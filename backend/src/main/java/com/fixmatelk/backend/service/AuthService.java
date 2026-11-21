package com.fixmatelk.backend.service;

import com.fixmatelk.backend.dto.*;
import com.fixmatelk.backend.entity.TechnicianProfile;
import com.fixmatelk.backend.entity.User;
import com.fixmatelk.backend.enums.Role;
import com.fixmatelk.backend.exception.BadRequestException;
import com.fixmatelk.backend.exception.ResourceNotFoundException;
import com.fixmatelk.backend.exception.UnauthorizedException;
import com.fixmatelk.backend.repository.TechnicianProfileRepository;
import com.fixmatelk.backend.repository.UserRepository;
import com.fixmatelk.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TechnicianProfileRepository technicianProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        // Public signup only permits CUSTOMER or TECHNICIAN (never ADMIN)
        Role safeRole = "TECHNICIAN".equalsIgnoreCase(request.getRole())
                ? Role.TECHNICIAN
                : Role.CUSTOMER;

        String category = safeRole == Role.TECHNICIAN
                ? (request.getServiceCategory() != null && !request.getServiceCategory().isBlank()
                    ? request.getServiceCategory().trim()
                    : "Plumbing")
                : null;

        User user = User.builder()
                .name(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .district(request.getDistrict().trim())
                .role(safeRole)
                .serviceCategory(category)
                .build();

        user = userRepository.save(user);

        if (safeRole == Role.TECHNICIAN) {
            TechnicianProfile profile = TechnicianProfile.builder()
                    .user(user)
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .category(category)
                    .district(user.getDistrict())
                    .verified(false)
                    .available(true)
                    .visitFee(1500)
                    .experienceYears(1)
                    .rating(5.0)
                    .reviewCount(0)
                    .skills(List.of(category, "Diagnostics", "General Repairs"))
                    .bio("New technician registered on FixMate LK awaiting verification.")
                    .build();
            technicianProfileRepository.save(profile);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (user.getRole() == Role.ADMIN) {
            throw new UnauthorizedException("Administrators must sign in via the Admin Portal.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .build();
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid administrator credentials."));

        if (user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Access denied: Administrator privileges required.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid administrator credentials.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .build();
    }

    public UserDto getCurrentUser(String email) {
        User user = getUserByEmail(email);
        return toUserDto(user);
    }

    @Transactional
    public UserDto updateUserProfile(String email, UpdateUserProfileRequest request) {
        User user = getUserByEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            user.setDistrict(request.getDistrict().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        user = userRepository.save(user);
        return toUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<TechnicianDto> getSavedTechnicians(String email) {
        User user = getUserByEmail(email);
        return user.getSavedTechnicians().stream()
                .filter(t -> !Boolean.TRUE.equals(t.getRejected()))
                .map(TechnicianService::toTechnicianDto)
                .toList();
    }

    @Transactional
    public SavedToggleResponse toggleSavedTechnician(String email, Long techId) {
        User user = getUserByEmail(email);
        TechnicianProfile tech = technicianProfileRepository.findById(techId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + techId));

        boolean isSaved;
        if (user.getSavedTechnicians().contains(tech)) {
            user.getSavedTechnicians().remove(tech);
            isSaved = false;
        } else {
            user.getSavedTechnicians().add(tech);
            isSaved = true;
        }

        userRepository.save(user);
        List<Long> savedIds = user.getSavedTechnicians().stream()
                .map(TechnicianProfile::getId)
                .toList();

        return SavedToggleResponse.builder()
                .savedIds(savedIds)
                .isSaved(isSaved)
                .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    public static UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .district(user.getDistrict())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .serviceCategory(user.getServiceCategory())
                .build();
    }
}
