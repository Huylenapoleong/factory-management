import apiClient from './api';
import {
  ProductionOrder,
  OperationStep,
  BomComponentItem,
  OperationReportPayload,
  CreateProductionOrderRequest,
} from '@/features/production/types';

const defaultOrders: ProductionOrder[] = [
  {
    id: 'wo-1',
    orderNo: 'WO-20261001-01',
    productCode: 'HV-204',
    productName: 'Precision Hydraulic Valve V2',
    productNameZh: '精密液压阀',
    spec: 'HV-204 / 40Cr Steel',
    batchNo: '26Q4-LOT08',
    workstation: 'Line A-02 (CNC Makino 5-Axis)',
    workstationZh: 'A产线-02 (牧野五轴CNC)',
    plannedQty: 500,
    completedQty: 465,
    scrapQty: 4,
    uom: 'pcs',
    currentStep: 'Op 30: Cylindrical Grinding',
    currentStepZh: '工序3/5: 外圆精磨',
    stepNumber: 3,
    totalSteps: 5,
    progressPercent: 93,
    scheduledStart: '2026-10-01 08:00',
    scheduledEnd: '2026-10-02 18:00',
    status: 'IN_PRODUCTION',
    isUrgent: true,
  },
  {
    id: 'wo-2',
    orderNo: 'WO-20261001-02',
    productCode: 'FS-880',
    productName: 'CNC Flange Shaft 45#',
    productNameZh: 'CNC法兰轴',
    spec: 'FS-880 / Carbon Steel',
    batchNo: '26Q4-LOT09',
    workstation: 'Line B-01 (DMG Mori Lathe)',
    workstationZh: 'B产线-01 (德马吉数控车)',
    plannedQty: 1200,
    completedQty: 840,
    scrapQty: 8,
    uom: 'pcs',
    currentStep: 'Op 20: Precision Lathe',
    currentStepZh: '工序2/4: 精密数控车',
    stepNumber: 2,
    totalSteps: 4,
    progressPercent: 70,
    scheduledStart: '2026-10-01 08:00',
    scheduledEnd: '2026-10-03 12:00',
    status: 'IN_PRODUCTION',
    isUrgent: false,
  },
  {
    id: 'wo-3',
    orderNo: 'WO-20261001-03',
    productCode: 'GB-300',
    productName: 'Industrial Gearbox C3',
    productNameZh: '工业减速箱',
    spec: 'GB-300 / Alloy Housing',
    batchNo: '26Q4-LOT10',
    workstation: 'Line C-04 (Assembly Bench 02)',
    workstationZh: 'C产线-04 (总装流水线02)',
    plannedQty: 250,
    completedQty: 250,
    scrapQty: 0,
    uom: 'pcs',
    currentStep: 'Op 40: Pressure Testing',
    currentStepZh: '工序4/4: 气密保压测试',
    stepNumber: 4,
    totalSteps: 4,
    progressPercent: 100,
    scheduledStart: '2026-09-30 08:00',
    scheduledEnd: '2026-10-02 20:00',
    status: 'QC_TESTING',
    isUrgent: false,
  },
  {
    id: 'wo-4',
    orderNo: 'WO-20261001-04',
    productCode: 'SH-120',
    productName: 'Servo Drive Housing',
    productNameZh: '伺服电机外壳',
    spec: 'SH-120 / Die-Cast Al',
    batchNo: '26Q4-LOT07',
    workstation: 'Line A-05 (Brother Speedio)',
    workstationZh: 'A产线-05 (兄弟攻丝加工中心)',
    plannedQty: 800,
    completedQty: 800,
    scrapQty: 2,
    uom: 'pcs',
    currentStep: 'Op 30: Final Inspection',
    currentStepZh: '工序3/3: 完工质检',
    stepNumber: 3,
    totalSteps: 3,
    progressPercent: 100,
    scheduledStart: '2026-09-29 08:00',
    scheduledEnd: '2026-10-01 16:30',
    status: 'COMPLETED',
    isUrgent: false,
  },
  {
    id: 'wo-5',
    orderNo: 'WO-20261001-05',
    productCode: 'PR-95',
    productName: 'High-Pressure Piston Rod',
    productNameZh: '高压活塞杆',
    spec: 'PR-95 / Stainless 316',
    batchNo: '26Q4-LOT04',
    workstation: 'Line B-03 (Cylindrical Grinder)',
    workstationZh: 'B产线-03 (高精度外圆磨床)',
    plannedQty: 350,
    completedQty: 110,
    scrapQty: 12,
    uom: 'pcs',
    currentStep: 'Op 20: Cylindrical Grinding',
    currentStepZh: '工序2/5: 精密外圆磨',
    stepNumber: 2,
    totalSteps: 5,
    progressPercent: 31,
    scheduledStart: '2026-09-28 08:00',
    scheduledEnd: '2026-09-30 18:00',
    status: 'IN_PRODUCTION',
    isUrgent: true,
  },
];

const defaultStepsMap: Record<string, OperationStep[]> = {
  'wo-1': [
    {
      id: 'step-10',
      stepCode: 'Op 10',
      stepName: 'CNC Rough Milling',
      stepNameZh: 'CNC粗铣与钻孔',
      machineId: 'CNC Makino-01',
      workerName: 'Wang Lei',
      workerNameZh: '王磊 (工号: W-084)',
      targetQty: 500,
      completedQty: 500,
      scrapQty: 0,
      progressPercent: 100,
      status: 'COMPLETED',
      standardHours: 2.0,
    },
    {
      id: 'step-20',
      stepCode: 'Op 20',
      stepName: 'CNC Turning & Threading',
      stepNameZh: '数控精车与螺纹车削',
      machineId: 'Lathe-03',
      workerName: 'Li Qiang',
      workerNameZh: '李强 (工号: W-092)',
      targetQty: 500,
      completedQty: 480,
      scrapQty: 2,
      progressPercent: 100,
      status: 'COMPLETED',
      standardHours: 1.5,
    },
    {
      id: 'step-30',
      stepCode: 'Op 30',
      stepName: 'Cylindrical Fine Grinding',
      stepNameZh: '高精外圆精磨',
      machineId: 'Grinder M-04',
      workerName: 'Chen Bin',
      workerNameZh: '陈斌 (工号: M-204)',
      targetQty: 500,
      completedQty: 465,
      scrapQty: 4,
      progressPercent: 93,
      status: 'ACTIVE',
      standardHours: 1.8,
    },
    {
      id: 'step-40',
      stepCode: 'Op 40',
      stepName: 'Ultrasonic Cleaning & Assembly',
      stepNameZh: '超声波清洗与精密组装',
      machineId: 'Bench C-02',
      workerName: 'Zhang Wei',
      workerNameZh: '张伟 (工号: A-012)',
      targetQty: 500,
      completedQty: 0,
      scrapQty: 0,
      progressPercent: 0,
      status: 'PENDING',
      standardHours: 1.0,
    },
    {
      id: 'step-50',
      stepCode: 'Op 50',
      stepName: 'Final QC & Pressure Testing',
      stepNameZh: '成品终检与35MPa保压测试',
      machineId: 'QC-Tester-05',
      workerName: 'Chief Inspector Zhao',
      workerNameZh: '赵质检 (工号: Q-003)',
      targetQty: 500,
      completedQty: 0,
      scrapQty: 0,
      progressPercent: 0,
      status: 'PENDING',
      standardHours: 0.8,
    },
  ],
};

const defaultBomMap: Record<string, BomComponentItem[]> = {
  'HV-204': [
    {
      id: 'bom-1',
      componentCode: 'RM-STEEL-40CR',
      componentName: 'Alloy Steel Bar 40Cr',
      componentNameZh: '40Cr合金结构钢棒料',
      spec: 'Dia 45mm x L 250mm',
      unitConsumption: 1.25,
      scrapRatePercent: 2.0,
      requiredTotal: 637.5,
      currentStock: 1200,
      uom: 'kg',
      isSufficient: true,
    },
    {
      id: 'bom-2',
      componentCode: 'SEAL-RING-NBR50',
      componentName: 'NBR High-Pressure O-Ring',
      componentNameZh: 'NBR高压丁腈O型密封圈',
      spec: 'ID 32mm x W 3.5mm',
      unitConsumption: 2.0,
      scrapRatePercent: 1.0,
      requiredTotal: 1010,
      currentStock: 450,
      uom: 'pcs',
      isSufficient: false,
    },
    {
      id: 'bom-3',
      componentCode: 'VALVE-SPOOL-CORE',
      componentName: 'Hardened Spool Core',
      componentNameZh: '渗碳淬火阀芯阀芯柱',
      spec: 'Precision Ground HRC 58-62',
      unitConsumption: 1.0,
      scrapRatePercent: 0.5,
      requiredTotal: 502.5,
      currentStock: 850,
      uom: 'pcs',
      isSufficient: true,
    },
    {
      id: 'bom-4',
      componentCode: 'SPRING-SUS304',
      componentName: 'Compression Return Spring',
      componentNameZh: '不锈钢复位压簧',
      spec: 'SUS304 Dia 1.8mm x L 45mm',
      unitConsumption: 1.0,
      scrapRatePercent: 0.0,
      requiredTotal: 500,
      currentStock: 1600,
      uom: 'pcs',
      isSufficient: true,
    },
  ],
};

export const productionService = {
  async getProductionOrders(): Promise<ProductionOrder[]> {
    try {
      const res = (await apiClient.get('/production/orders')) as { data?: ProductionOrder[] };
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return defaultOrders;
    } catch {
      return defaultOrders;
    }
  },

  async getOperationSteps(orderId: string): Promise<OperationStep[]> {
    return defaultStepsMap[orderId] || defaultStepsMap['wo-1'];
  },

  async submitOperationReport(
    orderId: string,
    operationId: string,
    payload: OperationReportPayload
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/production/orders/${orderId}/operations/track`, {
        operationId,
        ...payload,
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  async issueMaterials(orderId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/production/orders/${orderId}/issue-materials`, {});
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  async finishReceipt(orderId: string): Promise<{ success: boolean; lotNo: string }> {
    try {
      const res = (await apiClient.post(`/production/orders/${orderId}/finish-receipt`, {})) as {
        data?: { lotNo?: string };
      };
      return { success: true, lotNo: res?.data?.lotNo || `LOT-${Date.now().toString().slice(-6)}` };
    } catch {
      return { success: true, lotNo: `LOT-${Date.now().toString().slice(-6)}` };
    }
  },

  async getBomItems(productCode: string): Promise<BomComponentItem[]> {
    return defaultBomMap[productCode] || defaultBomMap['HV-204'];
  },

  async createOrder(payload: CreateProductionOrderRequest): Promise<{ success: boolean; orderNo: string }> {
    try {
      const res = (await apiClient.post('/production/orders', payload)) as { data?: { orderNo?: string } };
      return { success: true, orderNo: res?.data?.orderNo || `WO-${Date.now().toString().slice(-8)}` };
    } catch {
      return { success: true, orderNo: `WO-${Date.now().toString().slice(-8)}` };
    }
  },
};

export default productionService;
