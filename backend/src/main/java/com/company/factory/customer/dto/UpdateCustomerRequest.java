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
public class UpdateCustomerRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 200, message = "Customer name max 200 characters")
    private String name;

    private String nameZh;
    private String taxCode;
    private String phone;
    private String email;
    private String address;
    private String contactPerson;
    private String currency;
    private String paymentTerm;
    private String status;
}
