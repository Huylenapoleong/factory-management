import apiClient from './api';
import type { BomAnalysis, BomAnalysisLine, BomSummary, SupplierOption } from '@/features/bom/types';

interface ApiEnvelope<T> {
  data: T;
}

interface RawBom {
  id: number;
  code: string;
  productId: number;
  productCode: string;
  productNameEn: string;
  version: string;
  status: string;
  items?: unknown[];
}

const toNumber = (value: unknown): number => Number(value ?? 0);

const normalizeLine = (line: BomAnalysisLine): BomAnalysisLine => ({
  ...line,
  unitQuantity: toNumber(line.unitQuantity),
  scrapRate: toNumber(line.scrapRate),
  requiredQuantity: toNumber(line.requiredQuantity),
  availableQuantity: toNumber(line.availableQuantity),
  minStock: toNumber(line.minStock),
  shortageQuantity: toNumber(line.shortageQuantity),
  coveragePercent: toNumber(line.coveragePercent),
  unitCost: toNumber(line.unitCost),
  lineCost: toNumber(line.lineCost),
  scrapCost: toNumber(line.scrapCost),
  surplusQuantity: toNumber(line.surplusQuantity),
  onOrderQuantity: toNumber(line.onOrderQuantity),
  orderQuantity: toNumber(line.orderQuantity),
});

export const bomService = {
  async getBoms(): Promise<BomSummary[]> {
    const res = (await apiClient.get('/boms')) as ApiEnvelope<RawBom[]>;
    return (res.data ?? []).map((bom) => ({
      id: bom.id,
      code: bom.code,
      productId: bom.productId,
      productCode: bom.productCode,
      productNameEn: bom.productNameEn,
      version: bom.version,
      status: bom.status,
      itemCount: bom.items?.length ?? 0,
    }));
  },

  async getAnalysis(bomId: number, quantity: number, startDate: string): Promise<BomAnalysis> {
    const res = (await apiClient.get(`/boms/${bomId}/analysis`, { params: { quantity, startDate } })) as ApiEnvelope<BomAnalysis>;
    const a = res.data;
    return {
      ...a,
      plannedQuantity: toNumber(a.plannedQuantity),
      totalMaterialCost: toNumber(a.totalMaterialCost),
      totalScrapCost: toNumber(a.totalScrapCost),
      costPerUnit: toNumber(a.costPerUnit),
      maxBuildableQuantity: toNumber(a.maxBuildableQuantity),
      lines: (a.lines ?? []).map(normalizeLine),
    };
  },

  async getSuppliers(): Promise<SupplierOption[]> {
    const res = (await apiClient.get('/suppliers/active')) as ApiEnvelope<Array<{ id: number; code: string; name: string }>>;
    return (res.data ?? []).map((s) => ({ id: s.id, code: s.code, name: s.name }));
  },

  async createPurchaseOrder(payload: {
    supplierId: number;
    orderDate: string;
    expectedDate: string;
    note: string;
    items: Array<{ itemId: number; quantity: number; unitPrice: number }>;
  }): Promise<{ id: number; poNo: string }> {
    const res = (await apiClient.post('/purchase-orders', payload)) as ApiEnvelope<{ id: number; poNo: string }>;
    return { id: res.data.id, poNo: res.data.poNo };
  },

  async createProductionOrder(payload: {
    productId: number;
    bomId: number;
    plannedQuantity: number;
    startDate?: string;
    dueDate?: string;
  }): Promise<{ id: number; moNo: string }> {
    const res = (await apiClient.post('/production-orders', payload)) as ApiEnvelope<{ id: number; moNo: string }>;
    return { id: res.data.id, moNo: res.data.moNo };
  },
};

export default bomService;
