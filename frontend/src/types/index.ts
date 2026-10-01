export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PageResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  roles: string[];
}

export interface SystemSettings {
  applicationName: string;
  companyName: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}
