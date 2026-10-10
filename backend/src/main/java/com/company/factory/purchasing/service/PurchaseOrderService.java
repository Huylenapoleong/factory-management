package com.company.factory.purchasing.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.purchasing.domain.PurchaseOrder;
import com.company.factory.purchasing.domain.PurchaseOrderItem;
import com.company.factory.purchasing.dto.CreatePurchaseOrderItemRequest;
import com.company.factory.purchasing.dto.CreatePurchaseOrderRequest;
import com.company.factory.purchasing.dto.ItemSupplyDto;
import com.company.factory.purchasing.dto.PurchaseOrderDto;
import com.company.factory.purchasing.mapper.PurchasingMapper;
import com.company.factory.purchasing.repository.PurchaseOrderRepository;
import com.company.factory.supplier.domain.Supplier;
import com.company.factory.supplier.repository.SupplierRepository;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final PurchasingMapper purchasingMapper;

    private static final Set<String> OPEN_STATUSES = Set.of("DRAFT", "CONFIRMED", "PARTIAL_RECEIVED");

    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDto> getPurchaseOrders(String search, String status, Pageable pageable) {
        Specification<PurchaseOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate poMatch = cb.like(cb.lower(root.get("poNo")), pattern);
                Predicate supMatch = cb.like(cb.lower(root.get("supplier").get("name")), pattern);
                predicates.add(cb.or(poMatch, supMatch));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PurchaseOrderDto> page = poRepository.findAll(spec, pageable).map(po -> {
            PurchaseOrderDto dto = purchasingMapper.toPoDto(po);
            dto.setItems(po.getItems().stream().map(purchasingMapper::toPoItemDto).toList());
            return dto;
        });
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public Map<Long, ItemSupplyDto> getItemSupply(Collection<Long> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<PurchaseOrderItem>> linesByItem = new HashMap<>();
        for (PurchaseOrderItem line : poRepository.findActiveLinesByItemIds(itemIds)) {
            linesByItem.computeIfAbsent(line.getItem().getId(), id -> new ArrayList<>()).add(line);
        }

        Map<Long, ItemSupplyDto> result = new HashMap<>();
        linesByItem.forEach((itemId, lines) -> {
            PurchaseOrderItem latest = lines.get(0);
            BigDecimal onOrder = BigDecimal.ZERO;
            LocalDate nextExpected = null;
            long leadDaysSum = 0;
            int leadSamples = 0;

            for (PurchaseOrderItem line : lines) {
                PurchaseOrder po = line.getPurchaseOrder();
                BigDecimal remaining = line.getQuantity().subtract(line.getReceivedQuantity()).max(BigDecimal.ZERO);
                if (OPEN_STATUSES.contains(po.getStatus()) && remaining.signum() > 0) {
                    onOrder = onOrder.add(remaining);
                    if (po.getExpectedDate() != null && (nextExpected == null || po.getExpectedDate().isAfter(nextExpected))) {
                        nextExpected = po.getExpectedDate();
                    }
                }
                if (po.getExpectedDate() != null && !po.getExpectedDate().isBefore(po.getOrderDate())) {
                    leadDaysSum += ChronoUnit.DAYS.between(po.getOrderDate(), po.getExpectedDate());
                    leadSamples++;
                }
            }

            result.put(itemId, ItemSupplyDto.builder()
                    .itemId(itemId)
                    .onOrderQuantity(onOrder)
                    .nextExpectedDate(nextExpected)
                    .lastSupplierId(latest.getPurchaseOrder().getSupplier().getId())
                    .lastSupplierName(latest.getPurchaseOrder().getSupplier().getName())
                    .lastUnitPrice(latest.getUnitPrice())
                    .leadTimeDays(leadSamples > 0 ? (int) Math.round((double) leadDaysSum / leadSamples) : null)
                    .build());
        });
        return result;
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(Long id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));
        PurchaseOrderDto dto = purchasingMapper.toPoDto(po);
        dto.setItems(po.getItems().stream().map(purchasingMapper::toPoItemDto).toList());
        return dto;
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(CreatePurchaseOrderRequest request, Long userId) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found: " + request.getSupplierId()));

        String poNo = request.getPoNo();
        if (poNo == null || poNo.isBlank()) {
            poNo = "PO-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else if (poRepository.existsByPoNo(poNo)) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_PO_NO", "Purchase order number already exists: " + poNo);
        }

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        PurchaseOrder po = PurchaseOrder.builder()
                .poNo(poNo)
                .supplier(supplier)
                .orderDate(request.getOrderDate())
                .expectedDate(request.getExpectedDate())
                .status("DRAFT")
                .currency(request.getCurrency())
                .note(request.getNote())
                .createdBy(user)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        for (CreatePurchaseOrderItemRequest itemReq : request.getItems()) {
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found: " + itemReq.getItemId()));

            BigDecimal amount = itemReq.getQuantity().multiply(itemReq.getUnitPrice());
            subtotal = subtotal.add(amount);

            PurchaseOrderItem poItem = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .item(item)
                    .quantity(itemReq.getQuantity())
                    .receivedQuantity(BigDecimal.ZERO)
                    .unitPrice(itemReq.getUnitPrice())
                    .amount(amount)
                    .build();

            items.add(poItem);
        }

        po.setSubtotal(subtotal);
        po.setTotalAmount(subtotal);
        po.setItems(items);

        PurchaseOrder savedPo = poRepository.save(po);
        PurchaseOrderDto dto = purchasingMapper.toPoDto(savedPo);
        dto.setItems(savedPo.getItems().stream().map(purchasingMapper::toPoItemDto).toList());
        return dto;
    }

    @Transactional
    public PurchaseOrderDto confirmPurchaseOrder(Long id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));

        if (!"DRAFT".equals(po.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only DRAFT purchase orders can be confirmed");
        }

        po.setStatus("CONFIRMED");
        PurchaseOrder savedPo = poRepository.save(po);
        PurchaseOrderDto dto = purchasingMapper.toPoDto(savedPo);
        dto.setItems(savedPo.getItems().stream().map(purchasingMapper::toPoItemDto).toList());
        return dto;
    }

    @Transactional
    public PurchaseOrderDto cancelPurchaseOrder(Long id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));

        if ("RECEIVED".equals(po.getStatus()) || "PARTIAL_RECEIVED".equals(po.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Cannot cancel an order that has already received items");
        }

        po.setStatus("CANCELLED");
        PurchaseOrder savedPo = poRepository.save(po);
        PurchaseOrderDto dto = purchasingMapper.toPoDto(savedPo);
        dto.setItems(savedPo.getItems().stream().map(purchasingMapper::toPoItemDto).toList());
        return dto;
    }
}
