package com.fixmatelk.backend.repository;

import com.fixmatelk.backend.entity.TechnicianProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TechnicianProfileRepository
        extends JpaRepository<TechnicianProfile, Long>, JpaSpecificationExecutor<TechnicianProfile> {

    Optional<TechnicianProfile> findByUserId(Long userId);
    Optional<TechnicianProfile> findByEmailIgnoreCase(String email);
    List<TechnicianProfile> findByVerifiedFalseAndRejectedFalse();
    long countByVerifiedTrueAndRejectedFalse();
    long countByVerifiedFalseAndRejectedFalse();
}
