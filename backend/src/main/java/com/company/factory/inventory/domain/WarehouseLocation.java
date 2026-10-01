package com.company.factory.inventory.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "warehouse_locations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"warehouse_id", "code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
