package com.company.factory.inventory.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.inventory.domain.WarehouseType;
import com.company.factory.inventory.dto.CreateLocationRequest;
import com.company.factory.inventory.dto.CreateWarehouseRequest;
import com.company.factory.inventory.dto.WarehouseDto;
import com.company.factory.inventory.dto.WarehouseLocationDto;
import com.company.factory.inventory.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Warehouse & Location master data")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Get all warehouses with optional type and status filter")
    public ApiResponse<List<WarehouseDto>> getAllWarehouses(
            @RequestParam(required = false) WarehouseType type,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.success(warehouseService.getAllWarehouses(type, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ApiResponse<WarehouseDto> getWarehouseById(@PathVariable Long id) {
        return ApiResponse.success(warehouseService.getWarehouseById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    @Operation(summary = "Create warehouse")
    public ApiResponse<WarehouseDto> createWarehouse(@Valid @RequestBody CreateWarehouseRequest request) {
        return ApiResponse.success(warehouseService.createWarehouse(request), "Warehouse created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    @Operation(summary = "Update warehouse")
    public ApiResponse<WarehouseDto> updateWarehouse(@PathVariable Long id, @Valid @RequestBody CreateWarehouseRequest request) {
        return ApiResponse.success(warehouseService.updateWarehouse(id, request), "Warehouse updated successfully");
    }

    @GetMapping("/{id}/locations")
    @Operation(summary = "Get locations in warehouse")
    public ApiResponse<List<WarehouseLocationDto>> getLocations(@PathVariable Long id) {
        return ApiResponse.success(warehouseService.getLocations(id));
    }

    @PostMapping("/{id}/locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    @Operation(summary = "Add location to warehouse")
    public ApiResponse<WarehouseLocationDto> addLocation(@PathVariable Long id, @Valid @RequestBody CreateLocationRequest request) {
        return ApiResponse.success(warehouseService.addLocation(id, request), "Location added successfully");
    }
}
