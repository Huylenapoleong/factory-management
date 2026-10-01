package com.company.factory.purchasing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoodsReceiptRequest {

    private String receiptNo;

    private Long purchaseOrderId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Receipt date is required")
    private LocalDate receiptDate;

    private String note;

    @NotEmpty(message = "Goods receipt must contain at least one line item")
    @Valid
    private List<CreateGoodsReceiptItemRequest> items;
}
