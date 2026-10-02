-- ==============================================================================
-- V10__item_images.sql: One display image per item (product photo or drawing)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS item_images (
    item_id BIGINT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    size_bytes INT NOT NULL,
    data BYTEA NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
