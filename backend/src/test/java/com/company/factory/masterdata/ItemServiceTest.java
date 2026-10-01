package com.company.factory.masterdata;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemCategory;
import com.company.factory.masterdata.domain.ItemType;
import com.company.factory.masterdata.domain.UnitOfMeasurement;
import com.company.factory.masterdata.dto.CreateItemRequest;
import com.company.factory.masterdata.dto.ItemDto;
import com.company.factory.masterdata.mapper.ItemMapper;
import com.company.factory.masterdata.repository.ItemCategoryRepository;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.masterdata.repository.UnitOfMeasurementRepository;
import com.company.factory.masterdata.service.ItemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ItemCategoryRepository categoryRepository;

    @Mock
    private UnitOfMeasurementRepository unitRepository;

    @Mock
    private ItemMapper itemMapper;

    @InjectMocks
    private ItemService itemService;

    @Test
    @DisplayName("createItem should create and return item when code is unique")
    void shouldCreateItemSuccessfully() {
        CreateItemRequest request = CreateItemRequest.builder()
                .code("RM-001")
                .nameEn("Steel Plate")
                .type(ItemType.RAW_MATERIAL)
                .categoryId(1L)
                .unitId(1L)
                .purchasePrice(new BigDecimal("12.50"))
                .build();

        Item itemEntity = Item.builder().code("RM-001").nameEn("Steel Plate").type(ItemType.RAW_MATERIAL).build();
        ItemCategory category = ItemCategory.builder().id(1L).code("METALS").build();
        UnitOfMeasurement unit = UnitOfMeasurement.builder().id(1L).code("KG").build();
        Item savedItem = Item.builder().id(10L).code("RM-001").nameEn("Steel Plate").type(ItemType.RAW_MATERIAL).category(category).unit(unit).build();
        ItemDto expectedDto = ItemDto.builder().id(10L).code("RM-001").nameEn("Steel Plate").type(ItemType.RAW_MATERIAL).build();

        when(itemRepository.existsByCode("RM-001")).thenReturn(false);
        when(itemMapper.toEntity(request)).thenReturn(itemEntity);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(unitRepository.findById(1L)).thenReturn(Optional.of(unit));
        when(itemRepository.save(itemEntity)).thenReturn(savedItem);
        when(itemMapper.toDto(savedItem)).thenReturn(expectedDto);

        ItemDto result = itemService.createItem(request);

        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("RM-001");
        verify(itemRepository).save(itemEntity);
    }

    @Test
    @DisplayName("createItem should throw BusinessException when code already exists")
    void shouldThrowWhenCodeExists() {
        CreateItemRequest request = CreateItemRequest.builder()
                .code("RM-001")
                .nameEn("Steel Plate")
                .type(ItemType.RAW_MATERIAL)
                .build();

        when(itemRepository.existsByCode("RM-001")).thenReturn(true);

        assertThatThrownBy(() -> itemService.createItem(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");

        verify(itemRepository, never()).save(any());
    }
}
