package com.company.factory.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalItems;
    private long activeProductionOrders;
    private long pendingPurchaseOrders;
    private long openSalesOrders;
    private long lowStockAlerts;
    private long totalWarehouses;
    private long totalSuppliers;
    private long totalCustomers;
}
