package com.company.factory.masterdata.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCategoryDto {
    private Long id;

    @NotBlank(message = "Category code is required")
    @Size(max = 50, message = "Category code max 50 characters")
    private String code;

    @NotBlank(message = "Category English name is required")
    @Size(max = 100, message = "Category name max 100 characters")
    private String nameEn;

    private String nameZh;
    private String description;
    private Instant createdAt;
}
