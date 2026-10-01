package com.company.factory.inventory.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.inventory.domain.*;
import com.company.factory.inventory.dto.InventoryBalanceDto;
import com.company.factory.inventory.dto.StockAdjustmentRequest;
import com.company.factory.inventory.dto.StockTransactionDto;
import com.company.factory.inventory.mapper.StockMapper;
import com.company.factory.inventory.repository.InventoryBalanceRepository;
import com.company.factory.inventory.repository.StockTransactionRepository;
import com.company.factory.inventory.repository.WarehouseLocationRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class InventoryService {

    private final InventoryBalanceRepository balanceRepository;
    private final StockTransactionRepository transactionRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final StockMapper stockMapper;

    @Transactional
    public StockTransaction increaseStock(
            Long warehouseId,
            Long locationId,
            Long itemId,
            BigDecimal quantity,
            BigDecimal unitPrice,
            TransactionType type,
            String refType,
            String refId,
            String note,
            Long userId
    ) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Quantity must be greater than zero");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "Warehouse not found: " + warehouseId));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found: " + itemId));

        WarehouseLocation location = null;
        if (locationId != null) {
            location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND", "Location not found: " + locationId));
        }

        InventoryBalance balance = balanceRepository.findByWarehouseAndLocationAndItemForUpdate(warehouseId, locationId, itemId)
                .orElseGet(() -> InventoryBalance.builder()
                        .warehouse(warehouse)
                        .location(locationId != null ? locationRepository.findById(locationId).orElse(null) : null)
                        .item(item)
                        .quantity(BigDecimal.ZERO)
                        .reservedQuantity(BigDecimal.ZERO)
                        .build());

        balance.setQuantity(balance.getQuantity().add(quantity));
        balanceRepository.save(balance);

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        String txnNo = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        StockTransaction transaction = StockTransaction.builder()
                .transactionNo(txnNo)
                .transactionType(type)
                .item(item)
                .warehouse(warehouse)
                .location(location)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .referenceType(refType)
                .referenceId(refId)
                .note(note)
                .createdBy(user)
                .createdAt(Instant.now())
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public StockTransaction decreaseStock(
            Long warehouseId,
            Long locationId,
            Long itemId,
            BigDecimal quantity,
            BigDecimal unitPrice,
            TransactionType type,
            String refType,
            String refId,
            String note,
            Long userId
    ) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Quantity must be greater than zero");
        }

        InventoryBalance balance = balanceRepository.findByWarehouseAndLocationAndItemForUpdate(warehouseId, locationId, itemId)
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK",
                        "No inventory balance exists for item ID " + itemId + " in warehouse " + warehouseId));

        BigDecimal available = balance.computeAvailableQuantity();
        if (available.compareTo(quantity) < 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK",
                    "Insufficient available stock for item ID " + itemId + ": requested " + quantity + ", available " + available);
        }

        balance.setQuantity(balance.getQuantity().subtract(quantity));
        balanceRepository.save(balance);

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        String txnNo = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        StockTransaction transaction = StockTransaction.builder()
                .transactionNo(txnNo)
                .transactionType(type)
                .item(balance.getItem())
                .warehouse(balance.getWarehouse())
                .location(balance.getLocation())
                .quantity(quantity.negate())
                .unitPrice(unitPrice)
                .referenceType(refType)
                .referenceId(refId)
                .note(note)
                .createdBy(user)
                .createdAt(Instant.now())
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public void reserveStock(Long warehouseId, Long locationId, Long itemId, BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        InventoryBalance balance = balanceRepository.findByWarehouseAndLocationAndItemForUpdate(warehouseId, locationId, itemId)
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK",
                        "Cannot reserve stock: no inventory balance exists for item ID " + itemId));

        BigDecimal available = balance.computeAvailableQuantity();
        if (available.compareTo(quantity) < 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_STOCK",
                    "Cannot reserve stock for item ID " + itemId + ": requested " + quantity + ", available " + available);
        }

        balance.setReservedQuantity(balance.getReservedQuantity().add(quantity));
        balanceRepository.save(balance);
    }

    @Transactional
    public void releaseReservedStock(Long warehouseId, Long locationId, Long itemId, BigDecimal quantity) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        balanceRepository.findByWarehouseAndLocationAndItemForUpdate(warehouseId, locationId, itemId)
                .ifPresent(balance -> {
                    BigDecimal newReserved = balance.getReservedQuantity().subtract(quantity);
                    if (newReserved.compareTo(BigDecimal.ZERO) < 0) {
                        newReserved = BigDecimal.ZERO;
                    }
                    balance.setReservedQuantity(newReserved);
                    balanceRepository.save(balance);
                });
    }

    @Transactional
    public StockTransactionDto adjustStock(StockAdjustmentRequest request, Long userId) {
        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Adjustment quantity cannot be zero");
        }

        StockTransaction txn;
        if (request.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
            txn = increaseStock(
                    request.getWarehouseId(),
                    request.getLocationId(),
                    request.getItemId(),
                    request.getQuantity(),
                    request.getUnitPrice(),
                    TransactionType.INVENTORY_ADJUSTMENT,
                    "MANUAL_ADJUSTMENT",
                    null,
                    request.getNote(),
                    userId
            );
        } else {
            txn = decreaseStock(
                    request.getWarehouseId(),
                    request.getLocationId(),
                    request.getItemId(),
                    request.getQuantity().abs(),
                    request.getUnitPrice(),
                    TransactionType.INVENTORY_ADJUSTMENT,
                    "MANUAL_ADJUSTMENT",
                    null,
                    request.getNote(),
                    userId
            );
        }

        return stockMapper.toTransactionDto(txn);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryBalanceDto> getBalances(Long warehouseId, Long itemId, Boolean lowStockOnly, Pageable pageable) {
        Specification<InventoryBalance> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), warehouseId));
            }
            if (itemId != null) {
                predicates.add(cb.equal(root.get("item").get("id"), itemId));
            }
            if (Boolean.TRUE.equals(lowStockOnly)) {
                predicates.add(cb.lessThanOrEqualTo(
                        cb.diff(root.<BigDecimal>get("quantity"), root.<BigDecimal>get("reservedQuantity")),
                        root.get("item").<BigDecimal>get("minStock")
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<InventoryBalanceDto> page = balanceRepository.findAll(spec, pageable).map(stockMapper::toBalanceDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceDto> getLowStockBalances() {
        return balanceRepository.findLowStockBalances().stream()
                .map(stockMapper::toBalanceDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<StockTransactionDto> getTransactions(Long warehouseId, Long itemId, TransactionType type, Pageable pageable) {
        Specification<StockTransaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (warehouseId != null) {
                predicates.add(cb.equal(root.get("warehouse").get("id"), warehouseId));
            }
            if (itemId != null) {
                predicates.add(cb.equal(root.get("item").get("id"), itemId));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("transactionType"), type));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StockTransactionDto> page = transactionRepository.findAll(spec, pageable).map(stockMapper::toTransactionDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public List<StockTransactionDto> getRecentTransactions() {
        return transactionRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(stockMapper::toTransactionDto)
                .toList();
    }
}
