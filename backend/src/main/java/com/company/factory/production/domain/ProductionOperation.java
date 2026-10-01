package com.company.factory.production.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "production_operations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_order_id", nullable = false)
    private ProductionOrder productionOrder;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "operation_code", nullable = false, length = 50)
    private String operationCode;

    @Column(name = "operation_name_en", nullable = false, length = 100)
    private String operationNameEn;

    @Column(name = "operation_name_zh", length = 100)
    private String operationNameZh;

    @Column(name = "target_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal targetQuantity;

    @Column(name = "completed_quantity", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal completedQuantity = BigDecimal.ZERO;

    @Column(name = "scrap_quantity", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal scrapQuantity = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED
}
