package com.company.factory.sales.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.customer.domain.Customer;
import com.company.factory.customer.repository.CustomerRepository;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.sales.domain.SalesOrder;
import com.company.factory.sales.domain.SalesOrderItem;
import com.company.factory.sales.dto.CreateSalesOrderItemRequest;
import com.company.factory.sales.dto.CreateSalesOrderRequest;
import com.company.factory.sales.dto.SalesOrderDto;
import com.company.factory.sales.mapper.SalesMapper;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository soRepository;
    private final CustomerRepository customerRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final SalesMapper salesMapper;

    @Transactional(readOnly = true)
    public PageResponse<SalesOrderDto> getSalesOrders(String search, String status, Pageable pageable) {
        Specification<SalesOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate soMatch = cb.like(cb.lower(root.get("soNo")), pattern);
                Predicate custMatch = cb.like(cb.lower(root.get("customer").get("name")), pattern);
                predicates.add(cb.or(soMatch, custMatch));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SalesOrderDto> page = soRepository.findAll(spec, pageable).map(so -> {
            SalesOrderDto dto = salesMapper.toSoDto(so);
            dto.setItems(so.getItems().stream().map(salesMapper::toSoItemDto).toList());
            return dto;
        });
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public SalesOrderDto getSalesOrderById(Long id) {
        SalesOrder so = soRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SO_NOT_FOUND", "Sales order not found: " + id));
        SalesOrderDto dto = salesMapper.toSoDto(so);
        dto.setItems(so.getItems().stream().map(salesMapper::toSoItemDto).toList());
        return dto;
    }

    @Transactional
    public SalesOrderDto createSalesOrder(CreateSalesOrderRequest request, Long userId) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "CUSTOMER_NOT_FOUND", "Customer not found: " + request.getCustomerId()));

        String soNo = request.getSoNo();
        if (soNo == null || soNo.isBlank()) {
            soNo = "SO-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else if (soRepository.existsBySoNo(soNo)) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_SO_NO", "Sales order number already exists: " + soNo);
        }

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        SalesOrder so = SalesOrder.builder()
                .soNo(soNo)
                .customer(customer)
                .orderDate(request.getOrderDate())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .status("DRAFT")
                .currency(request.getCurrency())
                .note(request.getNote())
                .createdBy(user)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<SalesOrderItem> items = new ArrayList<>();

        for (CreateSalesOrderItemRequest itemReq : request.getItems()) {
            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found: " + itemReq.getItemId()));

            BigDecimal amount = itemReq.getQuantity().multiply(itemReq.getUnitPrice());
            subtotal = subtotal.add(amount);

            SalesOrderItem soItem = SalesOrderItem.builder()
                    .salesOrder(so)
                    .item(item)
                    .quantity(itemReq.getQuantity())
                    .deliveredQuantity(BigDecimal.ZERO)
                    .unitPrice(itemReq.getUnitPrice())
                    .amount(amount)
                    .build();

            items.add(soItem);
        }

        so.setSubtotal(subtotal);
        so.setTotalAmount(subtotal);
        so.setItems(items);

        SalesOrder savedSo = soRepository.save(so);
        SalesOrderDto dto = salesMapper.toSoDto(savedSo);
        dto.setItems(savedSo.getItems().stream().map(salesMapper::toSoItemDto).toList());
        return dto;
    }

    @Transactional
    public SalesOrderDto confirmSalesOrder(Long id) {
        SalesOrder so = soRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SO_NOT_FOUND", "Sales order not found: " + id));

        if (!"DRAFT".equals(so.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only DRAFT sales orders can be confirmed");
        }

        so.setStatus("CONFIRMED");
        SalesOrder savedSo = soRepository.save(so);
        SalesOrderDto dto = salesMapper.toSoDto(savedSo);
        dto.setItems(savedSo.getItems().stream().map(salesMapper::toSoItemDto).toList());
        return dto;
    }

    @Transactional
    public SalesOrderDto cancelSalesOrder(Long id) {
        SalesOrder so = soRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SO_NOT_FOUND", "Sales order not found: " + id));

        if ("DELIVERED".equals(so.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Cannot cancel an already delivered sales order");
        }

        so.setStatus("CANCELLED");
        SalesOrder savedSo = soRepository.save(so);
        SalesOrderDto dto = salesMapper.toSoDto(savedSo);
        dto.setItems(savedSo.getItems().stream().map(salesMapper::toSoItemDto).toList());
        return dto;
    }
}
