package com.company.factory.production.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.production.domain.Routing;
import com.company.factory.production.domain.RoutingStep;
import com.company.factory.production.dto.CreateRoutingRequest;
import com.company.factory.production.dto.CreateRoutingStepRequest;
import com.company.factory.production.dto.RoutingDto;
import com.company.factory.production.mapper.ProductionMapper;
import com.company.factory.production.repository.RoutingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoutingService {

    private final RoutingRepository routingRepository;
    private final ItemRepository itemRepository;
    private final ProductionMapper productionMapper;

    @Transactional(readOnly = true)
    public List<RoutingDto> getRoutings(Long productId, String status) {
        List<Routing> routings;
        if (productId != null) {
            routings = routingRepository.findByProductId(productId);
        } else {
            routings = routingRepository.findAll();
        }

        return routings.stream()
                .filter(r -> status == null || status.equalsIgnoreCase(r.getStatus()))
                .map(r -> {
                    RoutingDto dto = productionMapper.toRoutingDto(r);
                    dto.setSteps(r.getSteps().stream().map(productionMapper::toRoutingStepDto).toList());
                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public RoutingDto getRoutingById(Long id) {
        Routing routing = routingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ROUTING_NOT_FOUND", "Routing not found: " + id));
        RoutingDto dto = productionMapper.toRoutingDto(routing);
        dto.setSteps(routing.getSteps().stream().map(productionMapper::toRoutingStepDto).toList());
        return dto;
    }

    @Transactional
    public RoutingDto createRouting(CreateRoutingRequest request) {
        if (routingRepository.existsByCode(request.getCode())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_CODE", "Routing code already exists: " + request.getCode());
        }

        Item product = itemRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + request.getProductId()));

        Routing routing = Routing.builder()
                .code(request.getCode())
                .product(product)
                .version(request.getVersion() != null ? request.getVersion() : "1.0")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        List<RoutingStep> steps = new ArrayList<>();
        for (CreateRoutingStepRequest stepReq : request.getSteps()) {
            RoutingStep step = RoutingStep.builder()
                    .routing(routing)
                    .sequenceNo(stepReq.getSequenceNo())
                    .operationCode(stepReq.getOperationCode())
                    .operationNameEn(stepReq.getOperationNameEn())
                    .operationNameZh(stepReq.getOperationNameZh())
                    .standardTime(stepReq.getStandardTime())
                    .build();

            steps.add(step);
        }

        routing.setSteps(steps);
        Routing savedRouting = routingRepository.save(routing);
        RoutingDto dto = productionMapper.toRoutingDto(savedRouting);
        dto.setSteps(savedRouting.getSteps().stream().map(productionMapper::toRoutingStepDto).toList());
        return dto;
    }
}
