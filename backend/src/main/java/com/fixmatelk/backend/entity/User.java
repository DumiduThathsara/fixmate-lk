package com.fixmatelk.backend.entity;

import com.fixmatelk.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 30)
    private String phone;

    @Column(length = 60)
    private String district;

    @Column(length = 500)
    private String address;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 60)
    private String serviceCategory;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_saved_technicians",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "technician_id")
    )
    @Builder.Default
    private Set<TechnicianProfile> savedTechnicians = new HashSet<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
