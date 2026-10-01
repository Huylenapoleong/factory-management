import apiClient from './api';
import {
  InventoryBalanceItem,
  StockAuditLogItem,
  WarehouseSummary,
  StockTransferPayload,
  StockAdjustmentPayload,
  InventoryFilterParams,
} from '@/features/inventory/types';

const defaultBalances: InventoryBalanceItem[] = [
  {
    id: 1,
    warehouseId: 1,
    warehouseCode: 'WH-01',
    warehouseNameEn: 'Raw Materials Warehouse',
    warehouseNameZh: '原材料一号库',
    locationId: 101,
    locationCode: 'WH-01 / A-03-02',
    itemId: 1001,
    itemCode: 'RM-STEEL-304',
    itemNameEn: '304 Stainless Steel Round Bar',
    itemNameZh: '304不锈钢棒材',
    itemSpec: 'Ø25mm × 3000mm | Hot Rolled',
    itemCategory: 'Raw Alloys',
    itemCategoryZh: '特种合金',
    itemUnitCode: 'kg',
    lotNumber: '26Q4-LOT08',
    quantity: 2450,
    reservedQuantity: 600,
    availableQuantity: 1850,
    minStock: 800,
    unitCost: 18.5,
    totalValuation: 45325,
    status: 'NORMAL',
    updatedAt: '2026-10-01 11:22:15',
  },
  {
    id: 2,
    warehouseId: 2,
    warehouseCode: 'WH-02',
    warehouseNameEn: 'WIP Workshop Warehouse',
    warehouseNameZh: '车间在制品库',
    locationId: 201,
    locationCode: 'WH-02 / B-01-04',
    itemId: 1002,
    itemCode: 'ELEC-MOTOR-750W',
    itemNameEn: 'AC Servo Motor 750W',
    itemNameZh: '交流伺服电机',
    itemSpec: '220V / 3000rpm | Absolute Encoder',
    itemCategory: 'Electrical',
    itemCategoryZh: '电气伺服',
    itemUnitCode: 'pcs',
    lotNumber: 'LOT-20261001-A',
    quantity: 8,
    reservedQuantity: 6,
    availableQuantity: 2,
    minStock: 20,
    unitCost: 340.0,
    totalValuation: 2720,
    status: 'LOW_STOCK',
    updatedAt: '2026-10-01 10:45:00',
  },
  {
    id: 3,
    warehouseId: 1,
    warehouseCode: 'WH-01',
    warehouseNameEn: 'Raw Materials Warehouse',
    warehouseNameZh: '原材料一号库',
    locationId: 102,
    locationCode: 'WH-01 / C-04-01',
    itemId: 1003,
    itemCode: 'SEAL-RING-NBR50',
    itemNameEn: 'NBR O-Ring Seal',
    itemNameZh: '丁腈O型密封圈',
    itemSpec: 'Ø50mm × 3.5mm Shore A70 | Oil Res.',
    itemCategory: 'Packaging & Consumables',
    itemCategoryZh: '包材辅料',
    itemUnitCode: 'pcs',
    lotNumber: 'LOT-09201-B',
    quantity: 120,
    reservedQuantity: 50,
    availableQuantity: 70,
    minStock: 200,
    unitCost: 1.2,
    totalValuation: 144,
    status: 'LOW_STOCK',
    updatedAt: '2026-10-01 09:15:30',
  },
  {
    id: 4,
    warehouseId: 1,
    warehouseCode: 'WH-01',
    warehouseNameEn: 'Raw Materials Warehouse',
    warehouseNameZh: '原材料一号库',
    locationId: 103,
    locationCode: 'WH-01 / D-02-05',
    itemId: 1004,
    itemCode: 'FASTENER-M8-30',
    itemNameEn: 'High-Tensile Hex Bolt',
    itemNameZh: '高强内六角螺栓',
    itemSpec: 'M8 × 30 Grade 12.9 | Black Oxide',
    itemCategory: 'Fasteners',
    itemCategoryZh: '标准紧固件',
    itemUnitCode: 'pcs',
    lotNumber: '26H2-FAST01',
    quantity: 19400,
    reservedQuantity: 4200,
    availableQuantity: 15200,
    minStock: 5000,
    unitCost: 0.15,
    totalValuation: 2910,
    status: 'NORMAL',
    updatedAt: '2026-10-01 10:15:30',
  },
  {
    id: 5,
    warehouseId: 1,
    warehouseCode: 'WH-01',
    warehouseNameEn: 'Raw Materials Warehouse',
    warehouseNameZh: '原材料一号库',
    locationId: 104,
    locationCode: 'WH-01 / A-01-08',
    itemId: 1005,
    itemCode: 'ALLOY-AL6061-T6',
    itemNameEn: 'Aerospace Aluminum Plate',
    itemNameZh: '航空铝板',
    itemSpec: 'AL6061-T6 50mm × 1000mm × 2000mm',
    itemCategory: 'Raw Alloys',
    itemCategoryZh: '特种合金',
    itemUnitCode: 'kg',
    lotNumber: 'LOT-20260918',
    quantity: 1850,
    reservedQuantity: 750,
    availableQuantity: 1100,
    minStock: 500,
    unitCost: 32.0,
    totalValuation: 59200,
    status: 'NORMAL',
    updatedAt: '2026-10-01 08:30:00',
  },
  {
    id: 6,
    warehouseId: 3,
    warehouseCode: 'WH-03',
    warehouseNameEn: 'Finished Goods Warehouse',
    warehouseNameZh: '成品仓',
    locationId: 301,
    locationCode: 'WH-03 / E-02-11',
    itemId: 1006,
    itemCode: 'HYD-VALVE-CORE-02',
    itemNameEn: 'Precision Valve Core',
    itemNameZh: '精密液压阀芯',
    itemSpec: 'Hard Chrome Plated | Tolerance ±0.002mm',
    itemCategory: 'Raw Alloys',
    itemCategoryZh: '特种合金',
    itemUnitCode: 'pcs',
    lotNumber: 'LOT-VALV-441',
    quantity: 350,
    reservedQuantity: 70,
    availableQuantity: 280,
    minStock: 100,
    unitCost: 85.0,
    totalValuation: 29750,
    status: 'NORMAL',
    updatedAt: '2026-10-01 09:30:10',
  },
  {
    id: 7,
    warehouseId: 4,
    warehouseCode: 'WH-04',
    warehouseNameEn: 'Bonded Logistics Warehouse',
    warehouseNameZh: '保税物流仓',
    locationId: 401,
    locationCode: 'WH-04 / S-01-01',
    itemId: 1007,
    itemCode: 'SENS-LASER-DIST-01',
    itemNameEn: 'Laser Distance Sensor',
    itemNameZh: '激光测距传感器',
    itemSpec: 'IO-Link / 0.05-10m / IP67 / Class 2',
    itemCategory: 'Electrical',
    itemCategoryZh: '电气伺服',
    itemUnitCode: 'pcs',
    lotNumber: '--',
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    minStock: 30,
    unitCost: 210.0,
    totalValuation: 0,
    status: 'STOCKOUT',
    updatedAt: '2026-10-01 07:00:00',
  },
  {
    id: 8,
    warehouseId: 4,
    warehouseCode: 'WH-04',
    warehouseNameEn: 'Bonded Logistics Warehouse',
    warehouseNameZh: '保税物流仓',
    locationId: 402,
    locationCode: 'WH-04 / DEF-01',
    itemId: 1008,
    itemCode: 'QUAR-CAST-09',
    itemNameEn: 'Cast Iron Housing',
    itemNameZh: '铸铁壳体 (待评审)',
    itemSpec: 'HT250 / Sand Casting / Porosity Check',
    itemCategory: 'Raw Alloys',
    itemCategoryZh: '特种合金',
    itemUnitCode: 'pcs',
    lotNumber: 'LOT-99201-SCRAP',
    quantity: 15,
    reservedQuantity: 15,
    availableQuantity: 0,
    minStock: 0,
    unitCost: 45.0,
    totalValuation: 675,
    status: 'QUARANTINE',
    updatedAt: '2026-10-01 08:50:00',
  },
];

const defaultAuditLogs: StockAuditLogItem[] = [
  {
    id: 1,
    transactionNo: 'TX-20261001-081',
    type: 'INBOUND',
    itemCode: 'RM-STEEL-304',
    itemNameEn: '304 Stainless Steel Round Bar',
    itemNameZh: '304不锈钢棒材',
    quantityDelta: 500,
    unit: 'kg',
    targetLocation: 'WH-01 / A-03-02',
    docReference: 'PO-8812',
    operator: 'Clerk Liu (WH-042)',
    verificationStatus: 'PASS',
    note: 'Dock Bay 02 inspected & accepted',
    timestamp: '11:22:15',
  },
  {
    id: 2,
    transactionNo: 'TX-20261001-080',
    type: 'PRODUCTION_ISSUE',
    itemCode: 'ELEC-MOTOR-750W',
    itemNameEn: 'AC Servo Motor 750W',
    itemNameZh: '交流伺服电机',
    quantityDelta: -12,
    unit: 'pcs',
    sourceLocation: 'WH-02 / B-01-04',
    targetLocation: 'Line A Dispatch (WO-20261001-01)',
    docReference: 'WO-20261001-01',
    operator: 'Machinist Wang',
    verificationStatus: 'PASS',
    note: 'PDA RFID scanned and dispatched',
    timestamp: '10:45:00',
  },
  {
    id: 3,
    transactionNo: 'TX-20261001-079',
    type: 'TRANSFER',
    itemCode: 'FASTENER-M8-30',
    itemNameEn: 'High-Tensile Hex Bolt',
    itemNameZh: '高强内六角螺栓',
    quantityDelta: 600,
    unit: 'pcs',
    sourceLocation: 'WH-01 Staging Buffer',
    targetLocation: 'WH-01 / Rack-C2',
    docReference: 'TR-20261001-04',
    operator: 'Chen Bin (Forklift)',
    verificationStatus: 'PASS',
    note: 'Relocated for high-bay optimization',
    timestamp: '10:15:30',
  },
  {
    id: 4,
    transactionNo: 'TX-20261001-078',
    type: 'OUTBOUND',
    itemCode: 'HYD-VALVE-CORE-02',
    itemNameEn: 'Finished Valve Core Assembly',
    itemNameZh: '成品阀芯组件',
    quantityDelta: -250,
    unit: 'pcs',
    sourceLocation: 'WH-03 / E-02-11',
    targetLocation: 'Dock 03 / Bay 5',
    docReference: 'DO-20261001-03',
    operator: 'Logistics Dispatch',
    verificationStatus: 'PASS',
    note: 'Carrier: SF Express SF149204 sealed',
    timestamp: '09:30:10',
  },
  {
    id: 5,
    transactionNo: 'TX-20261001-077',
    type: 'QC_SCRAP',
    itemCode: 'QUAR-CAST-09',
    itemNameEn: 'Cast Iron Housing',
    itemNameZh: '铸铁壳体 (报废隔离)',
    quantityDelta: 15,
    unit: 'pcs',
    sourceLocation: 'Line A-02 Machining',
    targetLocation: 'WH-04 / Defect Area',
    docReference: 'NCR-20261001-01',
    operator: 'QC Inspector Qian',
    verificationStatus: 'FLAGGED',
    note: 'Porosity Defect > 0.2mm quarantined',
    timestamp: '08:50:00',
  },
];

const defaultWarehouses: WarehouseSummary[] = [
  {
    id: 1,
    code: 'WH-01',
    nameEn: 'Raw Materials Warehouse',
    nameZh: '原材料一号库',
    type: 'RAW_MATERIAL',
    activeLocations: 84,
    totalSkus: 680,
  },
  {
    id: 2,
    code: 'WH-02',
    nameEn: 'WIP Workshop Warehouse',
    nameZh: '车间在制品库',
    type: 'WIP',
    activeLocations: 32,
    totalSkus: 210,
  },
  {
    id: 3,
    code: 'WH-03',
    nameEn: 'Finished Goods Warehouse',
    nameZh: '成品总装库',
    type: 'FINISHED_GOODS',
    activeLocations: 56,
    totalSkus: 340,
  },
  {
    id: 4,
    code: 'WH-04',
    nameEn: 'Bonded Logistics Warehouse',
    nameZh: '保税物流中心',
    type: 'BONDED',
    activeLocations: 40,
    totalSkus: 252,
  },
];

class InventoryService {
  private balances: InventoryBalanceItem[] = [...defaultBalances];
  private auditLogs: StockAuditLogItem[] = [...defaultAuditLogs];

  public async getBalances(params?: InventoryFilterParams): Promise<InventoryBalanceItem[]> {
    try {
      const res = await apiClient.get('/api/v1/inventory/balances', {
        params: {
          warehouseId: params?.warehouseId !== 'ALL' ? params?.warehouseId : undefined,
          size: 50,
        },
      });
      const responseData = (res as { data?: { data?: { content?: unknown[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return this.balances;
      }
    } catch {
      // live backend offline, fall back to in-memory store
    }

    let result = [...this.balances];
    if (params?.warehouseId && params.warehouseId !== 'ALL') {
      result = result.filter((b) => b.warehouseId === params.warehouseId);
    }
    if (params?.category && params.category !== 'ALL') {
      result = result.filter((b) => b.itemCategory === params.category);
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((b) => b.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.itemCode.toLowerCase().includes(q) ||
          b.itemNameEn.toLowerCase().includes(q) ||
          b.itemNameZh.includes(q) ||
          b.locationCode.toLowerCase().includes(q) ||
          b.lotNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public async getRecentAuditLogs(): Promise<StockAuditLogItem[]> {
    try {
      const res = await apiClient.get('/api/v1/inventory/transactions/recent');
      const responseData = (res as { data?: { data?: unknown[] } })?.data;
      if (responseData?.data && Array.isArray(responseData.data)) {
        return this.auditLogs;
      }
    } catch {
      // offline fallback
    }
    return [...this.auditLogs];
  }

  public async getWarehouses(): Promise<WarehouseSummary[]> {
    try {
      const res = await apiClient.get('/api/v1/warehouses');
      const responseData = (res as { data?: { data?: unknown[] } })?.data;
      if (responseData?.data && Array.isArray(responseData.data)) {
        return defaultWarehouses;
      }
    } catch {
      // offline fallback
    }
    return defaultWarehouses;
  }

  public async transferStock(payload: StockTransferPayload): Promise<boolean> {
    const item = this.balances.find((b) => b.itemId === payload.itemId);
    if (!item) return false;

    // Deduct available
    item.availableQuantity = Math.max(0, item.availableQuantity - payload.quantity);
    item.updatedAt = new Date().toLocaleTimeString();

    // Log transaction
    const newLog: StockAuditLogItem = {
      id: Date.now(),
      transactionNo: `TX-${Date.now().toString().slice(-6)}`,
      type: 'TRANSFER',
      itemCode: item.itemCode,
      itemNameEn: item.itemNameEn,
      itemNameZh: item.itemNameZh,
      quantityDelta: payload.quantity,
      unit: item.itemUnitCode,
      sourceLocation: payload.fromLocationCode,
      targetLocation: payload.toLocationCode,
      docReference: `TR-${Date.now().toString().slice(-6)}`,
      operator: 'Logged Operator',
      verificationStatus: 'PASS',
      note: payload.reason,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.auditLogs.unshift(newLog);
    return true;
  }

  public async adjustStock(payload: StockAdjustmentPayload): Promise<boolean> {
    const item = this.balances.find((b) => b.itemId === payload.itemId);
    if (!item) return false;

    item.quantity += payload.quantity;
    item.availableQuantity += payload.quantity;
    item.totalValuation = item.quantity * item.unitCost;
    if (item.quantity <= 0) {
      item.status = 'STOCKOUT';
    } else if (item.quantity < item.minStock) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'NORMAL';
    }
    item.updatedAt = new Date().toLocaleTimeString();

    const newLog: StockAuditLogItem = {
      id: Date.now(),
      transactionNo: `TX-${Date.now().toString().slice(-6)}`,
      type: 'ADJUSTMENT',
      itemCode: item.itemCode,
      itemNameEn: item.itemNameEn,
      itemNameZh: item.itemNameZh,
      quantityDelta: payload.quantity,
      unit: item.itemUnitCode,
      sourceLocation: item.locationCode,
      targetLocation: item.locationCode,
      docReference: `ADJ-${Date.now().toString().slice(-6)}`,
      operator: 'Stocktake Lead',
      verificationStatus: 'PASS',
      note: payload.note,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.auditLogs.unshift(newLog);
    return true;
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
