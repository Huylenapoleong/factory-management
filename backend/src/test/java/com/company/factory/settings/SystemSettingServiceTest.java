package com.company.factory.settings;

import com.company.factory.settings.domain.SystemSetting;
import com.company.factory.settings.dto.SettingResponse;
import com.company.factory.settings.repository.SystemSettingRepository;
import com.company.factory.settings.service.SystemSettingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemSettingServiceTest {

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private SystemSettingService systemSettingService;

    private List<SystemSetting> mockSettings;

    @BeforeEach
    void setUp() {
        mockSettings = List.of(
                SystemSetting.builder().key("application_name").value("Test Factory").build(),
                SystemSetting.builder().key("company_name").value("Acme Corp").build(),
                SystemSetting.builder().key("feature_inventory").value("true").build(),
                SystemSetting.builder().key("feature_production").value("false").build()
        );
    }

    @Test
    @DisplayName("getSettings should parse settings and feature flags correctly")
    void shouldGetSettings() {
        when(systemSettingRepository.findAll()).thenReturn(mockSettings);

        SettingResponse response = systemSettingService.getSettings();

        assertThat(response).isNotNull();
        assertThat(response.getApplicationName()).isEqualTo("Test Factory");
        assertThat(response.getCompanyName()).isEqualTo("Acme Corp");
        assertThat(response.getFeatures()).containsEntry("inventory", true);
        assertThat(response.getFeatures()).containsEntry("production", false);
    }

    @Test
    @DisplayName("updateSettings should update existing or insert new settings")
    void shouldUpdateSettings() {
        when(systemSettingRepository.findByKey("application_name"))
                .thenReturn(Optional.of(SystemSetting.builder().key("application_name").value("Old Name").build()));
        when(systemSettingRepository.findAll()).thenReturn(List.of(
                SystemSetting.builder().key("application_name").value("New Name").build()
        ));

        SettingResponse response = systemSettingService.updateSettings(Map.of("application_name", "New Name"));

        verify(systemSettingRepository, times(1)).save(any(SystemSetting.class));
        assertThat(response.getApplicationName()).isEqualTo("New Name");
    }
}
