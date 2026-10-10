import apiClient from './api';
import {
  DashboardSummary,
  WorkOrderProgressItem,
  MaterialShortageItem,
  HourlyThroughputItem,
  StockMovementItem,
} from '@/features/dashboard/types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      const res = (await apiClient.get('/dashboard/summary')) as {
        data?: {
          totalItems?: number;
          activeProductionOrders?: number;
          pendingPurchaseOrders?: number;
          openSalesOrders?: number;
          lowStockAlerts?: number;
          totalWarehouses?: number;
          totalSuppliers?: number;
          totalCustomers?: number;
        };
      };
      const d = res?.data;
      let completionRate = 0;
      try {
        const progRes = (await apiClient.get('/dashboard/production-progress')) as {
          data?: Array<{ plannedQuantity?: number; completedQuantity?: number }>;
        };
        const items = progRes?.data || [];
        const plannedSum = items.reduce((s, i) => s + Number(i.plannedQuantity || 0), 0);
        const completedSum = items.reduce((s, i) => s + Number(i.completedQuantity || 0), 0);
        if (plannedSum > 0) {
          completionRate = Math.min(100, Math.round((completedSum / plannedSum) * 100));
        }
      } catch {
        // default 0
      }

      return {
        totalInventoryItems: d?.totalItems ?? 0,
        pendingPurchaseOrders: d?.pendingPurchaseOrders ?? 0,
        activeProductionOrders: d?.activeProductionOrders ?? 0,
        openSalesOrders: d?.openSalesOrders ?? 0,
        dailyPlanCompletionRate: completionRate,
        activeOrdersNearDeadline: 0,
        lowStockItemsCount: d?.lowStockAlerts ?? 0,
        dispatchedSalesOrdersToday: 0,
      };
    } catch {
      return {
        totalInventoryItems: 0,
        pendingPurchaseOrders: 0,
        activeProductionOrders: 0,
        openSalesOrders: 0,
        dailyPlanCompletionRate: 0,
        activeOrdersNearDeadline: 0,
        lowStockItemsCount: 0,
        dispatchedSalesOrdersToday: 0,
      };
    }
  },

  async getPriorityWorkOrders(): Promise<WorkOrderProgressItem[]> {
    try {
      const res = (await apiClient.get('/dashboard/production-progress')) as {
        data?: Array<{
          moId: number;
          moNo: string;
          productCode: string;
          productName: string;
          plannedQuantity: number;
          completedQuantity: number;
          progressPercentage: number;
          status: string;
          dueDate?: string;
        }>;
      };
      const list = res?.data;
      if (Array.isArray(list)) {
        return list.map((item, idx) => ({
          id: String(item.moId || idx + 1),
          woNo: item.moNo,
          productCode: item.productCode,
          productName: item.productName || item.productCode,
          productNameZh: item.productName || item.productCode,
          spec: `${item.productCode} / Batch: ${item.moNo.replace('WO-', '')}`,
          workstation: `Line ${idx + 1}`,
          workstationZh: `产线-0${idx + 1}`,
          plannedQty: Number(item.plannedQuantity || 0),
          completedQty: Number(item.completedQuantity || 0),
          progressPercent: Math.round(Number(item.progressPercentage || 0)),
          status: (item.status === 'IN_PROGRESS'
            ? 'IN_PRODUCTION'
            : item.status === 'COMPLETED'
              ? 'COMPLETED'
              : 'IN_PRODUCTION') as WorkOrderProgressItem['status'],
          uom: 'pcs',
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async getHourlyThroughput(): Promise<HourlyThroughputItem[]> {
    // Only return records if real hourly telemetry has been recorded
    return [];
  },

  async getMaterialShortages(): Promise<MaterialShortageItem[]> {
    try {
      const res = (await apiClient.get('/dashboard/low-stock')) as {
        data?: Array<{
          id: number;
          itemCode: string;
          itemNameEn: string;
          itemNameZh?: string;
          quantity: number;
          minStock: number;
          itemUnitCode?: string;
        }>;
      };
      const list = res?.data;
      if (Array.isArray(list)) {
        return list.map((item) => ({
          id: String(item.id),
          materialCode: item.itemCode,
          materialName: item.itemNameEn,
          materialNameZh: item.itemNameZh || item.itemNameEn,
          spec: `${item.itemCode} Industrial Grade`,
          currentStock: Number(item.quantity || 0),
          minStock: Number(item.minStock || 0),
          deficitQty: Math.max(0, Number(item.minStock || 0) - Number(item.quantity || 0)),
          uom: item.itemUnitCode || 'pcs',
          leadTimeNotice: `Below safety threshold: ${Number(item.quantity || 0)} / ${Number(item.minStock || 0)} ${item.itemUnitCode || 'pcs'}`,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async getRecentMovements(): Promise<StockMovementItem[]> {
    try {
      const res = (await apiClient.get('/dashboard/recent-transactions')) as {
        data?: Array<{
          id: number;
          transactionNo: string;
          transactionType: string;
          itemCode: string;
          itemNameEn: string;
          quantity: number;
          warehouseCode?: string;
          createdByUsername?: string;
          createdAt?: string;
          referenceId?: string;
        }>;
      };
      const list = res?.data;
      if (Array.isArray(list)) {
        return list.map((tx) => ({
          id: String(tx.id),
          timestamp: tx.createdAt
            ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Today',
          type:
            tx.transactionType === 'PURCHASE_IN'
              ? 'PO_INBOUND'
              : tx.transactionType === 'SALE_OUT'
                ? 'SO_OUTBOUND'
                : tx.transactionType === 'PRODUCTION_ISSUE'
                  ? 'PRODUCTION_ISSUE'
                  : 'QC_RETURN',
          referenceDoc: tx.transactionNo || tx.referenceId || 'TX-DOC',
          itemName: tx.itemNameEn || tx.itemCode,
          itemNameZh: tx.itemNameEn || tx.itemCode,
          quantity: Number(tx.quantity || 0),
          uom: 'pcs',
          warehouse: tx.warehouseCode || 'Main Logistics Hub',
          warehouseZh: tx.warehouseCode || '主生产物流仓',
          operator: tx.createdByUsername || 'System Operator',
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async quickCreatePo(
    itemId: number,
    quantity: number,
    supplierId?: number,
    unitPrice = 0,
  ): Promise<{ success: boolean; poNo: string }> {
    try {
      let targetSupplierId = supplierId;
      if (!targetSupplierId) {
        const suppliersRes = (await apiClient.get('/suppliers', { params: { size: 1 } })) as {
          data?: { data?: Array<{ id: number }> };
        };
        const defaultSupplierId = suppliersRes?.data?.data?.[0]?.id;
        if (!defaultSupplierId) {
          throw new Error('No supplier available to create purchase order');
        }
        targetSupplierId = defaultSupplierId;
      }
      const res = (await apiClient.post('/purchase-orders', {
        supplierId: targetSupplierId,
        orderDate: new Date().toISOString().split('T')[0],
        items: [{ itemId, quantity, unitPrice }],
      })) as { data?: { poNo?: string } };
      return { success: true, poNo: res?.data?.poNo || '' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create PO';
      throw new Error(message, { cause: err });
    }
  },
};

export default dashboardService;
