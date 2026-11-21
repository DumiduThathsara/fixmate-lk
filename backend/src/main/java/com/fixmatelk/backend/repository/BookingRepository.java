package com.fixmatelk.backend.repository;

import com.fixmatelk.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
