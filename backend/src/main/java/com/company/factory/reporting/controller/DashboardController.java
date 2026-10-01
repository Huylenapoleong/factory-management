package com.company.factory.reporting.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.inventory.dto.InventoryBalanceDto;
import com.company.factory.inventory.dto.StockTransactionDto;
import com.company.factory.reporting.dto.DashboardSummaryDto;
import com.company.factory.reporting.dto.ProductionProgressDto;
import com.company.factory.reporting.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Factory executive dashboard analytics & alerts")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get high-level factory KPI summary metrics")
    public ApiResponse<DashboardSummaryDto> getSummary() {
        return ApiResponse.success(dashboardService.getSummary());
    }

    @GetMapping("/production-progress")
    @Operation(summary = "Get execution progress of all active production orders")
    public ApiResponse<List<ProductionProgressDto>> getProductionProgress() {
        return ApiResponse.success(dashboardService.getProductionProgress());
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get inventory items below safety stock threshold")
    public ApiResponse<List<InventoryBalanceDto>> getLowStockAlerts() {
        return ApiResponse.success(dashboardService.getLowStockAlerts());
    }

    @GetMapping("/recent-transactions")
    @Operation(summary = "Get latest 10 stock movement ledger entries")
    public ApiResponse<List<StockTransactionDto>> getRecentTransactions() {
        return ApiResponse.success(dashboardService.getRecentTransactions());
    }
}
