export type CustomerStatus = 'ACTIVE' | 'CREDIT_HOLD' | 'INACTIVE';

export interface CustomerRecord {
  id: number;
  code: string;
  name: string;
  nameZh: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  shippingAddress: string;
  billingAddress: string;
  creditLimit: number;
  currency: string;
  paymentTerms: string;
  activeOrdersCount: number;
  status: CustomerStatus;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  code: string;
  name: string;
  nameZh: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  shippingAddress: string;
  billingAddress: string;
  creditLimit: number;
  paymentTerms: string;
}
