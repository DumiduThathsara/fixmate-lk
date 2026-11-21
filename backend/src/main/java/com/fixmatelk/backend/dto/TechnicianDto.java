package com.fixmatelk.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String category;
    private String district;
    private Double rating;
    private Integer reviewCount;
    private Integer visitFee;
    private Integer experienceYears;
    private Boolean verified;
    private Boolean available;
    private String workingHours;
    private List<String> skills;
    private String bio;
    private String avatar;
    private Double distanceKm;
    private Boolean isBestMatch;
}
