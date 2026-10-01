export type ItemType = 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOODS' | 'SPARE_PART';
export type ItemStatus = 'ACTIVE' | 'DISCONTINUED' | 'UNDER_REVIEW';

export interface ItemRecord {
  id: number;
  itemCode: string;
  nameEn: string;
  nameZh: string;
  specification: string;
  categoryName: string;
  categoryNameZh: string;
  type: ItemType;
  uomCode: string;
  minStock: number;
  maxStock: number;
  safetyStock: number;
  standardCost: number;
  currency: string;
  leadTimeDays: number;
  status: ItemStatus;
  updatedAt: string;
}

export interface CreateItemPayload {
  itemCode: string;
  nameEn: string;
  nameZh: string;
  specification: string;
  categoryId: number;
  type: ItemType;
  uomId: number;
  minStock: number;
  maxStock: number;
  safetyStock: number;
  standardCost: number;
  leadTimeDays: number;
}
