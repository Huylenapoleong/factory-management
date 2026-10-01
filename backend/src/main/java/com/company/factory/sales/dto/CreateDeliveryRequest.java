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
public class CreateDeliveryRequest {

    private String deliveryNo;

    private Long salesOrderId;

    @NotNull(message = "Source warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    private String note;

    @NotEmpty(message = "Delivery must contain at least one item")
    @Valid
    private List<CreateDeliveryItemRequest> items;
}
