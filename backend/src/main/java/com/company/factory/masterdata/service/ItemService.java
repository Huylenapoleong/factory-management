package com.company.factory.masterdata.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemCategory;
import com.company.factory.masterdata.domain.ItemType;
import com.company.factory.masterdata.domain.UnitOfMeasurement;
import com.company.factory.masterdata.dto.CreateItemRequest;
import com.company.factory.masterdata.dto.ItemDto;
import com.company.factory.masterdata.dto.UpdateItemRequest;
import com.company.factory.masterdata.mapper.ItemMapper;
import com.company.factory.masterdata.repository.ItemCategoryRepository;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.masterdata.repository.UnitOfMeasurementRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemCategoryRepository categoryRepository;
    private final UnitOfMeasurementRepository unitRepository;
    private final ItemMapper itemMapper;

    @Transactional(readOnly = true)
    public PageResponse<ItemDto> getItems(String search, ItemType type, String status, Pageable pageable) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), searchPattern);
                Predicate nameEnMatch = cb.like(cb.lower(root.get("nameEn")), searchPattern);
                Predicate nameZhMatch = cb.like(cb.lower(root.get("nameZh")), searchPattern);
                predicates.add(cb.or(codeMatch, nameEnMatch, nameZhMatch));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ItemDto> page = itemRepository.findAll(spec, pageable).map(itemMapper::toDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public ItemDto getItemById(Long id) {
        return itemRepository.findById(id)
                .map(itemMapper::toDto)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public ItemDto getItemByCode(String code) {
        return itemRepository.findByCode(code)
                .map(itemMapper::toDto)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found with code: " + code));
    }

    @Transactional
    public ItemDto createItem(CreateItemRequest request) {
        if (itemRepository.existsByCode(request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Item code already exists: " + request.getCode());
        }

        Item item = itemMapper.toEntity(request);

        if (request.getCategoryId() != null) {
            ItemCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found: " + request.getCategoryId()));
            item.setCategory(category);
        }

        if (request.getUnitId() != null) {
            UnitOfMeasurement unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "UNIT_NOT_FOUND", "Unit not found: " + request.getUnitId()));
            item.setUnit(unit);
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public ItemDto updateItem(Long id, UpdateItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found with id: " + id));

        item.setNameEn(request.getNameEn());
        item.setNameZh(request.getNameZh());
        item.setType(request.getType());
        if (request.getPurchasePrice() != null) item.setPurchasePrice(request.getPurchasePrice());
        if (request.getSalePrice() != null) item.setSalePrice(request.getSalePrice());
        if (request.getMinStock() != null) item.setMinStock(request.getMinStock());
        if (request.getStatus() != null) item.setStatus(request.getStatus());

        if (request.getCategoryId() != null) {
            ItemCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found: " + request.getCategoryId()));
            item.setCategory(category);
        } else {
            item.setCategory(null);
        }

        if (request.getUnitId() != null) {
            UnitOfMeasurement unit = unitRepository.findById(request.getUnitId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "UNIT_NOT_FOUND", "Unit not found: " + request.getUnitId()));
            item.setUnit(unit);
        } else {
            item.setUnit(null);
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found with id: " + id));
        item.setStatus("INACTIVE");
        itemRepository.save(item);
    }
}
