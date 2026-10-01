package com.company.factory.sales;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.customer.domain.Customer;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.purchasing.repository.ItemPriceHistoryRepository;
import com.company.factory.sales.domain.Delivery;
import com.company.factory.sales.domain.DeliveryItem;
import com.company.factory.sales.domain.SalesOrder;
import com.company.factory.sales.domain.SalesOrderItem;
import com.company.factory.sales.dto.DeliveryDto;
import com.company.factory.sales.mapper.SalesMapper;
import com.company.factory.sales.repository.DeliveryRepository;
import com.company.factory.sales.repository.SalesOrderRepository;
import com.company.factory.sales.service.DeliveryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryPostingTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private SalesOrderRepository soRepository;

    @Mock
    private ItemPriceHistoryRepository priceHistoryRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private SalesMapper salesMapper;

    @InjectMocks
    private DeliveryService deliveryService;

    private Warehouse warehouse;
    private Item item;
    private Customer customer;
    private SalesOrder so;
    private SalesOrderItem soItem;
    private Delivery delivery;
    private DeliveryItem deliveryItem;

    @BeforeEach
    void setUp() {
        warehouse = Warehouse.builder().id(1L).code("WH-FG").build();
        item = Item.builder().id(10L).code("FG-01").build();
        customer = Customer.builder().id(5L).code("CUST-01").name("Mega Corp").build();

        soItem = SalesOrderItem.builder()
                .id(101L)
                .item(item)
                .quantity(new BigDecimal("50"))
                .deliveredQuantity(BigDecimal.ZERO)
                .unitPrice(new BigDecimal("120.00"))
                .amount(new BigDecimal("6000.00"))
                .build();

        List<SalesOrderItem> soItems = new ArrayList<>();
        soItems.add(soItem);

        so = SalesOrder.builder()
                .id(70L)
                .soNo("SO-7001")
                .customer(customer)
                .status("CONFIRMED")
                .items(soItems)
                .build();

        deliveryItem = DeliveryItem.builder()
                .id(201L)
                .item(item)
                .quantity(new BigDecimal("50"))
                .unitPrice(new BigDecimal("120.00"))
                .build();

        List<DeliveryItem> deliveryItems = new ArrayList<>();
        deliveryItems.add(deliveryItem);

        delivery = Delivery.builder()
                .id(800L)
                .deliveryNo("DEL-8001")
                .salesOrder(so)
                .warehouse(warehouse)
                .deliveryDate(LocalDate.now())
                .status("DRAFT")
                .items(deliveryItems)
                .build();
    }

    @Test
    @DisplayName("postDelivery should decrease stock, update SO status to DELIVERED and delivery status to POSTED")
    void shouldPostDeliverySuccessfully() {
        when(deliveryRepository.findById(800L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(inv -> inv.getArgument(0));
        when(salesMapper.toDeliveryDto(any(Delivery.class))).thenReturn(DeliveryDto.builder().id(800L).status("POSTED").build());

        DeliveryDto result = deliveryService.postDelivery(800L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("POSTED");

        // Verify inventory was deducted
        verify(inventoryService).decreaseStock(
                eq(1L), eq(null), eq(10L), eq(new BigDecimal("50")),
                eq(new BigDecimal("120.00")), eq(TransactionType.SALE_OUT),
                eq("DELIVERY"), eq("DEL-8001"), any(), eq(1L)
        );

        // Verify SO progress updated
        assertThat(soItem.getDeliveredQuantity()).isEqualByComparingTo(new BigDecimal("50"));
        assertThat(so.getStatus()).isEqualTo("DELIVERED");
        verify(soRepository).save(so);
    }

    @Test
    @DisplayName("postDelivery should throw BusinessException if not DRAFT")
    void shouldThrowIfNotDraft() {
        delivery.setStatus("POSTED");
        when(deliveryRepository.findById(800L)).thenReturn(Optional.of(delivery));

        assertThatThrownBy(() -> deliveryService.postDelivery(800L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only DRAFT");

        verify(inventoryService, never()).decreaseStock(any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }
}
