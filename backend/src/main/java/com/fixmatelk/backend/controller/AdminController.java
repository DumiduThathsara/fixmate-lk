package com.fixmatelk.backend.controller;

import com.fixmatelk.backend.dto.AdminAnalyticsDto;
import com.fixmatelk.backend.dto.BookingDto;
import com.fixmatelk.backend.dto.TechnicianDto;
import com.fixmatelk.backend.dto.VerifyTechnicianRequest;
import com.fixmatelk.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getPlatformAnalytics());
    }

    @GetMapping("/technicians/pending")
    public ResponseEntity<List<TechnicianDto>> getPendingTechnicians() {
        return ResponseEntity.ok(adminService.getPendingTechnicians());
    }

    @PatchMapping("/technicians/{id}/verify")
    public ResponseEntity<TechnicianDto> verifyTechnician(
            @PathVariable Long id,
            @Valid @RequestBody VerifyTechnicianRequest request) {
        return ResponseEntity.ok(adminService.verifyTechnician(id, request.getApproved()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllPlatformBookings());
    }

    @PatchMapping("/bookings/{id}/resolve-dispute")
    public ResponseEntity<BookingDto> resolveDispute(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.resolveDispute(id));
    }
}
