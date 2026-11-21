package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityUpdateRequest {
    @NotNull(message = "Availability flag is required")
    private Boolean available;
}
