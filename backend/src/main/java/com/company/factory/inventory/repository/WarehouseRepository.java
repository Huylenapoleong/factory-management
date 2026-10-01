package com.company.factory.inventory.repository;

import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.domain.WarehouseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long>, JpaSpecificationExecutor<Warehouse> {
    Optional<Warehouse> findByCode(String code);
    boolean existsByCode(String code);
    List<Warehouse> findByType(WarehouseType type);
    List<Warehouse> findByStatus(String status);
}
