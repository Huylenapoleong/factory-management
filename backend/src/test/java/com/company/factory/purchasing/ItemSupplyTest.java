package com.company.factory.purchasing;

import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.purchasing.domain.PurchaseOrder;
import com.company.factory.purchasing.domain.PurchaseOrderItem;
import com.company.factory.purchasing.dto.ItemSupplyDto;
import com.company.factory.purchasing.mapper.PurchasingMapper;
import com.company.factory.purchasing.repository.PurchaseOrderRepository;
import com.company.factory.purchasing.service.PurchaseOrderService;
import com.company.factory.supplier.domain.Supplier;
import com.company.factory.supplier.repository.SupplierRepository;
import com.company.factory.user.repository.UserRepository;
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
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ItemSupplyTest {

    @Mock
    private PurchaseOrderRepository poRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private ItemRepository itemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PurchasingMapper purchasingMapper;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    private PurchaseOrderItem line(Item item, Supplier supplier, String status, LocalDate ordered, LocalDate expected,
                                   String qty, String received) {
        PurchaseOrder po = PurchaseOrder.builder().supplier(supplier).status(status).orderDate(ordered).expectedDate(expected).build();
        return PurchaseOrderItem.builder().purchaseOrder(po).item(item).quantity(new BigDecimal(qty))
                .receivedQuantity(new BigDecimal(received)).unitPrice(new BigDecimal("2.50")).build();
    }

    @Test
    @DisplayName("Sums open quantity, takes latest supplier and averages lead time")
    void getItemSupply_aggregatesHistory() {
        Item steel = Item.builder().id(1L).code("STEEL").nameEn("Steel").build();
        Supplier latest = Supplier.builder().id(9L).name("Latest Steel").build();
        Supplier older = Supplier.builder().id(8L).name("Old Steel").build();
        LocalDate base = LocalDate.of(2026, 9, 1);

        when(poRepository.findActiveLinesByItemIds(anyCollection())).thenReturn(List.of(
                line(steel, latest, "CONFIRMED", base.plusDays(20), base.plusDays(30), "100", "40"),
                line(steel, older, "PARTIAL_RECEIVED", base.plusDays(10), base.plusDays(14), "50", "50"),
                line(steel, older, "RECEIVED", base, base.plusDays(6), "80", "80")
        ));

        ItemSupplyDto supply = purchaseOrderService.getItemSupply(Set.of(1L)).get(1L);

        assertThat(supply.getOnOrderQuantity()).isEqualByComparingTo("60");
        assertThat(supply.getNextExpectedDate()).isEqualTo(base.plusDays(30));
        assertThat(supply.getLastSupplierId()).isEqualTo(9L);
        assertThat(supply.getLastSupplierName()).isEqualTo("Latest Steel");
        assertThat(supply.getLeadTimeDays()).isEqualTo(7);
    }

    @Test
    @DisplayName("Returns empty map without querying when no items are given")
    void getItemSupply_emptyInput() {
        Map<Long, ItemSupplyDto> result = purchaseOrderService.getItemSupply(Set.of());
        assertThat(result).isEmpty();
    }
}
