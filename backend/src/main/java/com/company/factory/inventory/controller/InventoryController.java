package com.company.factory.inventory.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.dto.InventoryBalanceDto;
import com.company.factory.inventory.dto.StockAdjustmentRequest;
import com.company.factory.inventory.dto.StockTransactionDto;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Stock balances, transactions and adjustments")
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    @GetMapping("/balances")
    @Operation(summary = "Get stock balances with filters and pagination")
    public ApiResponse<PageResponse<InventoryBalanceDto>> getBalances(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Boolean lowStockOnly,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(inventoryService.getBalances(warehouseId, itemId, lowStockOnly, pageable));
    }

    @GetMapping("/balances/low-stock")
    @Operation(summary = "Get all inventory items below minimum safety stock")
    public ApiResponse<List<InventoryBalanceDto>> getLowStockBalances() {
        return ApiResponse.success(inventoryService.getLowStockBalances());
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get stock transaction ledger with filters and pagination")
    public ApiResponse<PageResponse<StockTransactionDto>> getTransactions(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) TransactionType type,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(inventoryService.getTransactions(warehouseId, itemId, type, pageable));
    }

    @GetMapping("/transactions/recent")
    @Operation(summary = "Get recent 10 stock movements")
    public ApiResponse<List<StockTransactionDto>> getRecentTransactions() {
        return ApiResponse.success(inventoryService.getRecentTransactions());
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    @Operation(summary = "Adjust stock quantity (positive or negative adjustment)")
    public ApiResponse<StockTransactionDto> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        StockTransactionDto dto = inventoryService.adjustStock(request, userId);
        return ApiResponse.success(dto, "Stock adjusted successfully");
    }
}
