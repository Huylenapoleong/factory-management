package com.company.factory.masterdata.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.masterdata.domain.ItemType;
import com.company.factory.masterdata.dto.CreateItemRequest;
import com.company.factory.masterdata.dto.ItemDto;
import com.company.factory.masterdata.dto.UpdateItemRequest;
import com.company.factory.masterdata.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
@Tag(name = "Items", description = "Item & Material master data")
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    @Operation(summary = "Get items with search, type, status filter and pagination")
    public ApiResponse<PageResponse<ItemDto>> getItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(itemService.getItems(search, type, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item by ID")
    public ApiResponse<ItemDto> getItemById(@PathVariable Long id) {
        return ApiResponse.success(itemService.getItemById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get item by code")
    public ApiResponse<ItemDto> getItemByCode(@PathVariable String code) {
        return ApiResponse.success(itemService.getItemByCode(code));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'PRODUCTION')")
    @Operation(summary = "Create new item")
    public ApiResponse<ItemDto> createItem(@Valid @RequestBody CreateItemRequest request) {
        return ApiResponse.success(itemService.createItem(request), "Item created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE', 'PRODUCTION')")
    @Operation(summary = "Update item")
    public ApiResponse<ItemDto> updateItem(@PathVariable Long id, @Valid @RequestBody UpdateItemRequest request) {
        return ApiResponse.success(itemService.updateItem(id, request), "Item updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete item (deactivate)")
    public ApiResponse<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ApiResponse.success(null, "Item deactivated successfully");
    }
}
