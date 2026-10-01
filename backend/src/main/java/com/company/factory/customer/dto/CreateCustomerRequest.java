package com.company.factory.customer.dto;

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
public class CreateCustomerRequest {

    @NotBlank(message = "Customer code is required")
    @Size(max = 50, message = "Customer code max 50 characters")
    private String code;

    @NotBlank(message = "Customer name is required")
    @Size(max = 200, message = "Customer name max 200 characters")
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
