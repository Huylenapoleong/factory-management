package com.company.factory.masterdata.controller;

import com.company.factory.common.response.ApiResponse;
import com.company.factory.masterdata.domain.ItemImage;
import com.company.factory.masterdata.service.ItemImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/items/{id}/image")
@RequiredArgsConstructor
@Tag(name = "Item images", description = "Product photo or drawing shown on BOM and item screens")
public class ItemImageController {

    private final ItemImageService imageService;

    @GetMapping
    @Operation(summary = "Download the item's image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        ItemImage image = imageService.getImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .cacheControl(CacheControl.noCache().cachePrivate())
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Disposition", "inline")
                .body(image.getData());
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Upload or replace the item's image (PNG, JPEG or WEBP, max 5 MB)")
    public ApiResponse<Void> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        imageService.saveImage(id, file.getBytes(), file.getOriginalFilename());
        return ApiResponse.success(null, "Image saved");
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'PRODUCTION')")
    @Operation(summary = "Remove the item's image")
    public ApiResponse<Void> deleteImage(@PathVariable Long id) {
        imageService.deleteImage(id);
        return ApiResponse.success(null, "Image removed");
    }
}
