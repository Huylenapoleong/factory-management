-- ==============================================================================
-- V6__sales.sql: Sales Orders, SO Items, Deliveries & Delivery Items
-- ==============================================================================

CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGSERIAL PRIMARY KEY,
    so_no VARCHAR(100) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, DELIVERED, CANCELLED
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal NUMERIC(15, 4) DEFAULT 0,
    total_amount NUMERIC(15, 4) DEFAULT 0,
    note TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id BIGSERIAL PRIMARY KEY,
    sales_order_id BIGINT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id),
    quantity NUMERIC(15, 4) NOT NULL,
    delivered_quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
    unit_price NUMERIC(15, 4) NOT NULL,
    amount NUMERIC(15, 4) NOT NULL
);

CREATE TABLE IF NOT EXISTS deliveries (
    id BIGSERIAL PRIMARY KEY,
    delivery_no VARCHAR(100) NOT NULL UNIQUE,
    sales_order_id BIGINT REFERENCES sales_orders(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    delivery_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, POSTED, CANCELLED
    note TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_items (
    id BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES items(id),
    location_id BIGINT REFERENCES warehouse_locations(id),
    quantity NUMERIC(15, 4) NOT NULL,
    unit_price NUMERIC(15, 4)
);
