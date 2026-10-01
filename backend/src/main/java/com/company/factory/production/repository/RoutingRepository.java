package com.company.factory.production.repository;

import com.company.factory.production.domain.Routing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RoutingRepository extends JpaRepository<Routing, Long>, JpaSpecificationExecutor<Routing> {
    Optional<Routing> findByCode(String code);
    boolean existsByCode(String code);
    List<Routing> findByProductId(Long productId);
    Optional<Routing> findFirstByProductIdAndStatusOrderByVersionDesc(Long productId, String status);
}
