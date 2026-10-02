package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BomAnalysisLineDto {
    public static final String STATUS_SUFFICIENT = "SUFFICIENT";
    public static final String STATUS_LOW = "LOW";
    public static final String STATUS_SHORTAGE = "SHORTAGE";

    public static final String PROCUREMENT_COVERED = "COVERED";
    public static final String PROCUREMENT_ORDERED = "ORDERED";
    public static final String PROCUREMENT_TO_ORDER = "TO_ORDER";

    public static final String URGENCY_LATE = "LATE";
    public static final String URGENCY_TODAY = "TODAY";
    public static final String URGENCY_UPCOMING = "UPCOMING";

    private Long bomItemId;
    private Long materialId;
    private String materialCode;
    private String materialNameEn;
    private String materialNameZh;
    private String materialType;
    private String unitCode;
    private BigDecimal unitQuantity;
    private BigDecimal scrapRate;
    private BigDecimal requiredQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal minStock;
    private BigDecimal shortageQuantity;
    private BigDecimal coveragePercent;
    private String status;
    private BigDecimal unitCost;
    private BigDecimal lineCost;
    private BigDecimal scrapCost;

    private BigDecimal surplusQuantity;
    private BigDecimal onOrderQuantity;
    private BigDecimal orderQuantity;
    private String procurementStatus;
    private String urgency;
    private LocalDate orderByDate;
    private LocalDate expectedArrivalDate;
    private Long supplierId;
    private String supplierName;
    private Integer leadTimeDays;
}
