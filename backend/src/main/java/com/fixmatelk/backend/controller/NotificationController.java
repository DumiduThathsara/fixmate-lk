package com.fixmatelk.backend.controller;

import com.fixmatelk.backend.dto.NotificationDto;
import com.fixmatelk.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            Authentication authentication,
            @RequestParam(required = false) String role) {
        String resolvedRole = resolveRole(authentication, role);
        return ResponseEntity.ok(notificationService.getNotifications(resolvedRole));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<List<NotificationDto>> markAllAsRead(
            Authentication authentication,
            @RequestParam(required = false) String role) {
        String resolvedRole = resolveRole(authentication, role);
        return ResponseEntity.ok(notificationService.markAllAsRead(resolvedRole));
    }

    private String resolveRole(Authentication authentication, String explicitRole) {
        if (explicitRole != null && !explicitRole.isBlank()) {
            return explicitRole.toUpperCase();
        }
        if (authentication == null) {
            return null;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse(null);
    }
}
