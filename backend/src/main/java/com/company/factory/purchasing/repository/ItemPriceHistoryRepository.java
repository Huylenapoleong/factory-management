package com.company.factory.purchasing.repository;

import com.company.factory.purchasing.domain.ItemPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemPriceHistoryRepository extends JpaRepository<ItemPriceHistory, Long> {
    List<ItemPriceHistory> findByItemIdOrderByEffectiveFromDesc(Long itemId);
    List<ItemPriceHistory> findByItemIdAndPriceTypeOrderByEffectiveFromDesc(Long itemId, String priceType);
}
