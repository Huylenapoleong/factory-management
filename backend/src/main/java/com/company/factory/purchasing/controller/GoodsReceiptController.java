package com.company.factory.purchasing.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.common.response.PageResponse;
import com.company.factory.purchasing.dto.CreateGoodsReceiptRequest;
import com.company.factory.purchasing.dto.GoodsReceiptDto;
import com.company.factory.purchasing.service.GoodsReceiptService;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/goods-receipts")
@RequiredArgsConstructor
@Tag(name = "Goods Receipts", description = "Inbound goods receipt and inventory posting")
public class GoodsReceiptController {

    private final GoodsReceiptService receiptService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get goods receipts with filters and pagination")
    public ApiResponse<PageResponse<GoodsReceiptDto>> getGoodsReceipts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(receiptService.getGoodsReceipts(search, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goods receipt by ID")
    public ApiResponse<GoodsReceiptDto> getGoodsReceiptById(@PathVariable Long id) {
        return ApiResponse.success(receiptService.getGoodsReceiptById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    @Operation(summary = "Create draft goods receipt")
    public ApiResponse<GoodsReceiptDto> createGoodsReceipt(
            @Valid @RequestBody CreateGoodsReceiptRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ApiResponse.success(receiptService.createGoodsReceipt(request, userId), "Goods receipt created");
    }

    @PostMapping("/{id}/post")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WAREHOUSE')")
    @Operation(summary = "Post goods receipt (atomically increases inventory stock and logs transaction)")
    public ApiResponse<GoodsReceiptDto> postGoodsReceipt(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByUsername(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return ApiResponse.success(receiptService.postGoodsReceipt(id, userId), "Goods receipt posted and stock updated");
    }
}
