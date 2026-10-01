package com.company.factory.sales.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.domain.WarehouseLocation;
import com.company.factory.inventory.repository.WarehouseLocationRepository;
import com.company.factory.inventory.repository.WarehouseRepository;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.purchasing.domain.ItemPriceHistory;
import com.company.factory.purchasing.repository.ItemPriceHistoryRepository;
import com.company.factory.sales.domain.Delivery;
import com.company.factory.sales.domain.DeliveryItem;
import com.company.factory.sales.domain.SalesOrder;
import com.company.factory.sales.dto.CreateDeliveryItemRequest;
import com.company.factory.sales.dto.CreateDeliveryRequest;
import com.company.factory.sales.dto.DeliveryDto;
import com.company.factory.sales.mapper.SalesMapper;
import com.company.factory.sales.repository.DeliveryRepository;
import com.company.factory.sales.repository.SalesOrderRepository;
import com.company.factory.user.domain.User;
import com.company.factory.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final SalesOrderRepository soRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final ItemRepository itemRepository;
    private final ItemPriceHistoryRepository priceHistoryRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final SalesMapper salesMapper;

    @Transactional(readOnly = true)
    public PageResponse<DeliveryDto> getDeliveries(String search, String status, Pageable pageable) {
        Specification<Delivery> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate delivMatch = cb.like(cb.lower(root.get("deliveryNo")), pattern);
                predicates.add(delivMatch);
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeliveryDto> page = deliveryRepository.findAll(spec, pageable).map(deliv -> {
            DeliveryDto dto = salesMapper.toDeliveryDto(deliv);
            dto.setItems(deliv.getItems().stream().map(salesMapper::toDeliveryItemDto).toList());
            return dto;
        });
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public DeliveryDto getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DELIVERY_NOT_FOUND", "Delivery not found: " + id));
        DeliveryDto dto = salesMapper.toDeliveryDto(delivery);
        dto.setItems(delivery.getItems().stream().map(salesMapper::toDeliveryItemDto).toList());
        return dto;
    }

    @Transactional
    public DeliveryDto createDelivery(CreateDeliveryRequest request, Long userId) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "WAREHOUSE_NOT_FOUND", "Warehouse not found: " + request.getWarehouseId()));

        SalesOrder so = null;
        if (request.getSalesOrderId() != null) {
            so = soRepository.findById(request.getSalesOrderId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SO_NOT_FOUND", "Sales order not found: " + request.getSalesOrderId()));
        }

        String deliveryNo = request.getDeliveryNo();
        if (deliveryNo == null || deliveryNo.isBlank()) {
            deliveryNo = "DEL-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else if (deliveryRepository.existsByDeliveryNo(deliveryNo)) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_DELIVERY_NO", "Delivery number already exists: " + deliveryNo);
        }

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        Delivery delivery = Delivery.builder()
                .deliveryNo(deliveryNo)
                .salesOrder(so)
                .warehouse(warehouse)
                .deliveryDate(request.getDeliveryDate())
                .status("DRAFT")
                .note(request.getNote())
                .createdBy(user)
                .build();

        List<DeliveryItem> items = new ArrayList<>();
        for (CreateDeliveryItemRequest itemReq : request.getItems()) {
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found: " + itemReq.getItemId()));

            WarehouseLocation location = null;
            if (itemReq.getLocationId() != null) {
                location = locationRepository.findById(itemReq.getLocationId())
                        .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND", "Location not found: " + itemReq.getLocationId()));
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : item.getSalePrice();

            DeliveryItem deliveryItem = DeliveryItem.builder()
                    .delivery(delivery)
                    .item(item)
                    .location(location)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .build();

            items.add(deliveryItem);
        }

        delivery.setItems(items);
        Delivery savedDelivery = deliveryRepository.save(delivery);
        DeliveryDto dto = salesMapper.toDeliveryDto(savedDelivery);
        dto.setItems(savedDelivery.getItems().stream().map(salesMapper::toDeliveryItemDto).toList());
        return dto;
    }

    @Transactional
    public DeliveryDto postDelivery(Long id, Long userId) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DELIVERY_NOT_FOUND", "Delivery not found: " + id));

        if (!"DRAFT".equals(delivery.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only DRAFT deliveries can be posted");
        }

        SalesOrder so = delivery.getSalesOrder();

        for (DeliveryItem item : delivery.getItems()) {
            Long locId = item.getLocation() != null ? item.getLocation().getId() : null;

            inventoryService.decreaseStock(
                    delivery.getWarehouse().getId(),
                    locId,
                    item.getItem().getId(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    TransactionType.SALE_OUT,
                    "DELIVERY",
                    delivery.getDeliveryNo(),
                    delivery.getNote(),
                    userId
            );

            if (so != null) {
                so.getItems().stream()
                        .filter(soItem -> soItem.getItem().getId().equals(item.getItem().getId()))
                        .findFirst()
                        .ifPresent(soItem -> {
                            BigDecimal newDelivered = soItem.getDeliveredQuantity().add(item.getQuantity());
                            soItem.setDeliveredQuantity(newDelivered);
                        });
            }

            if (item.getUnitPrice() != null && item.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
                ItemPriceHistory priceHistory = ItemPriceHistory.builder()
                        .item(item.getItem())
                        .priceType("SALE")
                        .customer(so != null ? so.getCustomer() : null)
                        .price(item.getUnitPrice())
                        .effectiveFrom(Instant.now())
                        .build();
                priceHistoryRepository.save(priceHistory);
            }
        }

        if (so != null) {
            boolean allFullyDelivered = so.getItems().stream()
                    .allMatch(soItem -> soItem.getDeliveredQuantity().compareTo(soItem.getQuantity()) >= 0);
            if (allFullyDelivered) {
                so.setStatus("DELIVERED");
                soRepository.save(so);
            }
        }

        delivery.setStatus("POSTED");
        Delivery savedDelivery = deliveryRepository.save(delivery);

        DeliveryDto dto = salesMapper.toDeliveryDto(savedDelivery);
        dto.setItems(savedDelivery.getItems().stream().map(salesMapper::toDeliveryItemDto).toList());
        return dto;
    }
}
