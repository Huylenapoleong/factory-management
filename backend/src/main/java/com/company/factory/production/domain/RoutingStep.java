package com.company.factory.production.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "routing_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutingStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routing_id", nullable = false)
    private Routing routing;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "operation_code", nullable = false, length = 50)
    private String operationCode;

    @Column(name = "operation_name_en", nullable = false, length = 100)
    private String operationNameEn;

    @Column(name = "operation_name_zh", length = 100)
    private String operationNameZh;

    @Column(name = "standard_time")
    @Builder.Default
    private Integer standardTime = 0; // in minutes
}
