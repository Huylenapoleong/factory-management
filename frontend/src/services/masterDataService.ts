import apiClient from './api';
import { ItemRecord, CreateItemPayload } from '@/features/items/types';
import { SupplierRecord, CreateSupplierPayload } from '@/features/suppliers/types';
import { CustomerRecord, CreateCustomerPayload } from '@/features/customers/types';

class MasterDataService {
  // ===== Items =====
  public async getItems(): Promise<ItemRecord[]> {
    try {
      const res = await apiClient.get('/items', { params: { size: 50 } });
      const responseData = (
        res as {
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
        }
      )?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((item) => ({
          id: item.id,
          itemCode: item.code,
          nameEn: item.nameEn,
          nameZh: item.nameZh || item.nameEn,
          specification: item.code,
          categoryName: item.categoryName || 'Materials',
          categoryNameZh: item.categoryName || '工业物料',
          type: item.type as ItemRecord['type'],
          uomCode: item.unitCode || 'pcs',
          minStock: Number(item.minStock || 0),
          maxStock: Number(item.minStock || 0) > 0 ? Number(item.minStock) * 5 : 0,
          safetyStock: Number(item.minStock || 0) > 0 ? Number(item.minStock) * 1.5 : 0,
          standardCost: Number(item.purchasePrice || 0),
          currency: 'USD',
          leadTimeDays: 0,
          status: (item.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as ItemRecord['status'],
          updatedAt: item.updatedAt || '',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getItemCategories(): Promise<
    Array<{ id: number; code: string; nameEn: string; nameZh?: string }>
  > {
    try {
      const res = await apiClient.get('/item-categories');
      const responseData = (
        res as {
          data?: {
            data?: Array<{ id: number; code: string; nameEn: string; nameZh?: string }>;
          };
        }
      )?.data;
      const list = responseData?.data ?? (res as { data?: unknown })?.data;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  public async getUnitsOfMeasurement(): Promise<
    Array<{ id: number; code: string; nameEn: string; nameZh?: string }>
  > {
    try {
      const res = await apiClient.get('/units-of-measurement');
      const responseData = (
        res as {
          data?: {
            data?: Array<{ id: number; code: string; nameEn: string; nameZh?: string }>;
          };
        }
      )?.data;
      const list = responseData?.data ?? (res as { data?: unknown })?.data;
      return Array.isArray(list) ? list : [];
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
        id: Number(created?.id ?? 0),
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
      const responseData = (
        res as {
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
        }
      )?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((sup) => ({
          id: sup.id,
          code: sup.code,
          name: sup.name,
          nameZh: sup.nameZh || sup.name,
          contactPerson: sup.contactPerson || '—',
          email: sup.email || '—',
          phone: sup.phone || '—',
          address: sup.address || '—',
          taxNumber: sup.taxCode || '—',
          paymentTerms: sup.paymentTerm || '—',
          ratingGrade: undefined,
          onTimeDeliveryRate: undefined,
          qualityPassRate: undefined,
          status: (sup.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as SupplierRecord['status'],
          leadTimeDays: undefined,
          updatedAt: sup.updatedAt || '',
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
        id: Number(created?.id ?? 0),
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
        onTimeDeliveryRate: undefined,
        qualityPassRate: undefined,
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
      const responseData = (
        res as {
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
        }
      )?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          nameZh: c.nameZh || c.name,
          industry: undefined,
          contactPerson: c.contactPerson || '—',
          email: c.email || '—',
          phone: c.phone || '—',
          shippingAddress: c.address || '—',
          billingAddress: c.address || '—',
          creditLimit: 0,
          currency: c.currency || 'USD',
          paymentTerms: c.paymentTerm || 'Net 30',
          activeOrdersCount: 0,
          status: (c.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as CustomerRecord['status'],
          updatedAt: c.updatedAt || '',
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
        id: Number(created?.id ?? 0),
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
