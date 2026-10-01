package com.company.factory.masterdata.repository;

import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {
    Optional<Item> findByCode(String code);
    boolean existsByCode(String code);
    List<Item> findByType(ItemType type);
    List<Item> findByStatus(String status);
}
