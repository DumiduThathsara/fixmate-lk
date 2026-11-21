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
public class AdminAnalyticsDto {
    private long totalUsers;
    private long verifiedTechniciansCount;
    private long pendingVerificationsCount;
    private long activeBookingsCount;
    private long activeDisputesCount;
    private long totalRevenue;
    private List<DistrictCountDto> districtCounts;
    private List<CategoryRevenueDto> categoryBreakdown;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DistrictCountDto {
        private String district;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryRevenueDto {
        private String category;
        private long revenue;
    }
}
