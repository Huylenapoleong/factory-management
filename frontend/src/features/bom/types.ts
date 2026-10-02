export type CoverageStatus = 'SUFFICIENT' | 'LOW' | 'SHORTAGE';

export interface BomSummary {
  id: number;
  code: string;
  productId: number;
  productCode: string;
  productNameEn: string;
  version: string;
  status: string;
  itemCount: number;
}

export interface BomAnalysisLine {
  bomItemId: number;
  materialId: number;
  materialCode: string;
  materialNameEn: string;
  materialNameZh?: string;
  materialType?: string;
  unitCode?: string;
  unitQuantity: number;
  scrapRate: number;
  requiredQuantity: number;
  availableQuantity: number;
  minStock: number;
  shortageQuantity: number;
  coveragePercent: number;
  status: CoverageStatus;
  unitCost: number;
  lineCost: number;
  scrapCost: number;
  surplusQuantity: number;
  onOrderQuantity: number;
  orderQuantity: number;
  procurementStatus: ProcurementStatus;
  urgency?: Urgency | null;
  orderByDate?: string | null;
  expectedArrivalDate?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  leadTimeDays?: number | null;
}

export type ProcurementStatus = 'COVERED' | 'ORDERED' | 'TO_ORDER';
export type Urgency = 'LATE' | 'TODAY' | 'UPCOMING';

export interface SupplierOption {
  id: number;
  code: string;
  name: string;
}

export interface BomAnalysis {
  bomId: number;
  bomCode: string;
  version: string;
  status: string;
  productId: number;
  productCode: string;
  productNameEn: string;
  productNameZh?: string;
  productUnitCode?: string;
  plannedQuantity: number;
  startDate: string;
  bottleneckBomItemId?: number | null;
  bottleneckMaterialNameEn?: string | null;
  bottleneckMaterialNameZh?: string | null;
  toOrderCount: number;
  totalMaterialCost: number;
  totalScrapCost: number;
  costPerUnit: number;
  maxBuildableQuantity: number;
  sufficientCount: number;
  lowCount: number;
  shortageCount: number;
  lines: BomAnalysisLine[];
}

export type CoverageFilter = 'ALL' | CoverageStatus;
