package com.company.factory.masterdata.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "units_of_measurement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitOfMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "name_en", nullable = false, length = 50)
    private String nameEn;

    @Column(name = "name_zh", length = 50)
    private String nameZh;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
