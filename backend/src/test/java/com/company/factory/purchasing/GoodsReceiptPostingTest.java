package com.company.factory.purchasing;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.purchasing.domain.GoodsReceipt;
import com.company.factory.purchasing.domain.GoodsReceiptItem;
import com.company.factory.purchasing.domain.PurchaseOrder;
import com.company.factory.purchasing.domain.PurchaseOrderItem;
import com.company.factory.purchasing.dto.GoodsReceiptDto;
import com.company.factory.purchasing.mapper.PurchasingMapper;
import com.company.factory.purchasing.repository.GoodsReceiptRepository;
import com.company.factory.purchasing.repository.ItemPriceHistoryRepository;
import com.company.factory.purchasing.repository.PurchaseOrderRepository;
import com.company.factory.purchasing.service.GoodsReceiptService;
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
class GoodsReceiptPostingTest {

    @Mock
    private GoodsReceiptRepository receiptRepository;

    @Mock
    private PurchaseOrderRepository poRepository;

    @Mock
    private ItemPriceHistoryRepository priceHistoryRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private PurchasingMapper purchasingMapper;

    @InjectMocks
    private GoodsReceiptService receiptService;

    private Warehouse warehouse;
    private Item item;
    private PurchaseOrder po;
    private PurchaseOrderItem poItem;
    private GoodsReceipt receipt;
    private GoodsReceiptItem receiptItem;

    @BeforeEach
    void setUp() {
        warehouse = Warehouse.builder().id(1L).code("WH-01").build();
        item = Item.builder().id(10L).code("STEEL-01").build();

        poItem = PurchaseOrderItem.builder()
                .id(101L)
                .item(item)
                .quantity(new BigDecimal("100"))
                .receivedQuantity(BigDecimal.ZERO)
                .unitPrice(new BigDecimal("25.00"))
                .amount(new BigDecimal("2500.00"))
                .build();

        List<PurchaseOrderItem> poItems = new ArrayList<>();
        poItems.add(poItem);

        po = PurchaseOrder.builder()
                .id(50L)
                .poNo("PO-5001")
                .status("CONFIRMED")
                .items(poItems)
                .build();

        receiptItem = GoodsReceiptItem.builder()
                .id(201L)
                .item(item)
                .quantity(new BigDecimal("100"))
                .unitPrice(new BigDecimal("25.00"))
                .build();

        List<GoodsReceiptItem> receiptItems = new ArrayList<>();
        receiptItems.add(receiptItem);

        receipt = GoodsReceipt.builder()
                .id(300L)
                .receiptNo("GR-3001")
                .purchaseOrder(po)
                .warehouse(warehouse)
                .receiptDate(LocalDate.now())
                .status("DRAFT")
                .items(receiptItems)
                .build();
    }

    @Test
    @DisplayName("postGoodsReceipt should increase stock, update PO status to RECEIVED and receipt status to POSTED")
    void shouldPostGoodsReceiptSuccessfully() {
        when(receiptRepository.findById(300L)).thenReturn(Optional.of(receipt));
        when(receiptRepository.save(any(GoodsReceipt.class))).thenAnswer(inv -> inv.getArgument(0));
        when(purchasingMapper.toReceiptDto(any(GoodsReceipt.class))).thenReturn(GoodsReceiptDto.builder().id(300L).status("POSTED").build());

        GoodsReceiptDto result = receiptService.postGoodsReceipt(300L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("POSTED");

        // Verify inventory service was called to increase stock
        verify(inventoryService).increaseStock(
                eq(1L), eq(null), eq(10L), eq(new BigDecimal("100")),
                eq(new BigDecimal("25.00")), eq(TransactionType.PURCHASE_IN),
                eq("GOODS_RECEIPT"), eq("GR-3001"), any(), eq(1L)
        );

        // Verify PO received quantity and status updated
        assertThat(poItem.getReceivedQuantity()).isEqualByComparingTo(new BigDecimal("100"));
        assertThat(po.getStatus()).isEqualTo("RECEIVED");
        verify(poRepository).save(po);
    }

    @Test
    @DisplayName("postGoodsReceipt should throw BusinessException if already POSTED")
    void shouldThrowIfAlreadyPosted() {
        receipt.setStatus("POSTED");
        when(receiptRepository.findById(300L)).thenReturn(Optional.of(receipt));

        assertThatThrownBy(() -> receiptService.postGoodsReceipt(300L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only DRAFT");

        verify(inventoryService, never()).increaseStock(any(), any(), any(), any(), any(), any(), any(), any(), any(), any());
    }
}
