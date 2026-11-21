package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "4-digit PIN is required")
    @Pattern(regexp = "\\d{4}", message = "Invalid 4-digit Customer PIN")
    private String otp;
}
