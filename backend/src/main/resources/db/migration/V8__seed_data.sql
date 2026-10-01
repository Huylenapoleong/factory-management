-- ==============================================================================
-- V8__seed_data.sql: Comprehensive Seed Data for All Industrial Modules
-- ==============================================================================

-- 1. Item Categories
INSERT INTO item_categories (code, name_en, name_zh, description) VALUES
('CAT-ALLOY', 'Special Alloys', '特种合金', 'High-grade stainless steel and aerospace aluminum alloys'),
('CAT-ELEC', 'Electrical & Servo', '电气伺服', 'AC servo motors, encoders, and industrial drives'),
('CAT-SEAL', 'Seals & Gaskets', '密封件', 'NBR, Viton, and hydraulic sealing rings'),
('CAT-FAST', 'Standard Fasteners', '紧固件', 'High-tensile bolts, nuts, and precision hardware'),
('CAT-HYD', 'Hydraulic Components', '液压件', 'Precision valves, manifolds, and fluid power modules'),
('CAT-PCB', 'Control Circuits & Sensors', '控制电路', 'Industrial controllers, PLCs, and optical sensors'),
('CAT-FG', 'Finished Assemblies', '成品总成', 'Complete factory machinery and precision mechanical assemblies')
ON CONFLICT (code) DO NOTHING;

-- 2. Units of Measurement
INSERT INTO units_of_measurement (code, name_en, name_zh) VALUES
('kg', 'Kilogram', '千克'),
('pcs', 'Piece', '件'),
('m', 'Meter', '米'),
('set', 'Set', '套'),
('unit', 'Unit', '台')
ON CONFLICT (code) DO NOTHING;

-- 3. Master Items (SKUs)
INSERT INTO items (code, name_en, name_zh, type, category_id, unit_id, purchase_price, sale_price, min_stock, status) VALUES
('RM-STEEL-304', '304 Stainless Steel Round Bar', '304不锈钢棒材', 'RAW_MATERIAL',
 (SELECT id FROM item_categories WHERE code = 'CAT-ALLOY'),
 (SELECT id FROM units_of_measurement WHERE code = 'kg'), 18.5000, 24.0000, 800.0000, 'ACTIVE'),

('ELEC-MOTOR-750W', 'AC Servo Motor 750W', '交流伺服电机', 'RAW_MATERIAL',
 (SELECT id FROM item_categories WHERE code = 'CAT-ELEC'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 340.0000, 450.0000, 20.0000, 'ACTIVE'),

('SEAL-RING-NBR50', 'NBR O-Ring Seal', '丁腈O型密封圈', 'CONSUMABLE',
 (SELECT id FROM item_categories WHERE code = 'CAT-SEAL'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 1.2000, 2.5000, 200.0000, 'ACTIVE'),

('FASTENER-M8-30', 'High-Tensile Hex Bolt', '高强内六角螺栓', 'CONSUMABLE',
 (SELECT id FROM item_categories WHERE code = 'CAT-FAST'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 0.1500, 0.3500, 5000.0000, 'ACTIVE'),

('ALLOY-AL6061-T6', 'Aerospace Aluminum Plate', '航空铝板', 'RAW_MATERIAL',
 (SELECT id FROM item_categories WHERE code = 'CAT-ALLOY'),
 (SELECT id FROM units_of_measurement WHERE code = 'kg'), 32.0000, 48.0000, 500.0000, 'ACTIVE'),

('HYD-VALVE-CORE-02', 'Precision Valve Core', '精密液压阀芯', 'SEMI_FINISHED',
 (SELECT id FROM item_categories WHERE code = 'CAT-HYD'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 65.0000, 110.0000, 100.0000, 'ACTIVE'),

('HV-204', 'Precision Hydraulic Valve V2', '精密液压阀', 'FINISHED_GOOD',
 (SELECT id FROM item_categories WHERE code = 'CAT-FG'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 260.0000, 480.0000, 50.0000, 'ACTIVE'),

('FS-880', 'CNC Flange Shaft 45#', 'CNC法兰轴', 'SEMI_FINISHED',
 (SELECT id FROM item_categories WHERE code = 'CAT-ALLOY'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 45.0000, 120.0000, 100.0000, 'ACTIVE'),

('GB-300', 'Industrial Gearbox C3', '工业减速箱', 'FINISHED_GOOD',
 (SELECT id FROM item_categories WHERE code = 'CAT-FG'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 680.0000, 1250.0000, 20.0000, 'ACTIVE'),

('SENS-LASER-DIST-01', 'Laser Distance Sensor', '激光测距传感器', 'RAW_MATERIAL',
 (SELECT id FROM item_categories WHERE code = 'CAT-PCB'),
 (SELECT id FROM units_of_measurement WHERE code = 'pcs'), 145.0000, 210.0000, 30.0000, 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 4. Warehouses
INSERT INTO warehouses (code, name_en, name_zh, type, address, status) VALUES
('WH-01', 'Raw Materials Warehouse', '原材料一号库', 'RAW_MATERIAL', 'Building A, Zone 1, Industrial Park', 'ACTIVE'),
('WH-02', 'WIP Workshop Warehouse', '车间在制品库', 'WIP', 'Shop Floor Line A/B Intermediate Staging', 'ACTIVE'),
('WH-03', 'Finished Goods Warehouse', '成品仓', 'FINISHED_GOOD', 'Building C, Logistics Dock Gate 3', 'ACTIVE'),
('WH-04', 'Quarantine & Inspection Bay', '待检隔离仓', 'GENERAL', 'Inbound Inspection Receiving Bay 01', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 5. Warehouse Locations
INSERT INTO warehouse_locations (warehouse_id, code, name, status) VALUES
((SELECT id FROM warehouses WHERE code = 'WH-01'), 'A-03-02', 'Raw Steel Rack A-03-02', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-01'), 'C-04-01', 'Seals & Gaskets Bin C-04-01', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-01'), 'D-02-05', 'Fastener Storage D-02-05', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-01'), 'A-01-08', 'Heavy Alloy Pallet A-01-08', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-02'), 'B-01-04', 'WIP Motor Staging B-01-04', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-02'), 'LINE-A-STAGING', 'CNC Line A Input Staging', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-03'), 'E-02-11', 'Finished Valve Core Rack E-02-11', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-03'), 'FG-DOCK-01', 'Outbound Shipping Dock 01', 'ACTIVE'),
((SELECT id FROM warehouses WHERE code = 'WH-04'), 'QC-HOLD-01', 'Inbound Receiving Inspection Bay', 'ACTIVE')
ON CONFLICT (warehouse_id, code) DO NOTHING;

-- 6. Suppliers
INSERT INTO suppliers (code, name, name_zh, tax_code, phone, email, address, contact_person, currency, payment_term, status) VALUES
('SUP-001', 'Baosteel Precision Steel Ltd', '宝武特钢股份有限公司', '9131000013220456X', '+86-138-8812-4081', 'zhangwei@baosteel.com', 'Baoshan District, Shanghai', 'Zhang Wei (张伟)', 'USD', 'Net 60 Days', 'ACTIVE'),
('SUP-002', 'Shenzhen Inovance Servo Tech', '汇川精密伺服技术', '9144030074889211A', '+86-0755-9201-3829', 'liming@inovance.com', 'Nanshan District, Shenzhen', 'Li Ming (李明)', 'USD', 'TT 30% Advance', 'ACTIVE'),
('SUP-003', 'Parker Hannifin Hydraulics', '派克汉尼汾流体传动', '9132050060822194K', '+1 216-896-3000', 'jdoe@parker.com', 'Cleveland, OH, USA', 'John Doe', 'USD', 'LC at Sight', 'ACTIVE'),
('SUP-004', 'Dongguan Standard Fasteners', '东莞五金紧固件实业', '9144190076491203M', '+86-137-5120-0022', 'chenqiang@dgfastener.com', 'Chang’an Town, Dongguan', 'Chen Qiang (陈强)', 'USD', 'Net 30 Days', 'ACTIVE'),
('SUP-005', 'Omron Industrial Automation', '欧姆龙工业自动化', '9131011560728491Y', '+81 3-3436-7170', 'sato@omron.com', 'Kyoto, Japan', 'Kenji Sato', 'USD', 'Net 45 Days', 'ACTIVE'),
('SUP-006', 'Festo Pneumatic Systems', '费斯托气动系统', '9131000060721183T', '+49 711 3470', 'kweber@festo.com', 'Esslingen, Germany', 'Klaus Weber', 'USD', 'Net 30 Days', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 7. Customers
INSERT INTO customers (code, name, name_zh, tax_code, phone, email, address, contact_person, currency, payment_term, status) VALUES
('CUST-001', 'Tesla Energy Gigafactory', '特斯拉能源超级工厂', '91310000MA1FL4495J', '+86-21-67890001', 'supply@tesla-energy.cn', 'Lingang Special Area, Shanghai', 'Elon Zhang', 'USD', 'T/T 60 Days', 'ACTIVE'),
('CUST-002', 'BYD Auto Xi''an Plant', '比亚迪汽车西安总装基地', '91610131750268449D', '+86-29-88889999', 'procurement@byd.com', 'Hi-tech Zone, Xi''an', 'Manager Wang', 'USD', 'L/C at Sight', 'ACTIVE'),
('CUST-003', 'Siemens Energy AG', '西门子能源系统', 'DE129274202', '+49 89 63600', 'hans.mueller@siemens-energy.com', 'Munich, Germany', 'Hans Mueller', 'USD', 'Net 45 Days', 'ACTIVE'),
('CUST-004', 'Foxconn Precision Industry', '富士康精密制造', '9144030061882001A', '+86-755-28129588', 'foxconn.proc@foxconn.com', 'Longhua Science Park, Shenzhen', 'Terry Guo', 'USD', 'Net 30 Days', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- 8. Inventory Balances (available_quantity is computed automatically)
INSERT INTO inventory_balances (warehouse_id, location_id, item_id, quantity, reserved_quantity, version) VALUES
((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'A-03-02'),
 (SELECT id FROM items WHERE code = 'RM-STEEL-304'),
 2450.0000, 600.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-02'),
 (SELECT id FROM warehouse_locations WHERE code = 'B-01-04'),
 (SELECT id FROM items WHERE code = 'ELEC-MOTOR-750W'),
 8.0000, 6.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'C-04-01'),
 (SELECT id FROM items WHERE code = 'SEAL-RING-NBR50'),
 120.0000, 50.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'D-02-05'),
 (SELECT id FROM items WHERE code = 'FASTENER-M8-30'),
 19400.0000, 4200.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'A-01-08'),
 (SELECT id FROM items WHERE code = 'ALLOY-AL6061-T6'),
 1850.0000, 750.0000, 0),

((SELECT id FROM warehouses WHERE code = 'WH-03'),
 (SELECT id FROM warehouse_locations WHERE code = 'E-02-11'),
 (SELECT id FROM items WHERE code = 'HYD-VALVE-CORE-02'),
 350.0000, 70.0000, 0)
ON CONFLICT (warehouse_id, location_id, item_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  reserved_quantity = EXCLUDED.reserved_quantity;

-- 9. Stock Transactions
INSERT INTO stock_transactions (transaction_no, transaction_type, item_id, warehouse_id, location_id, quantity, unit_price, reference_type, reference_id, note) VALUES
('TX-20261001-001', 'INVENTORY_ADJUSTMENT',
 (SELECT id FROM items WHERE code = 'RM-STEEL-304'),
 (SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'A-03-02'),
 2450.0000, 18.5000, 'STOCKTAKE', 'AUDIT-2026Q4', 'Q4 Initial Stock Take - 304 Round Bar Lot 26Q4-LOT08'),

('TX-20261001-002', 'PURCHASE_IN',
 (SELECT id FROM items WHERE code = 'ELEC-MOTOR-750W'),
 (SELECT id FROM warehouses WHERE code = 'WH-02'),
 (SELECT id FROM warehouse_locations WHERE code = 'B-01-04'),
 8.0000, 340.0000, 'GOODS_RECEIPT', 'GRN-20261024-019', 'Received from Inovance via Bay 02'),

('TX-20261001-003', 'INVENTORY_ADJUSTMENT',
 (SELECT id FROM items WHERE code = 'FASTENER-M8-30'),
 (SELECT id FROM warehouses WHERE code = 'WH-01'),
 (SELECT id FROM warehouse_locations WHERE code = 'D-02-05'),
 19400.0000, 0.1500, 'STOCKTAKE', 'AUDIT-2026Q4', 'Batch Fasteners Lot 26H2-FAST01')
ON CONFLICT (transaction_no) DO NOTHING;

-- 10. Purchase Orders & Items
INSERT INTO purchase_orders (po_no, supplier_id, order_date, expected_date, status, currency, subtotal, total_amount, note) VALUES
('PO-202610-08812', (SELECT id FROM suppliers WHERE code = 'SUP-001'), '2026-09-24', '2026-10-01', 'CONFIRMED', 'USD', 92500.0000, 92500.0000, 'Urgent raw steel replenishment for Q4 production lines'),
('PO-202610-08819', (SELECT id FROM suppliers WHERE code = 'SUP-002'), '2026-09-28', '2026-10-03', 'CONFIRMED', 'USD', 13600.0000, 13600.0000, 'Servo motors for automated assembly workstations'),
('PO-202610-08831', (SELECT id FROM suppliers WHERE code = 'SUP-004'), '2026-09-20', '2026-09-30', 'CONFIRMED', 'USD', 9750.0000, 9750.0000, 'Standard fasteners high tensile bulk order')
ON CONFLICT (po_no) DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, received_quantity, unit_price, amount) VALUES
((SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08812'), (SELECT id FROM items WHERE code = 'RM-STEEL-304'), 5000.0000, 2450.0000, 18.5000, 92500.0000),
((SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08819'), (SELECT id FROM items WHERE code = 'ELEC-MOTOR-750W'), 40.0000, 40.0000, 340.0000, 13600.0000),
((SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08831'), (SELECT id FROM items WHERE code = 'FASTENER-M8-30'), 65000.0000, 19400.0000, 0.1500, 9750.0000)
ON CONFLICT DO NOTHING;

-- 11. Goods Receipts & Items
INSERT INTO goods_receipts (receipt_no, purchase_order_id, warehouse_id, receipt_date, status, note) VALUES
('GRN-20261024-019',
 (SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08819'),
 (SELECT id FROM warehouses WHERE code = 'WH-02'),
 '2026-10-01', 'POSTED', 'Zero dimensional flaw. Verified Pass 100%. Ready to post to stock.'),

('GRN-20261024-022',
 (SELECT id FROM purchase_orders WHERE po_no = 'PO-202610-08831'),
 (SELECT id FROM warehouses WHERE code = 'WH-01'),
 '2026-10-01', 'POSTED', 'Batch inspection complete. Fasteners Lot 26H2-FAST01 accepted.')
ON CONFLICT (receipt_no) DO NOTHING;

INSERT INTO goods_receipt_items (goods_receipt_id, item_id, location_id, quantity, unit_price) VALUES
((SELECT id FROM goods_receipts WHERE receipt_no = 'GRN-20261024-019'),
 (SELECT id FROM items WHERE code = 'ELEC-MOTOR-750W'),
 (SELECT id FROM warehouse_locations WHERE code = 'B-01-04'),
 40.0000, 340.0000),

((SELECT id FROM goods_receipts WHERE receipt_no = 'GRN-20261024-022'),
 (SELECT id FROM items WHERE code = 'FASTENER-M8-30'),
 (SELECT id FROM warehouse_locations WHERE code = 'D-02-05'),
 5000.0000, 0.1500)
ON CONFLICT DO NOTHING;

-- 12. Bill of Materials (BOM)
INSERT INTO boms (code, product_id, version, status, effective_from) VALUES
('BOM-HV204-V2', (SELECT id FROM items WHERE code = 'HV-204'), '2.0', 'ACTIVE', '2026-01-01')
ON CONFLICT (code) DO NOTHING;

INSERT INTO bom_items (bom_id, material_id, quantity, scrap_rate) VALUES
((SELECT id FROM boms WHERE code = 'BOM-HV204-V2'), (SELECT id FROM items WHERE code = 'RM-STEEL-304'), 3.5000, 2.00),
((SELECT id FROM boms WHERE code = 'BOM-HV204-V2'), (SELECT id FROM items WHERE code = 'SEAL-RING-NBR50'), 2.0000, 1.00),
((SELECT id FROM boms WHERE code = 'BOM-HV204-V2'), (SELECT id FROM items WHERE code = 'FASTENER-M8-30'), 4.0000, 0.50),
((SELECT id FROM boms WHERE code = 'BOM-HV204-V2'), (SELECT id FROM items WHERE code = 'HYD-VALVE-CORE-02'), 1.0000, 1.00)
ON CONFLICT DO NOTHING;

-- 13. Production Routings & Steps
INSERT INTO routings (code, product_id, version, status) VALUES
('RT-HV204-STD', (SELECT id FROM items WHERE code = 'HV-204'), '1.0', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO routing_steps (routing_id, sequence_no, operation_code, operation_name_en, operation_name_zh, standard_time) VALUES
((SELECT id FROM routings WHERE code = 'RT-HV204-STD'), 1, 'OP-10-CUT', 'CNC Rough Turning', '数控粗车下料', 25),
((SELECT id FROM routings WHERE code = 'RT-HV204-STD'), 2, 'OP-20-MILL', '5-Axis Precision Milling', '五轴精密铣削', 45),
((SELECT id FROM routings WHERE code = 'RT-HV204-STD'), 3, 'OP-30-GRIND', 'Cylindrical Fine Grinding', '外圆精磨抛光', 30),
((SELECT id FROM routings WHERE code = 'RT-HV204-STD'), 4, 'OP-40-ASSY', 'Valve Core Assembly', '阀芯精密组装', 20),
((SELECT id FROM routings WHERE code = 'RT-HV204-STD'), 5, 'OP-50-TEST', 'Hydraulic Pressure Testing', '高压气密检测', 15)
ON CONFLICT DO NOTHING;

-- 14. Work Orders (Production Orders)
INSERT INTO production_orders (mo_no, product_id, bom_id, routing_id, planned_quantity, completed_quantity, scrap_quantity, status, start_date, due_date) VALUES
('WO-20261001-01',
 (SELECT id FROM items WHERE code = 'HV-204'),
 (SELECT id FROM boms WHERE code = 'BOM-HV204-V2'),
 (SELECT id FROM routings WHERE code = 'RT-HV204-STD'),
 500.0000, 465.0000, 4.0000, 'IN_PROGRESS', '2026-10-01', '2026-10-02'),

('WO-20261001-02',
 (SELECT id FROM items WHERE code = 'FS-880'),
 NULL, NULL,
 1200.0000, 840.0000, 8.0000, 'IN_PROGRESS', '2026-10-01', '2026-10-03'),

('WO-20261001-03',
 (SELECT id FROM items WHERE code = 'GB-300'),
 NULL, NULL,
 250.0000, 250.0000, 0.0000, 'COMPLETED', '2026-09-30', '2026-10-02')
ON CONFLICT (mo_no) DO NOTHING;

-- 15. Production Materials for WO-20261001-01
INSERT INTO production_materials (production_order_id, material_id, required_quantity, issued_quantity) VALUES
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), (SELECT id FROM items WHERE code = 'RM-STEEL-304'), 1750.0000, 1750.0000),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), (SELECT id FROM items WHERE code = 'SEAL-RING-NBR50'), 1000.0000, 1000.0000),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), (SELECT id FROM items WHERE code = 'FASTENER-M8-30'), 2000.0000, 2000.0000),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), (SELECT id FROM items WHERE code = 'HYD-VALVE-CORE-02'), 500.0000, 500.0000)
ON CONFLICT DO NOTHING;

-- 16. Production Operations for WO-20261001-01
INSERT INTO production_operations (production_order_id, sequence_no, operation_code, operation_name_en, operation_name_zh, target_quantity, completed_quantity, scrap_quantity, status) VALUES
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), 1, 'OP-10-CUT', 'CNC Rough Turning', '数控粗车下料', 500.0000, 500.0000, 2.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), 2, 'OP-20-MILL', '5-Axis Precision Milling', '五轴精密铣削', 498.0000, 498.0000, 1.0000, 'COMPLETED'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), 3, 'OP-30-GRIND', 'Cylindrical Fine Grinding', '外圆精磨抛光', 497.0000, 465.0000, 1.0000, 'IN_PROGRESS'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), 4, 'OP-40-ASSY', 'Valve Core Assembly', '阀芯精密组装', 465.0000, 0.0000, 0.0000, 'PENDING'),
((SELECT id FROM production_orders WHERE mo_no = 'WO-20261001-01'), 5, 'OP-50-TEST', 'Hydraulic Pressure Testing', '高压气密检测', 465.0000, 0.0000, 0.0000, 'PENDING')
ON CONFLICT DO NOTHING;

-- 17. Sales Orders & Items
INSERT INTO sales_orders (so_no, customer_id, order_date, expected_delivery_date, status, currency, subtotal, total_amount, note) VALUES
('SO-202610-0941', (SELECT id FROM customers WHERE code = 'CUST-001'), '2026-09-18', '2026-10-01', 'CONFIRMED', 'USD', 348000.0000, 348000.0000, 'Tesla Energy Gigafactory - Urgent Q4 Supply Agreement'),
('SO-202610-0938', (SELECT id FROM customers WHERE code = 'CUST-002'), '2026-09-22', '2026-10-05', 'CONFIRMED', 'USD', 78500.0000, 78500.0000, 'BYD Auto Xi''an Plant - Tier-1 Transmission Shafts')
ON CONFLICT (so_no) DO NOTHING;

INSERT INTO sales_order_items (sales_order_id, item_id, quantity, delivered_quantity, unit_price, amount) VALUES
((SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0941'), (SELECT id FROM items WHERE code = 'HV-204'), 120.0000, 100.0000, 480.0000, 57600.0000),
((SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0941'), (SELECT id FROM items WHERE code = 'GB-300'), 200.0000, 180.0000, 1250.0000, 250000.0000),
((SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0938'), (SELECT id FROM items WHERE code = 'FS-880'), 650.0000, 400.0000, 120.0000, 78000.0000)
ON CONFLICT DO NOTHING;

-- 18. Outbound Deliveries & Items
INSERT INTO deliveries (delivery_no, sales_order_id, warehouse_id, delivery_date, status, note) VALUES
('DO-20261025-01',
 (SELECT id FROM sales_orders WHERE so_no = 'SO-202610-0941'),
 (SELECT id FROM warehouses WHERE code = 'WH-03'),
 '2026-10-01', 'POSTED', 'Outbound dispatch to Tesla Energy via Shipping Dock 01.')
ON CONFLICT (delivery_no) DO NOTHING;

INSERT INTO delivery_items (delivery_id, item_id, location_id, quantity, unit_price) VALUES
((SELECT id FROM deliveries WHERE delivery_no = 'DO-20261025-01'),
 (SELECT id FROM items WHERE code = 'HV-204'),
 (SELECT id FROM warehouse_locations WHERE code = 'FG-DOCK-01'),
 100.0000, 480.0000),

((SELECT id FROM deliveries WHERE delivery_no = 'DO-20261025-01'),
 (SELECT id FROM items WHERE code = 'GB-300'),
 (SELECT id FROM warehouse_locations WHERE code = 'FG-DOCK-01'),
 180.0000, 1250.0000)
ON CONFLICT DO NOTHING;

-- 19. Initial System Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'ADMIN role'),
('MANAGER', 'MANAGER role'),
('WAREHOUSE', 'WAREHOUSE role'),
('PURCHASING', 'PURCHASING role'),
('PRODUCTION', 'PRODUCTION role'),
('SALES', 'SALES role'),
('VIEWER', 'VIEWER role')
ON CONFLICT (name) DO NOTHING;

-- 20. Initial System Users (passwords: admin123, operator123, zhang123, wang123, liu123, qian123)
INSERT INTO users (username, password_hash, full_name, email, phone, status) VALUES
('admin', '$2a$10$yWbbZRBNu1b/L3G1b7MqiORx/vHap/s6xNz9ioZP9rdN45zv/p4se', 'System Administrator (系统管理员)', 'admin@wifim-factory.com', '+86-13800000001', 'ACTIVE'),
('operator', '$2a$10$HHmt3IjR9iG76sfPeb2NNOM4FZKaX4/Yo0cdLowjhYkJw.gfgfeUW', 'Shop Floor Operator (车间操作员)', 'operator@wifim-factory.com', '+86-13800000006', 'ACTIVE'),
('director_zhang', '$2a$10$B180Gc3ZvVo540F8mXlbpe2/IbC9ku1wMZA7SV1aJF9QWaAsek0SK', 'Director Zhang Yong (张厂长)', 'zhang.yong@wifim-factory.com', '+86-13800000002', 'ACTIVE'),
('dispatcher_wang', '$2a$10$G7I1dH4sAu8vJyzt3BD.UOSGDHE.DskjQGXnkxewLO93DvOV1VqCm', 'Machinist Wang Qiang (王调度)', 'wang.q@wifim-factory.com', '+86-13800000003', 'ACTIVE'),
('clerk_liu', '$2a$10$vg3EBJB7cwLBC1leP/9iLu2FZENTl5A0a18eph2RDsRV1g4lzYqpG', 'Warehouse Clerk Liu (刘仓管)', 'liu.wh@wifim-factory.com', '+86-13800000004', 'ACTIVE'),
('qc_qian', '$2a$10$Ln8DibjP1CEOVCDOKGnqaOjkdQlNs76KHh9qGJNdvwnBqxy40Speq', 'QC Inspector Qian (钱质检)', 'qian.qc@wifim-factory.com', '+86-13800000005', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 21. User Role Mappings
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE name = 'ADMIN')),
((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE name = 'MANAGER')),
((SELECT id FROM users WHERE username = 'operator'), (SELECT id FROM roles WHERE name = 'PRODUCTION')),
((SELECT id FROM users WHERE username = 'director_zhang'), (SELECT id FROM roles WHERE name = 'MANAGER')),
((SELECT id FROM users WHERE username = 'dispatcher_wang'), (SELECT id FROM roles WHERE name = 'PRODUCTION')),
((SELECT id FROM users WHERE username = 'clerk_liu'), (SELECT id FROM roles WHERE name = 'WAREHOUSE')),
((SELECT id FROM users WHERE username = 'qc_qian'), (SELECT id FROM roles WHERE name = 'PRODUCTION')),
((SELECT id FROM users WHERE username = 'qc_qian'), (SELECT id FROM roles WHERE name = 'VIEWER'))
ON CONFLICT DO NOTHING;

