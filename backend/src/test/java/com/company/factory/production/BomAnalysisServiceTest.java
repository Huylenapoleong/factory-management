package com.company.factory.production;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemType;
import com.company.factory.masterdata.domain.UnitOfMeasurement;
import com.company.factory.production.domain.Bom;
import com.company.factory.production.domain.BomItem;
import com.company.factory.production.dto.BomAnalysisDto;
import com.company.factory.production.dto.BomAnalysisLineDto;
import com.company.factory.production.repository.BomRepository;
import com.company.factory.production.service.BomAnalysisService;
import com.company.factory.purchasing.dto.ItemSupplyDto;
import com.company.factory.purchasing.service.PurchaseOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BomAnalysisServiceTest {

    @Mock
    private BomRepository bomRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private PurchaseOrderService purchaseOrderService;

    @InjectMocks
    private BomAnalysisService bomAnalysisService;

    private Bom bom;

    @BeforeEach
    void setUp() {
        UnitOfMeasurement pcs = UnitOfMeasurement.builder().id(1L).code("PCS").nameEn("Pieces").build();
        UnitOfMeasurement kg = UnitOfMeasurement.builder().id(2L).code("KG").nameEn("Kilogram").build();

        Item product = Item.builder().id(10L).code("HV-204").nameEn("Hydraulic Valve").type(ItemType.FINISHED_GOOD).unit(pcs).build();
        Item steel = Item.builder().id(1L).code("RM-STEEL").nameEn("Steel 304").type(ItemType.RAW_MATERIAL).unit(kg)
                .purchasePrice(new BigDecimal("2.00")).minStock(BigDecimal.ZERO).build();
        Item seal = Item.builder().id(2L).code("SEAL").nameEn("Seal Ring").type(ItemType.RAW_MATERIAL).unit(pcs)
                .purchasePrice(new BigDecimal("0.50")).minStock(new BigDecimal("50")).build();
        Item core = Item.builder().id(3L).code("CORE").nameEn("Valve Core").type(ItemType.SEMI_FINISHED).unit(pcs)
                .purchasePrice(new BigDecimal("10.00")).minStock(BigDecimal.ZERO).build();

        bom = Bom.builder().id(5L).code("BOM-HV204").product(product).version("2.0").status("ACTIVE").build();
        bom.setItems(List.of(
                BomItem.builder().id(100L).bom(bom).material(steel).quantity(new BigDecimal("2")).scrapRate(new BigDecimal("10")).build(),
                BomItem.builder().id(101L).bom(bom).material(seal).quantity(new BigDecimal("2")).scrapRate(BigDecimal.ZERO).build(),
                BomItem.builder().id(102L).bom(bom).material(core).quantity(BigDecimal.ONE).scrapRate(BigDecimal.ZERO).build()
        ));
    }

    @Test
    @DisplayName("Computes requirement, coverage status and cost per material line")
    void analyze_computesLines() {
        when(bomRepository.findById(5L)).thenReturn(Optional.of(bom));
        when(inventoryService.getAvailableQuantities(anyCollection())).thenReturn(Map.of(
                1L, new BigDecimal("500"),
                2L, new BigDecimal("220"),
                3L, new BigDecimal("40")
        ));

        BomAnalysisDto result = bomAnalysisService.analyze(5L, new BigDecimal("100"), null);

        BomAnalysisLineDto steel = result.getLines().get(0);
        assertThat(steel.getRequiredQuantity()).isEqualByComparingTo("220");
        assertThat(steel.getStatus()).isEqualTo(BomAnalysisLineDto.STATUS_SUFFICIENT);
        assertThat(steel.getLineCost()).isEqualByComparingTo("440.00");
        assertThat(steel.getScrapCost()).isEqualByComparingTo("40.00");

        BomAnalysisLineDto seal = result.getLines().get(1);
        assertThat(seal.getRequiredQuantity()).isEqualByComparingTo("200");
        assertThat(seal.getStatus()).isEqualTo(BomAnalysisLineDto.STATUS_LOW);

        BomAnalysisLineDto core = result.getLines().get(2);
        assertThat(core.getStatus()).isEqualTo(BomAnalysisLineDto.STATUS_SHORTAGE);
        assertThat(core.getShortageQuantity()).isEqualByComparingTo("60");
        assertThat(core.getCoveragePercent()).isEqualByComparingTo("40.0");

        assertThat(result.getTotalMaterialCost()).isEqualByComparingTo("1540.00");
        assertThat(result.getTotalScrapCost()).isEqualByComparingTo("40.00");
        assertThat(result.getCostPerUnit()).isEqualByComparingTo("15.40");
        assertThat(result.getMaxBuildableQuantity()).isEqualByComparingTo("40");
        assertThat(result.getSufficientCount()).isEqualTo(1);
        assertThat(result.getLowCount()).isEqualTo(1);
        assertThat(result.getShortageCount()).isEqualTo(1);
        assertThat(result.getProductUnitCode()).isEqualTo("PCS");
        assertThat(result.getBottleneckBomItemId()).isEqualTo(102L);
        assertThat(result.getToOrderCount()).isEqualTo(1);
        assertThat(core.getProcurementStatus()).isEqualTo(BomAnalysisLineDto.PROCUREMENT_TO_ORDER);
        assertThat(core.getOrderQuantity()).isEqualByComparingTo("60");
        assertThat(steel.getProcurementStatus()).isEqualTo(BomAnalysisLineDto.PROCUREMENT_COVERED);
        assertThat(steel.getSurplusQuantity()).isEqualByComparingTo("280");
    }

    @Test
    @DisplayName("Derives order quantity, order-by date and urgency from open purchase orders and lead time")
    void analyze_procurementPlanning() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.plusDays(10);
        when(bomRepository.findById(5L)).thenReturn(Optional.of(bom));
        when(inventoryService.getAvailableQuantities(anyCollection())).thenReturn(Map.of(
                1L, new BigDecimal("100"),
                2L, new BigDecimal("50"),
                3L, BigDecimal.ZERO
        ));
        when(purchaseOrderService.getItemSupply(anyCollection())).thenReturn(Map.of(
                1L, ItemSupplyDto.builder().itemId(1L).onOrderQuantity(new BigDecimal("40")).leadTimeDays(14)
                        .lastSupplierId(7L).lastSupplierName("Steel Co").build(),
                2L, ItemSupplyDto.builder().itemId(2L).onOrderQuantity(new BigDecimal("500"))
                        .nextExpectedDate(today.plusDays(12)).leadTimeDays(5).build(),
                3L, ItemSupplyDto.builder().itemId(3L).onOrderQuantity(BigDecimal.ZERO).leadTimeDays(3).build()
        ));

        BomAnalysisDto result = bomAnalysisService.analyze(5L, new BigDecimal("100"), start);

        BomAnalysisLineDto steel = result.getLines().get(0);
        assertThat(steel.getShortageQuantity()).isEqualByComparingTo("120");
        assertThat(steel.getOrderQuantity()).isEqualByComparingTo("80");
        assertThat(steel.getProcurementStatus()).isEqualTo(BomAnalysisLineDto.PROCUREMENT_TO_ORDER);
        assertThat(steel.getOrderByDate()).isEqualTo(start.minusDays(14));
        assertThat(steel.getUrgency()).isEqualTo(BomAnalysisLineDto.URGENCY_LATE);
        assertThat(steel.getSupplierName()).isEqualTo("Steel Co");

        BomAnalysisLineDto seal = result.getLines().get(1);
        assertThat(seal.getProcurementStatus()).isEqualTo(BomAnalysisLineDto.PROCUREMENT_ORDERED);
        assertThat(seal.getOrderQuantity()).isEqualByComparingTo("0");
        assertThat(seal.getUrgency()).isEqualTo(BomAnalysisLineDto.URGENCY_LATE);

        BomAnalysisLineDto core = result.getLines().get(2);
        assertThat(core.getOrderByDate()).isEqualTo(start.minusDays(3));
        assertThat(core.getUrgency()).isEqualTo(BomAnalysisLineDto.URGENCY_UPCOMING);

        assertThat(result.getStartDate()).isEqualTo(start);
        assertThat(result.getToOrderCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("Treats materials missing from inventory as zero stock")
    void analyze_missingStockIsShortage() {
        when(bomRepository.findById(5L)).thenReturn(Optional.of(bom));
        when(inventoryService.getAvailableQuantities(anyCollection())).thenReturn(Map.of());

        BomAnalysisDto result = bomAnalysisService.analyze(5L, BigDecimal.ONE, null);

        assertThat(result.getShortageCount()).isEqualTo(3);
        assertThat(result.getMaxBuildableQuantity()).isEqualByComparingTo("0");
        assertThat(result.getLines()).allSatisfy(line -> assertThat(line.getCoveragePercent()).isEqualByComparingTo("0"));
    }

    @Test
    @DisplayName("Rejects non-positive planned quantity")
    void analyze_rejectsInvalidQuantity() {
        assertThatThrownBy(() -> bomAnalysisService.analyze(5L, BigDecimal.ZERO, null))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(bomRepository, inventoryService, purchaseOrderService);
    }

    @Test
    @DisplayName("Throws when BOM does not exist")
    void analyze_bomNotFound() {
        when(bomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bomAnalysisService.analyze(99L, BigDecimal.TEN, null))
                .isInstanceOf(BusinessException.class);
    }
}
