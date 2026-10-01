package com.company.factory.production.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.production.dto.*;
import com.company.factory.production.service.ProductionOrderService;
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
@RequestMapping("/production-orders")
@RequiredArgsConstructor
@Tag(name = "Production Orders", description = "Manufacturing order lifecycle and operations")
public class ProductionOrderController {

    private final ProductionOrderService moService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get production orders with search, status and pagination")
    public ApiResponse<PageResponse<ProductionOrderDto>> getProductionOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(moService.getProductionOrders(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get production order by ID with materials and operations")
    public ApiResponse<ProductionOrderDto> getProductionOrderById(@PathVariable Long id) {
        return ApiResponse.success(moService.getProductionOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Create production order with BOM & Routing explosion")
    public ApiResponse<ProductionOrderDto> createProductionOrder(
            @Valid @RequestBody CreateProductionOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ApiResponse.success(moService.createProductionOrder(request, userId), "Production order created");
    }

    @PostMapping("/{id}/release")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Release production order to shop floor")
    public ApiResponse<ProductionOrderDto> releaseProductionOrder(@PathVariable Long id) {
        return ApiResponse.success(moService.releaseProductionOrder(id), "Production order released");
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Start production execution")
    public ApiResponse<ProductionOrderDto> startProductionOrder(@PathVariable Long id) {
        return ApiResponse.success(moService.startProductionOrder(id), "Production order started");
    }

    @PostMapping("/{id}/pause")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Pause production execution")
    public ApiResponse<ProductionOrderDto> pauseProductionOrder(@PathVariable Long id) {
        return ApiResponse.success(moService.pauseProductionOrder(id), "Production order paused");
    }

    @PostMapping("/issue-material")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE')")
    @Operation(summary = "Issue materials to production order (atomically deducts raw material stock)")
    public ApiResponse<ProductionMaterialDto> issueMaterial(
            @Valid @RequestBody MaterialIssueRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ApiResponse.success(moService.issueMaterial(request, userId), "Material issued successfully");
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Complete production order (atomically receives finished goods into warehouse)")
    public ApiResponse<ProductionOrderDto> completeProductionOrder(
            @PathVariable Long id,
            @Valid @RequestBody ProductionCompleteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ApiResponse.success(moService.completeProductionOrder(id, request, userId), "Production order completed");
    }

    private Long getUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByUsername(userDetails.getUsername())
                .map(User::getId)
                .orElse(null);
    }
}
