package com.fixmatelk.backend.entity;

import com.fixmatelk.backend.enums.BookingStatus;
import com.fixmatelk.backend.enums.QuoteStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(nullable = false, length = 120)
    private String customerName;

    @Column(length = 30)
    private String customerPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private TechnicianProfile technician;

    @Column(nullable = false, length = 120)
    private String technicianName;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 60)
    private String district;

    @Column(nullable = false, length = 30)
    private String scheduledDate;

    @Column(nullable = false, length = 50)
    private String timeSlot;

    @Column(nullable = false, length = 300)
    private String serviceAddress;

    @Column(nullable = false, length = 1000)
    private String issueDescription;

    @Column(nullable = false)
    private Integer visitFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(length = 4)
    private String startOtp;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isEmergency = false;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String issuePhoto;

    @Column(length = 40)
    private String promoCode;

    @Builder.Default
    private Integer discountAmount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasReviewed = false;

    // Embedded Repair Quote fields
    @Builder.Default
    private Integer quotePartsCost = 0;

    @Builder.Default
    private Integer quoteLaborCost = 0;

    @Column(length = 500)
    private String quoteNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private QuoteStatus quoteStatus = QuoteStatus.NONE;

    // Embedded Dispute fields
    @Column(nullable = false)
    @Builder.Default
    private Boolean disputeFlagged = false;

    @Column(length = 500)
    private String disputeReason;

    @Column(nullable = false)
    @Builder.Default
    private Boolean disputeResolved = false;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<BookingMessage> messages = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private Review review;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
