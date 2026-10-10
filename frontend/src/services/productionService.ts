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
        return rawList.map((mo) => {
          const planned = Number(mo.plannedQuantity || 0);
          const completed = Number(mo.completedQuantity || 0);
          const pct = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;
          return {
            id: String(mo.id),
            orderNo: mo.moNo,
            productCode: mo.productCode,
            productName: mo.productNameEn || mo.productCode,
            productNameZh: mo.productNameZh || mo.productNameEn || mo.productCode,
            spec: mo.productCode,
            batchNo: mo.moNo,
            workstation: 'Standard Line',
            workstationZh: '标准产线',
            plannedQty: planned,
            completedQty: completed,
            scrapQty: Number(mo.scrapQuantity || 0),
            uom: mo.productUnitCode || 'pcs',
            currentStep: mo.status === 'COMPLETED' ? 'Completed' : 'In Production',
            currentStepZh: mo.status === 'COMPLETED' ? '已完工' : '生产中',
            stepNumber: mo.status === 'COMPLETED' ? 1 : 1,
            totalSteps: 1,
            progressPercent: pct,
            scheduledStart: mo.startDate || '',
            scheduledEnd: mo.dueDate || '',
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
          const target = Number(op.targetQuantity ?? 0);
          const completed = Number(op.completedQuantity || 0);
          return {
            id: String(op.id),
            stepCode: op.operationCode || (op.sequenceNo ? `Op ${op.sequenceNo * 10}` : ''),
            stepName: op.operationNameEn || op.operationCode || '',
            stepNameZh: op.operationNameZh || op.operationNameEn || op.operationCode || '',
            machineId: op.sequenceNo ? `Line Workstation ${op.sequenceNo}` : 'Assembly Workstation',
            workerName: 'Operator On Duty',
            workerNameZh: '当班操作员',
            targetQty: target,
            completedQty: completed,
            scrapQty: Number(op.scrapQuantity || 0),
            progressPercent: target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0,
            status: (op.status === 'COMPLETED'
              ? 'COMPLETED'
              : op.status === 'IN_PROGRESS'
                ? 'ACTIVE'
                : 'PENDING') as OperationStep['status'],
            standardHours: 0,
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
    payload: OperationReportPayload,
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

  async finishReceipt(
    orderId: string,
    quantity: number,
    warehouseId?: number,
    note?: string,
  ): Promise<{ success: boolean; lotNo: string }> {
    try {
      let targetWhId = warehouseId;
      if (!targetWhId) {
        const whRes = (await apiClient.get('/warehouses')) as {
          data?: Array<{ id: number; type: string }>;
        };
        const whList = whRes?.data || [];
        const fgWh =
          whList.find((w) => w.type === 'FINISHED_GOODS' || w.type === 'FINISHED_GOOD') ||
          whList[0];
        targetWhId = fgWh ? fgWh.id : 1;
      }
      const res = (await apiClient.post(`/production-orders/${orderId}/complete`, {
        warehouseId: targetWhId,
        completedQuantity: quantity,
        acceptedQuantity: quantity,
        note,
      })) as {
        data?: { lotNo?: string };
      };
      return { success: true, lotNo: res?.data?.lotNo || `LOT-${orderId}` };
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

  async createOrder(
    payload: CreateProductionOrderRequest,
  ): Promise<{ success: boolean; orderNo: string }> {
    try {
      if (!payload.productId) {
        throw new Error('Product ID is required to create production order');
      }
      const res = (await apiClient.post('/production-orders', {
        productId: payload.productId,
        bomId: payload.bomId,
        routingId: payload.routingId,
        plannedQuantity: payload.plannedQty,
        dueDate: payload.scheduledEnd,
      })) as { data?: { moNo?: string } };
      return { success: true, orderNo: res?.data?.moNo || '' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create production order';
      throw new Error(message, { cause: err });
    }
  },

  async cancelOrder(orderId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/production-orders/${orderId}/cancel`, {});
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel production order';
      throw new Error(message, { cause: err });
    }
  },

  async deleteOrder(orderId: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/production-orders/${orderId}`);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete production order';
      throw new Error(message, { cause: err });
    }
  },
};

export default productionService;
