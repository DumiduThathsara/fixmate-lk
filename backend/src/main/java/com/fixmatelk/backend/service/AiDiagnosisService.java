package com.fixmatelk.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fixmatelk.backend.dto.AiDiagnosisRequest;
import com.fixmatelk.backend.dto.AiDiagnosisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
public class AiDiagnosisService {

    private static final Set<String> VALID_CATEGORIES = Set.of(
            "Plumbing", "Electrical", "AC Repair", "Carpentry", "Painting", "Appliance Repair"
    );

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String geminiApiKey;
    private final String geminiApiUrl;

    public AiDiagnosisService(
            ObjectMapper objectMapper,
            @Value("${gemini.api.key:}") String geminiApiKey,
            @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent}") String geminiApiUrl) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
        this.geminiApiKey = geminiApiKey;
        this.geminiApiUrl = geminiApiUrl;
    }

    public AiDiagnosisResponse diagnose(AiDiagnosisRequest request) {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                return callGeminiApi(request);
            } catch (Exception ex) {
                log.warn("Gemini API call failed, falling back to rule-based diagnosis: {}", ex.getMessage());
            }
        }
        return ruleBasedDiagnose(request);
    }

    private AiDiagnosisResponse callGeminiApi(AiDiagnosisRequest request) throws Exception {
        boolean hasImg = Boolean.TRUE.equals(request.getHasImage())
                || (request.getImageBase64() != null && !request.getImageBase64().isBlank());

        String prompt = """
                You are FixMate LK's Sri Lankan Home Maintenance & Repair Assistant.
                Analyze the user's issue description (which may be in English, Singlish, or Sinhala) and any attached image.
                Has user attached an image: %s
                User issue: "%s"

                Respond ONLY with a valid JSON object containing these exact fields:
                {
                  "detectedCategory": "one of: Plumbing, Electrical, AC Repair, Carpentry, Painting, Appliance Repair",
                  "confidence": 85,
                  "estimatedRange": "realistic Sri Lankan Rupee range like Rs. 2,500 – Rs. 6,500",
                  "urgency": "Normal or Emergency",
                  "advice": "practical 1-2 sentence Sri Lankan safety tip and recommended next step"
                }
                """.formatted(hasImg, request.getDescription().trim());

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (request.getImageBase64() != null && !request.getImageBase64().isBlank()) {
            String rawBase64 = request.getImageBase64().trim();
            int commaIdx = rawBase64.indexOf(',');
            String cleanBase64 = commaIdx >= 0 ? rawBase64.substring(commaIdx + 1) : rawBase64;
            String mimeType = (request.getMimeType() != null && !request.getMimeType().isBlank())
                    ? request.getMimeType().trim()
                    : "image/jpeg";

            parts.add(Map.of(
                    "inline_data", Map.of(
                            "mime_type", mimeType,
                            "data", cleanBase64
                    )
            ));
        }

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", parts)),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;
        String rawResponse = restClient.post()
                .uri(urlWithKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(rawResponse);
        String textJson = root.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();

        // Strip markdown code fences if present
        String cleanedJson = textJson.replaceAll("```json", "").replaceAll("```", "").trim();
        JsonNode parsed = objectMapper.readTree(cleanedJson);

        String rawCategory = parsed.path("detectedCategory").asText("Plumbing");
        String normalizedCategory = normalizeCategory(rawCategory);
        String rawUrgency = parsed.path("urgency").asText("Normal");
        String urgency = "Emergency".equalsIgnoreCase(rawUrgency) ? "Emergency" : "Normal";
        int confidence = Math.min(99, Math.max(60, parsed.path("confidence").asInt(85)));
        String estimatedRange = parsed.path("estimatedRange").asText("Rs. 2,000 – Rs. 5,500");
        String advice = parsed.path("advice").asText("Turn off the affected utility if unsafe and book a verified technician.");

        return AiDiagnosisResponse.builder()
                .detectedCategory(normalizedCategory)
                .confidence(confidence)
                .estimatedRange(estimatedRange)
                .urgency(urgency)
                .advice(advice)
                .build();
    }

    private String normalizeCategory(String rawCategory) {
        if (VALID_CATEGORIES.contains(rawCategory)) {
            return rawCategory;
        }
        String lower = rawCategory.toLowerCase();
        if (lower.contains("ac") || lower.contains("air") || lower.contains("refrigeration")) return "AC Repair";
        if (lower.contains("elec")) return "Electrical";
        if (lower.contains("plumb")) return "Plumbing";
        if (lower.contains("carp")) return "Carpentry";
        if (lower.contains("paint")) return "Painting";
        if (lower.contains("appl")) return "Appliance Repair";
        return "Plumbing";
    }

    // === Rule-Based Fallback ===
    private record CategoryRule(
            String category,
            List<String> keywords,
            String normalRange,
            String emergencyRange,
            String advice
    ) {}

    private static final List<CategoryRule> RULES = List.of(
            new CategoryRule("Plumbing",
                    List.of("pipe", "leak", "leaking", "tap", "faucet", "sink", "drain", "toilet", "water", "pump", "tank", "shower", "plumbing", "clog", "burst"),
                    "Rs. 1,500 – Rs. 4,500", "Rs. 2,500 – Rs. 7,500",
                    "Shut off the main water valve near the meter if water is actively leaking before the technician arrives."),
            new CategoryRule("Electrical",
                    List.of("wire", "wiring", "breaker", "trip", "tripping", "switch", "socket", "outlet", "power", "light", "bulb", "short", "spark", "sparking", "inverter", "electrical", "shock"),
                    "Rs. 1,800 – Rs. 5,000", "Rs. 3,000 – Rs. 8,500",
                    "Turn off the affected MCB/main breaker on your distribution board and avoid touching exposed wires."),
            new CategoryRule("AC Repair",
                    List.of("ac", "a/c", "aircon", "air conditioner", "cooling", "cool", "compressor", "gas", "refrigerant", "split", "hvac", "thermostat"),
                    "Rs. 2,500 – Rs. 6,500", "Rs. 3,500 – Rs. 9,000",
                    "Switch off the AC unit from the wall isolator if it is dripping water indoors or making loud noises."),
            new CategoryRule("Carpentry",
                    List.of("door", "lock", "wood", "hinge", "cabinet", "cupboard", "pantry", "furniture", "table", "chair", "window", "carpenter", "carpentry", "timber"),
                    "Rs. 1,500 – Rs. 5,500", "Rs. 2,500 – Rs. 7,000",
                    "Keep any loose hardware or broken hinges aside so the carpenter can assess replacement parts."),
            new CategoryRule("Painting",
                    List.of("paint", "painting", "wall", "damp", "dampness", "ceiling", "primer", "waterproof", "waterproofing", "crack", "peeling", "polish"),
                    "Rs. 2,000 – Rs. 8,000", "Rs. 3,000 – Rs. 9,500",
                    "Move furniture away from the affected wall area and note if dampness is coming from an adjacent pipe."),
            new CategoryRule("Appliance Repair",
                    List.of("fridge", "refrigerator", "washing", "washer", "microwave", "oven", "stove", "appliance", "purifier", "motor", "heater", "geyser"),
                    "Rs. 1,750 – Rs. 6,000", "Rs. 2,800 – Rs. 8,000",
                    "Unplug the appliance from the wall socket and note the brand/model number for faster diagnostics.")
    );

    private static final List<String> EMERGENCY_KEYWORDS = List.of(
            "spark", "sparking", "smoke", "fire", "flood", "flooding", "burst",
            "urgent", "emergency", "immediately", "no power", "short circuit",
            "gas leak", "overflow", "shock"
    );

    private AiDiagnosisResponse ruleBasedDiagnose(AiDiagnosisRequest request) {
        String text = request.getDescription().trim().toLowerCase();
        CategoryRule bestRule = RULES.get(0);
        int bestScore = 0;

        for (CategoryRule rule : RULES) {
            int score = 0;
            for (String kw : rule.keywords()) {
                if (text.contains(kw)) {
                    score += kw.contains(" ") ? 2 : 1;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestRule = rule;
            }
        }

        boolean isEmergency = EMERGENCY_KEYWORDS.stream().anyMatch(text::contains);
        int baseConfidence = bestScore == 0 ? 68 : Math.min(94, 74 + bestScore * 6);
        int confidence = Math.min(98, baseConfidence + (Boolean.TRUE.equals(request.getHasImage()) ? 4 : 0));

        return AiDiagnosisResponse.builder()
                .detectedCategory(bestRule.category())
                .confidence(confidence)
                .estimatedRange(isEmergency ? bestRule.emergencyRange() : bestRule.normalRange())
                .urgency(isEmergency ? "Emergency" : "Normal")
                .advice(bestRule.advice())
                .build();
    }
}
