package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuoteRequest {
    @NotNull
    @Min(0)
    private Integer partsCost;

    @NotNull
    @Min(0)
    private Integer laborCost;

    private String note;
}
