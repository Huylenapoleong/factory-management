package com.company.factory.role.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.role.dto.RoleDto;
import com.company.factory.role.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role management APIs")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "Get all available system roles")
    public ApiResponse<List<RoleDto>> getAllRoles() {
        return ApiResponse.success(roleService.getAllRoles());
    }
}
