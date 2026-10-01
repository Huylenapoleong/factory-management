package com.company.factory.inventory.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.domain.WarehouseLocation;
import com.company.factory.inventory.domain.WarehouseType;
import com.company.factory.inventory.dto.CreateLocationRequest;
import com.company.factory.inventory.dto.CreateWarehouseRequest;
import com.company.factory.inventory.dto.WarehouseDto;
import com.company.factory.inventory.dto.WarehouseLocationDto;
import com.company.factory.inventory.mapper.WarehouseMapper;
import com.company.factory.inventory.repository.WarehouseLocationRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final WarehouseMapper warehouseMapper;

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses(WarehouseType type, String status) {
        List<Warehouse> warehouses;
        if (type != null && status != null) {
            warehouses = warehouseRepository.findAll((root, query, cb) ->
                    cb.and(cb.equal(root.get("type"), type), cb.equal(root.get("status"), status)));
        } else if (type != null) {
            warehouses = warehouseRepository.findByType(type);
        } else if (status != null) {
            warehouses = warehouseRepository.findByStatus(status);
        } else {
            warehouses = warehouseRepository.findAll();
        }

        return warehouses.stream()
                .map(w -> {
                    WarehouseDto dto = warehouseMapper.toDto(w);
                    dto.setLocations(w.getLocations().stream().map(warehouseMapper::toLocationDto).toList());
                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "Warehouse not found: " + id));
        WarehouseDto dto = warehouseMapper.toDto(warehouse);
        dto.setLocations(warehouse.getLocations().stream().map(warehouseMapper::toLocationDto).toList());
        return dto;
    }

    @Transactional
    public WarehouseDto createWarehouse(CreateWarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Warehouse code already exists: " + request.getCode());
        }

        Warehouse warehouse = warehouseMapper.toEntity(request);
        return warehouseMapper.toDto(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseDto updateWarehouse(Long id, CreateWarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "Warehouse not found: " + id));

        warehouse.setNameEn(request.getNameEn());
        warehouse.setNameZh(request.getNameZh());
        warehouse.setType(request.getType());
        warehouse.setAddress(request.getAddress());
        if (request.getStatus() != null) warehouse.setStatus(request.getStatus());

        return warehouseMapper.toDto(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseLocationDto addLocation(Long warehouseId, CreateLocationRequest request) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "Warehouse not found: " + warehouseId));

        if (locationRepository.existsByWarehouseIdAndCode(warehouseId, request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_LOCATION", "Location code already exists in warehouse: " + request.getCode());
        }

        WarehouseLocation location = warehouseMapper.toLocationEntity(request);
        location.setWarehouse(warehouse);
        return warehouseMapper.toLocationDto(locationRepository.save(location));
    }

    @Transactional(readOnly = true)
    public List<WarehouseLocationDto> getLocations(Long warehouseId) {
        return locationRepository.findByWarehouseId(warehouseId).stream()
                .map(warehouseMapper::toLocationDto)
                .toList();
    }
}
