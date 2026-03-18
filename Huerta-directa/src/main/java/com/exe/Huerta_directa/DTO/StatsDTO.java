package com.exe.Huerta_directa.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {

    private AdminStats adminStats;
    private ClientStats clientStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminStats {
        private Map<String, Long> rolesCount;
        private Map<String, Long> genderCount;
        private Map<String, Long> ageRangeCount;
        private Map<String, Long> monthlyUserRegistrations;
        private Map<String, Long> categoryCount;
        private Map<String, Long> unitCount;
        private Map<String, BigDecimal> monthlySales;
        private Map<String, Long> topProducts;
        private List<MonthlyRevenue> revenueTrends;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientStats {
        private Map<String, Long> myCategoryCount;
        private Map<String, Long> myUnitCount;
        private List<PricePoint> priceAnalysis;
        private Map<String, BigDecimal> myMonthlySales;
        private BigDecimal totalRevenue;
    }

    @Data
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
    }

    @Data
    @AllArgsConstructor
    public static class PricePoint {
        private String date;
        private BigDecimal price;
        private String productName;
    }
}
