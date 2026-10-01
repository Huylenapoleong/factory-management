package com.company.factory.masterdata.repository;

import com.company.factory.masterdata.domain.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemCategoryRepository extends JpaRepository<ItemCategory, Long> {
    Optional<ItemCategory> findByCode(String code);
    boolean existsByCode(String code);
}
