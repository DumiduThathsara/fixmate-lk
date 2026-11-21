package com.fixmatelk.backend.controller;

import com.fixmatelk.backend.dto.*;
import com.fixmatelk.backend.service.TechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(technicianService.getCategories());
    }

    @GetMapping("/technicians")
    public ResponseEntity<PaginatedTechnicianResponse> searchTechnicians(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "All") String category,
            @RequestParam(required = false, defaultValue = "All") String district,
            @RequestParam(required = false, defaultValue = "0") Double minRating,
            @RequestParam(required = false, defaultValue = "5000") Integer maxFee,
            @RequestParam(required = false, defaultValue = "false") Boolean urgentOnly,
            @RequestParam(required = false, defaultValue = "rating_desc") String sortBy,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "6") int limit) {
        return ResponseEntity.ok(technicianService.searchTechnicians(
                search, category, district, minRating, maxFee, urgentOnly, sortBy, page, limit));
    }

    @GetMapping("/technicians/featured")
    public ResponseEntity<List<TechnicianDto>> getFeaturedTechnicians(
            @RequestParam(required = false, defaultValue = "4") int limit) {
        return ResponseEntity.ok(technicianService.getFeaturedTechnicians(limit));
    }

    @GetMapping("/technicians/me")
    public ResponseEntity<TechnicianDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(technicianService.getMyTechnicianProfile(authentication.getName()));
    }

    @GetMapping("/technicians/{id}")
    public ResponseEntity<TechnicianDto> getTechnicianById(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @PutMapping("/technicians/profile")
    public ResponseEntity<TechnicianDto> updateProfile(
            Authentication authentication,
            @RequestBody TechnicianProfileUpdateRequest request) {
        return ResponseEntity.ok(technicianService.updateTechnicianProfile(authentication.getName(), request));
    }

    @PatchMapping("/technicians/availability")
    public ResponseEntity<TechnicianDto> updateAvailability(
            Authentication authentication,
            @Valid @RequestBody AvailabilityUpdateRequest request) {
        return ResponseEntity.ok(technicianService.updateAvailability(
                authentication.getName(), request.getAvailable()));
    }
}
