package com.fixmatelk.backend.controller;

import com.fixmatelk.backend.dto.*;
import com.fixmatelk.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(
            Authentication authentication,
            @Valid @RequestBody CreateBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(authentication.getName(), request));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<BookingDto>> getCustomerBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getCustomerBookings(authentication.getName()));
    }

    @GetMapping("/technician")
    public ResponseEntity<List<BookingDto>> getTechnicianBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getTechnicianBookings(authentication.getName()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request.getStatus()));
    }

    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<BookingDto> verifyOtp(
            @PathVariable Long id,
            @Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(bookingService.verifyStartOtpAndBeginJob(id, request.getOtp()));
    }

    @PostMapping("/{id}/quote")
    public ResponseEntity<BookingDto> submitQuote(
            @PathVariable Long id,
            @Valid @RequestBody QuoteRequest request) {
        return ResponseEntity.ok(bookingService.submitRepairQuote(id, request));
    }

    @PatchMapping({"/{id}/quote/respond", "/{id}/quote"})
    public ResponseEntity<BookingDto> respondToQuote(
            @PathVariable Long id,
            @Valid @RequestBody QuoteDecisionRequest request) {
        return ResponseEntity.ok(bookingService.respondToQuote(id, request));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<BookingDto.BookingMessageDto>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<BookingDto> sendMessage(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(bookingService.sendBookingMessage(authentication.getName(), id, request));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<BookingDto> submitReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(bookingService.submitReview(id, request));
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<BookingDto> flagDispute(
            @PathVariable Long id,
            @Valid @RequestBody DisputeRequest request) {
        return ResponseEntity.ok(bookingService.flagDispute(id, request));
    }
}
