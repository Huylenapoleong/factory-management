import apiClient from './api';
import {
  SalesOrderSummary,
  OutboundDeliverySummary,
  CreateSalesOrderPayload,
  CreateDeliveryPayload,
} from '@/features/sales/types';

const defaultSalesOrders: SalesOrderSummary[] = [
  {
    id: 1,
    orderNo: 'SO-202610-0941',
    erpSoNumber: 'SAP SD# 5049001',
    customerId: 1,
    customerNameEn: 'Tesla Energy Gigafactory',
    customerNameZh: '特斯拉能源超级工厂',
    customerRegion: 'Shanghai Lingang · Export T12',
    itemLinesCount: 4,
    itemOverviewEn: 'Inverter Drive Assembly 150kW (120 pcs)',
    itemOverviewZh: '逆变驱动控制器总成 150kW (120套)',
    totalAmount: 348000,
    currency: 'USD',
    paymentTerms: 'T/T 60 Days',
    orderDate: '2026-09-18',
    deliveryDate: '2026-10-01',
    deliveryStatusLabel: 'Today (Bay 07)',
    fulfillmentPercent: 92,
    status: 'READY_TO_SHIP',
    isUrgent: true,
  },
  {
    id: 2,
    orderNo: 'SO-202610-0938',
    erpSoNumber: 'SAP SD# 5049009',
    customerId: 2,
    customerNameEn: "BYD Auto Xi'an Plant",
    customerNameZh: '比亚迪汽车西安总装基地',
    customerRegion: 'Shaanxi Industrial Hub · Tier-1 Mfg',
    itemLinesCount: 2,
    itemOverviewEn: 'CNC Machined Flange Shaft 45# (650 pcs)',
    itemOverviewZh: '精密法兰传动轴 45# (650件)',
    totalAmount: 78500,
    currency: 'USD',
    paymentTerms: 'L/C at Sight',
    orderDate: '2026-09-22',
    deliveryDate: '2026-10-05',
    deliveryStatusLabel: 'In 4 Days',
    fulfillmentPercent: 65,
    status: 'IN_PRODUCTION',
  },
  {
    id: 3,
    orderNo: 'SO-202610-0925',
    erpSoNumber: 'SAP SD# 5049022',
    customerId: 3,
    customerNameEn: 'Siemens Energy AG',
    customerNameZh: '西门子能源系统',
    customerRegion: 'Munich Logistics Gateway · Air Freight',
    itemLinesCount: 3,
    itemOverviewEn: 'High-Voltage Gas Insulated Bushing 220kV (18 pcs)',
    itemOverviewZh: '高压气体绝缘套管 220kV (18套)',
    totalAmount: 184500,
    currency: 'USD',
    paymentTerms: 'T/T 30% Adv.',
    orderDate: '2026-09-15',
    deliveryDate: '2026-10-04',
    deliveryStatusLabel: '10/4 Bay 08',
    fulfillmentPercent: 80,
    status: 'CONFIRMED',
  },
  {
    id: 4,
    orderNo: 'SO-202610-0919',
    erpSoNumber: 'SAP SD# 5049035',
    customerId: 4,
    customerNameEn: 'Foxconn Industrial Internet (FII)',
    customerNameZh: '富士康工业互联',
    customerRegion: 'Zhengzhou Precision Park · Facility C3',
    itemLinesCount: 6,
    itemOverviewEn: 'BGA Aluminum Stiffener Baseplate (45,000 pcs)',
    itemOverviewZh: '高导热铝加强背板 (45,000件)',
    totalAmount: 112500,
    currency: 'USD',
    paymentTerms: 'Net 45 Days',
    orderDate: '2026-09-25',
    deliveryDate: '2026-10-10',
    deliveryStatusLabel: 'In 9 Days',
    fulfillmentPercent: 40,
    status: 'IN_PRODUCTION',
  },
  {
    id: 5,
    orderNo: 'SO-202610-0902',
    erpSoNumber: 'SAP SD# 5049051',
    customerId: 5,
    customerNameEn: 'Sany Heavy Industry',
    customerNameZh: '三一重工股份有限公司',
    customerRegion: 'Changsha Heavy Plant · Direct Supply',
    itemLinesCount: 5,
    itemOverviewEn: 'Hydraulic Cylinder Rod Hard Chrome 90mm (150 pcs)',
    itemOverviewZh: '重载液压油缸镀铬活塞杆 Ø90mm (150支)',
    totalAmount: 96000,
    currency: 'USD',
    paymentTerms: 'Net 60 Days',
    orderDate: '2026-09-10',
    deliveryDate: '2026-09-30',
    deliveryStatusLabel: '1 Day Overdue',
    fulfillmentPercent: 100,
    status: 'READY_TO_SHIP',
    slaOverdue: true,
  },
  {
    id: 6,
    orderNo: 'SO-202610-0899',
    erpSoNumber: 'SAP SD# 5049060',
    customerId: 1,
    customerNameEn: 'Tesla Energy Gigafactory',
    customerNameZh: '特斯拉能源超级工厂',
    customerRegion: 'Shanghai Lingang · Export T12',
    itemLinesCount: 2,
    itemOverviewEn: 'BMS Harness Module Bundle 48V (3,600 sets)',
    itemOverviewZh: '低压线束总成 48V (3,600套)',
    totalAmount: 145000,
    currency: 'USD',
    paymentTerms: 'T/T 60 Days',
    orderDate: '2026-09-08',
    deliveryDate: '2026-09-29',
    deliveryStatusLabel: 'DOC Shipped',
    fulfillmentPercent: 100,
    status: 'SHIPPED',
  },
];

const defaultDeliveries: OutboundDeliverySummary[] = [
  {
    id: 1,
    deliveryNo: 'DO-20261024-088',
    salesOrderId: 1,
    salesOrderNo: 'SO-202610-0941',
    customerNameEn: 'Tesla Energy Gigafactory',
    customerNameZh: '特斯拉能源超级工厂',
    shippingBay: 'Dock Bay 07 - Outbound Export',
    carrierName: 'SF Heavy Freight Express (顺丰重货专运)',
    carrierTrackingNo: 'SF-LOG-8849201948',
    truckPlate: '苏E-98K21',
    driverContact: 'Master Liu (刘师傅) · +86 138-1920-3341',
    palletsCount: 4,
    grossWeightKg: 1840,
    volumeCbm: 5.6,
    customsSeal: 'SEAL-CN-202610-994',
    itemOverview: 'Inverter Drive Assembly 150kW (120 pcs)',
    status: 'STAGED',
  },
  {
    id: 2,
    deliveryNo: 'DO-20261024-085',
    salesOrderId: 2,
    salesOrderNo: 'SO-202610-0938',
    customerNameEn: "BYD Auto Xi'an Plant",
    customerNameZh: '比亚迪汽车西安总装基地',
    shippingBay: 'Dock Bay 05 - Domestic Rapid',
    carrierName: 'Deppon Logistics (德邦物流)',
    carrierTrackingNo: 'DP-992019284',
    truckPlate: '陕A-52T88',
    driverContact: 'Master Zhang (张师傅) · 139-0021-9922',
    palletsCount: 8,
    grossWeightKg: 3200,
    volumeCbm: 12.0,
    customsSeal: 'DOM-SEAL-8821',
    itemOverview: 'Flange Shaft 45# (650 pcs)',
    status: 'DISPATCHED',
    dispatchedAt: '13:00',
  },
];

class SalesService {
  private orders: SalesOrderSummary[] = [...defaultSalesOrders];
  private deliveries: OutboundDeliverySummary[] = [...defaultDeliveries];

  public async getSalesOrders(search?: string, status?: string): Promise<SalesOrderSummary[]> {
    try {
      const res = await apiClient.get('/api/v1/sales-orders', {
        params: { search, status: status !== 'ALL' ? status : undefined },
      });
      const responseData = (res as { data?: { data?: { content?: unknown[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return this.orders;
      }
    } catch {
      // offline fallback
    }

    let result = [...this.orders];
    if (status && status !== 'ALL') {
      result = result.filter((o) => o.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(q) ||
          o.customerNameEn.toLowerCase().includes(q) ||
          o.customerNameZh.includes(q) ||
          o.itemOverviewEn.toLowerCase().includes(q) ||
          o.itemOverviewZh.includes(q)
      );
    }
    return result;
  }

  public async getDeliveries(): Promise<OutboundDeliverySummary[]> {
    try {
      const res = await apiClient.get('/api/v1/deliveries');
      const responseData = (res as { data?: { data?: { content?: unknown[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return this.deliveries;
      }
    } catch {
      // offline fallback
    }
    return [...this.deliveries];
  }

  public async createSalesOrder(payload: CreateSalesOrderPayload): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/sales-orders', payload);
    } catch {
      // offline fallback
    }

    const newSO: SalesOrderSummary = {
      id: Date.now(),
      orderNo: `SO-202610-0${Date.now().toString().slice(-3)}`,
      erpSoNumber: `SAP SD# 5049${Date.now().toString().slice(-3)}`,
      customerId: payload.customerId,
      customerNameEn: 'Tesla Energy Gigafactory',
      customerNameZh: '特斯拉能源超级工厂',
      customerRegion: 'Shanghai Lingang · Export T12',
      itemLinesCount: payload.items.length,
      itemOverviewEn: 'Contract Industrial Assemblies',
      itemOverviewZh: '定制工业组装件',
      totalAmount: payload.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      currency: 'USD',
      paymentTerms: 'T/T 60 Days',
      orderDate: new Date().toISOString().slice(0, 10),
      deliveryDate: payload.deliveryDate,
      deliveryStatusLabel: 'New Confirmed',
      fulfillmentPercent: 10,
      status: 'CONFIRMED',
      isUrgent: payload.isUrgent,
    };
    this.orders.unshift(newSO);
    return true;
  }

  public async confirmSalesOrder(id: number): Promise<boolean> {
    const so = this.orders.find((o) => o.id === id);
    if (!so) return false;
    so.status = 'CONFIRMED';
    return true;
  }

  public async createDelivery(payload: CreateDeliveryPayload): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/deliveries', payload);
    } catch {
      // offline fallback
    }

    const so = this.orders.find((o) => o.id === payload.salesOrderId);
    const newDO: OutboundDeliverySummary = {
      id: Date.now(),
      deliveryNo: `DO-20261024-0${Date.now().toString().slice(-2)}`,
      salesOrderId: payload.salesOrderId,
      salesOrderNo: so ? so.orderNo : `SO-${payload.salesOrderId}`,
      customerNameEn: so ? so.customerNameEn : 'Customer Group',
      customerNameZh: so ? so.customerNameZh : '客户集团',
      shippingBay: payload.shippingBay,
      carrierName: payload.carrierName,
      carrierTrackingNo: payload.carrierTrackingNo,
      truckPlate: payload.truckPlate,
      driverContact: payload.driverContact,
      palletsCount: payload.palletsCount || 4,
      grossWeightKg: payload.grossWeightKg || 1650,
      volumeCbm: payload.volumeCbm || 5.0,
      customsSeal: `SEAL-CN-202610-${Date.now().toString().slice(-3)}`,
      itemOverview: so ? so.itemOverviewZh : 'Outbound cargo',
      status: 'STAGED',
    };
    this.deliveries.unshift(newDO);
    if (so) {
      so.status = 'READY_TO_SHIP';
      so.fulfillmentPercent = 95;
    }
    return true;
  }

  public async postDispatch(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/deliveries/${id}/post`);
    } catch {
      // offline fallback
    }

    const delivery = this.deliveries.find((d) => d.id === id);
    if (!delivery) return false;
    delivery.status = 'DISPATCHED';
    delivery.dispatchedAt = new Date().toLocaleTimeString();

    const so = this.orders.find((o) => o.id === delivery.salesOrderId);
    if (so) {
      so.status = 'SHIPPED';
      so.fulfillmentPercent = 100;
      so.deliveryStatusLabel = 'DOC Shipped';
    }
    return true;
  }
}

export const salesService = new SalesService();
export default salesService;
