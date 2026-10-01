package com.company.factory.sales.dto;

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
public class CreateSalesOrderRequest {

    private String soNo;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Order date is required")
    private LocalDate orderDate;

    private LocalDate expectedDeliveryDate;

    @Builder.Default
    private String currency = "USD";

    private String note;

    @NotEmpty(message = "Sales order must have at least one line item")
    @Valid
    private List<CreateSalesOrderItemRequest> items;
}
