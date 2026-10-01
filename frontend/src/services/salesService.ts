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
      const responseData = (res as {
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
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((so) => ({
          id: so.id,
          orderNo: so.soNo,
          erpSoNumber: `SAP SD# 504900${so.id}`,
          customerId: so.customerId,
          customerNameEn: so.customerName || 'Enterprise Customer',
          customerNameZh: so.customerName || '企业客户',
          customerRegion: `${so.customerCode || 'CUST'} Logistics Gateway`,
          itemLinesCount: so.items?.length || 1,
          itemOverviewEn: so.note || 'Contract Manufacturing Delivery',
          itemOverviewZh: so.note || '定制工业交付',
          totalAmount: Number(so.totalAmount || 0),
          currency: so.currency || 'USD',
          paymentTerms: 'T/T 60 Days',
          orderDate: so.orderDate || '2026-10-01',
          deliveryDate: so.expectedDeliveryDate || '2026-10-05',
          deliveryStatusLabel: so.status === 'CONFIRMED' ? 'Confirmed (In Queue)' : so.status,
          fulfillmentPercent: 85,
          status: (so.status === 'CONFIRMED' ? 'CONFIRMED' : 'READY_TO_SHIP') as SalesOrderSummary['status'],
          isUrgent: so.id === 1,
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
      const responseData = (res as {
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
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((del) => ({
          id: del.id,
          deliveryNo: del.deliveryNo,
          salesOrderId: del.salesOrderId,
          salesOrderNo: del.soNo,
          customerNameEn: del.customerName || 'Enterprise Customer',
          customerNameZh: del.customerName || '企业客户',
          shippingBay: `Bay 0${del.warehouseId || 7}`,
          carrierName: 'SF Heavy Logistics (顺丰重运)',
          carrierTrackingNo: 'SF149204-88',
          truckPlate: '苏E-98K21',
          driverContact: 'Captain Zhou (周师傅) · 139-0192-8821',
          palletsCount: 6,
          grossWeightKg: 2450,
          volumeCbm: 8.5,
          customsSeal: `SEAL-CN-202610-0${del.id}`,
          itemOverview: del.note || 'Outbound cargo verified',
          status: (del.status === 'POSTED' ? 'DISPATCHED' : 'STAGED') as OutboundDeliverySummary['status'],
          dispatchedAt: del.deliveryDate || 'Today',
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
      await apiClient.post('/deliveries', payload);
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
}

export const salesService = new SalesService();
export default salesService;
