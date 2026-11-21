package com.fixmatelk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String targetRole;
    private String title;
    private String message;
    private String link;
    private Boolean read;
    private Instant createdAt;
}
