package com.company.factory.masterdata.repository;

import com.company.factory.masterdata.domain.UnitOfMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UnitOfMeasurementRepository extends JpaRepository<UnitOfMeasurement, Long> {
    Optional<UnitOfMeasurement> findByCode(String code);
    boolean existsByCode(String code);
}
