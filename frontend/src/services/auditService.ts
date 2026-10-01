import apiClient from './api';
import { AuditLogItem, WorkshopConfig } from '@/features/settings/types';

const defaultLogs: AuditLogItem[] = [
  {
    id: 1,
    username: 'admin',
    userRoleZh: '厂长总监 / 系统管理员',
    userRoleEn: 'Plant Director / Admin',
    action: 'SHIP',
    entityType: 'SALES_ORDER',
    entityId: 'DO-20261024-088',
    detailsZh: '确认特斯拉能源超级工厂发货出库 (120套逆变驱动总成扣库存，顺丰重运 苏E-98K21)',
    detailsEn: 'Confirmed outbound dispatch for Tesla Megapack (120 units, SF Heavy 苏E-98K21)',
    ipAddress: '192.168.10.42',
    macAddress: 'F0:2F:74:98:B1:00',
    status: 'SUCCESS',
    timestamp: '2026-10-01 13:42:10',
  },
  {
    id: 2,
    username: 'dispatcher_01',
    userRoleZh: '车间调度主管',
    userRoleEn: 'Workshop Dispatcher',
    action: 'CONFIRM',
    entityType: 'PRODUCTION_ORDER',
    entityId: 'WO-20261001-01',
    detailsZh: '工序报工核验通过: Op 30 外圆精磨完成465件，合格率99.1%',
    detailsEn: 'Operation report verified: Op 30 Cylindrical Grinding 465 pcs, 99.1% yield',
    ipAddress: '192.168.10.88',
    macAddress: 'F0:2F:74:98:C3:12',
    status: 'SUCCESS',
    timestamp: '2026-10-01 12:15:30',
  },
  {
    id: 3,
    username: 'wh_clerk_02',
    userRoleZh: '仓储物流管理员',
    userRoleEn: 'Warehouse Clerk',
    action: 'POST',
    entityType: 'STOCK_MOVEMENT',
    entityId: 'GRN-20261024-019',
    detailsZh: '采购到货上架入库: 汇川伺服电机 750W 40台，分配库位 WH-02 / B-01-04',
    detailsEn: 'Goods receipt posted to stock: Inovance Motor 40 pcs -> WH-02 / B-01-04',
    ipAddress: '192.168.10.104',
    macAddress: '48:2A:E3:11:89:FA',
    status: 'SUCCESS',
    timestamp: '2026-10-01 11:22:15',
  },
  {
    id: 4,
    username: 'qc_inspector_sun',
    userRoleZh: '来料质检工程师',
    userRoleEn: 'IQC Engineer',
    action: 'UPDATE',
    entityType: 'PURCHASE_ORDER',
    entityId: 'PO-202610-08831',
    detailsZh: '开具不合格品评审记录 (NCR-20261001-04): 紧固件 M12 5件表面氧化隔离',
    detailsEn: 'NCR issued (NCR-20261001-04): 5 pcs Fastener M12 quarantined for surface oxidation',
    ipAddress: '192.168.10.150',
    macAddress: 'BC:D0:74:2A:44:91',
    status: 'WARNING',
    timestamp: '2026-10-01 09:40:00',
  },
  {
    id: 5,
    username: 'admin',
    userRoleZh: '厂长总监 / 系统管理员',
    userRoleEn: 'Plant Director / Admin',
    action: 'LOGIN',
    entityType: 'SYSTEM_AUTH',
    entityId: 'SESSION-TOKEN-994',
    detailsZh: '车间主控制台双因子认证登录成功 (证书指纹: SHA256-WIFIM-MES-PRO)',
    detailsEn: 'Workshop console 2FA authenticated (Certificate: SHA256-WIFIM-MES-PRO)',
    ipAddress: '192.168.10.42',
    macAddress: 'F0:2F:74:98:B1:00',
    status: 'SUCCESS',
    timestamp: '2026-10-01 08:00:02',
  },
];

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
  private logs: AuditLogItem[] = [...defaultLogs];
  private config: WorkshopConfig = { ...defaultWorkshopConfig };

  public async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await apiClient.get('/api/v1/audit-logs');
      const responseData = (res as { data?: { data?: { content?: unknown[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return this.logs;
      }
    } catch {
      // offline fallback
    }
    return [...this.logs];
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
