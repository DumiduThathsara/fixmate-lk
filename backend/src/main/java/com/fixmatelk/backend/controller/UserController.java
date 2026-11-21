package com.fixmatelk.backend.controller;

import com.fixmatelk.backend.dto.SavedToggleResponse;
import com.fixmatelk.backend.dto.TechnicianDto;
import com.fixmatelk.backend.dto.UpdateUserProfileRequest;
import com.fixmatelk.backend.dto.UserDto;
import com.fixmatelk.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            Authentication authentication,
            @RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(authService.updateUserProfile(authentication.getName(), request));
    }

    @GetMapping("/saved-technicians")
    public ResponseEntity<List<TechnicianDto>> getSavedTechnicians(Authentication authentication) {
        return ResponseEntity.ok(authService.getSavedTechnicians(authentication.getName()));
    }

    @PostMapping("/saved-technicians/{techId}")
    public ResponseEntity<SavedToggleResponse> toggleSavedTechnician(
            Authentication authentication,
            @PathVariable Long techId) {
        return ResponseEntity.ok(authService.toggleSavedTechnician(authentication.getName(), techId));
    }
}
