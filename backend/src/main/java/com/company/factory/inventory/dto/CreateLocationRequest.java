package com.company.factory.inventory.dto;

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
public class CreateLocationRequest {

    @NotBlank(message = "Location code is required")
    @Size(max = 50, message = "Location code max 50 characters")
    private String code;

    private String name;

    @Builder.Default
    private String status = "ACTIVE";
}
