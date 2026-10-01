package com.company.factory.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierRequest {

    @NotBlank(message = "Supplier code is required")
    @Size(max = 50, message = "Supplier code max 50 characters")
    private String code;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 200, message = "Supplier name max 200 characters")
    private String name;

    private String nameZh;
    private String taxCode;
    private String phone;
    private String email;
    private String address;
    private String contactPerson;

    @Builder.Default
    private String currency = "USD";

    private String paymentTerm;

    @Builder.Default
    private String status = "ACTIVE";
}
