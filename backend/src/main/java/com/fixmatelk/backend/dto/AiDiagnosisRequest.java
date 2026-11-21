package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiDiagnosisRequest {
    @NotBlank(message = "Issue description is required")
    private String description;

    private Boolean hasImage = false;
}
