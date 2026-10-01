package com.company.factory.inventory.repository;

import com.company.factory.inventory.domain.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, Long> {
    List<WarehouseLocation> findByWarehouseId(Long warehouseId);
    Optional<WarehouseLocation> findByWarehouseIdAndCode(Long warehouseId, String code);
    boolean existsByWarehouseIdAndCode(Long warehouseId, String code);
}
