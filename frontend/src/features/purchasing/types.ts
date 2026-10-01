export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'INBOUND_INSPECTING'
  | 'RECEIVED'
  | 'CANCELLED';

export type GoodsReceiptStatus =
  | 'INSPECTING'
  | 'PASSED'
  | 'DEFECT_HOLD'
  | 'POSTED';

export interface PurchaseOrderSummary {
  id: number;
  poNumber: string;
  erpPoNumber: string;
  supplierId: number;
  supplierNameEn: string;
  supplierNameZh: string;
  supplierContact: string;
  itemLinesCount: number;
  itemOverviewEn: string;
  itemOverviewZh: string;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  orderDate: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  isUrgent?: boolean;
  slaWarn?: boolean;
}

export interface GoodsReceiptSummary {
  id: number;
  grnNumber: string;
  poReference: string;
  supplierNameEn: string;
  supplierNameZh: string;
  receivingBay: string;
  carrierTracking: string;
  inspector: string;
  itemDescriptionEn: string;
  itemDescriptionZh: string;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  unit: string;
  status: GoodsReceiptStatus;
  receivedAt: string;
  notes?: string;
}

export interface CreatePurchaseOrderItemPayload {
  itemId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: number;
  expectedDeliveryDate: string;
  items: CreatePurchaseOrderItemPayload[];
  note?: string;
  isUrgent?: boolean;
}

export interface CreateGoodsReceiptPayload {
  purchaseOrderId: number;
  warehouseId: number;
  receivingBay: string;
  carrierTracking?: string;
  items: {
    poItemId: number;
    receivedQuantity: number;
    locationId?: number;
  }[];
}
