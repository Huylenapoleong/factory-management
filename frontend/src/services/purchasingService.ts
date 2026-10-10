import apiClient from './api';
import {
  PurchaseOrderSummary,
  GoodsReceiptSummary,
  CreatePurchaseOrderPayload,
  CreateGoodsReceiptPayload,
} from '@/features/purchasing/types';

class PurchasingService {
  public async getPurchaseOrders(
    search?: string,
    status?: string,
  ): Promise<PurchaseOrderSummary[]> {
    try {
      const res = await apiClient.get('/purchase-orders', {
        params: { search, status: status !== 'ALL' ? status : undefined, size: 50 },
      });
      const responseData = (
        res as {
          data?: {
            data?: Array<{
              id: number;
              poNo: string;
              supplierId: number;
              supplierCode?: string;
              supplierName?: string;
              orderDate?: string;
              expectedDate?: string;
              status: string;
              currency?: string;
              totalAmount?: number;
              note?: string;
              items?: Array<{ quantity: number }>;
            }>;
          };
        }
      )?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((po) => ({
          id: po.id,
          poNumber: po.poNo,
          erpPoNumber: po.poNo,
          supplierId: po.supplierId,
          supplierNameEn: po.supplierName || '—',
          supplierNameZh: po.supplierName || '—',
          supplierContact: po.supplierCode ? `SUP-${po.supplierCode}` : '—',
          itemLinesCount: po.items?.length ?? 0,
          itemOverviewEn: po.note || '—',
          itemOverviewZh: po.note || '—',
          totalAmount: Number(po.totalAmount || 0),
          currency: po.currency || 'USD',
          paymentTerms: '—',
          orderDate: po.orderDate || '',
          expectedDate: po.expectedDate || '',
          status: (po.status === 'CONFIRMED'
            ? 'CONFIRMED'
            : po.status === 'COMPLETED'
              ? 'RECEIVED'
              : 'INBOUND_INSPECTING') as PurchaseOrderSummary['status'],
          isUrgent: po.status === 'CONFIRMED',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getGoodsReceipts(): Promise<GoodsReceiptSummary[]> {
    try {
      const res = await apiClient.get('/goods-receipts', { params: { size: 50 } });
      const responseData = (
        res as {
          data?: {
            data?: Array<{
              id: number;
              receiptNo: string;
              purchaseOrderId: number;
              poNo: string;
              warehouseId: number;
              warehouseCode?: string;
              warehouseNameEn?: string;
              receiptDate?: string;
              status: string;
              note?: string;
              createdByUsername?: string;
              items?: Array<{ quantity: number }>;
            }>;
          };
        }
      )?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((gr) => {
          const totalQty = gr.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0;
          return {
            id: gr.id,
            grnNumber: gr.receiptNo,
            poReference: gr.poNo,
            supplierNameEn: gr.warehouseNameEn || '—',
            supplierNameZh: gr.warehouseNameEn || '—',
            receivingBay: gr.warehouseCode ? `WH-${gr.warehouseCode}` : '—',
            carrierTracking: '—',
            inspector: gr.createdByUsername || '—',
            itemDescriptionEn: gr.note || '—',
            itemDescriptionZh: gr.note || '—',
            quantityReceived: totalQty,
            quantityAccepted: totalQty,
            quantityRejected: 0,
            unit: 'pcs',
            status: (gr.status === 'POSTED'
              ? 'PASSED'
              : 'INSPECTING') as GoodsReceiptSummary['status'],
            receivedAt: gr.receiptDate || '',
            notes: gr.note || '',
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  }

  public async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<boolean> {
    try {
      await apiClient.post('/purchase-orders', payload);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create purchase order';
      throw new Error(message, { cause: err });
    }
  }

  public async confirmPurchaseOrder(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/purchase-orders/${id}/confirm`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to confirm purchase order';
      throw new Error(message, { cause: err });
    }
  }

  public async postGoodsReceipt(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/goods-receipts/${id}/post`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to post goods receipt';
      throw new Error(message, { cause: err });
    }
  }

  public async createGoodsReceipt(payload: CreateGoodsReceiptPayload): Promise<boolean> {
    try {
      const body = {
        purchaseOrderId: payload.purchaseOrderId,
        warehouseId: payload.warehouseId,
        receiptDate: payload.receiptDate || new Date().toISOString().split('T')[0],
        note:
          payload.note ||
          [payload.receivingBay, payload.carrierTracking].filter(Boolean).join(' | ') ||
          undefined,
        items: payload.items,
      };
      await apiClient.post('/goods-receipts', body);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create goods receipt';
      throw new Error(message, { cause: err });
    }
  }

  public async cancelGoodsReceipt(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/goods-receipts/${id}/cancel`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel goods receipt';
      throw new Error(message, { cause: err });
    }
  }
}

export const purchasingService = new PurchasingService();
export default purchasingService;
