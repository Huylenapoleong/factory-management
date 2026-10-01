package com.company.factory.production.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.production.domain.Bom;
import com.company.factory.production.domain.BomItem;
import com.company.factory.production.dto.BomDto;
import com.company.factory.production.dto.CreateBomItemRequest;
import com.company.factory.production.dto.CreateBomRequest;
import com.company.factory.production.mapper.ProductionMapper;
import com.company.factory.production.repository.BomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BomService {

    private final BomRepository bomRepository;
    private final ItemRepository itemRepository;
    private final ProductionMapper productionMapper;

    @Transactional(readOnly = true)
    public List<BomDto> getBoms(Long productId, String status) {
        List<Bom> boms;
        if (productId != null) {
            boms = bomRepository.findByProductId(productId);
        } else {
            boms = bomRepository.findAll();
        }

        return boms.stream()
                .filter(b -> status == null || status.equalsIgnoreCase(b.getStatus()))
                .map(b -> {
                    BomDto dto = productionMapper.toBomDto(b);
                    dto.setItems(b.getItems().stream().map(productionMapper::toBomItemDto).toList());
                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public BomDto getBomById(Long id) {
        Bom bom = bomRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "BOM_NOT_FOUND", "BOM not found: " + id));
        BomDto dto = productionMapper.toBomDto(bom);
        dto.setItems(bom.getItems().stream().map(productionMapper::toBomItemDto).toList());
        return dto;
    }

    @Transactional
    public BomDto createBom(CreateBomRequest request) {
        if (bomRepository.existsByCode(request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "BOM code already exists: " + request.getCode());
        }

        Item product = itemRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + request.getProductId()));

        Bom bom = Bom.builder()
                .code(request.getCode())
                .product(product)
                .version(request.getVersion() != null ? request.getVersion() : "1.0")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .build();

        List<BomItem> items = new ArrayList<>();
        for (CreateBomItemRequest itemReq : request.getItems()) {
            Item material = itemRepository.findById(itemReq.getMaterialId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MATERIAL_NOT_FOUND", "Material item not found: " + itemReq.getMaterialId()));

            BomItem bomItem = BomItem.builder()
                    .bom(bom)
                    .material(material)
                    .quantity(itemReq.getQuantity())
                    .scrapRate(itemReq.getScrapRate())
                    .build();

            items.add(bomItem);
        }

        bom.setItems(items);
        Bom savedBom = bomRepository.save(bom);
        BomDto dto = productionMapper.toBomDto(savedBom);
        dto.setItems(savedBom.getItems().stream().map(productionMapper::toBomItemDto).toList());
        return dto;
    }

    @Transactional
    public BomDto updateBomStatus(Long id, String status) {
        Bom bom = bomRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "BOM_NOT_FOUND", "BOM not found: " + id));
        bom.setStatus(status);
        Bom savedBom = bomRepository.save(bom);
        BomDto dto = productionMapper.toBomDto(savedBom);
        dto.setItems(savedBom.getItems().stream().map(productionMapper::toBomItemDto).toList());
        return dto;
    }
}
