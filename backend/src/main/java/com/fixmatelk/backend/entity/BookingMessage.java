package com.fixmatelk.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "booking_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, length = 20)
    private String senderRole;

    @Column(nullable = false, length = 120)
    private String senderName;

    @Column(nullable = false, length = 1000)
    private String text;

    @Column(nullable = false)
    @Builder.Default
    private Instant timestamp = Instant.now();
}
