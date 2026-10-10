-- ==============================================================================
-- V9__seed_subassembly_bom.sql: Sub-assembly BOM so the valve core is made in-house
-- ==============================================================================

INSERT INTO boms (code, product_id, version, status, effective_from) VALUES
('BOM-HVC02-V1', (SELECT id FROM items WHERE code = 'HYD-VALVE-CORE-02'), '1.0', 'ACTIVE', '2026-01-01')
ON CONFLICT (code) DO NOTHING;

INSERT INTO bom_items (bom_id, material_id, quantity, scrap_rate)
SELECT b.id, m.id, v.quantity, v.scrap_rate
FROM (VALUES
    ('RM-STEEL-304', 0.8000, 3.00),
    ('ALLOY-AL6061-T6', 0.2500, 2.00),
    ('SEAL-RING-NBR50', 2.0000, 1.00)
) AS v(material_code, quantity, scrap_rate)
JOIN boms b ON b.code = 'BOM-HVC02-V1'
JOIN items m ON m.code = v.material_code
WHERE NOT EXISTS (
    SELECT 1 FROM bom_items bi WHERE bi.bom_id = b.id AND bi.material_id = m.id
);
