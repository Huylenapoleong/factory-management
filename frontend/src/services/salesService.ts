import apiClient from './api';
import {
  SalesOrderSummary,
  OutboundDeliverySummary,
  CreateSalesOrderPayload,
  CreateDeliveryPayload,
} from '@/features/sales/types';

class SalesService {
  public async getSalesOrders(search?: string, status?: string): Promise<SalesOrderSummary[]> {
    try {
      const res = await apiClient.get('/sales-orders', {
        params: { search, status: status !== 'ALL' ? status : undefined, size: 50 },
      });
      const responseData = (
        res as {
          data?: {
            data?: Array<{
              id: number;
              soNo: string;
              customerId: number;
              customerCode?: string;
              customerName?: string;
              orderDate?: string;
              expectedDeliveryDate?: string;
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
        return rawList.map((so) => ({
          id: so.id,
          orderNo: so.soNo,
          erpSoNumber: so.soNo,
          customerId: so.customerId,
          customerNameEn: so.customerName || '—',
          customerNameZh: so.customerName || '—',
          customerRegion: so.customerCode ? `CUST-${so.customerCode}` : '—',
          itemLinesCount: so.items?.length ?? 0,
          itemOverviewEn: so.note || '—',
          itemOverviewZh: so.note || '—',
          totalAmount: Number(so.totalAmount || 0),
          currency: so.currency || 'USD',
          paymentTerms: '—',
          orderDate: so.orderDate || '',
          deliveryDate: so.expectedDeliveryDate || '',
          deliveryStatusLabel: so.status === 'CONFIRMED' ? 'Confirmed' : so.status,
          fulfillmentPercent: 0,
          status: (so.status === 'CONFIRMED'
            ? 'CONFIRMED'
            : 'READY_TO_SHIP') as SalesOrderSummary['status'],
          isUrgent: false,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getDeliveries(): Promise<OutboundDeliverySummary[]> {
    try {
      const res = await apiClient.get('/deliveries', { params: { size: 50 } });
      const responseData = (
        res as {
          data?: {
            data?: Array<{
              id: number;
              deliveryNo: string;
              salesOrderId: number;
              soNo: string;
              customerId: number;
              customerName?: string;
              warehouseId: number;
              warehouseCode?: string;
              warehouseNameEn?: string;
              deliveryDate?: string;
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
        return rawList.map((del) => ({
          id: del.id,
          deliveryNo: del.deliveryNo,
          salesOrderId: del.salesOrderId,
          salesOrderNo: del.soNo,
          customerNameEn: del.customerName || '—',
          customerNameZh: del.customerName || '—',
          shippingBay: del.warehouseCode ? `WH-${del.warehouseCode}` : '—',
          carrierName: '—',
          carrierTrackingNo: '—',
          truckPlate: '—',
          driverContact: '—',
          palletsCount: 0,
          grossWeightKg: 0,
          volumeCbm: 0,
          customsSeal: '',
          itemOverview: del.note || '—',
          status: (del.status === 'POSTED'
            ? 'DISPATCHED'
            : 'STAGED') as OutboundDeliverySummary['status'],
          dispatchedAt: del.deliveryDate || '',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async createSalesOrder(payload: CreateSalesOrderPayload): Promise<boolean> {
    try {
      await apiClient.post('/sales-orders', payload);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create sales order';
      throw new Error(message, { cause: err });
    }
  }

  public async confirmSalesOrder(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/sales-orders/${id}/confirm`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to confirm sales order';
      throw new Error(message, { cause: err });
    }
  }

  public async createDelivery(payload: CreateDeliveryPayload): Promise<boolean> {
    try {
      const noteDetails = [
        payload.shippingBay,
        payload.carrierName,
        payload.carrierTrackingNo ? `Tracking: ${payload.carrierTrackingNo}` : undefined,
        payload.truckPlate ? `Plate: ${payload.truckPlate}` : undefined,
        payload.driverContact ? `Driver: ${payload.driverContact}` : undefined,
        payload.note,
      ]
        .filter(Boolean)
        .join(' | ');

      const body = {
        salesOrderId: payload.salesOrderId,
        warehouseId: payload.warehouseId,
        deliveryDate: payload.deliveryDate || new Date().toISOString().split('T')[0],
        note: noteDetails || undefined,
        items: payload.items,
      };
      await apiClient.post('/deliveries', body);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create delivery order';
      throw new Error(message, { cause: err });
    }
  }

  public async postDispatch(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/deliveries/${id}/post`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to post delivery dispatch';
      throw new Error(message, { cause: err });
    }
  }

  public async cancelDelivery(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/deliveries/${id}/cancel`);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel delivery';
      throw new Error(message, { cause: err });
    }
  }
}

export const salesService = new SalesService();
export default salesService;
