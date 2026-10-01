package com.company.factory.production.domain;

import com.company.factory.masterdata.domain.Item;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "production_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_order_id", nullable = false)
    private ProductionOrder productionOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Item material;

    @Column(name = "required_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal requiredQuantity;

    @Column(name = "issued_quantity", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal issuedQuantity = BigDecimal.ZERO;
}
