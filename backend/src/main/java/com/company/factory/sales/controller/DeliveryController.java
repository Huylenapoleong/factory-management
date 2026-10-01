package com.company.factory.sales.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.sales.dto.CreateDeliveryRequest;
import com.company.factory.sales.dto.DeliveryDto;
import com.company.factory.sales.service.DeliveryService;
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
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@Tag(name = "Deliveries", description = "Outbound sales delivery and inventory deductions")
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get deliveries with filters and pagination")
    public ApiResponse<PageResponse<DeliveryDto>> getDeliveries(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(deliveryService.getDeliveries(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery by ID")
    public ApiResponse<DeliveryDto> getDeliveryById(@PathVariable Long id) {
        return ApiResponse.success(deliveryService.getDeliveryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'SALES')")
    @Operation(summary = "Create draft delivery order")
    public ApiResponse<DeliveryDto> createDelivery(
            @Valid @RequestBody CreateDeliveryRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ApiResponse.success(deliveryService.createDelivery(request, userId), "Delivery created");
    }

    @PostMapping("/{id}/post")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'SALES')")
    @Operation(summary = "Post delivery order (atomically decreases inventory stock and logs transaction)")
    public ApiResponse<DeliveryDto> postDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ApiResponse.success(deliveryService.postDelivery(id, userId), "Delivery posted and stock deducted");
    }
}
