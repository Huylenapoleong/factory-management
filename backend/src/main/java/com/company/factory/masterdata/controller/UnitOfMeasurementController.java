package com.company.factory.masterdata.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.masterdata.dto.UnitOfMeasurementDto;
import com.company.factory.masterdata.service.UnitOfMeasurementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units-of-measurement")
@RequiredArgsConstructor
@Tag(name = "Units of Measurement", description = "UoM master data")
public class UnitOfMeasurementController {

    private final UnitOfMeasurementService unitService;

    @GetMapping
    @Operation(summary = "Get all units of measurement")
    public ApiResponse<List<UnitOfMeasurementDto>> getAllUnits() {
        return ApiResponse.success(unitService.getAllUnits());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get unit of measurement by ID")
    public ApiResponse<UnitOfMeasurementDto> getUnitById(@PathVariable Long id) {
        return ApiResponse.success(unitService.getUnitById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create new unit of measurement")
    public ApiResponse<UnitOfMeasurementDto> createUnit(@Valid @RequestBody UnitOfMeasurementDto dto) {
        return ApiResponse.success(unitService.createUnit(dto), "Unit created");
    }
}
