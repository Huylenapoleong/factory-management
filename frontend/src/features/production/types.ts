export type ProductionOrderStatus = 'PLANNED' | 'IN_PRODUCTION' | 'QC_TESTING' | 'COMPLETED' | 'CANCELLED';

export interface ProductionOrder {
  id: string;
  orderNo: string;
  productCode: string;
  productName: string;
  productNameZh: string;
  spec: string;
  batchNo: string;
  workstation: string;
  workstationZh: string;
  plannedQty: number;
  completedQty: number;
  scrapQty: number;
  uom: string;
  currentStep: string;
  currentStepZh: string;
  stepNumber: number;
  totalSteps: number;
  progressPercent: number;
  scheduledStart: string;
  scheduledEnd: string;
  status: ProductionOrderStatus;
  isUrgent?: boolean;
}

export type OperationStepStatus = 'COMPLETED' | 'ACTIVE' | 'PENDING';

export interface OperationStep {
  id: string;
  stepCode: string; // e.g. "Op 10"
  stepName: string; // e.g. "CNC Rough Milling"
  stepNameZh: string; // e.g. "CNC粗铣加工"
  machineId: string;
  workerName: string;
  workerNameZh: string;
  targetQty: number;
  completedQty: number;
  scrapQty: number;
  progressPercent: number;
  status: OperationStepStatus;
  standardHours: number;
}

export interface OperationReportPayload {
  qualifiedQty: number;
  scrapQty: number;
  defectReason?: string;
  machineRunHours: number;
  operatorId: string;
  notes?: string;
}

export interface BomComponentItem {
  id: string;
  componentCode: string;
  componentName: string;
  componentNameZh: string;
  spec: string;
  unitConsumption: number;
  scrapRatePercent: number;
  requiredTotal: number;
  currentStock: number;
  uom: string;
  isSufficient: boolean;
}

export interface CreateProductionOrderRequest {
  productCode: string;
  workstation: string;
  plannedQty: number;
  scheduledEnd: string;
  isUrgent?: boolean;
  notes?: string;
}
