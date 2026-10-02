package com.company.factory.masterdata.repository;

import com.company.factory.masterdata.domain.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {

    @Query("SELECT i.updatedAt FROM ItemImage i WHERE i.itemId = :itemId")
    Optional<Instant> findUpdatedAtByItemId(@Param("itemId") Long itemId);
}
