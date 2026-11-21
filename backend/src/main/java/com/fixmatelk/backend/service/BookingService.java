package com.fixmatelk.backend.service;

import com.fixmatelk.backend.dto.*;
import com.fixmatelk.backend.entity.*;
import com.fixmatelk.backend.enums.BookingStatus;
import com.fixmatelk.backend.enums.QuoteStatus;
import com.fixmatelk.backend.exception.BadRequestException;
import com.fixmatelk.backend.exception.ResourceNotFoundException;
import com.fixmatelk.backend.repository.BookingRepository;
import com.fixmatelk.backend.repository.TechnicianProfileRepository;
import com.fixmatelk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingDto createBooking(String customerEmail, CreateBookingRequest request) {
        User customer = userRepository.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found."));

        TechnicianProfile tech = technicianRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found."));

        boolean isEmergency = Boolean.TRUE.equals(request.getIsEmergency());
        int baseFee = tech.getVisitFee() + (isEmergency ? 500 : 0);
        int discount = calculatePromoDiscount(request.getPromoCode(), baseFee);
        int finalFee = Math.max(0, baseFee - discount);
        String otp = String.format("%04d", 1000 + RANDOM.nextInt(9000));

        Booking booking = Booking.builder()
                .customer(customer)
                .customerName(request.getCustomerName() != null && !request.getCustomerName().isBlank()
                        ? request.getCustomerName().trim()
                        : customer.getName())
                .customerPhone(request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()
                        ? request.getCustomerPhone().trim()
                        : customer.getPhone())
                .technician(tech)
                .technicianName(tech.getName())
                .category(tech.getCategory())
                .district(tech.getDistrict())
                .scheduledDate(request.getScheduledDate())
                .timeSlot(request.getTimeSlot())
                .serviceAddress(request.getServiceAddress().trim())
                .issueDescription(request.getIssueDescription().trim())
                .visitFee(finalFee)
                .status(BookingStatus.PENDING)
                .startOtp(otp)
                .isEmergency(isEmergency)
                .issuePhoto(request.getIssuePhoto())
                .promoCode(discount > 0 ? request.getPromoCode().trim().toUpperCase() : null)
                .discountAmount(discount)
                .build();

        booking = bookingRepository.save(booking);

        notificationService.addNotification(
                "TECHNICIAN",
                isEmergency ? "New Emergency Request" : "New Booking Request",
                booking.getCustomerName() + " requested " + booking.getCategory() + " in " + booking.getDistrict() + ".",
                "/technician/dashboard"
        );

        return toDto(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getCustomerBookings(String customerEmail) {
        User customer = userRepository.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(BookingService::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getTechnicianBookings(String technicianEmail) {
        User user = userRepository.findByEmailIgnoreCase(technicianEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Technician user not found."));
        TechnicianProfile tech = technicianRepository.findByUserId(user.getId())
                .or(() -> technicianRepository.findByEmailIgnoreCase(technicianEmail))
                .orElseThrow(() -> new ResourceNotFoundException("Technician profile not found."));

        return bookingRepository.findByTechnicianIdOrderByCreatedAtDesc(tech.getId())
                .stream()
                .map(BookingService::toDto)
                .toList();
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be cancelled.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto updateBookingStatus(Long bookingId, String statusStr) {
        Booking booking = getBookingOrThrow(bookingId);
        BookingStatus newStatus = BookingStatus.fromString(statusStr);
        booking.setStatus(newStatus);
        booking = bookingRepository.save(booking);

        if (newStatus == BookingStatus.ACCEPTED) {
            notificationService.addNotification(
                    "CUSTOMER",
                    "Technician Accepted Your Request",
                    booking.getTechnicianName() + " accepted your booking. Share PIN " + booking.getStartOtp() + " on arrival.",
                    "/customer/dashboard"
            );
        }

        return toDto(booking);
    }

    @Transactional
    public BookingDto verifyStartOtpAndBeginJob(Long bookingId, String enteredOtp) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStartOtp() == null || !booking.getStartOtp().equals(enteredOtp.trim())) {
            throw new BadRequestException("Invalid 4-digit Customer PIN");
        }
        booking.setStatus(BookingStatus.IN_PROGRESS);
        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto submitRepairQuote(Long bookingId, QuoteRequest request) {
        Booking booking = getBookingOrThrow(bookingId);
        booking.setQuotePartsCost(request.getPartsCost());
        booking.setQuoteLaborCost(request.getLaborCost());
        booking.setQuoteNote(request.getNote() != null ? request.getNote().trim() : "");
        booking.setQuoteStatus(QuoteStatus.PENDING);
        booking = bookingRepository.save(booking);

        int totalQuote = request.getPartsCost() + request.getLaborCost();
        notificationService.addNotification(
                "CUSTOMER",
                "Repair Quote Ready",
                booking.getTechnicianName() + " submitted a repair estimate of Rs. " + totalQuote + ".",
                "/customer/dashboard"
        );

        return toDto(booking);
    }

    @Transactional
    public BookingDto respondToQuote(Long bookingId, QuoteDecisionRequest request) {
        Booking booking = getBookingOrThrow(bookingId);
        QuoteStatus decision = QuoteStatus.fromString(request.getDecision());
        if (decision != QuoteStatus.APPROVED && decision != QuoteStatus.REJECTED) {
            throw new BadRequestException("Decision must be Approved or Rejected.");
        }
        booking.setQuoteStatus(decision);
        return toDto(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingDto.BookingMessageDto> getBookingMessages(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        return booking.getMessages().stream().map(BookingService::toMessageDto).toList();
    }

    @Transactional
    public BookingDto sendBookingMessage(String senderEmail, Long bookingId, SendMessageRequest request) {
        Booking booking = getBookingOrThrow(bookingId);
        User sender = userRepository.findByEmailIgnoreCase(senderEmail).orElse(null);

        String role = request.getSenderRole() != null && !request.getSenderRole().isBlank()
                ? request.getSenderRole()
                : (sender != null ? sender.getRole().name() : "CUSTOMER");
        String name = request.getSenderName() != null && !request.getSenderName().isBlank()
                ? request.getSenderName()
                : (sender != null ? sender.getName() : "User");

        BookingMessage msg = BookingMessage.builder()
                .booking(booking)
                .senderRole(role)
                .senderName(name)
                .text(request.getText().trim())
                .build();

        booking.getMessages().add(msg);
        booking = bookingRepository.save(booking);
        return toDto(booking);
    }

    @Transactional
    public BookingDto submitReview(Long bookingId, ReviewRequest request) {
        Booking booking = getBookingOrThrow(bookingId);
        if (Boolean.TRUE.equals(booking.getHasReviewed())) {
            throw new BadRequestException("A review has already been submitted for this booking.");
        }

        TechnicianProfile tech = booking.getTechnician();
        Review review = Review.builder()
                .booking(booking)
                .technician(tech)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : "")
                .build();

        booking.setReview(review);
        booking.setHasReviewed(true);

        // Recalculate technician average rating and review count
        int oldCount = tech.getReviewCount() != null ? tech.getReviewCount() : 0;
        double oldTotal = (tech.getRating() != null ? tech.getRating() : 5.0) * oldCount;
        int newCount = oldCount + 1;
        double newAvg = Math.round(((oldTotal + request.getRating()) / newCount) * 10.0) / 10.0;

        tech.setReviewCount(newCount);
        tech.setRating(newAvg);
        technicianRepository.save(tech);

        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto flagDispute(Long bookingId, DisputeRequest request) {
        Booking booking = getBookingOrThrow(bookingId);
        booking.setDisputeFlagged(true);
        booking.setDisputeReason(request.getReason().trim());
        booking.setDisputeResolved(false);
        booking = bookingRepository.save(booking);

        notificationService.addNotification(
                "ADMIN",
                "New Booking Dispute Flagged",
                "Booking #" + booking.getId() + " flagged: " + booking.getDisputeReason(),
                "/admin/dashboard"
        );

        return toDto(booking);
    }

    private int calculatePromoDiscount(String promoCode, int baseAmount) {
        if (promoCode == null || promoCode.isBlank()) {
            return 0;
        }
        String code = promoCode.trim().toUpperCase();
        if ("FIRST500".equals(code)) {
            return Math.min(500, baseAmount);
        }
        if ("FIX10".equals(code)) {
            return (int) Math.round(baseAmount * 0.10);
        }
        return 0;
    }

    private Booking getBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
    }

    public static BookingDto toDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .customerId(b.getCustomer() != null ? b.getCustomer().getId() : null)
                .customerName(b.getCustomerName())
                .customerPhone(b.getCustomerPhone())
                .technicianId(b.getTechnician() != null ? b.getTechnician().getId() : null)
                .technicianName(b.getTechnicianName())
                .category(b.getCategory())
                .district(b.getDistrict())
                .scheduledDate(b.getScheduledDate())
                .timeSlot(b.getTimeSlot())
                .serviceAddress(b.getServiceAddress())
                .issueDescription(b.getIssueDescription())
                .visitFee(b.getVisitFee())
                .status(b.getStatus())
                .startOtp(b.getStartOtp())
                .isEmergency(b.getIsEmergency())
                .issuePhoto(b.getIssuePhoto())
                .promoCode(b.getPromoCode())
                .discountAmount(b.getDiscountAmount())
                .hasReviewed(b.getHasReviewed())
                .quote(BookingDto.QuoteDto.builder()
                        .partsCost(b.getQuotePartsCost())
                        .laborCost(b.getQuoteLaborCost())
                        .note(b.getQuoteNote())
                        .status(b.getQuoteStatus())
                        .build())
                .dispute(BookingDto.DisputeDto.builder()
                        .isFlagged(b.getDisputeFlagged())
                        .reason(b.getDisputeReason())
                        .resolved(b.getDisputeResolved())
                        .build())
                .review(b.getReview() != null
                        ? BookingDto.ReviewDto.builder()
                            .rating(b.getReview().getRating())
                            .comment(b.getReview().getComment())
                            .submittedAt(b.getReview().getSubmittedAt())
                            .build()
                        : null)
                .messages(b.getMessages().stream().map(BookingService::toMessageDto).toList())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private static BookingDto.BookingMessageDto toMessageDto(BookingMessage m) {
        return BookingDto.BookingMessageDto.builder()
                .id(m.getId())
                .senderRole(m.getSenderRole())
                .senderName(m.getSenderName())
                .text(m.getText())
                .timestamp(m.getTimestamp())
                .build();
    }
}
