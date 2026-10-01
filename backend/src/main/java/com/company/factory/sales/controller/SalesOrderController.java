package com.company.factory.sales.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.sales.dto.CreateSalesOrderRequest;
import com.company.factory.sales.dto.SalesOrderDto;
import com.company.factory.sales.service.SalesOrderService;
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

@RestController
@RequestMapping("/api/v1/sales-orders")
@RequiredArgsConstructor
@Tag(name = "Sales Orders", description = "Customer sales orders and quotation management")
public class SalesOrderController {

    private final SalesOrderService soService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get sales orders with search, status and pagination")
    public ApiResponse<PageResponse<SalesOrderDto>> getSalesOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(soService.getSalesOrders(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sales order by ID")
    public ApiResponse<SalesOrderDto> getSalesOrderById(@PathVariable Long id) {
        return ApiResponse.success(soService.getSalesOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "Create sales order")
    public ApiResponse<SalesOrderDto> createSalesOrder(
            @Valid @RequestBody CreateSalesOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ApiResponse.success(soService.createSalesOrder(request, userId), "Sales order created");
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "Confirm draft sales order")
    public ApiResponse<SalesOrderDto> confirmSalesOrder(@PathVariable Long id) {
        return ApiResponse.success(soService.confirmSalesOrder(id), "Sales order confirmed");
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "Cancel sales order")
    public ApiResponse<SalesOrderDto> cancelSalesOrder(@PathVariable Long id) {
        return ApiResponse.success(soService.cancelSalesOrder(id), "Sales order cancelled");
    }
}
