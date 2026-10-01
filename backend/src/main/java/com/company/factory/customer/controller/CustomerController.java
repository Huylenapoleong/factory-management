package com.company.factory.customer.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.customer.dto.CreateCustomerRequest;
import com.company.factory.customer.dto.CustomerDto;
import com.company.factory.customer.dto.UpdateCustomerRequest;
import com.company.factory.customer.service.CustomerService;
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
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer master data")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get customers with search, status filter and pagination")
    public ApiResponse<PageResponse<CustomerDto>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(customerService.getCustomers(search, status, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active customers for dropdowns")
    public ApiResponse<List<CustomerDto>> getActiveCustomers() {
        return ApiResponse.success(customerService.getAllActiveCustomers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ApiResponse<CustomerDto> getCustomerById(@PathVariable Long id) {
        return ApiResponse.success(customerService.getCustomerById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "Create new customer")
    public ApiResponse<CustomerDto> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return ApiResponse.success(customerService.createCustomer(request), "Customer created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "Update customer")
    public ApiResponse<CustomerDto> updateCustomer(@PathVariable Long id, @Valid @RequestBody UpdateCustomerRequest request) {
        return ApiResponse.success(customerService.updateCustomer(id, request), "Customer updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete customer (deactivate)")
    public ApiResponse<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ApiResponse.success(null, "Customer deactivated successfully");
    }
}
