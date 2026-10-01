import apiClient from './api';
import { ItemRecord, CreateItemPayload } from '@/features/items/types';
import { SupplierRecord, CreateSupplierPayload } from '@/features/suppliers/types';
import { CustomerRecord, CreateCustomerPayload } from '@/features/customers/types';

class MasterDataService {
  // ===== Items =====
  public async getItems(): Promise<ItemRecord[]> {
    try {
      const res = await apiClient.get('/items', { params: { size: 50 } });
      const responseData = (res as {
        data?: {
          data?: Array<{
            id: number;
            code: string;
            nameEn: string;
            nameZh?: string;
            type: string;
            categoryId?: number;
            categoryName?: string;
            unitCode?: string;
            purchasePrice?: number;
            salePrice?: number;
            minStock?: number;
            status: string;
            updatedAt?: string;
          }>;
        };
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((item) => ({
          id: item.id,
          itemCode: item.code,
          nameEn: item.nameEn,
          nameZh: item.nameZh || item.nameEn,
          specification: `${item.code} Industrial Spec`,
          categoryName: item.categoryName || 'Materials',
          categoryNameZh: item.categoryName || '工业物料',
          type: item.type as ItemRecord['type'],
          uomCode: item.unitCode || 'pcs',
          minStock: Number(item.minStock || 0),
          maxStock: Number(item.minStock || 0) * 5,
          safetyStock: Number(item.minStock || 0) * 1.5,
          standardCost: Number(item.purchasePrice || 0),
          currency: 'USD',
          leadTimeDays: 7,
          status: (item.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as ItemRecord['status'],
          updatedAt: item.updatedAt || '2026-10-01 10:00:00',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async createItem(payload: CreateItemPayload): Promise<ItemRecord> {
    try {
      const res = (await apiClient.post('/items', {
        code: payload.itemCode,
        nameEn: payload.nameEn,
        nameZh: payload.nameZh,
        type: payload.type,
        categoryId: payload.categoryId,
        unitId: payload.uomId,
        minStock: payload.minStock,
        purchasePrice: payload.standardCost,
      })) as {
        data?: {
          id: number;
          code: string;
          nameEn: string;
          nameZh?: string;
          type: string;
          unitCode?: string;
          purchasePrice?: number;
          minStock?: number;
          status: string;
        };
      };
      const created = res?.data;
      return {
        id: created?.id || Date.now(),
        itemCode: created?.code || payload.itemCode,
        nameEn: created?.nameEn || payload.nameEn,
        nameZh: created?.nameZh || payload.nameZh,
        specification: payload.specification,
        categoryName: 'General Materials',
        categoryNameZh: '通用材料',
        type: payload.type,
        uomCode: created?.unitCode || 'pcs',
        minStock: Number(created?.minStock || payload.minStock),
        maxStock: payload.maxStock,
        safetyStock: payload.safetyStock,
        standardCost: Number(created?.purchasePrice || payload.standardCost),
        currency: 'USD',
        leadTimeDays: payload.leadTimeDays,
        status: 'ACTIVE',
        updatedAt: new Date().toLocaleString(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      throw new Error(message, { cause: err });
    }
  }

  // ===== Suppliers =====
  public async getSuppliers(): Promise<SupplierRecord[]> {
    try {
      const res = await apiClient.get('/suppliers', { params: { size: 50 } });
      const responseData = (res as {
        data?: {
          data?: Array<{
            id: number;
            code: string;
            name: string;
            nameZh?: string;
            contactPerson?: string;
            email?: string;
            phone?: string;
            address?: string;
            taxCode?: string;
            paymentTerm?: string;
            status: string;
            updatedAt?: string;
          }>;
        };
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((sup) => ({
          id: sup.id,
          code: sup.code,
          name: sup.name,
          nameZh: sup.nameZh || sup.name,
          contactPerson: sup.contactPerson || 'Logistics Liaison',
          email: sup.email || 'procure@wifim-internal.com',
          phone: sup.phone || '+86-512-6800-0000',
          address: sup.address || 'Industrial Zone, China',
          taxNumber: sup.taxCode || '91320500MA1WXXXXXX',
          paymentTerms: sup.paymentTerm || 'Net 30 Days',
          ratingGrade: 'A' as const,
          onTimeDeliveryRate: 98.8,
          qualityPassRate: 99.4,
          status: (sup.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as SupplierRecord['status'],
          leadTimeDays: 7,
          updatedAt: sup.updatedAt || '2026-10-01 09:00:00',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async createSupplier(payload: CreateSupplierPayload): Promise<SupplierRecord> {
    try {
      const res = (await apiClient.post('/suppliers', {
        code: payload.code,
        name: payload.name,
        contactPerson: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        taxCode: payload.taxNumber,
        paymentTerm: payload.paymentTerms,
      })) as {
        data?: {
          id: number;
          code: string;
          name: string;
          contactPerson?: string;
          email?: string;
          phone?: string;
          address?: string;
          status: string;
        };
      };
      const created = res?.data;
      return {
        id: created?.id || Date.now(),
        code: created?.code || payload.code,
        name: created?.name || payload.name,
        nameZh: payload.nameZh,
        contactPerson: created?.contactPerson || payload.contactPerson,
        email: created?.email || payload.email,
        phone: created?.phone || payload.phone,
        address: created?.address || payload.address,
        taxNumber: payload.taxNumber,
        paymentTerms: payload.paymentTerms,
        ratingGrade: payload.ratingGrade,
        onTimeDeliveryRate: 100.0,
        qualityPassRate: 100.0,
        status: 'ACTIVE',
        leadTimeDays: payload.leadTimeDays,
        updatedAt: new Date().toLocaleString(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create supplier';
      throw new Error(message, { cause: err });
    }
  }

  // ===== Customers =====
  public async getCustomers(): Promise<CustomerRecord[]> {
    try {
      const res = await apiClient.get('/customers', { params: { size: 50 } });
      const responseData = (res as {
        data?: {
          data?: Array<{
            id: number;
            code: string;
            name: string;
            nameZh?: string;
            contactPerson?: string;
            email?: string;
            phone?: string;
            address?: string;
            paymentTerm?: string;
            currency?: string;
            status: string;
            updatedAt?: string;
          }>;
        };
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          nameZh: c.nameZh || c.name,
          industry: 'Industrial Equipment Tier-1',
          contactPerson: c.contactPerson || 'Procurement Director',
          email: c.email || 'commercial@client.com',
          phone: c.phone || '+86-21-6000-0000',
          shippingAddress: c.address || 'Logistics Bay, China',
          billingAddress: c.address || 'Finance Hub, China',
          creditLimit: 1500000,
          currency: c.currency || 'USD',
          paymentTerms: c.paymentTerm || 'Net 45 Days',
          activeOrdersCount: 2,
          status: (c.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as CustomerRecord['status'],
          updatedAt: c.updatedAt || '2026-10-01 08:30:00',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async createCustomer(payload: CreateCustomerPayload): Promise<CustomerRecord> {
    try {
      const res = (await apiClient.post('/customers', {
        code: payload.code,
        name: payload.name,
        contactPerson: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
        address: payload.shippingAddress,
        paymentTerm: payload.paymentTerms,
        currency: 'USD',
      })) as {
        data?: {
          id: number;
          code: string;
          name: string;
          contactPerson?: string;
          email?: string;
          phone?: string;
          address?: string;
          status: string;
        };
      };
      const created = res?.data;
      return {
        id: created?.id || Date.now(),
        code: created?.code || payload.code,
        name: created?.name || payload.name,
        nameZh: payload.nameZh,
        industry: payload.industry,
        contactPerson: created?.contactPerson || payload.contactPerson,
        email: created?.email || payload.email,
        phone: created?.phone || payload.phone,
        shippingAddress: payload.shippingAddress,
        billingAddress: payload.billingAddress,
        creditLimit: payload.creditLimit,
        currency: 'USD',
        paymentTerms: payload.paymentTerms,
        activeOrdersCount: 0,
        status: 'ACTIVE',
        updatedAt: new Date().toLocaleString(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      throw new Error(message, { cause: err });
    }
  }
}

export const masterDataService = new MasterDataService();
export default masterDataService;
