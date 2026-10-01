package com.company.factory.masterdata.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.masterdata.dto.ItemCategoryDto;
import com.company.factory.masterdata.service.ItemCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/item-categories")
@RequiredArgsConstructor
@Tag(name = "Item Categories", description = "Product category master data")
public class ItemCategoryController {

    private final ItemCategoryService itemCategoryService;

    @GetMapping
    @Operation(summary = "Get all item categories")
    public ApiResponse<List<ItemCategoryDto>> getAllCategories() {
        return ApiResponse.success(itemCategoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item category by ID")
    public ApiResponse<ItemCategoryDto> getCategoryById(@PathVariable Long id) {
        return ApiResponse.success(itemCategoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create new item category")
    public ApiResponse<ItemCategoryDto> createCategory(@Valid @RequestBody ItemCategoryDto dto) {
        return ApiResponse.success(itemCategoryService.createCategory(dto), "Item category created");
    }
}
