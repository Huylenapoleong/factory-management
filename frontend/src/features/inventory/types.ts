export type StockStatus = 'NORMAL' | 'LOW_STOCK' | 'STOCKOUT' | 'QUARANTINE';

export type StockMovementType =
  | 'INBOUND'
  | 'OUTBOUND'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'PRODUCTION_ISSUE'
  | 'QC_SCRAP';

export interface InventoryBalanceItem {
  id: number;
  warehouseId: number;
  warehouseCode: string;
  warehouseNameEn: string;
  warehouseNameZh: string;
  locationId?: number;
  locationCode: string;
  itemId: number;
  itemCode: string;
  itemNameEn: string;
  itemNameZh: string;
  itemSpec: string;
  itemCategory: string;
  itemCategoryZh: string;
  itemUnitCode: string;
  lotNumber: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStock: number;
  unitCost: number;
  totalValuation: number;
  status: StockStatus;
  updatedAt: string;
}

export interface StockAuditLogItem {
  id: number;
  transactionNo: string;
  type: StockMovementType;
  itemCode: string;
  itemNameEn: string;
  itemNameZh: string;
  quantityDelta: number;
  unit: string;
  sourceLocation?: string;
  targetLocation?: string;
  docReference: string;
  operator: string;
  operatorBadge?: string;
  verificationStatus?: 'PASS' | 'PENDING' | 'FLAGGED';
  note?: string;
  timestamp: string;
}

export interface WarehouseSummary {
  id: number;
  code: string;
  nameEn: string;
  nameZh: string;
  type: string;
  activeLocations: number;
  totalSkus: number;
}

export interface StockTransferPayload {
  itemId: number;
  fromWarehouseId: number;
  fromLocationCode: string;
  toWarehouseId: number;
  toLocationCode: string;
  quantity: number;
  lotNumber?: string;
  reason: string;
}

export interface StockAdjustmentPayload {
  warehouseId: number;
  locationId?: number;
  itemId: number;
  quantity: number; // difference (+ or -)
  unitPrice?: number;
  note: string;
}

export interface InventoryFilterParams {
  warehouseId?: number | 'ALL';
  category?: string | 'ALL';
  status?: StockStatus | 'ALL';
  search?: string;
}
