export interface DashboardSummary {
  totalInventoryItems: number;
  pendingPurchaseOrders: number;
  activeProductionOrders: number;
  openSalesOrders: number;
  dailyPlanCompletionRate: number; // e.g. 94.2
  activeOrdersNearDeadline: number; // e.g. 2
  lowStockItemsCount: number; // e.g. 5
  dispatchedSalesOrdersToday: number; // e.g. 8
}

export type WorkOrderStatus = 'IN_PRODUCTION' | 'QC_INSPECTION' | 'COMPLETED' | 'NEAR_DEADLINE';

export interface WorkOrderProgressItem {
  id: string;
  woNo: string;
  productCode: string;
  productName: string;
  productNameZh: string;
  spec: string;
  workstation: string;
  workstationZh: string;
  plannedQty: number;
  completedQty: number;
  progressPercent: number;
  status: WorkOrderStatus;
  uom: string;
}

export interface MaterialShortageItem {
  id: string;
  materialCode: string;
  materialName: string;
  materialNameZh: string;
  spec: string;
  currentStock: number;
  minStock: number;
  deficitQty: number;
  uom: string;
  leadTimeNotice: string;
}

export interface HourlyThroughputItem {
  hourSlot: string; // e.g. '08:00', '09:00'
  targetQty: number;
  actualQty: number;
  yieldRatePercent: number;
}

export type StockMovementType = 'PO_INBOUND' | 'PRODUCTION_ISSUE' | 'SO_OUTBOUND' | 'QC_RETURN';

export interface StockMovementItem {
  id: string;
  timestamp: string;
  type: StockMovementType;
  referenceDoc: string;
  itemName: string;
  itemNameZh: string;
  quantity: number;
  uom: string;
  warehouse: string;
  warehouseZh: string;
  operator: string;
}
