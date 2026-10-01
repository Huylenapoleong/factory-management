import apiClient from './api';
import { ItemRecord, CreateItemPayload } from '@/features/items/types';
import { SupplierRecord, CreateSupplierPayload } from '@/features/suppliers/types';
import { CustomerRecord, CreateCustomerPayload } from '@/features/customers/types';

// Default Master Data - Items
const defaultItems: ItemRecord[] = [
  {
    id: 1001,
    itemCode: 'RM-STEEL-304',
    nameEn: '304 Stainless Steel Round Bar',
    nameZh: '304不锈钢圆钢棒材',
    specification: 'Ø25mm × 3000mm | Hot Rolled Grade A',
    categoryName: 'Raw Alloys',
    categoryNameZh: '特种合金',
    type: 'RAW_MATERIAL',
    uomCode: 'kg',
    minStock: 800,
    maxStock: 5000,
    safetyStock: 1200,
    standardCost: 18.5,
    currency: 'USD',
    leadTimeDays: 7,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 10:15:00',
  },
  {
    id: 1002,
    itemCode: 'ELEC-MOTOR-750W',
    nameEn: 'AC Servo Motor 750W',
    nameZh: '交流伺服电机 750W',
    specification: '220V / 3000rpm | Absolute Encoder IP65',
    categoryName: 'Electrical',
    categoryNameZh: '电气伺服',
    type: 'RAW_MATERIAL',
    uomCode: 'pcs',
    minStock: 20,
    maxStock: 100,
    safetyStock: 30,
    standardCost: 340.0,
    currency: 'USD',
    leadTimeDays: 14,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 09:30:00',
  },
  {
    id: 1003,
    itemCode: 'SEAL-RING-NBR50',
    nameEn: 'NBR O-Ring Seal Ø50mm',
    nameZh: '丁腈橡胶O型密封圈',
    specification: 'Ø50mm × 3.5mm Shore A70 | Oil Res.',
    categoryName: 'Packaging & Consumables',
    categoryNameZh: '包材辅料',
    type: 'RAW_MATERIAL',
    uomCode: 'pcs',
    minStock: 200,
    maxStock: 2000,
    safetyStock: 500,
    standardCost: 1.2,
    currency: 'USD',
    leadTimeDays: 3,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 11:00:00',
  },
  {
    id: 1004,
    itemCode: 'FASTENER-M8-30',
    nameEn: 'High-Tensile Hex Bolt M8x30',
    nameZh: '高强度内六角螺栓 M8x30',
    specification: 'M8 × 30 Grade 12.9 | Black Oxide DIN 912',
    categoryName: 'Fasteners',
    categoryNameZh: '标准紧固件',
    type: 'RAW_MATERIAL',
    uomCode: 'pcs',
    minStock: 5000,
    maxStock: 50000,
    safetyStock: 10000,
    standardCost: 0.15,
    currency: 'USD',
    leadTimeDays: 5,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 08:45:00',
  },
  {
    id: 1005,
    itemCode: 'ALLOY-AL6061-T6',
    nameEn: 'Aerospace Aluminum Plate 50mm',
    nameZh: '航空级铝合金厚板 AL6061-T6',
    specification: '50mm × 1000mm × 2000mm | AMS 4027',
    categoryName: 'Raw Alloys',
    categoryNameZh: '特种合金',
    type: 'RAW_MATERIAL',
    uomCode: 'kg',
    minStock: 500,
    maxStock: 3000,
    safetyStock: 800,
    standardCost: 32.0,
    currency: 'USD',
    leadTimeDays: 10,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 11:20:00',
  },
  {
    id: 1006,
    itemCode: 'HYD-VALVE-CORE-02',
    nameEn: 'Precision Hydraulic Valve Core',
    nameZh: '高压柱塞液压多路阀芯',
    specification: 'Hard Chrome Plated | Tolerance ±0.002mm',
    categoryName: 'Raw Alloys',
    categoryNameZh: '特种合金',
    type: 'FINISHED_GOODS',
    uomCode: 'pcs',
    minStock: 100,
    maxStock: 800,
    safetyStock: 200,
    standardCost: 85.0,
    currency: 'USD',
    leadTimeDays: 12,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 11:45:00',
  },
  {
    id: 1007,
    itemCode: 'SENS-LASER-DIST-01',
    nameEn: 'Industrial Laser Distance Sensor',
    nameZh: '高精度工业激光测距传感器',
    specification: 'IO-Link / 0.05-10m / IP67 / Class 2 Red',
    categoryName: 'Electrical',
    categoryNameZh: '电气伺服',
    type: 'RAW_MATERIAL',
    uomCode: 'pcs',
    minStock: 30,
    maxStock: 150,
    safetyStock: 50,
    standardCost: 210.0,
    currency: 'USD',
    leadTimeDays: 20,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 07:15:00',
  },
];

// Default Master Data - Suppliers
const defaultSuppliers: SupplierRecord[] = [
  {
    id: 1,
    code: 'SUP-BAO-01',
    name: 'Baosteel Special Metals Co., Ltd.',
    nameZh: '宝山钢铁特种金属有限公司',
    contactPerson: 'Wang Qiang (王强经理)',
    email: 'wangq@baosteel-sample.com',
    phone: '+86-21-5849-0120',
    address: 'No. 885 Fujin Road, Baoshan District, Shanghai, China',
    taxNumber: '91310000132204918X',
    paymentTerms: 'Net 60',
    ratingGrade: 'A',
    onTimeDeliveryRate: 98.4,
    qualityPassRate: 99.6,
    status: 'ACTIVE',
    leadTimeDays: 7,
    updatedAt: '2026-10-01 09:00:00',
  },
  {
    id: 2,
    code: 'SUP-DELTA-02',
    name: 'Delta Electronics Servo Drives Ltd.',
    nameZh: '中达电通工业伺服控制系统',
    contactPerson: 'Lin Sheng (林工)',
    email: 'lin.sheng@delta-sample.com',
    phone: '+86-512-6340-8800',
    address: 'Wujiang Economic Dev Zone, Suzhou, Jiangsu, China',
    taxNumber: '91320500720584910Y',
    paymentTerms: 'Net 30',
    ratingGrade: 'A',
    onTimeDeliveryRate: 96.2,
    qualityPassRate: 99.1,
    status: 'ACTIVE',
    leadTimeDays: 14,
    updatedAt: '2026-10-01 10:20:00',
  },
  {
    id: 3,
    code: 'SUP-CHALCO-03',
    name: 'Aluminum Corp of China (CHALCO)',
    nameZh: '中国铝业股份有限公司特材分部',
    contactPerson: 'Chen Gang (陈主任)',
    email: 'chengang@chalco-sample.com',
    phone: '+86-10-8229-8000',
    address: 'Xicheng District Industrial Park, Beijing, China',
    taxNumber: '91110000710928491K',
    paymentTerms: 'Net 45',
    ratingGrade: 'A',
    onTimeDeliveryRate: 97.5,
    qualityPassRate: 98.8,
    status: 'ACTIVE',
    leadTimeDays: 10,
    updatedAt: '2026-10-01 08:30:00',
  },
  {
    id: 4,
    code: 'SUP-SICK-04',
    name: 'SICK Optic-Electronic Sensors Ltd.',
    nameZh: '西克光学测控仪器工程部',
    contactPerson: 'Markus Schmidt (施密特总监)',
    email: 'm.schmidt@sick-sample.de',
    phone: '+49-7681-202-0',
    address: 'Erwin-Sick-Str. 1, Waldkirch, Germany',
    taxNumber: 'DE142928371',
    paymentTerms: 'Net 30',
    ratingGrade: 'B',
    onTimeDeliveryRate: 92.0,
    qualityPassRate: 99.8,
    status: 'ACTIVE',
    leadTimeDays: 21,
    updatedAt: '2026-09-28 14:10:00',
  },
  {
    id: 5,
    code: 'SUP-NOK-05',
    name: 'NOK Seals & Polymer Technology',
    nameZh: '恩福油封高分子密封材料',
    contactPerson: 'Zhao Min (赵敏)',
    email: 'zhaomin@nok-sample.com',
    phone: '+86-510-8521-1200',
    address: 'High-Tech Industrial Park, Wuxi, Jiangsu, China',
    taxNumber: '91320200607928471P',
    paymentTerms: 'Net 30',
    ratingGrade: 'A',
    onTimeDeliveryRate: 99.1,
    qualityPassRate: 99.5,
    status: 'ACTIVE',
    leadTimeDays: 4,
    updatedAt: '2026-10-01 11:10:00',
  },
];

// Default Master Data - Customers
const defaultCustomers: CustomerRecord[] = [
  {
    id: 1,
    code: 'CUST-HYD-01',
    name: 'Sany Heavy Industry Group',
    nameZh: '三一重工液压机械制造分公司',
    industry: 'Heavy Machinery',
    contactPerson: 'Director Liu (刘部长)',
    email: 'liu.director@sany-sample.com',
    phone: '+86-731-8403-1288',
    shippingAddress: 'Sany Industrial Park, Changsha, Hunan, China',
    billingAddress: 'Sany Headquarters Financial Center, Changsha, China',
    creditLimit: 2500000,
    currency: 'USD',
    paymentTerms: 'Net 60',
    activeOrdersCount: 4,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 11:30:00',
  },
  {
    id: 2,
    code: 'CUST-CAT-02',
    name: 'Caterpillar APAC Distribution',
    nameZh: '卡特彼勒亚太工程装备中心',
    industry: 'Heavy Machinery',
    contactPerson: 'Sarah Jenkins (詹金斯主管)',
    email: 'sarah.j@cat-sample.com',
    phone: '+65-6838-8000',
    shippingAddress: '7 Tractor Road, Jurong Industrial Estate, Singapore',
    billingAddress: 'CAT Financial Services APAC, Singapore',
    creditLimit: 5000000,
    currency: 'USD',
    paymentTerms: 'Net 45',
    activeOrdersCount: 6,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 09:15:00',
  },
  {
    id: 3,
    code: 'CUST-XCMG-03',
    name: 'XCMG Construction Machinery Co.',
    nameZh: '徐工集团工程机械核心零部件处',
    industry: 'Construction Equipment',
    contactPerson: 'Gao Feng (高峰)',
    email: 'gaofeng@xcmg-sample.com',
    phone: '+86-516-8756-1188',
    shippingAddress: 'XCMG High-tech Zone, Xuzhou, Jiangsu, China',
    billingAddress: 'XCMG Treasury Center, Xuzhou, China',
    creditLimit: 3200000,
    currency: 'USD',
    paymentTerms: 'Net 60',
    activeOrdersCount: 3,
    status: 'ACTIVE',
    updatedAt: '2026-09-30 16:40:00',
  },
  {
    id: 4,
    code: 'CUST-KOM-04',
    name: 'Komatsu Manufacturing (China)',
    nameZh: '小松机械制造常州工厂',
    industry: 'Mining Machinery',
    contactPerson: 'Takeshi Yamada (山田经理)',
    email: 'yamada.t@komatsu-sample.co.jp',
    phone: '+86-519-8512-3300',
    shippingAddress: 'Xinbei District Industrial Zone, Changzhou, Jiangsu, China',
    billingAddress: 'Komatsu China Commercial Corp, Shanghai, China',
    creditLimit: 1800000,
    currency: 'USD',
    paymentTerms: 'Net 30',
    activeOrdersCount: 2,
    status: 'ACTIVE',
    updatedAt: '2026-10-01 08:20:00',
  },
];

class MasterDataService {
  private items: ItemRecord[] = [...defaultItems];
  private suppliers: SupplierRecord[] = [...defaultSuppliers];
  private customers: CustomerRecord[] = [...defaultCustomers];

  // ===== Items =====
  public async getItems(): Promise<ItemRecord[]> {
    try {
      const res = await apiClient.get('/items');
      const responseData = (res as { data?: { data?: { content?: ItemRecord[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return responseData.data.content;
      }
    } catch {
      // offline fallback
    }
    return [...this.items];
  }

  public async createItem(payload: CreateItemPayload): Promise<ItemRecord> {
    const newItem: ItemRecord = {
      id: Date.now(),
      itemCode: payload.itemCode,
      nameEn: payload.nameEn,
      nameZh: payload.nameZh,
      specification: payload.specification,
      categoryName: 'General Materials',
      categoryNameZh: '通用材料',
      type: payload.type,
      uomCode: 'pcs',
      minStock: payload.minStock,
      maxStock: payload.maxStock,
      safetyStock: payload.safetyStock,
      standardCost: payload.standardCost,
      currency: 'USD',
      leadTimeDays: payload.leadTimeDays,
      status: 'ACTIVE',
      updatedAt: new Date().toLocaleString(),
    };
    try {
      await apiClient.post('/items', payload);
    } catch {
      // offline fallback
    }
    this.items.unshift(newItem);
    return newItem;
  }

  // ===== Suppliers =====
  public async getSuppliers(): Promise<SupplierRecord[]> {
    try {
      const res = await apiClient.get('/suppliers');
      const responseData = (res as { data?: { data?: { content?: SupplierRecord[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return responseData.data.content;
      }
    } catch {
      // offline fallback
    }
    return [...this.suppliers];
  }

  public async createSupplier(payload: CreateSupplierPayload): Promise<SupplierRecord> {
    const newSupplier: SupplierRecord = {
      id: Date.now(),
      code: payload.code,
      name: payload.name,
      nameZh: payload.nameZh,
      contactPerson: payload.contactPerson,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      taxNumber: payload.taxNumber,
      paymentTerms: payload.paymentTerms,
      ratingGrade: payload.ratingGrade,
      onTimeDeliveryRate: 100.0,
      qualityPassRate: 100.0,
      status: 'ACTIVE',
      leadTimeDays: payload.leadTimeDays,
      updatedAt: new Date().toLocaleString(),
    };
    try {
      await apiClient.post('/suppliers', payload);
    } catch {
      // offline fallback
    }
    this.suppliers.unshift(newSupplier);
    return newSupplier;
  }

  // ===== Customers =====
  public async getCustomers(): Promise<CustomerRecord[]> {
    try {
      const res = await apiClient.get('/customers');
      const responseData = (res as { data?: { data?: { content?: CustomerRecord[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return responseData.data.content;
      }
    } catch {
      // offline fallback
    }
    return [...this.customers];
  }

  public async createCustomer(payload: CreateCustomerPayload): Promise<CustomerRecord> {
    const newCustomer: CustomerRecord = {
      id: Date.now(),
      code: payload.code,
      name: payload.name,
      nameZh: payload.nameZh,
      industry: payload.industry,
      contactPerson: payload.contactPerson,
      email: payload.email,
      phone: payload.phone,
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.billingAddress,
      creditLimit: payload.creditLimit,
      currency: 'USD',
      paymentTerms: payload.paymentTerms,
      activeOrdersCount: 0,
      status: 'ACTIVE',
      updatedAt: new Date().toLocaleString(),
    };
    try {
      await apiClient.post('/customers', payload);
    } catch {
      // offline fallback
    }
    this.customers.unshift(newCustomer);
    return newCustomer;
  }
}

export const masterDataService = new MasterDataService();
export default masterDataService;
