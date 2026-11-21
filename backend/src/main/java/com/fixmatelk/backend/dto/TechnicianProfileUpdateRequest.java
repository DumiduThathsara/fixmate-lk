package com.fixmatelk.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class TechnicianProfileUpdateRequest {
    private String name;
    private String phone;
    private String district;
    private String category;
    private Integer visitFee;
    private Integer experienceYears;
    private String workingHours;
    private List<String> skills;
    private String bio;
    private String avatar;
    private Boolean available;
}
