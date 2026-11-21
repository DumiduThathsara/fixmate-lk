package com.fixmatelk.backend.controller;

import com.fixmatelk.backend.dto.AiDiagnosisRequest;
import com.fixmatelk.backend.dto.AiDiagnosisResponse;
import com.fixmatelk.backend.service.AiDiagnosisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiDiagnosisController {

    private final AiDiagnosisService aiDiagnosisService;

    @PostMapping("/diagnose")
    public ResponseEntity<AiDiagnosisResponse> diagnose(@Valid @RequestBody AiDiagnosisRequest request) {
        return ResponseEntity.ok(aiDiagnosisService.diagnose(request));
    }
}
