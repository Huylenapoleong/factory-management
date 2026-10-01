package com.company.factory.masterdata.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.UnitOfMeasurement;
import com.company.factory.masterdata.dto.UnitOfMeasurementDto;
import com.company.factory.masterdata.mapper.ItemMapper;
import com.company.factory.masterdata.repository.UnitOfMeasurementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitOfMeasurementService {

    private final UnitOfMeasurementRepository unitRepository;
    private final ItemMapper itemMapper;

    @Transactional(readOnly = true)
    public List<UnitOfMeasurementDto> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(itemMapper::toUnitDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UnitOfMeasurementDto getUnitById(Long id) {
        return unitRepository.findById(id)
                .map(itemMapper::toUnitDto)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "UNIT_NOT_FOUND", "Unit of measurement not found: " + id));
    }

    @Transactional
    public UnitOfMeasurementDto createUnit(UnitOfMeasurementDto dto) {
        if (unitRepository.existsByCode(dto.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Unit code already exists: " + dto.getCode());
        }
        UnitOfMeasurement unit = itemMapper.toUnitEntity(dto);
        return itemMapper.toUnitDto(unitRepository.save(unit));
    }
}
