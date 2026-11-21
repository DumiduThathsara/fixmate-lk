package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DisputeRequest {
    @NotBlank(message = "Dispute reason is required")
    private String reason;
}
