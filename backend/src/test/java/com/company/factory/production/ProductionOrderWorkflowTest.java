package com.company.factory.production;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemType;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.production.domain.*;
import com.company.factory.production.dto.*;
import com.company.factory.production.mapper.ProductionMapper;
import com.company.factory.production.repository.*;
import com.company.factory.production.service.ProductionOrderService;
import com.company.factory.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductionOrderWorkflowTest {

    @Mock
    private ProductionOrderRepository moRepository;

    @Mock
    private ProductionMaterialRepository materialRepository;

    @Mock
    private ProductionOperationRepository operationRepository;

    @Mock
    private BomRepository bomRepository;

    @Mock
    private RoutingRepository routingRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private ProductionMapper productionMapper;

    @InjectMocks
    private ProductionOrderService moService;

    private Item finishedGood;
    private Item rawMaterial;
    private Bom bom;
    private Routing routing;
    private ProductionOrder mo;
    private ProductionMaterial prodMaterial;

    @BeforeEach
    void setUp() {
        finishedGood = Item.builder().id(100L).code("FG-01").nameEn("Smart Sensor").type(ItemType.FINISHED_GOOD).salePrice(new BigDecimal("150.00")).build();
        rawMaterial = Item.builder().id(200L).code("RM-01").nameEn("Sensor IC").type(ItemType.RAW_MATERIAL).purchasePrice(new BigDecimal("20.00")).build();

        BomItem bomItem = BomItem.builder()
                .id(1L)
                .material(rawMaterial)
                .quantity(new BigDecimal("2"))
                .scrapRate(new BigDecimal("5.00")) // 5% scrap
                .build();

        bom = Bom.builder()
                .id(10L)
                .code("BOM-FG-01")
                .product(finishedGood)
                .items(List.of(bomItem))
                .build();

        RoutingStep step = RoutingStep.builder()
                .id(1L)
                .sequenceNo(1)
                .operationCode("SMT-01")
                .operationNameEn("SMT Assembly")
                .standardTime(15)
                .build();

        routing = Routing.builder()
                .id(20L)
                .code("RT-FG-01")
                .product(finishedGood)
                .steps(List.of(step))
                .build();

        mo = ProductionOrder.builder()
                .id(500L)
                .moNo("MO-5001")
                .product(finishedGood)
                .bom(bom)
                .routing(routing)
                .plannedQuantity(new BigDecimal("100"))
                .completedQuantity(BigDecimal.ZERO)
                .scrapQuantity(BigDecimal.ZERO)
                .status("IN_PROGRESS")
                .materials(new ArrayList<>())
                .operations(new ArrayList<>())
                .build();

        prodMaterial = ProductionMaterial.builder()
                .id(501L)
                .productionOrder(mo)
                .material(rawMaterial)
                .requiredQuantity(new BigDecimal("210"))
                .issuedQuantity(BigDecimal.ZERO)
                .build();
    }

    @Test
    @DisplayName("issueMaterial should decrease raw material stock and update issued quantity")
    void shouldIssueMaterial() {
        MaterialIssueRequest request = MaterialIssueRequest.builder()
                .productionOrderId(500L)
                .warehouseId(1L)
                .materialId(200L)
                .quantity(new BigDecimal("100"))
                .note("Issue batch 1")
                .build();

        when(moRepository.findById(500L)).thenReturn(Optional.of(mo));
        when(materialRepository.findByProductionOrderIdAndMaterialId(500L, 200L)).thenReturn(Optional.of(prodMaterial));
        when(materialRepository.save(any(ProductionMaterial.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productionMapper.toMaterialDto(any(ProductionMaterial.class))).thenReturn(ProductionMaterialDto.builder().id(501L).issuedQuantity(new BigDecimal("100")).build());

        ProductionMaterialDto result = moService.issueMaterial(request, 1L);

        assertThat(result).isNotNull();
        assertThat(prodMaterial.getIssuedQuantity()).isEqualByComparingTo(new BigDecimal("100"));

        verify(inventoryService).decreaseStock(
                eq(1L), eq(null), eq(200L), eq(new BigDecimal("100")),
                eq(new BigDecimal("20.00")), eq(TransactionType.PRODUCTION_ISSUE),
                eq("PRODUCTION_ORDER"), eq("MO-5001"), eq("Issue batch 1"), eq(1L)
        );
    }

    @Test
    @DisplayName("completeProductionOrder should increase finished goods stock and mark MO COMPLETED")
    void shouldCompleteProductionOrder() {
        ProductionCompleteRequest request = ProductionCompleteRequest.builder()
                .warehouseId(2L)
                .completedQuantity(new BigDecimal("100"))
                .scrapQuantity(new BigDecimal("2"))
                .note("Final batch complete")
                .build();

        when(moRepository.findById(500L)).thenReturn(Optional.of(mo));
        when(moRepository.save(any(ProductionOrder.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productionMapper.toMoDto(any(ProductionOrder.class))).thenReturn(ProductionOrderDto.builder().id(500L).status("COMPLETED").build());

        ProductionOrderDto result = moService.completeProductionOrder(500L, request, 1L);

        assertThat(result).isNotNull();
        assertThat(mo.getStatus()).isEqualTo("COMPLETED");
        assertThat(mo.getCompletedQuantity()).isEqualByComparingTo(new BigDecimal("100"));
        assertThat(mo.getScrapQuantity()).isEqualByComparingTo(new BigDecimal("2"));

        verify(inventoryService).increaseStock(
                eq(2L), eq(null), eq(100L), eq(new BigDecimal("100")),
                eq(new BigDecimal("150.00")), eq(TransactionType.PRODUCTION_RECEIPT),
                eq("PRODUCTION_ORDER"), eq("MO-5001"), eq("Final batch complete"), eq(1L)
        );
    }
}
