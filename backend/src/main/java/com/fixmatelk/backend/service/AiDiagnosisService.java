package com.fixmatelk.backend.service;

import com.fixmatelk.backend.dto.AiDiagnosisRequest;
import com.fixmatelk.backend.dto.AiDiagnosisResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiDiagnosisService {

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

    public AiDiagnosisResponse diagnose(AiDiagnosisRequest request) {
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
