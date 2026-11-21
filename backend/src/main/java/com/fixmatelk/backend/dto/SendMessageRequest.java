package com.fixmatelk.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {
    private String senderRole;
    private String senderName;

    @NotBlank(message = "Message text is required")
    private String text;
}
