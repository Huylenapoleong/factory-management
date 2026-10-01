package com.company.factory.purchasing.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.purchasing.dto.CreatePurchaseOrderRequest;
import com.company.factory.purchasing.dto.PurchaseOrderDto;
import com.company.factory.purchasing.service.PurchaseOrderService;
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
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Procurement orders management")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get purchase orders with search, status and pagination")
    public ApiResponse<PageResponse<PurchaseOrderDto>> getPurchaseOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(poService.getPurchaseOrders(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID")
    public ApiResponse<PurchaseOrderDto> getPurchaseOrderById(@PathVariable Long id) {
        return ApiResponse.success(poService.getPurchaseOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PURCHASING')")
    @Operation(summary = "Create new purchase order")
    public ApiResponse<PurchaseOrderDto> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ApiResponse.success(poService.createPurchaseOrder(request, userId), "Purchase order created");
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PURCHASING')")
    @Operation(summary = "Confirm draft purchase order")
    public ApiResponse<PurchaseOrderDto> confirmPurchaseOrder(@PathVariable Long id) {
        return ApiResponse.success(poService.confirmPurchaseOrder(id), "Purchase order confirmed");
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PURCHASING')")
    @Operation(summary = "Cancel purchase order")
    public ApiResponse<PurchaseOrderDto> cancelPurchaseOrder(@PathVariable Long id) {
        return ApiResponse.success(poService.cancelPurchaseOrder(id), "Purchase order cancelled");
    }
}
