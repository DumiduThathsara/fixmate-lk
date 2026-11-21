package com.fixmatelk.backend.service;

import com.fixmatelk.backend.dto.*;
import com.fixmatelk.backend.entity.TechnicianProfile;
import com.fixmatelk.backend.entity.User;
import com.fixmatelk.backend.exception.ResourceNotFoundException;
import com.fixmatelk.backend.repository.TechnicianProfileRepository;
import com.fixmatelk.backend.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianProfileRepository technicianRepository;
    private final UserRepository userRepository;

    public List<CategoryDto> getCategories() {
        return List.of(
                new CategoryDto("cat-plumbing", "Plumbing", "plumbing", "Wrench",
                        "Pipe repairs, leak detection, bathroom fittings, and water tank installations."),
                new CategoryDto("cat-electrical", "Electrical", "electrical", "Zap",
                        "Wiring, circuit breaker fixes, lighting setups, and inverter installations."),
                new CategoryDto("cat-ac-repair", "AC Repair", "ac-repair", "Snowflake",
                        "AC servicing, gas refilling, compressor repairs, and split-unit mounting."),
                new CategoryDto("cat-carpentry", "Carpentry", "carpentry", "Hammer",
                        "Custom furniture, door & lock repairs, kitchen cabinetry, and woodwork."),
                new CategoryDto("cat-painting", "Painting", "painting", "Paintbrush",
                        "Interior & exterior wall painting, waterproofing, and wood polishing."),
                new CategoryDto("cat-appliance-repair", "Appliance Repair", "appliance-repair", "Settings",
                        "Washing machine, refrigerator, microwave, and kitchen appliance servicing.")
        );
    }

    @Transactional(readOnly = true)
    public PaginatedTechnicianResponse searchTechnicians(
            String search,
            String category,
            String district,
            Double minRating,
            Integer maxFee,
            Boolean urgentOnly,
            String sortBy,
            int page,
            int limit) {

        Specification<TechnicianProfile> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("rejected")));

            if (Boolean.TRUE.equals(urgentOnly)) {
                predicates.add(cb.isTrue(root.get("available")));
            }

            if (category != null && !category.isBlank() && !"All".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (district != null && !district.isBlank() && !"All".equalsIgnoreCase(district)) {
                predicates.add(cb.equal(root.get("district"), district));
            }

            if (minRating != null && minRating > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            }

            if (maxFee != null && maxFee > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("visitFee"), maxFee));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("bio")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = switch (sortBy != null ? sortBy : "rating_desc") {
            case "fee_asc" -> Sort.by(Sort.Direction.ASC, "visitFee");
            case "fee_desc" -> Sort.by(Sort.Direction.DESC, "visitFee");
            case "experience_desc" -> Sort.by(Sort.Direction.DESC, "experienceYears");
            default -> Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("reviewCount"));
        };

        int safeLimit = Math.max(1, limit);
        int safePage = Math.max(1, page);
        Pageable pageable = PageRequest.of(safePage - 1, safeLimit, sort);

        Page<TechnicianProfile> resultPage = technicianRepository.findAll(spec, pageable);

        return PaginatedTechnicianResponse.builder()
                .data(resultPage.getContent().stream().map(TechnicianService::toTechnicianDto).toList())
                .totalItems(resultPage.getTotalElements())
                .totalPages(Math.max(1, resultPage.getTotalPages()))
                .currentPage(safePage)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TechnicianDto> getFeaturedTechnicians(int limit) {
        return searchTechnicians(null, null, null, null, null, null, "rating_desc", 1, limit)
                .getData();
    }

    @Transactional(readOnly = true)
    public TechnicianDto getTechnicianById(Long id) {
        TechnicianProfile tech = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + id));
        return toTechnicianDto(tech);
    }

    @Transactional(readOnly = true)
    public TechnicianDto getMyTechnicianProfile(String email) {
        TechnicianProfile tech = findOrCreateByUserEmail(email);
        return toTechnicianDto(tech);
    }

    @Transactional
    public TechnicianDto updateTechnicianProfile(String email, TechnicianProfileUpdateRequest request) {
        TechnicianProfile tech = findOrCreateByUserEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            tech.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            tech.setPhone(request.getPhone().trim());
        }
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            tech.setDistrict(request.getDistrict().trim());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            tech.setCategory(request.getCategory().trim());
        }
        if (request.getVisitFee() != null) {
            tech.setVisitFee(request.getVisitFee());
        }
        if (request.getExperienceYears() != null) {
            tech.setExperienceYears(request.getExperienceYears());
        }
        if (request.getWorkingHours() != null) {
            tech.setWorkingHours(request.getWorkingHours().trim());
        }
        if (request.getSkills() != null) {
            tech.setSkills(new ArrayList<>(request.getSkills()));
        }
        if (request.getBio() != null) {
            tech.setBio(request.getBio().trim());
        }
        if (request.getAvatar() != null) {
            tech.setAvatar(request.getAvatar());
        }
        if (request.getAvailable() != null) {
            tech.setAvailable(request.getAvailable());
        }

        tech = technicianRepository.save(tech);

        if (tech.getUser() != null) {
            User user = tech.getUser();
            user.setName(tech.getName());
            user.setAvatar(tech.getAvatar());
            userRepository.save(user);
        }

        return toTechnicianDto(tech);
    }

    @Transactional
    public TechnicianDto updateAvailability(String email, boolean available) {
        TechnicianProfile tech = findOrCreateByUserEmail(email);
        tech.setAvailable(available);
        tech = technicianRepository.save(tech);
        return toTechnicianDto(tech);
    }

    public TechnicianProfile findOrCreateByUserEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        return technicianRepository.findByUserId(user.getId())
                .or(() -> technicianRepository.findByEmailIgnoreCase(email))
                .orElseGet(() -> technicianRepository.save(TechnicianProfile.builder()
                        .user(user)
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .category(user.getServiceCategory() != null ? user.getServiceCategory() : "Plumbing")
                        .district(user.getDistrict() != null ? user.getDistrict() : "Colombo")
                        .verified(false)
                        .available(true)
                        .visitFee(1500)
                        .experienceYears(1)
                        .rating(5.0)
                        .reviewCount(0)
                        .build()));
    }

    public static TechnicianDto toTechnicianDto(TechnicianProfile tech) {
        boolean bestMatch = Boolean.TRUE.equals(tech.getVerified()) && tech.getRating() >= 4.8;
        return TechnicianDto.builder()
                .id(tech.getId())
                .name(tech.getName())
                .email(tech.getEmail())
                .phone(tech.getPhone())
                .category(tech.getCategory())
                .district(tech.getDistrict())
                .rating(tech.getRating())
                .reviewCount(tech.getReviewCount())
                .visitFee(tech.getVisitFee())
                .experienceYears(tech.getExperienceYears())
                .verified(tech.getVerified())
                .available(tech.getAvailable())
                .workingHours(tech.getWorkingHours())
                .skills(tech.getSkills())
                .bio(tech.getBio())
                .avatar(tech.getAvatar())
                .distanceKm(tech.getDistanceKm())
                .isBestMatch(bestMatch)
                .build();
    }
}
