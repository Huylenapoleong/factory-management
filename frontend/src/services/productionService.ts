import apiClient from './api';
import {
  ProductionOrder,
  OperationStep,
  BomComponentItem,
  OperationReportPayload,
  CreateProductionOrderRequest,
} from '@/features/production/types';

export const productionService = {
  async getProductionOrders(): Promise<ProductionOrder[]> {
    try {
      const res = (await apiClient.get('/production-orders', { params: { size: 50 } })) as {
        data?: {
          data?: Array<{
            id: number;
            moNo: string;
            productId: number;
            productCode: string;
            productNameEn: string;
            productNameZh?: string;
            productUnitCode?: string;
            plannedQuantity: number;
            completedQuantity: number;
            scrapQuantity?: number;
            status: string;
            startDate?: string;
            dueDate?: string;
          }>;
        };
      };
      const rawList = res?.data?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((mo, idx) => {
          const planned = Number(mo.plannedQuantity || 1);
          const completed = Number(mo.completedQuantity || 0);
          const pct = Math.min(100, Math.round((completed / planned) * 100));
          return {
            id: String(mo.id),
            orderNo: mo.moNo,
            productCode: mo.productCode,
            productName: mo.productNameEn || mo.productCode,
            productNameZh: mo.productNameZh || mo.productNameEn || mo.productCode,
            spec: `${mo.productCode} / Batch: ${mo.moNo.replace('WO-', '')}`,
            batchNo: `26Q4-LOT0${mo.id}`,
            workstation: `Line ${idx === 0 ? 'A-02 (CNC 5-Axis)' : idx === 1 ? 'B-01 (DMG Lathe)' : 'C-04 (Final Assembly)'}`,
            workstationZh: `产线 ${idx === 0 ? 'A-02 (五轴加工中心)' : idx === 1 ? 'B-01 (德马吉数控车)' : 'C-04 (总装流水线)'}`,
            plannedQty: planned,
            completedQty: completed,
            scrapQty: Number(mo.scrapQuantity || 0),
            uom: mo.productUnitCode || 'pcs',
            currentStep: mo.status === 'COMPLETED' ? 'Final QC Passed' : 'Machining & Assembly',
            currentStepZh: mo.status === 'COMPLETED' ? '完工质检合格' : '精加工与组装',
            stepNumber: mo.status === 'COMPLETED' ? 4 : 2,
            totalSteps: 4,
            progressPercent: pct,
            scheduledStart: mo.startDate || '2026-10-01 08:00',
            scheduledEnd: mo.dueDate || '2026-10-03 18:00',
            status: (mo.status === 'IN_PROGRESS'
              ? 'IN_PRODUCTION'
              : mo.status === 'COMPLETED'
              ? 'COMPLETED'
              : 'IN_PRODUCTION') as ProductionOrder['status'],
            isUrgent: mo.status === 'IN_PROGRESS' && pct < 80,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  async getOperationSteps(orderId: string): Promise<OperationStep[]> {
    try {
      const res = (await apiClient.get(`/production-orders/${orderId}`)) as {
        data?: {
          operations?: Array<{
            id: number;
            sequenceNo: number;
            operationCode: string;
            operationNameEn: string;
            operationNameZh?: string;
            targetQuantity: number;
            completedQuantity: number;
            scrapQuantity?: number;
            status: string;
          }>;
        };
      };
      const ops = res?.data?.operations;
      if (Array.isArray(ops) && ops.length > 0) {
        return ops.map((op) => {
          const target = Number(op.targetQuantity || 1);
          const completed = Number(op.completedQuantity || 0);
          return {
            id: String(op.id),
            stepCode: op.operationCode || `Op ${op.sequenceNo * 10}`,
            stepName: op.operationNameEn || op.operationCode,
            stepNameZh: op.operationNameZh || op.operationNameEn,
            machineId: `Line Workstation ${op.sequenceNo || 1}`,
            workerName: 'Operator On Duty',
            workerNameZh: '当班操作员',
            targetQty: target,
            completedQty: completed,
            scrapQty: Number(op.scrapQuantity || 0),
            progressPercent: Math.min(100, Math.round((completed / target) * 100)),
            status: (op.status === 'COMPLETED'
              ? 'COMPLETED'
              : op.status === 'IN_PROGRESS'
              ? 'ACTIVE'
              : 'PENDING') as OperationStep['status'],
            standardHours: 2.0,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  async submitOperationReport(
    _orderId: string,
    operationId: string,
    payload: OperationReportPayload
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/production-operations/${operationId}/report`, {
        completedQuantity: payload.qualifiedQty,
        scrapQuantity: payload.scrapQty,
        notes: payload.notes || payload.defectReason || '',
      });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit operation report';
      throw new Error(message, { cause: err });
    }
  },

  async issueMaterials(orderId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/production-orders/${orderId}/start`, {});
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to issue materials';
      throw new Error(message, { cause: err });
    }
  },

  async finishReceipt(orderId: string): Promise<{ success: boolean; lotNo: string }> {
    try {
      const res = (await apiClient.post(`/production-orders/${orderId}/complete`, {
        warehouseId: 3,
        completedQuantity: 100,
        acceptedQuantity: 100,
      })) as {
        data?: { lotNo?: string };
      };
      return { success: true, lotNo: res?.data?.lotNo || `LOT-${Date.now().toString().slice(-6)}` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete production order';
      throw new Error(message, { cause: err });
    }
  },

  async getBomItems(orderIdOrProductCode: string): Promise<BomComponentItem[]> {
    try {
      const res = (await apiClient.get(`/production-orders/${orderIdOrProductCode}`)) as {
        data?: {
          materials?: Array<{
            id: number;
            materialCode: string;
            materialNameEn: string;
            materialUnitCode?: string;
            requiredQuantity: number;
            issuedQuantity: number;
            remainingQuantity: number;
          }>;
        };
      };
      const mats = res?.data?.materials;
      if (Array.isArray(mats) && mats.length > 0) {
        return mats.map((mat) => ({
          id: String(mat.id),
          componentCode: mat.materialCode,
          componentName: mat.materialNameEn,
          componentNameZh: mat.materialNameEn,
          spec: `${mat.materialCode} Industrial Grade`,
          unitConsumption: 1.0,
          scrapRatePercent: 0.0,
          requiredTotal: Number(mat.requiredQuantity || 0),
          currentStock: Number(mat.remainingQuantity || mat.requiredQuantity || 0),
          uom: mat.materialUnitCode || 'pcs',
          isSufficient: Number(mat.remainingQuantity || 0) <= 0,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async createOrder(payload: CreateProductionOrderRequest): Promise<{ success: boolean; orderNo: string }> {
    try {
      const res = (await apiClient.post('/production-orders', {
        productId: 6, // default finished valve
        bomId: 1,
        routingId: 1,
        plannedQuantity: payload.plannedQty,
        dueDate: payload.scheduledEnd,
      })) as { data?: { moNo?: string } };
      return { success: true, orderNo: res?.data?.moNo || `WO-${Date.now().toString().slice(-8)}` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create production order';
      throw new Error(message, { cause: err });
    }
  },
};

export default productionService;
