package com.fixmatelk.backend.repository;

import com.fixmatelk.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
