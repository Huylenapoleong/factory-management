package com.company.factory.production.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.production.dto.OperationReportRequest;
import com.company.factory.production.dto.ProductionOperationDto;
import com.company.factory.production.service.ProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/production-operations")
@RequiredArgsConstructor
@Tag(name = "Production Operations", description = "Shop-floor operation reporting")
public class ProductionOperationController {

    private final ProductionOrderService moService;

    @PostMapping("/{id}/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Report completed and scrap quantities on routing step")
    public ApiResponse<ProductionOperationDto> reportProgress(
            @PathVariable Long id,
            @Valid @RequestBody OperationReportRequest request
    ) {
        return ApiResponse.success(moService.reportOperationProgress(id, request), "Progress reported successfully");
    }
}
