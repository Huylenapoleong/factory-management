package com.company.factory.production.domain;

import com.company.factory.masterdata.domain.Item;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "bom_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id", nullable = false)
    private Bom bom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Item material;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "scrap_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal scrapRate = BigDecimal.ZERO;

    public BigDecimal requiredQuantityFor(BigDecimal plannedQuantity) {
        BigDecimal rate = scrapRate != null ? scrapRate : BigDecimal.ZERO;
        BigDecimal scrapFactor = BigDecimal.ONE.add(rate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        return plannedQuantity.multiply(quantity).multiply(scrapFactor);
    }
}
