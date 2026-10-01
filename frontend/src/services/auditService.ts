import apiClient from './api';
import { AuditLogItem, WorkshopConfig } from '@/features/settings/types';

const defaultWorkshopConfig: WorkshopConfig = {
  workshopCode: 'SHOP-A-HEAVY',
  workshopNameZh: '重型精密加工与总装一号车间',
  workshopNameEn: 'Heavy Machining & Precision Assembly Workshop 01',
  supervisorName: 'Director Zhang (张总监)',
  shiftSchedule: 'Shift A (08:00 - 16:30) / Shift B (16:30 - 01:00)',
  targetOeePercent: 95.0,
  autoRefreshIntervalSeconds: 10,
  opcUaServerUrl: 'opc.tcp://192.168.10.200:4840/WIFIM/Server',
  sapGatewayEndpoint: 'https://sap-gateway.wifim-internal.net/sap/bc/sd/rfc',
  weighbridgePort: 'COM3 (Baud: 9600, Parity: None)',
};

class AuditService {
  private config: WorkshopConfig = { ...defaultWorkshopConfig };

  public async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await apiClient.get('/audit-logs', { params: { size: 50 } });
      const responseData = (res as {
        data?: {
          data?: Array<{
            id: number;
            username?: string;
            action: string;
            entityType: string;
            entityId?: string;
            ipAddress?: string;
            createdAt?: string;
          }>;
        };
      })?.data;
      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((log) => ({
          id: log.id,
          username: log.username || 'admin',
          userRoleZh: '系统操作员',
          userRoleEn: 'System Operator',
          action: (log.action || 'CONFIRM') as AuditLogItem['action'],
          entityType: (log.entityType || 'SYSTEM_AUTH') as AuditLogItem['entityType'],
          entityId: log.entityId || `TX-${log.id}`,
          detailsZh: `系统审计记录: ${log.action} ${log.entityType}`,
          detailsEn: `System audit event: ${log.action} on ${log.entityType}`,
          ipAddress: log.ipAddress || '127.0.0.1',
          macAddress: 'F0:2F:74:98:B1:00',
          status: 'SUCCESS' as const,
          timestamp: log.createdAt || '2026-10-01 12:00:00',
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getWorkshopConfig(): Promise<WorkshopConfig> {
    return { ...this.config };
  }

  public async updateWorkshopConfig(newConfig: Partial<WorkshopConfig>): Promise<WorkshopConfig> {
    this.config = { ...this.config, ...newConfig };
    return { ...this.config };
  }
}

export const auditService = new AuditService();
export default auditService;
