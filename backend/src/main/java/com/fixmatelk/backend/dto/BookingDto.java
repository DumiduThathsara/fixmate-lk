package com.fixmatelk.backend.dto;

import com.fixmatelk.backend.enums.BookingStatus;
import com.fixmatelk.backend.enums.QuoteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long technicianId;
    private String technicianName;
    private String category;
    private String district;
    private String scheduledDate;
    private String timeSlot;
    private String serviceAddress;
    private String issueDescription;
    private Integer visitFee;
    private BookingStatus status;
    private String startOtp;
    private Boolean isEmergency;
    private String issuePhoto;
    private String promoCode;
    private Integer discountAmount;
    private Boolean hasReviewed;
    private QuoteDto quote;
    private DisputeDto dispute;
    private ReviewDto review;
    private List<BookingMessageDto> messages;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuoteDto {
        private Integer partsCost;
        private Integer laborCost;
        private String note;
        private QuoteStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisputeDto {
        private Boolean isFlagged;
        private String reason;
        private Boolean resolved;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewDto {
        private Integer rating;
        private String comment;
        private Instant submittedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingMessageDto {
        private Long id;
        private String senderRole;
        private String senderName;
        private String text;
        private Instant timestamp;
    }
}
