package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuoteDecisionRequest {
    @NotBlank(message = "Decision is required (Approved or Rejected)")
    private String decision;
}
