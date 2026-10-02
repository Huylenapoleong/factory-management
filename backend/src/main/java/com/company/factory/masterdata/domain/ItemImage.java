package com.company.factory.masterdata.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "item_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemImage {

    @Id
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "size_bytes", nullable = false)
    private Integer sizeBytes;

    @Column(nullable = false)
    private byte[] data;

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
