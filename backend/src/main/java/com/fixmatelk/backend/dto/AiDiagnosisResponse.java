package com.fixmatelk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDiagnosisResponse {
    private String detectedCategory;
    private int confidence;
    private String estimatedRange;
    private String urgency;
    private String advice;
}
