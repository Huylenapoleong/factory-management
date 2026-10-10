export type SupplierStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED';

export interface SupplierRecord {
  id: number;
  code: string;
  name: string;
  nameZh: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  ratingGrade?: 'A' | 'B' | 'C' | null;
  onTimeDeliveryRate?: number | null;
  qualityPassRate?: number | null;
  status: SupplierStatus;
  leadTimeDays?: number | null;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  code: string;
  name: string;
  nameZh: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  paymentTerms: string;
  ratingGrade: 'A' | 'B' | 'C';
  leadTimeDays: number;
}
