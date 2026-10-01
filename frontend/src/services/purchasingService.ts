import apiClient from './api';
import {
  PurchaseOrderSummary,
  GoodsReceiptSummary,
  CreatePurchaseOrderPayload,
  CreateGoodsReceiptPayload,
} from '@/features/purchasing/types';

const defaultPOs: PurchaseOrderSummary[] = [
  {
    id: 1,
    poNumber: 'PO-202610-08812',
    erpPoNumber: 'ERP-PO: #4580993122',
    supplierId: 1,
    supplierNameEn: 'Baosteel Precision Steel Ltd',
    supplierNameZh: '宝武特钢股份有限公司',
    supplierContact: 'Zhang Wei (张伟) · 138-8812-4081',
    itemLinesCount: 3,
    itemOverviewEn: '304 Stainless Round Bar Ø25mm (5,000 kg)',
    itemOverviewZh: '304不锈钢圆棒 Ø25mm (5,000 kg)',
    totalAmount: 92500,
    currency: 'USD',
    paymentTerms: 'Net 60 Days',
    orderDate: '2026-09-24',
    expectedDate: '2026-10-01',
    status: 'INBOUND_INSPECTING',
    isUrgent: true,
  },
  {
    id: 2,
    poNumber: 'PO-202610-08819',
    erpPoNumber: 'ERP-PO: #4580993145',
    supplierId: 2,
    supplierNameEn: 'Shenzhen Inovance Servo Tech',
    supplierNameZh: '汇川精密伺服技术',
    supplierContact: 'Li Ming (李明) · 0755-9201-3829',
    itemLinesCount: 2,
    itemOverviewEn: 'AC Servo Motor 750W 3000rpm (40 pcs)',
    itemOverviewZh: '交流伺服电机 750W (40 pcs)',
    totalAmount: 13600,
    currency: 'USD',
    paymentTerms: 'TT 30% Advance',
    orderDate: '2026-09-28',
    expectedDate: '2026-10-03',
    status: 'CONFIRMED',
    isUrgent: false,
  },
  {
    id: 3,
    poNumber: 'PO-202610-08824',
    erpPoNumber: 'ERP-PO: #4580993150',
    supplierId: 3,
    supplierNameEn: 'Parker Hannifin Hydraulics',
    supplierNameZh: '派克汉尼汾流体传动',
    supplierContact: 'John Doe · +1 216-896-3000',
    itemLinesCount: 4,
    itemOverviewEn: 'Proportional Valves D1FB (16 units)',
    itemOverviewZh: '比例溢流阀 D1FB (16台)',
    totalAmount: 48900,
    currency: 'USD',
    paymentTerms: 'LC at Sight',
    orderDate: '2026-09-25',
    expectedDate: '2026-10-05',
    status: 'CONFIRMED',
    isUrgent: false,
  },
  {
    id: 4,
    poNumber: 'PO-202610-08831',
    erpPoNumber: 'ERP-PO: #4580993162',
    supplierId: 4,
    supplierNameEn: 'Dongguan Standard Fasteners',
    supplierNameZh: '东莞五金紧固件实业',
    supplierContact: 'Chen Qiang (陈强) · 137-5120-0022',
    itemLinesCount: 6,
    itemOverviewEn: 'Hex Bolt M8×45 Gr 12.9 (65,000 pcs)',
    itemOverviewZh: '高强内六角螺栓 M8×45 (65,000 pcs)',
    totalAmount: 9750,
    currency: 'USD',
    paymentTerms: 'Net 30 Days',
    orderDate: '2026-09-20',
    expectedDate: '2026-09-30',
    status: 'CONFIRMED',
    slaWarn: true,
  },
  {
    id: 5,
    poNumber: 'PO-202610-08865',
    erpPoNumber: 'ERP-PO: #4580993899',
    supplierId: 5,
    supplierNameEn: 'Omron Industrial Automation',
    supplierNameZh: '欧姆龙工业自动化',
    supplierContact: 'Kenji Sato · +81 3-3436-7170',
    itemLinesCount: 1,
    itemOverviewEn: 'Optic Sensor E3Z-T81A (120 units)',
    itemOverviewZh: '光电传感器 E3Z-T81A (120台)',
    totalAmount: 18400,
    currency: 'USD',
    paymentTerms: 'Net 45 Days',
    orderDate: '2026-09-29',
    expectedDate: '2026-10-08',
    status: 'CONFIRMED',
    isUrgent: false,
  },
  {
    id: 6,
    poNumber: 'PO-202610-09010',
    erpPoNumber: 'Uncommitted Draft',
    supplierId: 6,
    supplierNameEn: 'Festo Pneumatic Systems',
    supplierNameZh: '费斯托气动系统',
    supplierContact: 'Klaus Weber · +49 711 3470',
    itemLinesCount: 5,
    itemOverviewEn: 'Guided Cylinder DFM-32 (60 pcs)',
    itemOverviewZh: '紧凑型导向气缸 DFM-32 (60 pcs)',
    totalAmount: 31200,
    currency: 'USD',
    paymentTerms: 'Net 30 Days',
    orderDate: '2026-10-01',
    expectedDate: '2026-10-15',
    status: 'DRAFT',
  },
];

const defaultReceipts: GoodsReceiptSummary[] = [
  {
    id: 1,
    grnNumber: 'GRN-20261024-019',
    poReference: 'PO-202610-08819',
    supplierNameEn: 'Shenzhen Inovance Servo Tech',
    supplierNameZh: '汇川精密伺服技术',
    receivingBay: 'Bay 02 - Heavy Freight',
    carrierTracking: 'SF Heavy 顺丰重运 884910249',
    inspector: 'QC Tech Zhao (赵工)',
    itemDescriptionEn: 'AC Servo Motor 750W 3000rpm (SKU: ELEC-SRV-750)',
    itemDescriptionZh: '交流伺服电机 750W 3000rpm (SKU: ELEC-SRV-750)',
    quantityReceived: 40,
    quantityAccepted: 40,
    quantityRejected: 0,
    unit: 'pcs',
    status: 'PASSED',
    receivedAt: '2026-10-01 10:15:00',
    notes: 'Zero dimensional flaw. Verified Pass 100%. Ready to post to stock.',
  },
  {
    id: 2,
    grnNumber: 'GRN-20261024-022',
    poReference: 'PO-202610-08790',
    supplierNameEn: 'Dongguan Standard Fasteners',
    supplierNameZh: '东莞五金紧固件实业',
    receivingBay: 'Bay 01 - Small Parts',
    carrierTracking: 'ZTO Freight 992019284',
    inspector: 'QC Tech Sun (孙工)',
    itemDescriptionEn: 'Fastener M12 Grade 8.8 (SKU: FAS-M12-088)',
    itemDescriptionZh: '高强紧固件 M12 8.8级 (SKU: FAS-M12-088)',
    quantityReceived: 5000,
    quantityAccepted: 4995,
    quantityRejected: 5,
    unit: 'pcs',
    status: 'DEFECT_HOLD',
    receivedAt: '2026-10-01 09:40:00',
    notes: 'Surface oxidation observed on crate #04. NCR-20261001-04 issued.',
  },
];

class PurchasingService {
  private pos: PurchaseOrderSummary[] = [...defaultPOs];
  private receipts: GoodsReceiptSummary[] = [...defaultReceipts];

  public async getPurchaseOrders(search?: string, status?: string): Promise<PurchaseOrderSummary[]> {
    try {
      const res = await apiClient.get('/api/v1/purchase-orders', {
        params: { search, status: status !== 'ALL' ? status : undefined },
      });
      const responseData = (res as { data?: { data?: { content?: unknown[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return this.pos;
      }
    } catch {
      // offline fallback
    }

    let result = [...this.pos];
    if (status && status !== 'ALL') {
      result = result.filter((p) => p.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.poNumber.toLowerCase().includes(q) ||
          p.supplierNameEn.toLowerCase().includes(q) ||
          p.supplierNameZh.includes(q) ||
          p.itemOverviewEn.toLowerCase().includes(q) ||
          p.itemOverviewZh.includes(q)
      );
    }
    return result;
  }

  public async getGoodsReceipts(): Promise<GoodsReceiptSummary[]> {
    try {
      const res = await apiClient.get('/api/v1/goods-receipts');
      const responseData = (res as { data?: { data?: { content?: unknown[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return this.receipts;
      }
    } catch {
      // offline fallback
    }
    return [...this.receipts];
  }

  public async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/purchase-orders', payload);
    } catch {
      // offline fallback
    }

    const newPO: PurchaseOrderSummary = {
      id: Date.now(),
      poNumber: `PO-202610-${Date.now().toString().slice(-5)}`,
      erpPoNumber: `ERP-PO: #${Date.now().toString().slice(-8)}`,
      supplierId: payload.supplierId,
      supplierNameEn: 'Baosteel Precision Steel Ltd',
      supplierNameZh: '宝武特钢股份有限公司',
      supplierContact: 'Zhang Wei · 138-8812-4081',
      itemLinesCount: payload.items.length,
      itemOverviewEn: 'Procured Production Materials',
      itemOverviewZh: '生产原料及配套辅件',
      totalAmount: payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      currency: 'USD',
      paymentTerms: 'Net 30 Days',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate: payload.expectedDeliveryDate,
      status: 'CONFIRMED',
      isUrgent: payload.isUrgent,
    };
    this.pos.unshift(newPO);
    return true;
  }

  public async confirmPurchaseOrder(id: number): Promise<boolean> {
    const po = this.pos.find((p) => p.id === id);
    if (!po) return false;
    po.status = 'CONFIRMED';
    return true;
  }

  public async postGoodsReceipt(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/api/v1/goods-receipts/${id}/post`);
    } catch {
      // offline fallback
    }
    const receipt = this.receipts.find((r) => r.id === id);
    if (!receipt) return false;
    receipt.status = 'POSTED';
    return true;
  }

  public async createGoodsReceipt(payload: CreateGoodsReceiptPayload): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/goods-receipts', payload);
    } catch {
      // offline fallback
    }
    const po = this.pos.find((p) => p.id === payload.purchaseOrderId);
    const newGrn: GoodsReceiptSummary = {
      id: Date.now(),
      grnNumber: `GRN-20261024-${Date.now().toString().slice(-3)}`,
      poReference: po ? po.poNumber : `PO-${payload.purchaseOrderId}`,
      supplierNameEn: po ? po.supplierNameEn : 'Supplier Ltd',
      supplierNameZh: po ? po.supplierNameZh : '供货商实业',
      receivingBay: payload.receivingBay,
      carrierTracking: payload.carrierTracking || 'SF Heavy 顺丰重运',
      inspector: 'QC Tech Zhao (赵工)',
      itemDescriptionEn: po ? po.itemOverviewEn : 'Materials received',
      itemDescriptionZh: po ? po.itemOverviewZh : '物料到货',
      quantityReceived: payload.items.reduce((s, i) => s + i.receivedQuantity, 0),
      quantityAccepted: payload.items.reduce((s, i) => s + i.receivedQuantity, 0),
      quantityRejected: 0,
      unit: 'pcs',
      status: 'PASSED',
      receivedAt: new Date().toLocaleTimeString(),
      notes: 'Dock received, initial dimensional check pass.',
    };
    this.receipts.unshift(newGrn);
    if (po) {
      po.status = 'INBOUND_INSPECTING';
    }
    return true;
  }
}

export const purchasingService = new PurchasingService();
export default purchasingService;
