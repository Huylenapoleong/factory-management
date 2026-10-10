package com.company.factory.production.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.common.response.PageResponse;
import com.company.factory.inventory.domain.TransactionType;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.production.domain.*;
import com.company.factory.production.dto.*;
import com.company.factory.production.mapper.ProductionMapper;
import com.company.factory.production.repository.*;
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
public class ProductionOrderService {

    private final ProductionOrderRepository moRepository;
    private final ProductionMaterialRepository materialRepository;
    private final ProductionOperationRepository operationRepository;
    private final BomRepository bomRepository;
    private final RoutingRepository routingRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final ProductionMapper productionMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductionOrderDto> getProductionOrders(String search, String status, Pageable pageable) {
        Specification<ProductionOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate moMatch = cb.like(cb.lower(root.get("moNo")), pattern);
                Predicate productMatch = cb.like(cb.lower(root.get("product").get("nameEn")), pattern);
                predicates.add(cb.or(moMatch, productMatch));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ProductionOrderDto> page = moRepository.findAll(spec, pageable).map(this::toDetailedDto);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public ProductionOrderDto getProductionOrderById(Long id) {
        ProductionOrder mo = moRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MO_NOT_FOUND", "Production order not found: " + id));
        return toDetailedDto(mo);
    }

    @Transactional
    public ProductionOrderDto createProductionOrder(CreateProductionOrderRequest request, Long userId) {
        Item product = itemRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + request.getProductId()));

        Bom bom = null;
        if (request.getBomId() != null) {
            bom = bomRepository.findById(request.getBomId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "BOM_NOT_FOUND", "BOM not found: " + request.getBomId()));
        } else {
            bom = bomRepository.findFirstByProductIdAndStatusOrderByVersionDesc(product.getId(), "ACTIVE").orElse(null);
        }

        Routing routing = null;
        if (request.getRoutingId() != null) {
            routing = routingRepository.findById(request.getRoutingId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ROUTING_NOT_FOUND", "Routing not found: " + request.getRoutingId()));
        } else {
            routing = routingRepository.findFirstByProductIdAndStatusOrderByVersionDesc(product.getId(), "ACTIVE").orElse(null);
        }

        String moNo = request.getMoNo();
        if (moNo == null || moNo.isBlank()) {
            moNo = "MO-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        } else if (moRepository.existsByMoNo(moNo)) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_MO_NO", "Production order number already exists: " + moNo);
        }

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        ProductionOrder mo = ProductionOrder.builder()
                .moNo(moNo)
                .product(product)
                .bom(bom)
                .routing(routing)
                .plannedQuantity(request.getPlannedQuantity())
                .completedQuantity(BigDecimal.ZERO)
                .scrapQuantity(BigDecimal.ZERO)
                .status("DRAFT")
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .createdBy(user)
                .build();

        List<ProductionMaterial> materials = new ArrayList<>();
        if (bom != null) {
            for (BomItem bomItem : bom.getItems()) {
                BigDecimal requiredQty = bomItem.requiredQuantityFor(request.getPlannedQuantity());

                ProductionMaterial material = ProductionMaterial.builder()
                        .productionOrder(mo)
                        .material(bomItem.getMaterial())
                        .requiredQuantity(requiredQty)
                        .issuedQuantity(BigDecimal.ZERO)
                        .build();

                materials.add(material);
            }
        }
        mo.setMaterials(materials);

        List<ProductionOperation> operations = new ArrayList<>();
        if (routing != null) {
            for (RoutingStep step : routing.getSteps()) {
                ProductionOperation op = ProductionOperation.builder()
                        .productionOrder(mo)
                        .sequenceNo(step.getSequenceNo())
                        .operationCode(step.getOperationCode())
                        .operationNameEn(step.getOperationNameEn())
                        .operationNameZh(step.getOperationNameZh())
                        .targetQuantity(request.getPlannedQuantity())
                        .completedQuantity(BigDecimal.ZERO)
                        .scrapQuantity(BigDecimal.ZERO)
                        .status("PENDING")
                        .build();

                operations.add(op);
            }
        }
        mo.setOperations(operations);

        ProductionOrder savedMo = moRepository.save(mo);
        return toDetailedDto(savedMo);
    }

    @Transactional
    public ProductionOrderDto releaseProductionOrder(Long id) {
        ProductionOrder mo = moRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MO_NOT_FOUND", "Production order not found: " + id));

        if (!"DRAFT".equals(mo.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only DRAFT orders can be released");
        }

        mo.setStatus("RELEASED");
        return toDetailedDto(moRepository.save(mo));
    }

    @Transactional
    public ProductionOrderDto startProductionOrder(Long id) {
        ProductionOrder mo = moRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MO_NOT_FOUND", "Production order not found: " + id));

        if (!"RELEASED".equals(mo.getStatus()) && !"PAUSED".equals(mo.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only RELEASED or PAUSED orders can be started");
        }

        mo.setStatus("IN_PROGRESS");
        return toDetailedDto(moRepository.save(mo));
    }

    @Transactional
    public ProductionOrderDto pauseProductionOrder(Long id) {
        ProductionOrder mo = moRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MO_NOT_FOUND", "Production order not found: " + id));

        if (!"IN_PROGRESS".equals(mo.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only IN_PROGRESS orders can be paused");
        }

        mo.setStatus("PAUSED");
        return toDetailedDto(moRepository.save(mo));
    }

    @Transactional
    public ProductionMaterialDto issueMaterial(MaterialIssueRequest request, Long userId) {
        ProductionOrder mo = moRepository.findById(request.getProductionOrderId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MO_NOT_FOUND", "Production order not found: " + request.getProductionOrderId()));

        if (!"RELEASED".equals(mo.getStatus()) && !"IN_PROGRESS".equals(mo.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Can only issue materials to RELEASED or IN_PROGRESS orders");
        }

        ProductionMaterial material = materialRepository.findByProductionOrderIdAndMaterialId(mo.getId(), request.getMaterialId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MATERIAL_NOT_FOUND", "Material item not associated with this production order: " + request.getMaterialId()));

        inventoryService.decreaseStock(
                request.getWarehouseId(),
                request.getLocationId(),
                request.getMaterialId(),
                request.getQuantity(),
                material.getMaterial().getPurchasePrice(),
                TransactionType.PRODUCTION_ISSUE,
                "PRODUCTION_ORDER",
                mo.getMoNo(),
                request.getNote(),
                userId
        );

        material.setIssuedQuantity(material.getIssuedQuantity().add(request.getQuantity()));
        ProductionMaterial savedMaterial = materialRepository.save(material);
        return productionMapper.toMaterialDto(savedMaterial);
    }

    @Transactional
    public ProductionOperationDto reportOperationProgress(Long operationId, OperationReportRequest request) {
        ProductionOperation op = operationRepository.findById(operationId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "OPERATION_NOT_FOUND", "Operation step not found: " + operationId));

        op.setCompletedQuantity(op.getCompletedQuantity().add(request.getCompletedQuantity()));
        op.setScrapQuantity(op.getScrapQuantity().add(request.getScrapQuantity()));

        if (op.getCompletedQuantity().compareTo(op.getTargetQuantity()) >= 0) {
            op.setStatus("COMPLETED");
        } else {
            op.setStatus("IN_PROGRESS");
        }

        return productionMapper.toOperationDto(operationRepository.save(op));
    }

    @Transactional
    public ProductionOrderDto completeProductionOrder(Long id, ProductionCompleteRequest request, Long userId) {
        ProductionOrder mo = moRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "MO_NOT_FOUND", "Production order not found: " + id));

        if (!"IN_PROGRESS".equals(mo.getStatus())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Only IN_PROGRESS orders can be completed");
        }

        inventoryService.increaseStock(
                request.getWarehouseId(),
                request.getLocationId(),
                mo.getProduct().getId(),
                request.getCompletedQuantity(),
                mo.getProduct().getSalePrice(),
                TransactionType.PRODUCTION_RECEIPT,
                "PRODUCTION_ORDER",
                mo.getMoNo(),
                request.getNote(),
                userId
        );

        mo.setCompletedQuantity(mo.getCompletedQuantity().add(request.getCompletedQuantity()));
        mo.setScrapQuantity(mo.getScrapQuantity().add(request.getScrapQuantity()));
        mo.setStatus("COMPLETED");

        return toDetailedDto(moRepository.save(mo));
    }

    private ProductionOrderDto toDetailedDto(ProductionOrder mo) {
        ProductionOrderDto dto = productionMapper.toMoDto(mo);
        dto.setMaterials(mo.getMaterials().stream().map(productionMapper::toMaterialDto).toList());
        dto.setOperations(mo.getOperations().stream().map(productionMapper::toOperationDto).toList());
        return dto;
    }
}
