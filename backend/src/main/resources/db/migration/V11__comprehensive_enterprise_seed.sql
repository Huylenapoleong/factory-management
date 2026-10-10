-- ==============================================================================
-- V11__comprehensive_enterprise_seed.sql: Complete Seed Data for All Factory Modules
-- Supplements missing BOMs, Routings, Work Order Operations, Inventory Balances,
-- Pending QC Inbound Receipts, Staged Outbound Deliveries, and Audit Logs.
-- ==============================================================================

-- 1. Additional Master Items (SKUs)
INSERT INTO items (code, name_en, name_zh, type, category_id, unit_id, purchase_price, sale_price, min_stock, status) VALUES
('PLC-MOD-FX5U', 'Mitsubishi PLC Controller FX5U', '三菱PLC控制器FX5U', 'RAW_MATERIAL',
 (SELECT id FROM item_categories WHERE code = 'CAT-PCB'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 320.0000, 480.0000, 15.0000, 'ACTIVE'),

('OPT-SEN-E3Z', 'Omron Optical Beam Sensor', '欧姆龙光电传感器', 'CONSUMABLE',
 (SELECT id FROM item_categories WHERE code = 'CAT-PCB'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 28.5000, 45.0000, 50.0000, 'ACTIVE'),

('AL-BILLET-7075', '7075 Aerospace Aluminum Billet', '7075航空级铝圆棒', 'RAW_MATERIAL',
 (SELECT id FROM item_categories WHERE code = 'CAT-ALLOY'),
 (SELECT id FROM units_of_measurement WHERE code = 'kg'), 26.0000, 38.0000, 600.0000, 'ACTIVE'),

('SA-VALVE-BODY-01', 'Hydraulic Valve Manifold Body', '高压液压阀体总成', 'SEMI_FINISHED',
 (SELECT id FROM item_categories WHERE code = 'CAT-FG'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 85.0000, 160.0000, 80.0000, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 2. Multi-level BOMs for FS-880 and GB-300
INSERT INTO boms (code, product_id, version, status, effective_from) VALUES
('BOM-FS880-V1', (SELECT id FROM items WHERE code = 'FS-880'), '1.0', 'ACTIVE', '2026-01-01'),
('BOM-GB300-V1', (SELECT id FROM items WHERE code = 'GB-300'), '1.0', 'ACTIVE', '2026-01-01')
ON CONFLICT (code) DO NOTHING;

INSERT INTO bom_items (bom_id, material_id, quantity, scrap_rate) VALUES
-- FS-880 Bill of Materials
((SELECT id FROM boms WHERE code = 'BOM-FS880-V1'), (SELECT id FROM items WHERE code = 'RM-STEEL-304'), 1.2000, 2.50),

-- GB-300 Industrial Gearbox Bill of Materials (Multi-level containing subassemblies)
((SELECT id FROM boms WHERE code = 'BOM-GB300-V1'), (SELECT id FROM items WHERE code = 'FS-880'), 2.0000, 1.00),
((SELECT id FROM boms WHERE code = 'BOM-GB300-V1'), (SELECT id FROM items WHERE code = 'FASTENER-M8-30'), 16.0000, 0.50),
((SELECT id FROM boms WHERE code = 'BOM-GB300-V1'), (SELECT id FROM items WHERE code = 'SEAL-RING-NBR50'), 4.0000, 1.00),
((SELECT id FROM boms WHERE code = 'BOM-GB300-V1'), (SELECT id FROM items WHERE code = 'ALLOY-AL6061-T6'), 8.5000, 2.00)
ON CONFLICT DO NOTHING;

-- 3. Production Routings & Steps for FS-880 and GB-300
INSERT INTO routings (code, product_id, version, status) VALUES
('RT-FS880-STD', (SELECT id FROM items WHERE code = 'FS-880'), '1.0', 'ACTIVE'),
('RT-GB300-STD', (SELECT id FROM items WHERE code = 'GB-300'), '1.0', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO routing_steps (routing_id, sequence_no, operation_code, operation_name_en, operation_name_zh, standard_time) VALUES
-- FS-880 Routing Steps
((SELECT id FROM routings WHERE code = 'RT-FS880-STD'), 1, 'OP-10-LATHE', 'CNC Heavy Turning Rough', '数控车削粗加工', 20),
((SELECT id FROM routings WHERE code = 'RT-FS880-STD'), 2, 'OP-20-MILL', '4-Axis Flange Index Milling', '四轴法兰分度铣削', 30),
((SELECT id FROM routings WHERE code = 'RT-FS880-STD'), 3, 'OP-30-DRILL', 'Precision Pitch Bolt Drilling', '节圆螺栓精密钻孔', 15),
((SELECT id FROM routings WHERE code = 'RT-FS880-STD'), 4, 'OP-40-QC', 'Coordinate Measuring Inspection (CMM)', '三坐标全尺寸检测', 10),

-- GB-300 Routing Steps
((SELECT id FROM routings WHERE code = 'RT-GB300-STD'), 1, 'OP-10-MACH', 'Housing CNC Milling', '箱体CNC高精加工', 60),
((SELECT id FROM routings WHERE code = 'RT-GB300-STD'), 2, 'OP-20-GEAR', 'Planetary Gear Train Lapping', '行星齿轮精密研合', 40),
((SELECT id FROM routings WHERE code = 'RT-GB300-STD'), 3, 'OP-30-ASSY', 'Gearbox Cleanroom Assembly', '无尘密封总装', 35),
((SELECT id FROM routings WHERE code = 'RT-GB300-STD'), 4, 'OP-40-TEST', 'Torque & Vibration Dyno Run', '扭矩及振动台测试', 20)
ON CONFLICT DO NOTHING;

-- 4. Update existing Work Orders with BOM and Routing associations
UPDATE production_orders
SET bom_id = (SELECT id FROM boms WHERE code = 'BOM-FS880-V1'),
    routing_id = (SELECT id FROM routings WHERE code = 'RT-FS880-STD')
WHERE mo_no = 'WO-20261001-02' AND bom_id IS NULL;

UPDATE production_orders
SET bom_id = (SELECT id FROM boms WHERE code = 'BOM-GB300-V1'),
    routing_id = (SELECT id FROM routings WHERE code = 'RT-GB300-STD')
WHERE mo_no = 'WO-20261001-03' AND bom_id IS NULL;

-- 5. Additional Work Order (Upcoming Released Order)
INSERT INTO production_orders (mo_no, product_id, bom_id, routing_id, planned_quantity, completed_quantity, scrap_quantity, status, start_date, due_date) VALUES
('WO-20261002-04',
 (SELECT id FROM items WHERE code = 'HV-204'),
 (SELECT id FROM boms WHERE code = 'BOM-HV204-V2'),
 (SELECT id FROM routings WHERE code = 'RT-HV204-STD'),
 300.0000, 0.0000, 0.0000, 'RELEASED', '2026-10-02', '2026-10-04')
ON CONFLICT (mo_no) DO NOTHING;

-- 6. Production Materials for WO-20261001-02 and WO-20261001-03
INSERT INTO production_materials (production_order_id, material_id, required_quantity, issued_quantity) VALUES
-- WO-20261001-02 (FS-880, planned 1200 pcs)
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-02'), (SELECT id FROM items WHERE code = 'RM-STEEL-304'), 1440.0000, 1440.0000),

-- WO-20261001-03 (GB-300, planned 250 pcs, completed)
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), (SELECT id FROM items WHERE code = 'FS-880'), 500.0000, 500.0000),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), (SELECT id FROM items WHERE code = 'FASTENER-M8-30'), 4000.0000, 4000.0000),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), (SELECT id FROM items WHERE code = 'SEAL-RING-NBR50'), 1000.0000, 1000.0000),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), (SELECT id FROM items WHERE code = 'ALLOY-AL6061-T6'), 2125.0000, 2125.0000)
ON CONFLICT DO NOTHING;

-- 7. Production Operations for WO-20261001-02 and WO-20261001-03
INSERT INTO production_operations (production_order_id, sequence_no, operation_code, operation_name_en, operation_name_zh, target_quantity, completed_quantity, scrap_quantity, status) VALUES
-- Operations for WO-20261001-02 (FS-880: 1200 planned, 840 completed)
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-02'), 1, 'OP-10-LATHE', 'CNC Heavy Turning Rough', '数控车削粗加工', 1200.0000, 1200.0000, 4.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-02'), 2, 'OP-20-MILL', '4-Axis Flange Index Milling', '四轴法兰分度铣削', 1196.0000, 1196.0000, 2.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-02'), 3, 'OP-30-DRILL', 'Precision Pitch Bolt Drilling', '节圆螺栓精密钻孔', 1194.0000, 840.0000, 2.0000, 'IN_PROGRESS'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-02'), 4, 'OP-40-QC', 'Coordinate Measuring Inspection (CMM)', '三坐标全尺寸检测', 840.0000, 0.0000, 0.0000, 'PENDING'),

-- Operations for WO-20261001-03 (GB-300: 250 planned, completed)
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), 1, 'OP-10-MACH', 'Housing CNC Milling', '箱体CNC高精加工', 250.0000, 250.0000, 0.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), 2, 'OP-20-GEAR', 'Planetary Gear Train Lapping', '行星齿轮精密研合', 250.0000, 250.0000, 0.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), 3, 'OP-30-ASSY', 'Gearbox Cleanroom Assembly', '无尘密封总装', 250.0000, 250.0000, 0.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-03'), 4, 'OP-40-TEST', 'Torque & Vibration Dyno Run', '扭矩及振动台测试', 250.0000, 250.0000, 0.0000, 'COMPLETED')
ON CONFLICT DO NOTHING;

-- 8. Comprehensive Warehouse Balances across all items
INSERT INTO inventory_balances (warehouse_id, location_id, item_id, quantity, reserved_quantity, version) VALUES
-- Finished Goods in WH-03
((SELECT id FROM warehouses WHERE code = 'WH-03'),
 (SELECT id FROM warehouse_locations WHERE code = 'FG-DOCK-01'),
 (SELECT id FROM items WHERE code = 'HV-204'),
 180.0000, 40.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-03'),
 (SELECT id FROM warehouse_locations WHERE code = 'FG-DOCK-01'),
 (SELECT id FROM items WHERE code = 'GB-300'),
 45.0000, 10.0000, 0),

-- WIP in WH-02
((SELECT id FROM warehouses WHERE code = 'WH-02'),
 (SELECT id FROM warehouse_locations WHERE code = 'LINE-A-STAGING'),
 (SELECT id FROM items WHERE code = 'FS-880'),
 420.0000, 60.0000, 0),

-- Raw Materials & Consumables in WH-01
-- SENS-LASER-DIST-01: 12 pcs with minStock = 30 -> Demonstrates real low stock deficit alert
((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'C-04-01'),
 (SELECT id FROM items WHERE code = 'SENS-LASER-DIST-01'),
 12.0000, 0.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'A-01-08'),
 (SELECT id FROM items WHERE code = 'PLC-MOD-FX5U'),
 25.0000, 5.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'C-04-01'),
 (SELECT id FROM items WHERE code = 'OPT-SEN-E3Z'),
 90.0000, 10.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'A-01-08'),
 (SELECT id FROM items WHERE code = 'AL-BILLET-7075'),
 1450.0000, 200.0000, 0)
ON CONFLICT (warehouse_id, location_id, item_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  reserved_quantity = EXCLUDED.reserved_quantity;

-- 9. Additional Purchase Order & Pending Goods Receipt for Inbound QC Testing
INSERT INTO purchase_orders (po_no, supplier_id, order_date, expected_date, status, currency, subtotal, total_amount, note) VALUES
('PO-202610-08845',
 (SELECT id FROM suppliers WHERE code = 'SUP-005'),
 '2026-09-30', '2026-10-15', 'CONFIRMED', 'USD', 10100.0000, 10100.0000, 'Optical distance sensors replenishment for automated CNC feedback')
ON CONFLICT (po_no) DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, received_quantity, unit_price, amount) VALUES
((SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08845'),
 (SELECT id FROM items WHERE code = 'SENS-LASER-DIST-01'),
 50.0000, 0.0000, 145.0000, 7250.0000),

((SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08845'),
 (SELECT id FROM items WHERE code = 'OPT-SEN-E3Z'),
 100.0000, 0.0000, 28.5000, 2850.0000)
ON CONFLICT DO NOTHING;

-- Pending Goods Receipt (Awaiting Inbound QC Inspection)
INSERT INTO goods_receipts (receipt_no, purchase_order_id, warehouse_id, receipt_date, status, note) VALUES
('GRN-20261026-031',
 (SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08845'),
 (SELECT id FROM warehouses WHERE code = 'WH-04'),
 '2026-10-02', 'DRAFT', 'Dock Receiving Bay 01 - Awaiting Inbound QC sampling and electrical bench tests')
ON CONFLICT (receipt_no) DO NOTHING;

INSERT INTO goods_receipt_items (goods_receipt_id, item_id, location_id, quantity, unit_price) VALUES
((SELECT id FROM goods_receipts WHERE receipt_no = 'GRN-20261026-031'),
 (SELECT id FROM items WHERE code = 'SENS-LASER-DIST-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'QC-HOLD-01'),
 50.0000, 145.0000),

((SELECT id FROM goods_receipts WHERE receipt_no = 'GRN-20261026-031'),
 (SELECT id FROM items WHERE code = 'OPT-SEN-E3Z'),
 (SELECT id FROM warehouse_locations WHERE code = 'QC-HOLD-01'),
 100.0000, 28.5000)
ON CONFLICT DO NOTHING;

-- 10. Additional Sales Order & Staged Outbound Delivery for Dock Dispatch Testing
INSERT INTO sales_orders (so_no, customer_id, order_date, expected_delivery_date, status, currency, subtotal, total_amount, note) VALUES
('SO-202610-0955',
 (SELECT id FROM customers WHERE code = 'CUST-003'),
 '2026-09-28', '2026-10-12', 'CONFIRMED', 'USD', 69650.0000, 69650.0000, 'Siemens Energy Munich - Precision Valves and Gearboxes Batch')
ON CONFLICT (so_no) DO NOTHING;

INSERT INTO sales_order_items (sales_order_id, item_id, quantity, delivered_quantity, unit_price, amount) VALUES
((SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0955'),
 (SELECT id FROM items WHERE code = 'HV-204'),
 80.0000, 0.0000, 480.0000, 38400.0000),

((SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0955'),
 (SELECT id FROM items WHERE code = 'GB-300'),
 25.0000, 0.0000, 1250.0000, 31250.0000)
ON CONFLICT DO NOTHING;

-- Staged Outbound Delivery (Awaiting Loading Dock Carrier Pickup)
INSERT INTO deliveries (delivery_no, sales_order_id, warehouse_id, delivery_date, status, note) VALUES
('DO-20261026-02',
 (SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0938'),
 (SELECT id FROM warehouses WHERE code = 'WH-03'),
 '2026-10-02', 'DRAFT', 'Staged on Outbound Loading Bay 01 - Scheduled for BYD Xi''an Logistics freight truck')
ON CONFLICT (delivery_no) DO NOTHING;

INSERT INTO delivery_items (delivery_id, item_id, location_id, quantity, unit_price) VALUES
((SELECT id FROM deliveries WHERE delivery_no = 'DO-20261026-02'),
 (SELECT id FROM items WHERE code = 'FS-880'),
 (SELECT id FROM warehouse_locations WHERE code = 'FG-DOCK-01'),
 250.0000, 120.0000)
ON CONFLICT DO NOTHING;

-- 11. Realistic System Audit Trail Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, created_at) VALUES
((SELECT id FROM users WHERE username = 'admin'), 'USER_LOGIN', 'AUTH', 'admin', '192.168.1.10', CURRENT_TIMESTAMP - INTERVAL '4 hour'),
((SELECT id FROM users WHERE username = 'director_zhang'), 'PO_APPROVE', 'PURCHASE_ORDER', 'PO-202610-08812', '192.168.1.15', CURRENT_TIMESTAMP - INTERVAL '3 hour'),
((SELECT id FROM users WHERE username = 'dispatcher_wang'), 'WORK_ORDER_RELEASE', 'PRODUCTION_ORDER', 'WO-20261001-01', '192.168.1.22', CURRENT_TIMESTAMP - INTERVAL '2 hour'),
((SELECT id FROM users WHERE username = 'qc_qian'), 'QC_INSPECTION_PASS', 'GOODS_RECEIPT', 'GRN-20261024-019', '192.168.1.30', CURRENT_TIMESTAMP - INTERVAL '90 minute'),
((SELECT id FROM users WHERE username = 'clerk_liu'), 'INVENTORY_STOCKTAKE', 'INVENTORY_BALANCE', 'RM-STEEL-304', '192.168.1.18', CURRENT_TIMESTAMP - INTERVAL '45 minute'),
((SELECT id FROM users WHERE username = 'clerk_liu'), 'DELIVERY_DISPATCH', 'DELIVERY', 'DO-20261025-01', '192.168.1.18', CURRENT_TIMESTAMP - INTERVAL '20 minute')
ON CONFLICT DO NOTHING;

-- 12. Enterprise White-label Settings Alignment
UPDATE system_settings SET value = 'WIFIM Precision Manufacturing Co., Ltd.' WHERE key = 'company_name';
UPDATE system_settings SET value = 'WIFIM MES Enterprise Suite' WHERE key = 'application_name';

-- 13. Dedicated User Accounts for PURCHASING, SALES, and VIEWER roles (passwords: admin123)
INSERT INTO users (username, password_hash, full_name, email, phone, status) VALUES
('purchaser_chen', '$2a$10$yWbbZRBNu1b/L3G1b7MqiORx/vHap/s6xNz9ioZP9rdN45zv/p4se', 'Procurement Specialist Chen (陈采购)', 'chen.procurement@wifim-factory.com', '+86-13800000007', 'ACTIVE'),
('sales_zhao', '$2a$10$yWbbZRBNu1b/L3G1b7MqiORx/vHap/s6xNz9ioZP9rdN45zv/p4se', 'Sales Account Exec Zhao (赵销售)', 'zhao.sales@wifim-factory.com', '+86-13800000008', 'ACTIVE'),
('viewer_lin', '$2a$10$yWbbZRBNu1b/L3G1b7MqiORx/vHap/s6xNz9ioZP9rdN45zv/p4se', 'Auditor & Observer Lin (林审计)', 'lin.audit@wifim-factory.com', '+86-13800000009', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE username = 'purchaser_chen'), (SELECT id FROM roles WHERE name = 'PURCHASING')),
((SELECT id FROM users WHERE username = 'sales_zhao'), (SELECT id FROM roles WHERE name = 'SALES')),
((SELECT id FROM users WHERE username = 'viewer_lin'), (SELECT id FROM roles WHERE name = 'VIEWER'))
ON CONFLICT DO NOTHING;
