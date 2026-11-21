package com.fixmatelk.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "technician_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 160)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 60)
    private String district;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 4.8;

    @Column(nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer visitFee = 1500;

    @Column(nullable = false)
    @Builder.Default
    private Integer experienceYears = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean rejected = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;

    @Column(length = 120)
    @Builder.Default
    private String workingHours = "8:00 AM - 6:00 PM (Mon - Sat)";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "technician_skills", joinColumns = @JoinColumn(name = "technician_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Column(length = 1000)
    private String bio;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String avatar;

    @Builder.Default
    private Double distanceKm = 2.4;
}
