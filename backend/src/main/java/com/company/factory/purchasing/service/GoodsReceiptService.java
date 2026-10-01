package com.company.factory.purchasing.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.domain.WarehouseLocation;
import com.company.factory.inventory.repository.WarehouseLocationRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.purchasing.domain.*;
import com.company.factory.purchasing.dto.CreateGoodsReceiptItemRequest;
import com.company.factory.purchasing.dto.CreateGoodsReceiptRequest;
import com.company.factory.purchasing.dto.GoodsReceiptDto;
import com.company.factory.purchasing.mapper.PurchasingMapper;
import com.company.factory.purchasing.repository.GoodsReceiptRepository;
import com.company.factory.purchasing.repository.ItemPriceHistoryRepository;
import com.company.factory.purchasing.repository.PurchaseOrderRepository;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptRepository receiptRepository;
    private final PurchaseOrderRepository poRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ItemRepository itemRepository;
    private final ItemPriceHistoryRepository priceHistoryRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final PurchasingMapper purchasingMapper;

    @Transactional(readOnly = true)
    public PageResponse<GoodsReceiptDto> getGoodsReceipts(String search, String status, Pageable pageable) {
        Specification<GoodsReceipt> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate receiptMatch = cb.like(cb.lower(root.get("receiptNo")), pattern);
                predicates.add(receiptMatch);
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<GoodsReceiptDto> page = receiptRepository.findAll(spec, pageable).map(receipt -> {
            GoodsReceiptDto dto = purchasingMapper.toReceiptDto(receipt);
            dto.setItems(receipt.getItems().stream().map(purchasingMapper::toReceiptItemDto).toList());
            return dto;
        });
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public GoodsReceiptDto getGoodsReceiptById(Long id) {
        GoodsReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RECEIPT_NOT_FOUND", "Goods receipt not found: " + id));
        GoodsReceiptDto dto = purchasingMapper.toReceiptDto(receipt);
        dto.setItems(receipt.getItems().stream().map(purchasingMapper::toReceiptItemDto).toList());
        return dto;
    }

    @Transactional
    public GoodsReceiptDto createGoodsReceipt(CreateGoodsReceiptRequest request, Long userId) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "Warehouse not found: " + request.getWarehouseId()));

        PurchaseOrder po = null;
        if (request.getPurchaseOrderId() != null) {
            po = poRepository.findById(request.getPurchaseOrderId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + request.getPurchaseOrderId()));
        }

        String receiptNo = request.getReceiptNo();
        if (receiptNo == null || receiptNo.isBlank()) {
            receiptNo = "GR-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else if (receiptRepository.existsByReceiptNo(receiptNo)) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_RECEIPT_NO", "Goods receipt number already exists: " + receiptNo);
        }

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        GoodsReceipt receipt = GoodsReceipt.builder()
                .receiptNo(receiptNo)
                .purchaseOrder(po)
                .warehouse(warehouse)
                .receiptDate(request.getReceiptDate())
                .status("DRAFT")
                .note(request.getNote())
                .createdBy(user)
                .build();

        List<GoodsReceiptItem> items = new ArrayList<>();
        for (CreateGoodsReceiptItemRequest itemReq : request.getItems()) {
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found: " + itemReq.getItemId()));

            WarehouseLocation location = null;
            if (itemReq.getLocationId() != null) {
                location = locationRepository.findById(itemReq.getLocationId())
                        .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND", "Location not found: " + itemReq.getLocationId()));
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : item.getPurchasePrice();

            GoodsReceiptItem receiptItem = GoodsReceiptItem.builder()
                    .goodsReceipt(receipt)
                    .item(item)
                    .location(location)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .build();

            items.add(receiptItem);
        }

        receipt.setItems(items);
        GoodsReceipt savedReceipt = receiptRepository.save(receipt);
        GoodsReceiptDto dto = purchasingMapper.toReceiptDto(savedReceipt);
        dto.setItems(savedReceipt.getItems().stream().map(purchasingMapper::toReceiptItemDto).toList());
        return dto;
    }

    @Transactional
    public GoodsReceiptDto postGoodsReceipt(Long id, Long userId) {
        GoodsReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RECEIPT_NOT_FOUND", "Goods receipt not found: " + id));

        if (!"DRAFT".equals(receipt.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only DRAFT receipts can be posted");
        }

        PurchaseOrder po = receipt.getPurchaseOrder();

        for (GoodsReceiptItem item : receipt.getItems()) {
            Long locId = item.getLocation() != null ? item.getLocation().getId() : null;

            inventoryService.increaseStock(
                    receipt.getWarehouse().getId(),
                    locId,
                    item.getItem().getId(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    TransactionType.PURCHASE_IN,
                    "GOODS_RECEIPT",
                    receipt.getReceiptNo(),
                    receipt.getNote(),
                    userId
            );

            if (po != null) {
                po.getItems().stream()
                        .filter(poItem -> poItem.getItem().getId().equals(item.getItem().getId()))
                        .findFirst()
                        .ifPresent(poItem -> {
                            BigDecimal newReceived = poItem.getReceivedQuantity().add(item.getQuantity());
                            poItem.setReceivedQuantity(newReceived);
                        });
            }

            if (item.getUnitPrice() != null && item.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
                ItemPriceHistory priceHistory = ItemPriceHistory.builder()
                        .item(item.getItem())
                        .priceType("PURCHASE")
                        .supplier(po != null ? po.getSupplier() : null)
                        .price(item.getUnitPrice())
                        .effectiveFrom(Instant.now())
                        .build();
                priceHistoryRepository.save(priceHistory);
            }
        }

        if (po != null) {
            boolean allFullyReceived = po.getItems().stream()
                    .allMatch(poItem -> poItem.getReceivedQuantity().compareTo(poItem.getQuantity()) >= 0);
            po.setStatus(allFullyReceived ? "RECEIVED" : "PARTIAL_RECEIVED");
            poRepository.save(po);
        }

        receipt.setStatus("POSTED");
        GoodsReceipt savedReceipt = receiptRepository.save(receipt);

        GoodsReceiptDto dto = purchasingMapper.toReceiptDto(savedReceipt);
        dto.setItems(savedReceipt.getItems().stream().map(purchasingMapper::toReceiptItemDto).toList());
        return dto;
    }
}
