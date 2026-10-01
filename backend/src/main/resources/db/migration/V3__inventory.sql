-- ==============================================================================
-- V3__inventory.sql: Inventory Balances & Stock Transactions
-- ==============================================================================

CREATE TABLE IF NOT EXISTS inventory_balances (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    location_id BIGINT REFERENCES warehouse_locations(id),
    item_id BIGINT NOT NULL REFERENCES items(id),
    quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
    reserved_quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
    available_quantity NUMERIC(15, 4) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_inventory_balance UNIQUE (warehouse_id, location_id, item_id),
    CONSTRAINT chk_positive_quantity CHECK (quantity >= 0),
    CONSTRAINT chk_positive_reserved CHECK (reserved_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_no VARCHAR(100) NOT NULL UNIQUE,
    transaction_type VARCHAR(50) NOT NULL, -- PURCHASE_IN, SALE_OUT, PRODUCTION_ISSUE, PRODUCTION_RETURN, etc.
    item_id BIGINT NOT NULL REFERENCES items(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    location_id BIGINT REFERENCES warehouse_locations(id),
    quantity NUMERIC(15, 4) NOT NULL,
    unit_price NUMERIC(15, 4),
    reference_type VARCHAR(50), -- PURCHASE_ORDER, GOODS_RECEIPT, PRODUCTION_ORDER, SALES_ORDER, etc.
    reference_id VARCHAR(100),
    note TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
