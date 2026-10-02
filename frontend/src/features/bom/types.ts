export type CoverageStatus = 'SUFFICIENT' | 'LOW' | 'SHORTAGE' | 'MAKE';
export type MakeOrBuy = 'MAKE' | 'BUY';

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
  materialId: number;
  materialCode: string;
  materialNameEn: string;
  materialNameZh?: string;
  materialType?: string;
  unitCode?: string;
  level: number;
  makeOrBuy: MakeOrBuy;
  usedIn: string[];
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
  toMakeQuantity: number;
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

export type ProcurementStatus = 'COVERED' | 'ORDERED' | 'TO_ORDER' | 'TO_MAKE';
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
  productImageVersion?: number | null;
  plannedQuantity: number;
  startDate: string;
  bottleneckMaterialId?: number | null;
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
  makeCount: number;
  levelCount: number;
  lines: BomAnalysisLine[];
  structure: BomStructureNode;
}

export interface BomStructureNode {
  itemId: number;
  itemCode: string;
  itemNameEn: string;
  itemNameZh?: string | null;
  unitCode?: string | null;
  makeOrBuy: MakeOrBuy;
  quantityPer: number;
  scrapRate: number;
  requiredQuantity: number;
  makeQuantity?: number | null;
  children: BomStructureNode[];
}

export type CoverageFilter = 'ALL' | CoverageStatus;
