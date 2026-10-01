package com.company.factory.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingResponse {
    private String applicationName;
    private String companyName;
    private String defaultLanguage;
    private String supportedLanguages;
    private String defaultCurrency;
    private String timezone;
    private String dateFormat;
    private String numberFormat;
    private Map<String, Boolean> features;
    private Map<String, String> allSettings;
}
