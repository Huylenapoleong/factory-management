package com.company.factory.settings.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"key\"", nullable = false, unique = true, length = 100)
    private String key;

    @Column(name = "\"value\"", nullable = false, columnDefinition = "TEXT")
    private String value;

    private String description;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
