package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBookingRequest {
    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private String customerName;
    private String customerPhone;

    @NotBlank(message = "Scheduled date is required")
    private String scheduledDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    @NotBlank(message = "Service address is required")
    private String serviceAddress;

    @NotBlank(message = "Issue description is required")
    private String issueDescription;

    private Boolean isEmergency = false;
    private String issuePhoto;
    private String promoCode;
}
