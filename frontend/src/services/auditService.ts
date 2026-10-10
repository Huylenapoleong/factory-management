import apiClient from './api';
import { AuditLogItem, WorkshopConfig } from '@/features/settings/types';

const defaultWorkshopConfig: WorkshopConfig = {
  workshopCode: 'SHOP-01',
  workshopNameZh: '一号生产车间',
  workshopNameEn: 'Main Production Workshop 01',
  supervisorName: 'Workshop Lead',
  shiftSchedule: 'Shift A (08:00 - 16:30) / Shift B (16:30 - 01:00)',
  targetOeePercent: 95.0,
  autoRefreshIntervalSeconds: 10,
  opcUaServerUrl: '',
  sapGatewayEndpoint: '',
  weighbridgePort: '',
};

class AuditService {
  private config: WorkshopConfig = { ...defaultWorkshopConfig };

  public async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await apiClient.get('/audit-logs', { params: { size: 50 } });
      const responseData = (
        res as {
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
        }
      )?.data;
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
          macAddress: '—',
          status: 'SUCCESS' as const,
          timestamp: log.createdAt || '',
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
