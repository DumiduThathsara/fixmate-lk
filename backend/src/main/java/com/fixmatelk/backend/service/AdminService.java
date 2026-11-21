package com.fixmatelk.backend.service;

import com.fixmatelk.backend.dto.AdminAnalyticsDto;
import com.fixmatelk.backend.dto.BookingDto;
import com.fixmatelk.backend.dto.TechnicianDto;
import com.fixmatelk.backend.entity.Booking;
import com.fixmatelk.backend.entity.TechnicianProfile;
import com.fixmatelk.backend.enums.BookingStatus;
import com.fixmatelk.backend.enums.QuoteStatus;
import com.fixmatelk.backend.exception.ResourceNotFoundException;
import com.fixmatelk.backend.repository.BookingRepository;
import com.fixmatelk.backend.repository.TechnicianProfileRepository;
import com.fixmatelk.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public AdminAnalyticsDto getPlatformAnalytics() {
        long totalUsers = userRepository.count();
        long verifiedTechniciansCount = technicianRepository.countByVerifiedTrueAndRejectedFalse();
        long pendingVerificationsCount = technicianRepository.countByVerifiedFalseAndRejectedFalse();

        List<Booking> bookings = bookingRepository.findAll();

        long activeBookingsCount = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING
                        || b.getStatus() == BookingStatus.ACCEPTED
                        || b.getStatus() == BookingStatus.IN_PROGRESS)
                .count();

        long activeDisputesCount = bookings.stream()
                .filter(b -> Boolean.TRUE.equals(b.getDisputeFlagged())
                        && !Boolean.TRUE.equals(b.getDisputeResolved()))
                .count();

        long totalRevenue = 0;
        Map<String, Long> districtMap = new HashMap<>();
        Map<String, Long> categoryRevenueMap = new HashMap<>();

        for (Booking b : bookings) {
            if (b.getDistrict() != null) {
                districtMap.merge(b.getDistrict(), 1L, Long::sum);
            }

            long quoteTotal = b.getQuoteStatus() == QuoteStatus.APPROVED
                    ? (long) (b.getQuotePartsCost() + b.getQuoteLaborCost())
                    : 0L;
            long bookingAmount = b.getStatus() == BookingStatus.COMPLETED
                    ? b.getVisitFee() + quoteTotal
                    : b.getVisitFee();

            if (b.getStatus() == BookingStatus.COMPLETED) {
                totalRevenue += bookingAmount;
            }

            if (b.getCategory() != null) {
                categoryRevenueMap.merge(b.getCategory(), bookingAmount, Long::sum);
            }
        }

        List<AdminAnalyticsDto.DistrictCountDto> districtCounts = districtMap.entrySet().stream()
                .map(e -> new AdminAnalyticsDto.DistrictCountDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(AdminAnalyticsDto.DistrictCountDto::getCount).reversed())
                .toList();

        List<AdminAnalyticsDto.CategoryRevenueDto> categoryBreakdown = categoryRevenueMap.entrySet().stream()
                .map(e -> new AdminAnalyticsDto.CategoryRevenueDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(AdminAnalyticsDto.CategoryRevenueDto::getRevenue).reversed())
                .toList();

        return AdminAnalyticsDto.builder()
                .totalUsers(totalUsers)
                .verifiedTechniciansCount(verifiedTechniciansCount)
                .pendingVerificationsCount(pendingVerificationsCount)
                .activeBookingsCount(activeBookingsCount)
                .activeDisputesCount(activeDisputesCount)
                .totalRevenue(totalRevenue)
                .districtCounts(districtCounts)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TechnicianDto> getPendingTechnicians() {
        return technicianRepository.findByVerifiedFalseAndRejectedFalse().stream()
                .map(TechnicianService::toTechnicianDto)
                .toList();
    }

    @Transactional
    public TechnicianDto verifyTechnician(Long techId, boolean approved) {
        TechnicianProfile tech = technicianRepository.findById(techId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + techId));

        if (approved) {
            tech.setVerified(true);
            tech.setRejected(false);
        } else {
            tech.setVerified(false);
            tech.setRejected(true);
        }

        return TechnicianService.toTechnicianDto(technicianRepository.save(tech));
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getAllPlatformBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(BookingService::toDto)
                .toList();
    }

    @Transactional
    public BookingDto resolveDispute(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        booking.setDisputeResolved(true);
        return BookingService.toDto(bookingRepository.save(booking));
    }
}
