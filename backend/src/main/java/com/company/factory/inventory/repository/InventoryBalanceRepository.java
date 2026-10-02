package com.company.factory.inventory.repository;

import com.company.factory.inventory.domain.InventoryBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long>, JpaSpecificationExecutor<InventoryBalance> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InventoryBalance b WHERE b.warehouse.id = :warehouseId AND ((:locationId IS NULL AND b.location IS NULL) OR b.location.id = :locationId) AND b.item.id = :itemId")
    Optional<InventoryBalance> findByWarehouseAndLocationAndItemForUpdate(
            @Param("warehouseId") Long warehouseId,
            @Param("locationId") Long locationId,
            @Param("itemId") Long itemId
    );

    @Query("SELECT b FROM InventoryBalance b WHERE b.warehouse.id = :warehouseId AND ((:locationId IS NULL AND b.location IS NULL) OR b.location.id = :locationId) AND b.item.id = :itemId")
    Optional<InventoryBalance> findByWarehouseAndLocationAndItem(
            @Param("warehouseId") Long warehouseId,
            @Param("locationId") Long locationId,
            @Param("itemId") Long itemId
    );

    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM InventoryBalance b WHERE b.item.id = :itemId")
    BigDecimal getTotalQuantityByItemId(@Param("itemId") Long itemId);

    @Query("SELECT COALESCE(SUM(b.quantity - b.reservedQuantity), 0) FROM InventoryBalance b WHERE b.item.id = :itemId")
    BigDecimal getTotalAvailableQuantityByItemId(@Param("itemId") Long itemId);

    @Query("SELECT b.item.id, COALESCE(SUM(b.quantity - b.reservedQuantity), 0) FROM InventoryBalance b WHERE b.item.id IN :itemIds GROUP BY b.item.id")
    List<Object[]> sumAvailableQuantityByItemIds(@Param("itemIds") Collection<Long> itemIds);

    @Query("SELECT b FROM InventoryBalance b JOIN b.item i WHERE (b.quantity - b.reservedQuantity) <= i.minStock")
    List<InventoryBalance> findLowStockBalances();

    List<InventoryBalance> findByWarehouseId(Long warehouseId);

    List<InventoryBalance> findByItemId(Long itemId);
}
