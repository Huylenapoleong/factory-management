package com.company.factory.settings.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.settings.dto.SettingResponse;
import com.company.factory.settings.dto.UpdateSettingsRequest;
import com.company.factory.settings.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "White-label configuration & feature flags")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    @Operation(summary = "Get system settings and feature flags")
    public ApiResponse<SettingResponse> getSettings() {
        return ApiResponse.success(systemSettingService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update system settings (Admin/Manager only)")
    public ApiResponse<SettingResponse> updateSettings(@RequestBody UpdateSettingsRequest request) {
        return ApiResponse.success(systemSettingService.updateSettings(request.getSettings()));
    }
}
