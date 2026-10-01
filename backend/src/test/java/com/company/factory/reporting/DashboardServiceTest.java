package com.company.factory.reporting;

import com.company.factory.customer.repository.CustomerRepository;
import com.company.factory.inventory.repository.InventoryBalanceRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.production.domain.ProductionOrder;
import com.company.factory.production.repository.ProductionOrderRepository;
import com.company.factory.purchasing.repository.PurchaseOrderRepository;
import com.company.factory.reporting.dto.DashboardSummaryDto;
import com.company.factory.reporting.dto.ProductionProgressDto;
import com.company.factory.reporting.service.DashboardService;
import com.company.factory.sales.repository.SalesOrderRepository;
import com.company.factory.supplier.repository.SupplierRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ProductionOrderRepository moRepository;

    @Mock
    private PurchaseOrderRepository poRepository;

    @Mock
    private SalesOrderRepository soRepository;

    @Mock
    private InventoryBalanceRepository balanceRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("getSummary should return aggregate counts from all modules")
    void shouldReturnSummaryMetrics() {
        when(itemRepository.count()).thenReturn(150L);
        when(moRepository.countActiveProductionOrders()).thenReturn(12L);
        when(poRepository.countPendingPurchaseOrders()).thenReturn(8L);
        when(soRepository.countOpenSalesOrders()).thenReturn(25L);
        when(balanceRepository.findLowStockBalances()).thenReturn(List.of());
        when(warehouseRepository.count()).thenReturn(4L);
        when(supplierRepository.count()).thenReturn(18L);
        when(customerRepository.count()).thenReturn(30L);

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalItems()).isEqualTo(150L);
        assertThat(summary.getActiveProductionOrders()).isEqualTo(12L);
        assertThat(summary.getPendingPurchaseOrders()).isEqualTo(8L);
        assertThat(summary.getOpenSalesOrders()).isEqualTo(25L);
        assertThat(summary.getLowStockAlerts()).isEqualTo(0L);
        assertThat(summary.getTotalWarehouses()).isEqualTo(4L);
        assertThat(summary.getTotalSuppliers()).isEqualTo(18L);
        assertThat(summary.getTotalCustomers()).isEqualTo(30L);
    }

    @Test
    @DisplayName("getProductionProgress should compute completion percentage correctly")
    void shouldComputeProductionProgress() {
        Item product = Item.builder().id(1L).code("PRD-01").nameEn("Widget A").build();
        ProductionOrder mo = ProductionOrder.builder()
                .id(10L)
                .moNo("MO-1001")
                .product(product)
                .plannedQuantity(new BigDecimal("200"))
                .completedQuantity(new BigDecimal("150"))
                .status("IN_PROGRESS")
                .build();

        when(moRepository.findAll(any(Specification.class))).thenReturn(List.of(mo));

        List<ProductionProgressDto> progress = dashboardService.getProductionProgress();

        assertThat(progress).hasSize(1);
        assertThat(progress.get(0).getProgressPercentage()).isEqualTo(75.0);
        assertThat(progress.get(0).getMoNo()).isEqualTo("MO-1001");
    }
}
