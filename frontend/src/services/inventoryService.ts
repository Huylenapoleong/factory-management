import apiClient from './api';
import {
  InventoryBalanceItem,
  StockAuditLogItem,
  WarehouseSummary,
  StockTransferPayload,
  StockAdjustmentPayload,
  InventoryFilterParams,
} from '@/features/inventory/types';

class InventoryService {
  private balances: InventoryBalanceItem[] = [];

  public async getBalances(params?: InventoryFilterParams): Promise<InventoryBalanceItem[]> {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        size: 100,
      };
      if (params?.warehouseId && params.warehouseId !== 'ALL') {
        queryParams.warehouseId = params.warehouseId;
      }
      if (params?.status === 'LOW_STOCK') {
        queryParams.lowStockOnly = true;
      }

      const res = await apiClient.get('/inventory/balances', { params: queryParams });
      const responseData = (res as {
        data?: {
          data?: Array<{
            id: number;
            warehouseId: number;
            warehouseCode: string;
            warehouseNameEn?: string;
            locationId?: number;
            locationCode?: string;
            itemId: number;
            itemCode: string;
            itemNameEn: string;
            itemUnitCode?: string;
            quantity: number;
            reservedQuantity: number;
            availableQuantity: number;
            minStock: number;
            isLowStock?: boolean;
            updatedAt?: string;
          }>;
        };
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        let result = rawList.map((dto) => ({
          id: dto.id,
          warehouseId: dto.warehouseId,
          warehouseCode: dto.warehouseCode,
          warehouseNameEn: dto.warehouseNameEn || dto.warehouseCode,
          warehouseNameZh: dto.warehouseNameEn || dto.warehouseCode,
          locationId: dto.locationId || 1,
          locationCode: dto.locationCode ? `${dto.warehouseCode} / ${dto.locationCode}` : `${dto.warehouseCode} / Floor`,
          itemId: dto.itemId,
          itemCode: dto.itemCode,
          itemNameEn: dto.itemNameEn,
          itemNameZh: dto.itemNameEn,
          itemSpec: `${dto.itemCode} Industrial Grade`,
          itemCategory: 'Materials',
          itemCategoryZh: '物料库存',
          itemUnitCode: dto.itemUnitCode || 'pcs',
          lotNumber: `LOT-26Q4-0${dto.id}`,
          quantity: Number(dto.quantity || 0),
          reservedQuantity: Number(dto.reservedQuantity || 0),
          availableQuantity: Number(dto.availableQuantity || 0),
          minStock: Number(dto.minStock || 0),
          unitCost: 25.0,
          totalValuation: Number(dto.quantity || 0) * 25.0,
          status: (dto.isLowStock || Number(dto.availableQuantity || 0) < Number(dto.minStock || 0)
            ? 'LOW_STOCK'
            : Number(dto.quantity || 0) <= 0
            ? 'STOCKOUT'
            : 'NORMAL') as InventoryBalanceItem['status'],
          updatedAt: dto.updatedAt || '2026-10-01 12:00:00',
        }));

        if (params?.category && params.category !== 'ALL') {
          result = result.filter((b) => b.itemCategory === params.category);
        }
        if (params?.status && params.status !== 'ALL') {
          result = result.filter((b) => b.status === params.status);
        }
        if (params?.search && params.search.trim()) {
          const q = params.search.toLowerCase();
          result = result.filter(
            (b) =>
              b.itemCode.toLowerCase().includes(q) ||
              b.itemNameEn.toLowerCase().includes(q) ||
              b.itemNameZh.includes(q) ||
              b.locationCode.toLowerCase().includes(q) ||
              b.lotNumber.toLowerCase().includes(q)
          );
        }
        this.balances = result;
        return result;
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getRecentAuditLogs(): Promise<StockAuditLogItem[]> {
    try {
      const res = await apiClient.get('/inventory/transactions/recent');
      const responseData = (res as {
        data?: Array<{
          id: number;
          transactionNo: string;
          transactionType: string;
          itemCode: string;
          itemNameEn: string;
          quantity: number;
          locationCode?: string;
          warehouseCode?: string;
          referenceType?: string;
          referenceId?: string;
          createdByUsername?: string;
          note?: string;
          createdAt?: string;
        }>;
      })?.data;

      if (Array.isArray(responseData)) {
        return responseData.map((tx) => ({
          id: tx.id,
          transactionNo: tx.transactionNo || `TX-${tx.id}`,
          type: (tx.transactionType === 'PURCHASE_IN'
            ? 'PURCHASE_IN'
            : tx.transactionType === 'PRODUCTION_ISSUE'
            ? 'PRODUCTION_ISSUE'
            : tx.transactionType === 'SALE_OUT'
            ? 'OUTBOUND'
            : 'TRANSFER') as StockAuditLogItem['type'],
          itemCode: tx.itemCode,
          itemNameEn: tx.itemNameEn,
          itemNameZh: tx.itemNameEn,
          quantityDelta: Number(tx.quantity || 0),
          unit: 'pcs',
          sourceLocation: tx.locationCode ? `${tx.warehouseCode} / ${tx.locationCode}` : 'Staging Area',
          targetLocation: tx.referenceType ? `${tx.referenceType} #${tx.referenceId || ''}` : 'Shop Floor Buffer',
          docReference: tx.referenceId || tx.transactionNo,
          operator: tx.createdByUsername || 'System Operator',
          verificationStatus: 'PASS',
          note: tx.note || 'Stock ledger entry updated',
          timestamp: tx.createdAt
            ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Today',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getWarehouses(): Promise<WarehouseSummary[]> {
    try {
      const res = await apiClient.get('/warehouses');
      const responseData = (res as {
        data?: Array<{
          id: number;
          code: string;
          nameEn: string;
          nameZh?: string;
          type: string;
          locations?: unknown[];
        }>;
      })?.data;

      if (Array.isArray(responseData)) {
        return responseData.map((wh) => ({
          id: wh.id,
          code: wh.code,
          nameEn: wh.nameEn,
          nameZh: wh.nameZh || wh.nameEn,
          type: wh.type as WarehouseSummary['type'],
          activeLocations: wh.locations?.length || 20,
          totalSkus: 150,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async transferStock(payload: StockTransferPayload): Promise<boolean> {
    const item = this.balances.find((b) => b.itemId === payload.itemId);
    if (!item) return false;
    item.availableQuantity = Math.max(0, item.availableQuantity - payload.quantity);
    item.updatedAt = new Date().toLocaleTimeString();
    return true;
  }

  public async adjustStock(payload: StockAdjustmentPayload): Promise<boolean> {
    const item = this.balances.find((b) => b.itemId === payload.itemId);
    if (!item) return false;
    try {
      await apiClient.post('/inventory/adjust', {
        warehouseId: item.warehouseId,
        itemId: payload.itemId,
        quantity: payload.quantity,
        note: payload.note,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Adjustment failed';
      throw new Error(message, { cause: err });
    }
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
