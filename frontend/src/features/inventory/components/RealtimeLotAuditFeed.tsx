import React, { useState } from 'react';
import { Card, Tag, Radio, Button, Space, Badge, theme } from 'antd';
import { message } from '@/utils/antdApp';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  SwapOutlined,
  WarningOutlined,
  SendOutlined,
  QrcodeOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { StockAuditLogItem, StockMovementType } from '../types';

interface RealtimeLotAuditFeedProps {
  logs: StockAuditLogItem[];
  onRefresh?: () => void;
}

export const RealtimeLotAuditFeed: React.FC<RealtimeLotAuditFeedProps> = ({ logs, onRefresh }) => {
  const [syncing, setSyncing] = useState<boolean>(false);
  const { language } = useAppStore();
  const { user } = useAuthStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'INBOUND' && log.type === 'INBOUND') return true;
    if (filterType === 'ISSUE' && (log.type === 'PRODUCTION_ISSUE' || log.type === 'OUTBOUND'))
      return true;
    if (filterType === 'TRANSFER' && log.type === 'TRANSFER') return true;
    if (filterType === 'SCRAP' && log.type === 'QC_SCRAP') return true;
    return false;
  });

  const getBadgeForType = (type: StockMovementType) => {
    switch (type) {
      case 'INBOUND':
        return {
          color: 'green',
          icon: <ArrowDownOutlined />,
          text: isZh ? '采购入库' : 'INBOUND',
        };
      case 'PRODUCTION_ISSUE':
        return {
          color: 'blue',
          icon: <ArrowUpOutlined />,
          text: isZh ? '工单领料' : 'PROD ISSUE',
        };
      case 'TRANSFER':
        return {
          color: 'cyan',
          icon: <SwapOutlined />,
          text: isZh ? '库位调拨' : 'TRANSFER',
        };
      case 'OUTBOUND':
        return {
          color: 'geekblue',
          icon: <SendOutlined />,
          text: isZh ? '销售出库' : 'DISPATCH',
        };
      case 'QC_SCRAP':
        return {
          color: 'error',
          icon: <WarningOutlined />,
          text: isZh ? '报废隔离' : 'QC SCRAP',
        };
      default:
        return {
          color: 'default',
          icon: <SwapOutlined />,
          text: type,
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. Live Audit Log Feed Card */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: token.colorBgContainer,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge status="processing" color="#10b981" />
            <span style={{ fontWeight: 600, fontSize: 13, color: token.colorText }}>
              {isZh ? '实时物料流转出入库动态' : 'Real-time Lot Audit Trail'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: token.colorTextSecondary }}>Live Sync</span>
        </div>

        {/* Filter Pills */}
        <Radio.Group
          size="small"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ marginBottom: 12, width: '100%' }}
          buttonStyle="solid"
        >
          <Radio.Button value="ALL" style={{ width: '20%', textAlign: 'center', padding: 0 }}>
            {isZh ? '全部' : 'All'}
          </Radio.Button>
          <Radio.Button value="INBOUND" style={{ width: '20%', textAlign: 'center', padding: 0 }}>
            {isZh ? '入库' : 'In'}
          </Radio.Button>
          <Radio.Button value="ISSUE" style={{ width: '20%', textAlign: 'center', padding: 0 }}>
            {isZh ? '领料' : 'Issue'}
          </Radio.Button>
          <Radio.Button value="TRANSFER" style={{ width: '20%', textAlign: 'center', padding: 0 }}>
            {isZh ? '调拨' : 'Move'}
          </Radio.Button>
          <Radio.Button value="SCRAP" style={{ width: '20%', textAlign: 'center', padding: 0 }}>
            {isZh ? '报废' : 'Scrap'}
          </Radio.Button>
        </Radio.Group>

        {/* Audit Log Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredLogs.map((log) => {
            const badge = getBadgeForType(log.type);
            const isNegative = log.quantityDelta < 0;
            return (
              <div
                key={log.id}
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 4,
                  padding: '8px 10px',
                  backgroundColor: token.colorFillAlter,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <Space size="small">
                    <Tag
                      color={badge.color}
                      icon={badge.icon}
                      style={{ margin: 0, borderRadius: 2, fontSize: 11, fontWeight: 600 }}
                    >
                      {badge.text}
                    </Tag>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: '#1677ff',
                        fontWeight: 600,
                      }}
                    >
                      {log.itemCode}
                    </span>
                  </Space>
                  <span
                    className="tnum"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isNegative ? '#dc2626' : '#15803d',
                    }}
                  >
                    {isNegative ? '' : '+'}
                    {log.quantityDelta} {log.unit}
                  </span>
                </div>

                <div
                  style={{ fontSize: 12, fontWeight: 500, color: token.colorText, marginBottom: 2 }}
                >
                  {isZh ? log.itemNameZh : log.itemNameEn}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: token.colorTextSecondary,
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <span>
                    {log.targetLocation ? `-> ${log.targetLocation}` : log.sourceLocation}
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      color: token.colorTextTertiary || token.colorTextSecondary,
                    }}
                  >
                    {log.docReference}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    color: token.colorTextSecondary,
                    marginTop: 4,
                    borderTop: `1px dashed ${token.colorBorderSecondary}`,
                    paddingTop: 4,
                  }}
                >
                  <span>{log.operator}</span>
                  <span className="tnum">{log.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Handheld PDA Terminal Card */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: token.colorBgContainer,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Space size="small">
            <QrcodeOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: token.colorText }}>
              {isZh ? '手持 PDA 终端状态' : 'PDA Terminal Status'}
            </span>
          </Space>
          <Tag color="success" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
            {isZh ? '终端在线' : 'Terminal Online'}
          </Tag>
        </div>

        <div style={{ fontSize: 11, color: token.colorTextSecondary, lineHeight: '18px' }}>
          <div>
            {isZh ? '当前操作员: ' : 'Active Operator: '}
            <strong style={{ color: token.colorText }}>
              {user?.fullName || user?.username || (isZh ? '当班操作员' : 'Duty Operator')}
            </strong>
          </div>
          <div>{isZh ? '作业区域: 厂区仓储与物流中心' : 'Active Zone: Plant Logistics Hub'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <WifiOutlined style={{ color: '#10b981' }} />
            <span>{isZh ? '工业物联网通信正常' : 'Industrial IoT Connected'}</span>
          </div>
        </div>

        <Button
          type="dashed"
          block
          size="small"
          loading={syncing}
          style={{ marginTop: 10, fontSize: 11 }}
          onClick={async () => {
            setSyncing(true);
            try {
              if (onRefresh) {
                await onRefresh();
              }
              message.success(
                isZh
                  ? '拣货任务已与手持终端实时同步'
                  : 'Picking task synchronized to handheld terminal',
              );
            } finally {
              setSyncing(false);
            }
          }}
        >
          {isZh ? '同步拣货任务' : 'Sync Picking Tasks'}
        </Button>
      </Card>
    </div>
  );
};
