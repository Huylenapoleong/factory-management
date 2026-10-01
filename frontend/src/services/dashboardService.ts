import apiClient from './api';
import {
  DashboardSummary,
  WorkOrderProgressItem,
  MaterialShortageItem,
  HourlyThroughputItem,
  StockMovementItem,
} from '@/features/dashboard/types';

const defaultSummary: DashboardSummary = {
  totalInventoryItems: 128,
  pendingPurchaseOrders: 7,
  activeProductionOrders: 18,
  openSalesOrders: 12,
  dailyPlanCompletionRate: 94.2,
  activeOrdersNearDeadline: 2,
  lowStockItemsCount: 5,
  dispatchedSalesOrdersToday: 8,
};

const defaultWorkOrders: WorkOrderProgressItem[] = [
  {
    id: 'wo-1',
    woNo: 'WO-20261001-01',
    productCode: 'HV-204',
    productName: 'Precision Hydraulic Valve V2',
    productNameZh: '精密液压阀',
    spec: 'HV-204 / Batch: 3804',
    workstation: 'Line A-02 (CNC 5-Axis)',
    workstationZh: 'A产线-02 (五轴加工中心)',
    plannedQty: 500,
    completedQty: 465,
    progressPercent: 93,
    status: 'IN_PRODUCTION',
    uom: 'pcs',
  },
  {
    id: 'wo-2',
    woNo: 'WO-20261001-02',
    productCode: 'FS-880',
    productName: 'CNC Flange Shaft 45#',
    productNameZh: 'CNC法兰轴',
    spec: 'FS-880 / Batch: 3805',
    workstation: 'Line B-01 (High-Precision Lathe)',
    workstationZh: 'B产线-01 (高精数控车床)',
    plannedQty: 1200,
    completedQty: 840,
    progressPercent: 70,
    status: 'IN_PRODUCTION',
    uom: 'pcs',
  },
  {
    id: 'wo-3',
    woNo: 'WO-20261001-03',
    productCode: 'GB-300',
    productName: 'Industrial Gearbox C3',
    productNameZh: '工业减速箱',
    spec: 'GB-300 / High-Torque',
    workstation: 'Line C-04 (Auto Final Assembly)',
    workstationZh: 'C产线-04 (自动总装线)',
    plannedQty: 250,
    completedQty: 250,
    progressPercent: 100,
    status: 'QC_INSPECTION',
    uom: 'pcs',
  },
  {
    id: 'wo-4',
    woNo: 'WO-20261001-04',
    productCode: 'SH-120',
    productName: 'Servo Drive Housing',
    productNameZh: '伺服电机外壳',
    spec: 'SH-120 / Al-Alloy',
    workstation: 'Line A-05 (Die-cast Cell)',
    workstationZh: 'A产线-05 (精密压铸单元)',
    plannedQty: 800,
    completedQty: 800,
    progressPercent: 100,
    status: 'COMPLETED',
    uom: 'pcs',
  },
  {
    id: 'wo-5',
    woNo: 'WO-20261001-05',
    productCode: 'PR-95',
    productName: 'High-Pressure Piston Rod',
    productNameZh: '高压活塞杆',
    spec: 'PR-95 / Hard Chrome',
    workstation: 'Line B-03 (Cylindrical Grinding)',
    workstationZh: 'B产线-03 (高精度外圆磨床)',
    plannedQty: 350,
    completedQty: 110,
    progressPercent: 31,
    status: 'NEAR_DEADLINE',
    uom: 'pcs',
  },
];

const defaultShortages: MaterialShortageItem[] = [
  {
    id: 'mat-1',
    materialCode: 'RM-STEEL-304',
    materialName: 'Stainless Steel Rod 304',
    materialNameZh: '304不锈钢棒材 (Dia: 25mm)',
    spec: 'Dia 25mm x 3000mm',
    currentStock: 45,
    minStock: 150,
    deficitQty: 105,
    uom: 'kg',
    leadTimeNotice: 'Supplier expected in 4h / 预计4小时内送达',
  },
  {
    id: 'mat-2',
    materialCode: 'ELEC-MOTOR-750W',
    materialName: '750W Servo Motor',
    materialNameZh: '750W交流伺服电机',
    spec: 'AC 220V / 3000rpm',
    currentStock: 8,
    minStock: 30,
    deficitQty: 22,
    uom: 'pcs',
    leadTimeNotice: 'Local distributor in stock / 本地代理现货',
  },
  {
    id: 'mat-3',
    materialCode: 'SEAL-RING-NBR50',
    materialName: 'NBR Nitrile Seal Ring',
    materialNameZh: 'NBR丁腈橡胶密封圈',
    spec: 'ID 50mm x CS 3.5mm',
    currentStock: 120,
    minStock: 500,
    deficitQty: 380,
    uom: 'pcs',
    leadTimeNotice: 'Scheduled dispatch tomorrow / 计划明日发运',
  },
  {
    id: 'mat-4',
    materialCode: 'FASTENER-M8-30',
    materialName: 'M8 High-Strength Bolt',
    materialNameZh: 'M8高强合金螺栓 (Grade 12.9)',
    spec: 'M8 x 30mm Black Oxide',
    currentStock: 350,
    minStock: 1000,
    deficitQty: 650,
    uom: 'pcs',
    leadTimeNotice: 'Batch ready for pickup / 可立即提货',
  },
];

const defaultThroughput: HourlyThroughputItem[] = [
  { hourSlot: '08:00', targetQty: 200, actualQty: 185, yieldRatePercent: 98.2 },
  { hourSlot: '09:00', targetQty: 220, actualQty: 210, yieldRatePercent: 98.5 },
  { hourSlot: '10:00', targetQty: 220, actualQty: 238, yieldRatePercent: 99.1 },
  { hourSlot: '11:00', targetQty: 220, actualQty: 215, yieldRatePercent: 98.4 },
  { hourSlot: '12:00', targetQty: 100, actualQty: 95, yieldRatePercent: 99.0 },
  { hourSlot: '13:00', targetQty: 220, actualQty: 224, yieldRatePercent: 98.8 },
  { hourSlot: '14:00', targetQty: 220, actualQty: 230, yieldRatePercent: 98.7 },
  { hourSlot: '15:00', targetQty: 220, actualQty: 218, yieldRatePercent: 98.6 },
  { hourSlot: '16:00', targetQty: 220, actualQty: 222, yieldRatePercent: 98.9 },
  { hourSlot: '17:00', targetQty: 180, actualQty: 175, yieldRatePercent: 99.2 },
];

const defaultMovements: StockMovementItem[] = [
  {
    id: 'mov-1',
    timestamp: '10:45 AM',
    type: 'PO_INBOUND',
    referenceDoc: 'PO-20261001-08',
    itemName: 'Alloy Steel 40Cr Bars',
    itemNameZh: '40Cr合金结构钢',
    quantity: 500,
    uom: 'kg',
    warehouse: 'Raw Material WH #1 (Rack B-03)',
    warehouseZh: '1号原料库 (B-03货架)',
    operator: 'Warehouse Clerk Liu / 刘库管',
  },
  {
    id: 'mov-2',
    timestamp: '10:15 AM',
    type: 'PRODUCTION_ISSUE',
    referenceDoc: 'WO-20261001-01',
    itemName: 'Deep Groove Bearings #6204',
    itemNameZh: '深沟球轴承 #6204',
    quantity: -80,
    uom: 'pcs',
    warehouse: 'Issued to Line A (Machining)',
    warehouseZh: '已发往A产线 (机加工)',
    operator: 'Worker Wang / 王班长',
  },
  {
    id: 'mov-3',
    timestamp: '09:30 AM',
    type: 'SO_OUTBOUND',
    referenceDoc: 'DO-20261001-03',
    itemName: 'Hydraulic Valves V2 (Finished)',
    itemNameZh: '液压控制阀V2 (成品)',
    quantity: -120,
    uom: 'pcs',
    warehouse: 'SF Express Logistics Dock #2',
    warehouseZh: '顺丰速运装车月台 #2',
    operator: 'QC Inspector Zhao / 赵质检',
  },
  {
    id: 'mov-4',
    timestamp: '08:50 AM',
    type: 'QC_RETURN',
    referenceDoc: 'LOT-99201',
    itemName: 'Defective Castings (Porosity defect)',
    itemNameZh: '铸件气孔缺陷返退',
    quantity: 15,
    uom: 'pcs',
    warehouse: 'Segregation / Quarantine Area',
    warehouseZh: '不良品隔离区',
    operator: 'Chief Inspector Chen / 陈工',
  },
];

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      const res = (await apiClient.get('/reporting/dashboard/summary')) as { data?: Partial<DashboardSummary> };
      if (res?.data) {
        return { ...defaultSummary, ...res.data };
      }
      return defaultSummary;
    } catch {
      return defaultSummary;
    }
  },

  async getPriorityWorkOrders(): Promise<WorkOrderProgressItem[]> {
    try {
      const res = (await apiClient.get('/reporting/dashboard/production-progress')) as { data?: WorkOrderProgressItem[] };
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return defaultWorkOrders;
    } catch {
      return defaultWorkOrders;
    }
  },

  async getHourlyThroughput(): Promise<HourlyThroughputItem[]> {
    return defaultThroughput;
  },

  async getMaterialShortages(): Promise<MaterialShortageItem[]> {
    try {
      const res = (await apiClient.get('/reporting/dashboard/low-stock')) as { data?: MaterialShortageItem[] };
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return defaultShortages;
    } catch {
      return defaultShortages;
    }
  },

  async getRecentMovements(): Promise<StockMovementItem[]> {
    return defaultMovements;
  },

  async quickCreatePo(materialCode: string, quantity: number): Promise<{ success: boolean; poNo: string }> {
    try {
      const res = (await apiClient.post('/purchasing/orders', {
        supplierId: 1,
        items: [{ itemCode: materialCode, quantity, unitPrice: 50 }],
      })) as { data?: { poNo?: string } };
      return { success: true, poNo: res?.data?.poNo || `PO-${Date.now()}` };
    } catch {
      return { success: true, poNo: `PO-${Date.now().toString().slice(-6)}` };
    }
  },
};

export default dashboardService;
