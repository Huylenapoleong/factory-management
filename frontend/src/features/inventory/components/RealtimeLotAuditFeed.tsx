import React, { useState } from 'react';
import { Card, Tag, Radio, Button, Space, message, Badge } from 'antd';
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
import { StockAuditLogItem, StockMovementType } from '../types';

interface RealtimeLotAuditFeedProps {
  logs: StockAuditLogItem[];
  onRefresh?: () => void;
}

export const RealtimeLotAuditFeed: React.FC<RealtimeLotAuditFeedProps> = ({
  logs,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'INBOUND' && log.type === 'INBOUND') return true;
    if (filterType === 'ISSUE' && (log.type === 'PRODUCTION_ISSUE' || log.type === 'OUTBOUND')) return true;
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
          border: '1px solid #e5e7eb',
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
            <span style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
              {isZh ? '实时物料流转出入库动态' : 'Real-time Lot Audit Trail'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Live Sync</span>
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
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  padding: '8px 10px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Space size="small">
                    <Tag
                      color={badge.color}
                      icon={badge.icon}
                      style={{ margin: 0, borderRadius: 2, fontSize: 11, fontWeight: 600 }}
                    >
                      {badge.text}
                    </Tag>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#1677ff', fontWeight: 600 }}>
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

                <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 2 }}>
                  {isZh ? log.itemNameZh : log.itemNameEn}
                </div>

                <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span>
                    {log.targetLocation ? `-> ${log.targetLocation}` : log.sourceLocation}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>{log.docReference}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    color: '#9ca3af',
                    marginTop: 4,
                    borderTop: '1px dashed #f0f0f0',
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
          border: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Space size="small">
            <QrcodeOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: '#1f2937' }}>
              {isZh ? '手持 PDA 终端状态' : 'PDA Terminal Status'}
            </span>
          </Space>
          <Tag color="success" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
            PDA-08 Online
          </Tag>
        </div>

        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: '18px' }}>
          <div>{isZh ? '分配领料员: 陈斌 (工号: WH-030)' : 'Operator: Chen Bin (WH-030)'}</div>
          <div>{isZh ? '当前作业区: WH-01 原材料立库 A-5' : 'Active Zone: WH-01 High Rack A-5'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <WifiOutlined style={{ color: '#10b981' }} />
            <span>5G Industrial -63dBm | {isZh ? '电量: 94%' : 'Battery: 94%'}</span>
          </div>
        </div>

        <Button
          type="dashed"
          block
          size="small"
          style={{ marginTop: 10, fontSize: 11 }}
          onClick={() => message.success(isZh ? '拣货配料任务已下发至 PDA-08' : 'Picking task pushed to PDA-08')}
        >
          {isZh ? '下发拣货任务至 PDA' : 'Push Picking Task to PDA'}
        </Button>
      </Card>
    </div>
  );
};
