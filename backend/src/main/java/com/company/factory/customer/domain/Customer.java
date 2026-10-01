package com.company.factory.customer.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    private String address;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "payment_term", length = 100)
    private String paymentTerm;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
