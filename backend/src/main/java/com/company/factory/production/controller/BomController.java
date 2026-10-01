package com.company.factory.production.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.production.dto.BomDto;
import com.company.factory.production.dto.CreateBomRequest;
import com.company.factory.production.service.BomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/boms")
@RequiredArgsConstructor
@Tag(name = "Bill of Materials", description = "Product BOM recipes and components")
public class BomController {

    private final BomService bomService;

    @GetMapping
    @Operation(summary = "Get BOMs by product or status")
    public ApiResponse<List<BomDto>> getBoms(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.success(bomService.getBoms(productId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get BOM by ID")
    public ApiResponse<BomDto> getBomById(@PathVariable Long id) {
        return ApiResponse.success(bomService.getBomById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Create new BOM")
    public ApiResponse<BomDto> createBom(@Valid @RequestBody CreateBomRequest request) {
        return ApiResponse.success(bomService.createBom(request), "BOM created successfully");
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Update BOM status (ACTIVE/INACTIVE)")
    public ApiResponse<BomDto> updateBomStatus(@PathVariable Long id, @RequestParam String status) {
        return ApiResponse.success(bomService.updateBomStatus(id, status), "BOM status updated");
    }
}
