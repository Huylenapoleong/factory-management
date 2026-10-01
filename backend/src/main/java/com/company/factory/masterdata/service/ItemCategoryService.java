package com.company.factory.masterdata.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.ItemCategory;
import com.company.factory.masterdata.dto.ItemCategoryDto;
import com.company.factory.masterdata.mapper.ItemMapper;
import com.company.factory.masterdata.repository.ItemCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemCategoryService {

    private final ItemCategoryRepository categoryRepository;
    private final ItemMapper itemMapper;

    @Transactional(readOnly = true)
    public List<ItemCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(itemMapper::toCategoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemCategoryDto getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(itemMapper::toCategoryDto)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Item category not found: " + id));
    }

    @Transactional
    public ItemCategoryDto createCategory(ItemCategoryDto dto) {
        if (categoryRepository.existsByCode(dto.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Item category code already exists: " + dto.getCode());
        }
        ItemCategory category = itemMapper.toCategoryEntity(dto);
        return itemMapper.toCategoryDto(categoryRepository.save(category));
    }
}
