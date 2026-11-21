package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyTechnicianRequest {
    @NotNull(message = "Approval decision is required")
    private Boolean approved;
}
