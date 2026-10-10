package com.company.factory.production.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.repository.ItemImageRepository;
import com.company.factory.production.domain.Bom;
import com.company.factory.production.domain.BomItem;
import com.company.factory.production.dto.BomAnalysisDto;
import com.company.factory.production.dto.BomAnalysisLineDto;
import com.company.factory.production.dto.BomStructureNodeDto;
import com.company.factory.production.repository.BomRepository;
import com.company.factory.purchasing.dto.ItemSupplyDto;
import com.company.factory.purchasing.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static com.company.factory.production.dto.BomAnalysisLineDto.*;

/**
 * Multi-level (MRP-style) BOM analysis: a component with its own active BOM is made in-house,
 * so only the part of its requirement not covered by its own stock is exploded into its children.
 */
@Service
@RequiredArgsConstructor
public class BomAnalysisService {

    private static final int QTY_SCALE = 4;
    private static final int MONEY_SCALE = 2;
    private static final int MAX_DEPTH = 10;
    private static final long MAX_BUILDABLE_SEARCH = 10_000_000L;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final BomRepository bomRepository;
    private final InventoryService inventoryService;
    private final PurchaseOrderService purchaseOrderService;
    private final ItemImageRepository itemImageRepository;

    @Transactional(readOnly = true)
    public BomAnalysisDto analyze(Long bomId, BigDecimal plannedQuantity, LocalDate startDate) {
        if (plannedQuantity == null || plannedQuantity.signum() <= 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Planned quantity must be greater than zero");
        }

        Bom bom = bomRepository.findById(bomId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "BOM_NOT_FOUND", "BOM not found: " + bomId));

        LocalDate today = LocalDate.now();
        LocalDate needBy = startDate != null ? startDate : today;

        Graph graph = buildGraph(bom);
        Map<Long, BigDecimal> available = inventoryService.getAvailableQuantities(graph.items.keySet());
        Map<Long, ItemSupplyDto> supply = purchaseOrderService.getItemSupply(graph.buyItemIds());

        Explosion plan = explode(graph, plannedQuantity, available);
        Explosion standard = explode(graph, BigDecimal.ONE, Map.of());

        List<BomAnalysisLineDto> lines = graph.itemsByLevel().stream()
                .map(id -> toLine(graph, id, plan, standard, available.getOrDefault(id, BigDecimal.ZERO), supply.get(id), needBy, today))
                .toList();

        BigDecimal totalCost = lines.stream().map(BomAnalysisLineDto::getLineCost).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalScrapCost = lines.stream().map(BomAnalysisLineDto::getScrapCost).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal maxBuildable = maxBuildable(graph, available);
        Item bottleneck = bottleneck(graph, maxBuildable.add(BigDecimal.ONE), available);

        Item product = bom.getProduct();
        return BomAnalysisDto.builder()
                .bomId(bom.getId())
                .bomCode(bom.getCode())
                .version(bom.getVersion())
                .status(bom.getStatus())
                .productId(product.getId())
                .productCode(product.getCode())
                .productNameEn(product.getNameEn())
                .productNameZh(product.getNameZh())
                .productUnitCode(product.getUnit() != null ? product.getUnit().getCode() : null)
                .productImageVersion(itemImageRepository.findUpdatedAtByItemId(product.getId()).map(Instant::toEpochMilli).orElse(null))
                .plannedQuantity(plannedQuantity)
                .startDate(needBy)
                .totalMaterialCost(totalCost)
                .totalScrapCost(totalScrapCost)
                .costPerUnit(totalCost.divide(plannedQuantity, QTY_SCALE, RoundingMode.HALF_UP))
                .maxBuildableQuantity(maxBuildable)
                .bottleneckMaterialId(bottleneck != null ? bottleneck.getId() : null)
                .bottleneckMaterialNameEn(bottleneck != null ? bottleneck.getNameEn() : null)
                .bottleneckMaterialNameZh(bottleneck != null ? bottleneck.getNameZh() : null)
                .sufficientCount(count(lines, STATUS_SUFFICIENT))
                .lowCount(count(lines, STATUS_LOW))
                .shortageCount(count(lines, STATUS_SHORTAGE))
                .makeCount(count(lines, STATUS_MAKE))
                .toOrderCount((int) lines.stream().filter(l -> PROCUREMENT_TO_ORDER.equals(l.getProcurementStatus())).count())
                .levelCount(graph.level.values().stream().max(Integer::compare).orElse(0))
                .lines(lines)
                .structure(structureRoot(graph, plan, plannedQuantity))
                .build();
    }

    // ---------------------------------------------------------------- structure

    private static final class Graph {
        final Long rootId;
        final Item root;
        final Map<Long, Item> items = new LinkedHashMap<>();
        final Map<Long, Bom> boms = new HashMap<>();
        final Map<Long, Integer> level = new HashMap<>();
        final Map<Long, Set<Long>> parents = new HashMap<>();

        Graph(Bom rootBom) {
            this.root = rootBom.getProduct();
            this.rootId = root.getId();
            boms.put(rootId, rootBom);
        }

        boolean isMake(Long itemId) {
            return boms.containsKey(itemId);
        }

        Set<Long> buyItemIds() {
            Set<Long> ids = new LinkedHashSet<>(items.keySet());
            ids.removeIf(this::isMake);
            return ids;
        }

        List<Long> itemsByLevel() {
            List<Long> ordered = new ArrayList<>(items.keySet());
            ordered.sort(Comparator.comparingInt(level::get));
            return ordered;
        }
    }

    private Graph buildGraph(Bom rootBom) {
        Graph graph = new Graph(rootBom);
        Map<Long, Optional<Bom>> bomCache = new HashMap<>();
        Set<Long> path = new HashSet<>();
        path.add(graph.rootId);
        visit(graph, rootBom, graph.rootId, 1, path, bomCache);
        return graph;
    }

    private void visit(Graph graph, Bom bom, Long parentId, int depth, Set<Long> path, Map<Long, Optional<Bom>> bomCache) {
        if (depth > MAX_DEPTH) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "BOM_TOO_DEEP",
                    "BOM nesting exceeds " + MAX_DEPTH + " levels under " + bom.getCode());
        }
        for (BomItem bomItem : bom.getItems()) {
            Item child = bomItem.getMaterial();
            Long childId = child.getId();
            if (path.contains(childId)) {
                throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "BOM_CYCLE",
                        "Circular BOM reference: " + child.getCode() + " is used inside its own structure");
            }
            graph.items.putIfAbsent(childId, child);
            graph.level.merge(childId, depth, Math::max);
            graph.parents.computeIfAbsent(childId, id -> new LinkedHashSet<>()).add(parentId);

            Optional<Bom> childBom = bomCache.computeIfAbsent(childId,
                    id -> bomRepository.findFirstByProductIdAndStatusOrderByVersionDesc(id, "ACTIVE"));
            if (childBom.isPresent()) {
                graph.boms.put(childId, childBom.get());
                path.add(childId);
                visit(graph, childBom.get(), childId, depth + 1, path, bomCache);
                path.remove(childId);
            }
        }
    }

    // ---------------------------------------------------------------- explosion

    private record Explosion(Map<Long, BigDecimal> gross, Map<Long, BigDecimal> grossWithoutScrap, Map<Long, BigDecimal> make) {
        BigDecimal gross(Long id) {
            return gross.getOrDefault(id, BigDecimal.ZERO);
        }

        BigDecimal make(Long id) {
            return make.getOrDefault(id, BigDecimal.ZERO);
        }
    }

    private Explosion explode(Graph graph, BigDecimal quantity, Map<Long, BigDecimal> available) {
        Map<Long, BigDecimal> gross = new HashMap<>();
        Map<Long, BigDecimal> net = new HashMap<>();
        Map<Long, BigDecimal> make = new HashMap<>();
        make.put(graph.rootId, quantity);
        addChildren(graph.boms.get(graph.rootId), quantity, gross, net);

        for (Long id : graph.itemsByLevel()) {
            Bom bom = graph.boms.get(id);
            if (bom == null) {
                continue;
            }
            BigDecimal usable = available.getOrDefault(id, BigDecimal.ZERO).max(BigDecimal.ZERO);
            BigDecimal toMake = gross.getOrDefault(id, BigDecimal.ZERO).subtract(usable).max(BigDecimal.ZERO);
            make.put(id, toMake);
            addChildren(bom, toMake, gross, net);
        }
        return new Explosion(gross, net, make);
    }

    private void addChildren(Bom bom, BigDecimal parentQuantity, Map<Long, BigDecimal> gross, Map<Long, BigDecimal> net) {
        if (parentQuantity.signum() == 0) {
            return;
        }
        for (BomItem bomItem : bom.getItems()) {
            Long childId = bomItem.getMaterial().getId();
            gross.merge(childId, bomItem.requiredQuantityFor(parentQuantity), BigDecimal::add);
            net.merge(childId, parentQuantity.multiply(bomItem.getQuantity()), BigDecimal::add);
        }
    }

    private boolean feasible(Graph graph, BigDecimal quantity, Map<Long, BigDecimal> available) {
        Explosion explosion = explode(graph, quantity, available);
        for (Long id : graph.buyItemIds()) {
            if (explosion.gross(id).compareTo(available.getOrDefault(id, BigDecimal.ZERO).max(BigDecimal.ZERO)) > 0) {
                return false;
            }
        }
        return true;
    }

    private BigDecimal maxBuildable(Graph graph, Map<Long, BigDecimal> available) {
        if (!feasible(graph, BigDecimal.ONE, available)) {
            return BigDecimal.ZERO;
        }
        long low = 1;
        long high = 2;
        while (high <= MAX_BUILDABLE_SEARCH && feasible(graph, BigDecimal.valueOf(high), available)) {
            low = high;
            high *= 2;
        }
        if (high > MAX_BUILDABLE_SEARCH) {
            return BigDecimal.valueOf(low);
        }
        while (high - low > 1) {
            long mid = low + (high - low) / 2;
            if (feasible(graph, BigDecimal.valueOf(mid), available)) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return BigDecimal.valueOf(low);
    }

    private Item bottleneck(Graph graph, BigDecimal quantity, Map<Long, BigDecimal> available) {
        Explosion explosion = explode(graph, quantity, available);
        Item worst = null;
        BigDecimal worstRatio = null;
        for (Long id : graph.buyItemIds()) {
            BigDecimal need = explosion.gross(id);
            if (need.signum() == 0) {
                continue;
            }
            BigDecimal usable = available.getOrDefault(id, BigDecimal.ZERO).max(BigDecimal.ZERO);
            if (usable.compareTo(need) >= 0) {
                continue;
            }
            BigDecimal ratio = usable.divide(need, 6, RoundingMode.HALF_UP);
            if (worstRatio == null || ratio.compareTo(worstRatio) < 0) {
                worstRatio = ratio;
                worst = graph.items.get(id);
            }
        }
        return worst;
    }

    // ---------------------------------------------------------------- lines

    private BomAnalysisLineDto toLine(Graph graph, Long id, Explosion plan, Explosion standard, BigDecimal availableQty,
                                      ItemSupplyDto supply, LocalDate needBy, LocalDate today) {
        Item material = graph.items.get(id);
        boolean make = graph.isMake(id);
        BigDecimal required = plan.gross(id).setScale(QTY_SCALE, RoundingMode.HALF_UP);
        BigDecimal unitCost = material.getPurchasePrice() != null ? material.getPurchasePrice() : BigDecimal.ZERO;
        BigDecimal minStock = material.getMinStock() != null ? material.getMinStock() : BigDecimal.ZERO;
        BigDecimal usable = availableQty.max(BigDecimal.ZERO);
        BigDecimal shortage = required.subtract(usable).max(BigDecimal.ZERO);

        String status;
        if (shortage.signum() > 0) {
            status = make ? STATUS_MAKE : STATUS_SHORTAGE;
        } else if (usable.subtract(required).compareTo(minStock) < 0) {
            status = STATUS_LOW;
        } else {
            status = STATUS_SUFFICIENT;
        }

        BigDecimal coverage = required.signum() == 0
                ? HUNDRED
                : usable.multiply(HUNDRED).divide(required, 1, RoundingMode.HALF_UP).min(HUNDRED);

        BigDecimal standardGross = standard.gross(id);
        BigDecimal standardNet = standard.grossWithoutScrap().getOrDefault(id, BigDecimal.ZERO);
        BigDecimal scrapRate = standardNet.signum() == 0
                ? BigDecimal.ZERO
                : standardGross.subtract(standardNet).multiply(HUNDRED).divide(standardNet, 2, RoundingMode.HALF_UP);

        // A made item only costs what is taken from its own stock; the rest is costed through its children.
        BigDecimal costedQty = make ? required.min(usable) : required;
        BigDecimal scrapShare = required.signum() == 0
                ? BigDecimal.ZERO
                : required.subtract(plan.grossWithoutScrap().getOrDefault(id, BigDecimal.ZERO)).max(BigDecimal.ZERO)
                    .divide(required, 6, RoundingMode.HALF_UP);

        BomAnalysisLineDto.BomAnalysisLineDtoBuilder line = BomAnalysisLineDto.builder()
                .materialId(id)
                .materialCode(material.getCode())
                .materialNameEn(material.getNameEn())
                .materialNameZh(material.getNameZh())
                .materialType(material.getType() != null ? material.getType().name() : null)
                .unitCode(material.getUnit() != null ? material.getUnit().getCode() : null)
                .level(graph.level.get(id))
                .makeOrBuy(make ? SOURCE_MAKE : SOURCE_BUY)
                .usedIn(graph.parents.get(id).stream()
                        .map(parentId -> parentId.equals(graph.rootId) ? graph.root.getCode() : graph.items.get(parentId).getCode())
                        .toList())
                .unitQuantity(standardNet.setScale(QTY_SCALE, RoundingMode.HALF_UP))
                .scrapRate(scrapRate)
                .requiredQuantity(required)
                .availableQuantity(availableQty)
                .minStock(minStock)
                .shortageQuantity(shortage)
                .surplusQuantity(usable.subtract(required).max(BigDecimal.ZERO))
                .coveragePercent(coverage)
                .status(status)
                .unitCost(unitCost)
                .lineCost(costedQty.multiply(unitCost).setScale(MONEY_SCALE, RoundingMode.HALF_UP))
                .scrapCost(costedQty.multiply(scrapShare).multiply(unitCost).setScale(MONEY_SCALE, RoundingMode.HALF_UP))
                .onOrderQuantity(BigDecimal.ZERO)
                .orderQuantity(BigDecimal.ZERO)
                .toMakeQuantity(BigDecimal.ZERO);

        if (make) {
            return line
                    .toMakeQuantity(shortage.setScale(0, RoundingMode.CEILING))
                    .procurementStatus(shortage.signum() > 0 ? PROCUREMENT_TO_MAKE : PROCUREMENT_COVERED)
                    .build();
        }

        BigDecimal onOrder = supply != null ? supply.getOnOrderQuantity() : BigDecimal.ZERO;
        BigDecimal orderQty = shortage.subtract(onOrder).max(BigDecimal.ZERO).setScale(0, RoundingMode.CEILING);
        Integer leadTime = supply != null ? supply.getLeadTimeDays() : null;
        LocalDate orderBy = needBy.minusDays(leadTime != null ? leadTime : 0);
        LocalDate expectedArrival = supply != null ? supply.getNextExpectedDate() : null;

        String procurement;
        String urgency = null;
        if (shortage.signum() == 0) {
            procurement = PROCUREMENT_COVERED;
        } else if (orderQty.signum() == 0) {
            procurement = PROCUREMENT_ORDERED;
            if (expectedArrival != null && expectedArrival.isAfter(needBy)) {
                urgency = URGENCY_LATE;
            }
        } else {
            procurement = PROCUREMENT_TO_ORDER;
            urgency = orderBy.isBefore(today) ? URGENCY_LATE : orderBy.isEqual(today) ? URGENCY_TODAY : URGENCY_UPCOMING;
        }

        return line
                .onOrderQuantity(onOrder)
                .orderQuantity(orderQty)
                .procurementStatus(procurement)
                .urgency(urgency)
                .orderByDate(shortage.signum() > 0 ? orderBy : null)
                .expectedArrivalDate(expectedArrival)
                .supplierId(supply != null ? supply.getLastSupplierId() : null)
                .supplierName(supply != null ? supply.getLastSupplierName() : null)
                .leadTimeDays(leadTime)
                .build();
    }

    private int count(List<BomAnalysisLineDto> lines, String status) {
        return (int) lines.stream().filter(line -> status.equals(line.getStatus())).count();
    }

    // ---------------------------------------------------------------- tree

    private BomStructureNodeDto structureRoot(Graph graph, Explosion plan, BigDecimal quantity) {
        Item root = graph.root;
        return BomStructureNodeDto.builder()
                .itemId(root.getId())
                .itemCode(root.getCode())
                .itemNameEn(root.getNameEn())
                .itemNameZh(root.getNameZh())
                .unitCode(root.getUnit() != null ? root.getUnit().getCode() : null)
                .makeOrBuy(SOURCE_MAKE)
                .quantityPer(BigDecimal.ONE)
                .scrapRate(BigDecimal.ZERO)
                .requiredQuantity(quantity)
                .makeQuantity(quantity)
                .children(structureChildren(graph, graph.boms.get(graph.rootId), quantity, plan))
                .build();
    }

    private List<BomStructureNodeDto> structureChildren(Graph graph, Bom bom, BigDecimal parentMake, Explosion plan) {
        List<BomStructureNodeDto> nodes = new ArrayList<>();
        for (BomItem bomItem : bom.getItems()) {
            Item child = bomItem.getMaterial();
            Long childId = child.getId();
            BigDecimal occurrence = bomItem.requiredQuantityFor(parentMake);
            Bom childBom = graph.boms.get(childId);

            BigDecimal occurrenceMake = null;
            List<BomStructureNodeDto> grandChildren = List.of();
            if (childBom != null) {
                BigDecimal total = plan.gross(childId);
                occurrenceMake = total.signum() == 0
                        ? BigDecimal.ZERO
                        : plan.make(childId).multiply(occurrence).divide(total, QTY_SCALE, RoundingMode.HALF_UP);
                grandChildren = structureChildren(graph, childBom, occurrenceMake, plan);
            }

            nodes.add(BomStructureNodeDto.builder()
                    .itemId(childId)
                    .itemCode(child.getCode())
                    .itemNameEn(child.getNameEn())
                    .itemNameZh(child.getNameZh())
                    .unitCode(child.getUnit() != null ? child.getUnit().getCode() : null)
                    .makeOrBuy(childBom != null ? SOURCE_MAKE : SOURCE_BUY)
                    .quantityPer(bomItem.getQuantity())
                    .scrapRate(bomItem.getScrapRate() != null ? bomItem.getScrapRate() : BigDecimal.ZERO)
                    .requiredQuantity(occurrence.setScale(QTY_SCALE, RoundingMode.HALF_UP))
                    .makeQuantity(occurrenceMake)
                    .children(grandChildren)
                    .build());
        }
        return nodes;
    }
}
