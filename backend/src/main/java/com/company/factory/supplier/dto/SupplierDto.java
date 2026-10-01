package com.company.factory.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {
    private Long id;
    private String code;
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
    private Instant createdAt;
    private Instant updatedAt;
}
