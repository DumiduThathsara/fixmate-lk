package com.fixmatelk.backend.service;

import com.fixmatelk.backend.dto.NotificationDto;
import com.fixmatelk.backend.entity.Notification;
import com.fixmatelk.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(String role) {
        List<Notification> list = (role == null || role.isBlank())
                ? notificationRepository.findAllByOrderByCreatedAtDesc()
                : notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role.toUpperCase());

        return list.stream().map(NotificationService::toDto).toList();
    }

    @Transactional
    public NotificationDto addNotification(String targetRole, String title, String message, String link) {
        Notification saved = notificationRepository.save(Notification.builder()
                .targetRole(targetRole.toUpperCase())
                .title(title)
                .message(message)
                .link(link)
                .isRead(false)
                .build());
        return toDto(saved);
    }

    @Transactional
    public List<NotificationDto> markAllAsRead(String role) {
        List<Notification> list = (role == null || role.isBlank())
                ? notificationRepository.findAllByOrderByCreatedAtDesc()
                : notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role.toUpperCase());

        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
        return list.stream().map(NotificationService::toDto).toList();
    }

    public static NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .targetRole(n.getTargetRole())
                .title(n.getTitle())
                .message(n.getMessage())
                .link(n.getLink())
                .read(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
