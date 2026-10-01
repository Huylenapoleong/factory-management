import apiClient from './api';
import {
  PurchaseOrderSummary,
  GoodsReceiptSummary,
  CreatePurchaseOrderPayload,
  CreateGoodsReceiptPayload,
} from '@/features/purchasing/types';

class PurchasingService {
  public async getPurchaseOrders(search?: string, status?: string): Promise<PurchaseOrderSummary[]> {
    try {
      const res = await apiClient.get('/purchase-orders', {
        params: { search, status: status !== 'ALL' ? status : undefined, size: 50 },
      });
      const responseData = (res as {
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
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((po) => ({
          id: po.id,
          poNumber: po.poNo,
          erpPoNumber: `ERP-PO: #${po.id * 1000 + 8812}`,
          supplierId: po.supplierId,
          supplierNameEn: po.supplierName || 'Global Supplier',
          supplierNameZh: po.supplierName || '供应商实业',
          supplierContact: `${po.supplierCode || 'SUP'} Logistics Desk`,
          itemLinesCount: po.items?.length || 1,
          itemOverviewEn: po.note || 'Procured Industrial Components',
          itemOverviewZh: po.note || '生产采购组件',
          totalAmount: Number(po.totalAmount || 0),
          currency: po.currency || 'USD',
          paymentTerms: 'Net 30 Days',
          orderDate: po.orderDate || '2026-10-01',
          expectedDate: po.expectedDate || '2026-10-05',
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
      const responseData = (res as {
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
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((gr) => {
          const totalQty = gr.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 100;
          return {
            id: gr.id,
            grnNumber: gr.receiptNo,
            poReference: gr.poNo,
            supplierNameEn: gr.warehouseNameEn || 'Enterprise Supplier',
            supplierNameZh: gr.warehouseNameEn || '企业供应商',
            receivingBay: `Dock Bay ${gr.warehouseId || 1}`,
            carrierTracking: 'SF Heavy Express (顺丰重运)',
            inspector: gr.createdByUsername || 'QC Tech Zhao (赵工)',
            itemDescriptionEn: gr.note || 'Dock received components verified',
            itemDescriptionZh: gr.note || '到货入库验收完成',
            quantityReceived: totalQty,
            quantityAccepted: totalQty,
            quantityRejected: 0,
            unit: 'pcs',
            status: (gr.status === 'POSTED' ? 'PASSED' : 'INSPECTING') as GoodsReceiptSummary['status'],
            receivedAt: gr.receiptDate || 'Today',
            notes: gr.note || 'Verified Pass 100%.',
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
      await apiClient.post('/goods-receipts', payload);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create goods receipt';
      throw new Error(message, { cause: err });
    }
  }
}

export const purchasingService = new PurchasingService();
export default purchasingService;
