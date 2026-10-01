-- ==============================================================================
-- V7__settings.sql: System Settings (White-label & Feature Flags)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default white-label configuration
INSERT INTO system_settings (key, value, description) VALUES
('application_name', 'Smart Factory', 'Public title of the factory application'),
('company_name', 'ABC Manufacturing Co., Ltd.', 'Legal entity name'),
('default_language', 'en', 'Default system locale (en, zh-CN)'),
('supported_languages', 'en,zh-CN', 'Comma-separated supported language codes'),
('default_currency', 'USD', 'System base accounting currency'),
('timezone', 'Asia/Shanghai', 'Factory local timezone'),
('date_format', 'YYYY-MM-DD', 'Standard display date format'),
('number_format', '#,##0.00', 'Standard display number format'),
('feature_inventory', 'true', 'Enable/disable inventory module'),
('feature_purchasing', 'true', 'Enable/disable purchasing module'),
('feature_production', 'true', 'Enable/disable production module'),
('feature_sales', 'true', 'Enable/disable sales module'),
('feature_reporting', 'true', 'Enable/disable reporting module')
ON CONFLICT (key) DO NOTHING;
