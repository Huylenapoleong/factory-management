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
  ratingGrade: 'A' | 'B' | 'C';
  onTimeDeliveryRate: number;
  qualityPassRate: number;
  status: SupplierStatus;
  leadTimeDays: number;
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
