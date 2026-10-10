package com.company.factory.masterdata;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.masterdata.domain.ItemImage;
import com.company.factory.masterdata.repository.ItemImageRepository;
import com.company.factory.masterdata.repository.ItemRepository;
import com.company.factory.masterdata.service.ItemImageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ItemImageServiceTest {

    @Mock
    private ItemImageRepository imageRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemImageService imageService;

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};

    @Test
    @DisplayName("Stores a PNG and records the type detected from its bytes")
    void saveImage_detectsPng() {
        when(itemRepository.existsById(7L)).thenReturn(true);
        when(imageRepository.findById(7L)).thenReturn(Optional.empty());
        when(imageRepository.save(any(ItemImage.class))).thenAnswer(inv -> inv.getArgument(0));

        ItemImage saved = imageService.saveImage(7L, PNG, "valve.jpg");

        assertThat(saved.getContentType()).isEqualTo("image/png");
        assertThat(saved.getSizeBytes()).isEqualTo(PNG.length);
        assertThat(saved.getItemId()).isEqualTo(7L);
    }

    @Test
    @DisplayName("Rejects content that is not a PNG, JPEG or WEBP image, whatever its name")
    void saveImage_rejectsNonImage() {
        when(itemRepository.existsById(7L)).thenReturn(true);
        byte[] svg = "<svg onload=alert(1)></svg>".getBytes(StandardCharsets.UTF_8);

        assertThatThrownBy(() -> imageService.saveImage(7L, svg, "logo.png"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("PNG, JPEG or WEBP");
        verify(imageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejects files larger than 5 MB")
    void saveImage_rejectsTooLarge() {
        when(itemRepository.existsById(7L)).thenReturn(true);
        byte[] big = new byte[ItemImageService.MAX_BYTES + 1];
        System.arraycopy(PNG, 0, big, 0, PNG.length);

        assertThatThrownBy(() -> imageService.saveImage(7L, big, "big.png"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("5 MB");
    }

    @Test
    @DisplayName("Rejects upload for an item that does not exist")
    void saveImage_itemMissing() {
        when(itemRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> imageService.saveImage(99L, PNG, "x.png"))
                .isInstanceOf(BusinessException.class);
    }
}
