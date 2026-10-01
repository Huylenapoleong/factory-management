export interface AuditLogItem {
  id: number;
  username: string;
  userRoleZh: string;
  userRoleEn: string;
  action: 'CREATE' | 'UPDATE' | 'CONFIRM' | 'POST' | 'SHIP' | 'DELETE' | 'LOGIN';
  entityType: 'PRODUCTION_ORDER' | 'STOCK_MOVEMENT' | 'PURCHASE_ORDER' | 'SALES_ORDER' | 'SYSTEM_AUTH';
  entityId: string;
  detailsZh: string;
  detailsEn: string;
  ipAddress: string;
  macAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: string;
}

export interface WorkshopConfig {
  workshopCode: string;
  workshopNameZh: string;
  workshopNameEn: string;
  supervisorName: string;
  shiftSchedule: string;
  targetOeePercent: number;
  autoRefreshIntervalSeconds: number;
  opcUaServerUrl: string;
  sapGatewayEndpoint: string;
  weighbridgePort: string;
}
