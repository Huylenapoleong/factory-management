package com.company.factory.production.repository;

import com.company.factory.production.domain.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface BomRepository extends JpaRepository<Bom, Long>, JpaSpecificationExecutor<Bom> {
    Optional<Bom> findByCode(String code);
    boolean existsByCode(String code);
    List<Bom> findByProductId(Long productId);
    Optional<Bom> findFirstByProductIdAndStatusOrderByVersionDesc(Long productId, String status);
}
