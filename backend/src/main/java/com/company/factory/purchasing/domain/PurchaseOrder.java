package com.company.factory.purchasing.domain;

import com.company.factory.supplier.domain.Supplier;
import com.company.factory.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_no", nullable = false, unique = true, length = 100)
    private String poNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, CONFIRMED, PARTIAL_RECEIVED, RECEIVED, CANCELLED

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 15, scale = 4)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
