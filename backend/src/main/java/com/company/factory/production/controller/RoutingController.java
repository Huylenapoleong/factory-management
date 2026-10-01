package com.company.factory.production.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.production.dto.CreateRoutingRequest;
import com.company.factory.production.dto.RoutingDto;
import com.company.factory.production.service.RoutingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routings")
@RequiredArgsConstructor
@Tag(name = "Routings", description = "Manufacturing process sequences and steps")
public class RoutingController {

    private final RoutingService routingService;

    @GetMapping
    @Operation(summary = "Get routings by product or status")
    public ApiResponse<List<RoutingDto>> getRoutings(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.success(routingService.getRoutings(productId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get routing by ID")
    public ApiResponse<RoutingDto> getRoutingById(@PathVariable Long id) {
        return ApiResponse.success(routingService.getRoutingById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Create process routing")
    public ApiResponse<RoutingDto> createRouting(@Valid @RequestBody CreateRoutingRequest request) {
        return ApiResponse.success(routingService.createRouting(request), "Routing created successfully");
    }
}
