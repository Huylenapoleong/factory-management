export type SalesOrderStatus =
  | 'QUOTATION'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'CANCELLED';

export interface SalesOrderSummary {
  id: number;
  orderNo: string;
  erpSoNumber: string;
  customerId: number;
  customerNameEn: string;
  customerNameZh: string;
  customerRegion: string;
  itemLinesCount: number;
  itemOverviewEn: string;
  itemOverviewZh: string;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  orderDate: string;
  deliveryDate: string;
  deliveryStatusLabel?: string;
  fulfillmentPercent: number;
  status: SalesOrderStatus;
  isUrgent?: boolean;
  slaOverdue?: boolean;
}

export interface OutboundDeliverySummary {
  id: number;
  deliveryNo: string;
  salesOrderId: number;
  salesOrderNo: string;
  customerNameEn: string;
  customerNameZh: string;
  shippingBay: string;
  carrierName: string;
  carrierTrackingNo: string;
  truckPlate: string;
  driverContact: string;
  palletsCount: number;
  grossWeightKg: number;
  volumeCbm: number;
  customsSeal: string;
  itemOverview: string;
  status: 'STAGED' | 'DISPATCHED' | 'DELIVERED';
  dispatchedAt?: string;
}

export interface CreateSalesOrderItemPayload {
  itemId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderPayload {
  customerId: number;
  deliveryDate: string;
  items: CreateSalesOrderItemPayload[];
  note?: string;
  isUrgent?: boolean;
}

export interface CreateDeliveryPayload {
  salesOrderId: number;
  warehouseId: number;
  shippingBay: string;
  carrierName: string;
  carrierTrackingNo: string;
  truckPlate: string;
  driverContact: string;
  palletsCount?: number;
  grossWeightKg?: number;
  volumeCbm?: number;
  items: {
    soItemId: number;
    quantity: number;
  }[];
}
