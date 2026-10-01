-- ==============================================================================
-- V2__master_data.sql: Item Categories, Units, Items, Warehouses, Locations, Suppliers, Customers
-- ==============================================================================

CREATE TABLE IF NOT EXISTS item_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100),
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units_of_measurement (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name_en VARCHAR(50) NOT NULL,
    name_zh VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(200) NOT NULL,
    name_zh VARCHAR(200),
    type VARCHAR(30) NOT NULL, -- RAW_MATERIAL, SEMI_FINISHED, FINISHED_GOOD, CONSUMABLE
    category_id BIGINT REFERENCES item_categories(id),
    unit_id BIGINT REFERENCES units_of_measurement(id),
    purchase_price NUMERIC(15, 4) DEFAULT 0,
    sale_price NUMERIC(15, 4) DEFAULT 0,
    min_stock NUMERIC(15, 4) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_zh VARCHAR(150),
    type VARCHAR(30) NOT NULL, -- RAW_MATERIAL, WIP, FINISHED_GOOD, GENERAL
    address VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouse_locations (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    name_zh VARCHAR(200),
    tax_code VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(100),
    address VARCHAR(255),
    contact_person VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_term VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    name_zh VARCHAR(200),
    tax_code VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(100),
    address VARCHAR(255),
    contact_person VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_term VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
