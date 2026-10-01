package com.company.factory.reporting.service;

import com.company.factory.customer.repository.CustomerRepository;
import com.company.factory.inventory.dto.InventoryBalanceDto;
import com.company.factory.inventory.dto.StockTransactionDto;
import com.company.factory.inventory.repository.InventoryBalanceRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.production.domain.ProductionOrder;
import com.company.factory.production.repository.ProductionOrderRepository;
import com.company.factory.purchasing.repository.PurchaseOrderRepository;
import com.company.factory.reporting.dto.DashboardSummaryDto;
import com.company.factory.reporting.dto.ProductionProgressDto;
import com.company.factory.sales.repository.SalesOrderRepository;
import com.company.factory.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ItemRepository itemRepository;
    private final ProductionOrderRepository moRepository;
    private final PurchaseOrderRepository poRepository;
    private final SalesOrderRepository soRepository;
    private final InventoryBalanceRepository balanceRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary() {
        return DashboardSummaryDto.builder()
                .totalItems(itemRepository.count())
                .activeProductionOrders(moRepository.countActiveProductionOrders())
                .pendingPurchaseOrders(poRepository.countPendingPurchaseOrders())
                .openSalesOrders(soRepository.countOpenSalesOrders())
                .lowStockAlerts(balanceRepository.findLowStockBalances().size())
                .totalWarehouses(warehouseRepository.count())
                .totalSuppliers(supplierRepository.count())
                .totalCustomers(customerRepository.count())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductionProgressDto> getProductionProgress() {
        List<ProductionOrder> activeOrders = moRepository.findAll((root, query, cb) ->
                root.get("status").in("RELEASED", "IN_PROGRESS", "PAUSED"));

        return activeOrders.stream()
                .map(mo -> {
                    BigDecimal planned = mo.getPlannedQuantity();
                    BigDecimal completed = mo.getCompletedQuantity() != null ? mo.getCompletedQuantity() : BigDecimal.ZERO;
                    double percent = 0.0;
                    if (planned != null && planned.compareTo(BigDecimal.ZERO) > 0) {
                        percent = completed.divide(planned, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
                    }

                    return ProductionProgressDto.builder()
                            .moId(mo.getId())
                            .moNo(mo.getMoNo())
                            .productCode(mo.getProduct() != null ? mo.getProduct().getCode() : null)
                            .productName(mo.getProduct() != null ? mo.getProduct().getNameEn() : null)
                            .plannedQuantity(planned)
                            .completedQuantity(completed)
                            .progressPercentage(Math.min(100.0, percent))
                            .status(mo.getStatus())
                            .dueDate(mo.getDueDate())
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceDto> getLowStockAlerts() {
        return inventoryService.getLowStockBalances();
    }

    @Transactional(readOnly = true)
    public List<StockTransactionDto> getRecentTransactions() {
        return inventoryService.getRecentTransactions();
    }
}
