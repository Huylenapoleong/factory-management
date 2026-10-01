-- ==============================================================================
-- V4__purchasing.sql: Purchase Orders, Goods Receipts, Price History
-- ==============================================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    po_no VARCHAR(100) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    order_date DATE NOT NULL,
    expected_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, PARTIAL_RECEIVED, RECEIVED, CANCELLED
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal NUMERIC(15, 4) DEFAULT 0,
    total_amount NUMERIC(15, 4) DEFAULT 0,
    note TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id),
    quantity NUMERIC(15, 4) NOT NULL,
    received_quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
    unit_price NUMERIC(15, 4) NOT NULL,
    amount NUMERIC(15, 4) NOT NULL
);

CREATE TABLE IF NOT EXISTS goods_receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_no VARCHAR(100) NOT NULL UNIQUE,
    purchase_order_id BIGINT REFERENCES purchase_orders(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    receipt_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, POSTED, CANCELLED
    note TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id BIGSERIAL PRIMARY KEY,
    goods_receipt_id BIGINT NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id),
    location_id BIGINT REFERENCES warehouse_locations(id),
    quantity NUMERIC(15, 4) NOT NULL,
    unit_price NUMERIC(15, 4)
);

CREATE TABLE IF NOT EXISTS item_price_history (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id),
    price_type VARCHAR(20) NOT NULL, -- PURCHASE, SALE
    supplier_id BIGINT REFERENCES suppliers(id),
    customer_id BIGINT REFERENCES customers(id),
    price NUMERIC(15, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
