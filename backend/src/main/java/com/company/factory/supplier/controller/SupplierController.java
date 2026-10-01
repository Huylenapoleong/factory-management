package com.company.factory.supplier.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.supplier.dto.CreateSupplierRequest;
import com.company.factory.supplier.dto.SupplierDto;
import com.company.factory.supplier.dto.UpdateSupplierRequest;
import com.company.factory.supplier.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Supplier master data")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get suppliers with search, status filter and pagination")
    public ApiResponse<PageResponse<SupplierDto>> getSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(supplierService.getSuppliers(search, status, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active suppliers for dropdowns")
    public ApiResponse<List<SupplierDto>> getActiveSuppliers() {
        return ApiResponse.success(supplierService.getAllActiveSuppliers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ApiResponse<SupplierDto> getSupplierById(@PathVariable Long id) {
        return ApiResponse.success(supplierService.getSupplierById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PURCHASING')")
    @Operation(summary = "Create new supplier")
    public ApiResponse<SupplierDto> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        return ApiResponse.success(supplierService.createSupplier(request), "Supplier created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PURCHASING')")
    @Operation(summary = "Update supplier")
    public ApiResponse<SupplierDto> updateSupplier(@PathVariable Long id, @Valid @RequestBody UpdateSupplierRequest request) {
        return ApiResponse.success(supplierService.updateSupplier(id, request), "Supplier updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete supplier (deactivate)")
    public ApiResponse<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.success(null, "Supplier deactivated successfully");
    }
}
