package com.company.factory.inventory;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.domain.InventoryBalance;
import com.company.factory.inventory.domain.StockTransaction;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.mapper.StockMapper;
import com.company.factory.inventory.repository.InventoryBalanceRepository;
import com.company.factory.inventory.repository.StockTransactionRepository;
import com.company.factory.inventory.repository.WarehouseLocationRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemType;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryBalanceRepository balanceRepository;

    @Mock
    private StockTransactionRepository transactionRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private WarehouseLocationRepository locationRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StockMapper stockMapper;

    @InjectMocks
    private InventoryService inventoryService;

    private Warehouse warehouse;
    private Item item;
    private InventoryBalance balance;

    @BeforeEach
    void setUp() {
        warehouse = Warehouse.builder().id(1L).code("WH-01").nameEn("Raw Material WH").build();
        item = Item.builder().id(10L).code("STEEL-01").nameEn("Steel Plate").type(ItemType.RAW_MATERIAL).minStock(new BigDecimal("20")).build();
        balance = InventoryBalance.builder()
                .id(100L)
                .warehouse(warehouse)
                .item(item)
                .quantity(new BigDecimal("100"))
                .reservedQuantity(new BigDecimal("10"))
                .build();
    }

    @Test
    @DisplayName("increaseStock should atomically increment quantity and save transaction")
    void shouldIncreaseStock() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        when(balanceRepository.findByWarehouseAndLocationAndItemForUpdate(1L, null, 10L)).thenReturn(Optional.of(balance));
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        StockTransaction txn = inventoryService.increaseStock(
                1L, null, 10L, new BigDecimal("50"), new BigDecimal("10.00"),
                TransactionType.PURCHASE_IN, "PO", "PO-1001", "Received goods", 1L
        );

        assertThat(txn).isNotNull();
        assertThat(balance.getQuantity()).isEqualByComparingTo(new BigDecimal("150"));
        verify(balanceRepository).save(balance);
        verify(transactionRepository).save(any(StockTransaction.class));
    }

    @Test
    @DisplayName("decreaseStock should deduct stock when sufficient available")
    void shouldDecreaseStockWhenSufficient() {
        when(balanceRepository.findByWarehouseAndLocationAndItemForUpdate(1L, null, 10L)).thenReturn(Optional.of(balance));
        when(transactionRepository.save(any(StockTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        StockTransaction txn = inventoryService.decreaseStock(
                1L, null, 10L, new BigDecimal("30"), new BigDecimal("10.00"),
                TransactionType.PRODUCTION_ISSUE, "MO", "MO-2001", "Issued to production", 1L
        );

        assertThat(txn).isNotNull();
        assertThat(balance.getQuantity()).isEqualByComparingTo(new BigDecimal("70"));
        verify(balanceRepository).save(balance);
    }

    @Test
    @DisplayName("decreaseStock should throw BusinessException when stock is insufficient")
    void shouldThrowWhenInsufficientStock() {
        when(balanceRepository.findByWarehouseAndLocationAndItemForUpdate(1L, null, 10L)).thenReturn(Optional.of(balance));

        // Available is 100 - 10 = 90. Requesting 95 should fail.
        assertThatThrownBy(() -> inventoryService.decreaseStock(
                1L, null, 10L, new BigDecimal("95"), new BigDecimal("10.00"),
                TransactionType.SALE_OUT, "SO", "SO-3001", "Fulfill order", 1L
        ))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient available stock");

        verify(balanceRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("reserveStock should increase reserved quantity")
    void shouldReserveStock() {
        when(balanceRepository.findByWarehouseAndLocationAndItemForUpdate(1L, null, 10L)).thenReturn(Optional.of(balance));

        inventoryService.reserveStock(1L, null, 10L, new BigDecimal("40"));

        assertThat(balance.getReservedQuantity()).isEqualByComparingTo(new BigDecimal("50"));
        verify(balanceRepository).save(balance);
    }
}
