-- ==============================================================================
-- V5__production.sql: BOM, Routing, Production Orders, Materials & Operations
-- ==============================================================================

CREATE TABLE IF NOT EXISTS boms (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    product_id BIGINT NOT NULL REFERENCES items(id),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bom_items (
    id BIGSERIAL PRIMARY KEY,
    bom_id BIGINT NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES items(id),
    quantity NUMERIC(15, 4) NOT NULL,
    scrap_rate NUMERIC(5, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS routings (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    product_id BIGINT NOT NULL REFERENCES items(id),
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routing_steps (
    id BIGSERIAL PRIMARY KEY,
    routing_id BIGINT NOT NULL REFERENCES routings(id) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    operation_code VARCHAR(50) NOT NULL,
    operation_name_en VARCHAR(100) NOT NULL,
    operation_name_zh VARCHAR(100),
    standard_time INT DEFAULT 0 -- in minutes
);

CREATE TABLE IF NOT EXISTS production_orders (
    id BIGSERIAL PRIMARY KEY,
    mo_no VARCHAR(100) NOT NULL UNIQUE,
    product_id BIGINT NOT NULL REFERENCES items(id),
    bom_id BIGINT REFERENCES boms(id),
    routing_id BIGINT REFERENCES routings(id),
    planned_quantity NUMERIC(15, 4) NOT NULL,
    completed_quantity NUMERIC(15, 4) DEFAULT 0,
    scrap_quantity NUMERIC(15, 4) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, RELEASED, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED
    start_date DATE,
    due_date DATE,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_materials (
    id BIGSERIAL PRIMARY KEY,
    production_order_id BIGINT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES items(id),
    required_quantity NUMERIC(15, 4) NOT NULL,
    issued_quantity NUMERIC(15, 4) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS production_operations (
    id BIGSERIAL PRIMARY KEY,
    production_order_id BIGINT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    operation_code VARCHAR(50) NOT NULL,
    operation_name_en VARCHAR(100) NOT NULL,
    operation_name_zh VARCHAR(100),
    target_quantity NUMERIC(15, 4) NOT NULL,
    completed_quantity NUMERIC(15, 4) DEFAULT 0,
    scrap_quantity NUMERIC(15, 4) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' -- PENDING, IN_PROGRESS, COMPLETED
);
