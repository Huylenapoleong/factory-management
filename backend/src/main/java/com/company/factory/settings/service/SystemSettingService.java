package com.company.factory.settings.service;

import com.company.factory.settings.domain.SystemSetting;
import com.company.factory.settings.dto.SettingResponse;
import com.company.factory.settings.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public SettingResponse getSettings() {
        List<SystemSetting> settingsList = systemSettingRepository.findAll();
        Map<String, String> allSettings = new HashMap<>();
        Map<String, Boolean> features = new HashMap<>();

        for (SystemSetting setting : settingsList) {
            allSettings.put(setting.getKey(), setting.getValue());
            if (setting.getKey().startsWith("feature_")) {
                String featureKey = setting.getKey().replace("feature_", "");
                features.put(featureKey, Boolean.parseBoolean(setting.getValue()));
            }
        }

        return SettingResponse.builder()
                .applicationName(allSettings.getOrDefault("application_name", "Smart Factory"))
                .companyName(allSettings.getOrDefault("company_name", "ABC Manufacturing Co., Ltd."))
                .defaultLanguage(allSettings.getOrDefault("default_language", "en"))
                .supportedLanguages(allSettings.getOrDefault("supported_languages", "en,zh-CN"))
                .defaultCurrency(allSettings.getOrDefault("default_currency", "USD"))
                .timezone(allSettings.getOrDefault("timezone", "Asia/Shanghai"))
                .dateFormat(allSettings.getOrDefault("date_format", "YYYY-MM-DD"))
                .numberFormat(allSettings.getOrDefault("number_format", "#,##0.00"))
                .features(features)
                .allSettings(allSettings)
                .build();
    }

    @Transactional
    public SettingResponse updateSettings(Map<String, String> newSettings) {
        if (newSettings == null || newSettings.isEmpty()) {
            return getSettings();
        }

        Instant now = Instant.now();
        for (Map.Entry<String, String> entry : newSettings.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            SystemSetting setting = systemSettingRepository.findByKey(key)
                    .orElse(SystemSetting.builder().key(key).build());

            setting.setValue(value);
            setting.setUpdatedAt(now);
            systemSettingRepository.save(setting);
        }

        return getSettings();
    }

    @Transactional(readOnly = true)
    public boolean isFeatureEnabled(String featureName) {
        String key = featureName.startsWith("feature_") ? featureName : "feature_" + featureName;
        return systemSettingRepository.findByKey(key)
                .map(setting -> Boolean.parseBoolean(setting.getValue()))
                .orElse(true);
    }
}
