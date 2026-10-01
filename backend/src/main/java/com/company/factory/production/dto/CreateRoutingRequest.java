package com.company.factory.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoutingRequest {

    @NotBlank(message = "Routing code is required")
    @Size(max = 50, message = "Routing code max 50 characters")
    private String code;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @Builder.Default
    private String version = "1.0";

    @Builder.Default
    private String status = "ACTIVE";

    @NotEmpty(message = "Routing must have at least one step")
    @Valid
    private List<CreateRoutingStepRequest> steps;
}
