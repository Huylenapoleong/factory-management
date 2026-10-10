package com.company.factory.masterdata.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.ItemImage;
import com.company.factory.masterdata.repository.ItemImageRepository;
import com.company.factory.masterdata.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ItemImageService {

    public static final int MAX_BYTES = 5 * 1024 * 1024;

    private final ItemImageRepository imageRepository;
    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public ItemImage getImage(Long itemId) {
        return imageRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Item has no image: " + itemId));
    }

    @Transactional
    public ItemImage saveImage(Long itemId, byte[] data, String fileName) {
        if (!itemRepository.existsById(itemId)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Item not found: " + itemId);
        }
        if (data == null || data.length == 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "Image file is empty");
        }
        if (data.length > MAX_BYTES) {
            throw new BusinessException(HttpStatus.CONTENT_TOO_LARGE, "FILE_TOO_LARGE", "Image must be 5 MB or smaller");
        }
        String contentType = detectContentType(data);
        if (contentType == null) {
            throw new BusinessException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_IMAGE", "Only PNG, JPEG or WEBP images are accepted");
        }

        ItemImage image = imageRepository.findById(itemId).orElseGet(() -> ItemImage.builder().itemId(itemId).build());
        image.setData(data);
        image.setContentType(contentType);
        image.setFileName(fileName != null && fileName.length() > 255 ? fileName.substring(0, 255) : fileName);
        image.setSizeBytes(data.length);
        image.setUpdatedAt(Instant.now());
        return imageRepository.save(image);
    }

    @Transactional
    public void deleteImage(Long itemId) {
        imageRepository.deleteById(itemId);
    }

    // Trust the file's magic bytes, never the client-declared type or extension.
    static String detectContentType(byte[] data) {
        if (startsWith(data, 0, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return "image/png";
        }
        if (startsWith(data, 0, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }
        if (startsWith(data, 0, 'R', 'I', 'F', 'F') && startsWith(data, 8, 'W', 'E', 'B', 'P')) {
            return "image/webp";
        }
        return null;
    }

    private static boolean startsWith(byte[] data, int offset, int... signature) {
        if (data.length < offset + signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((data[offset + i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }
}
