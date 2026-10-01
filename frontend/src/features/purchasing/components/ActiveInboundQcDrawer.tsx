import React from 'react';
import { Card, Tag, Button, Space, message, Typography, theme } from 'antd';
import {
  SafetyCertificateOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { GoodsReceiptSummary } from '../types';

const { Text } = Typography;

interface ActiveInboundQcDrawerProps {
  receipts: GoodsReceiptSummary[];
  onPostReceipt: (id: number) => void;
}

export const ActiveInboundQcDrawer: React.FC<ActiveInboundQcDrawerProps> = ({
  receipts,
  onPostReceipt,
}) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. Inbound QC Queue Card */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: token.colorBgContainer,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#1677ff', fontSize: 15 }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: token.colorText }}>
              {isZh ? '现场到货质检与收货队列' : 'Active Inbound QC Queue'}
            </span>
          </div>
          <Tag color="warning" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
            {isZh ? '3 批暂存' : '3 BATCHES HOLD'}
          </Tag>
        </div>

        {/* Goods Receipts Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {receipts.map((grn) => {
            const isPassed = grn.status === 'PASSED';
            const isDefect = grn.status === 'DEFECT_HOLD';
            const isPosted = grn.status === 'POSTED';

            return (
              <div
                key={grn.id}
                style={{
                  border: `1px solid ${isPassed ? '#86efac' : isDefect ? '#fca5a5' : token.colorBorderSecondary}`,
                  backgroundColor: token.colorFillAlter,
                  borderRadius: 4,
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                      {isZh ? '收货单号 (GRN):' : 'RECEIPT NOTE:'}
                    </span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1677ff', fontSize: 12 }}>
                      {grn.grnNumber}
                    </div>
                  </div>

                  {isPosted ? (
                    <Tag color="success" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                      {isZh ? '已入库上架' : 'POSTED TO STOCK'}
                    </Tag>
                  ) : isPassed ? (
                    <Tag color="green" icon={<CheckCircleOutlined />} style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                      {isZh ? '质检合格 100%' : 'Passed 100%'}
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<AlertOutlined />} style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                      {isZh ? '异常隔离 (5 pcs)' : '5 PCS DEFECT'}
                    </Tag>
                  )}
                </div>

                <div style={{ fontSize: 11, color: token.colorTextSecondary, lineHeight: '18px', marginBottom: 6 }}>
                  <div>
                    <Text type="secondary">{isZh ? '关联采购单: ' : 'PO Ref: '}</Text>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: token.colorText }}>{grn.poReference}</span>
                  </div>
                  <div>
                    <Text type="secondary">{isZh ? '卸货码头: ' : 'Receiving Bay: '}</Text>
                    <span style={{ color: token.colorText, fontWeight: 500 }}>{grn.receivingBay}</span>
                  </div>
                  <div>
                    <Text type="secondary">{isZh ? '承运物流: ' : 'Carrier: '}</Text>
                    <span style={{ color: token.colorText }}>{grn.carrierTracking}</span>
                  </div>
                  <div>
                    <Text type="secondary">{isZh ? '主检质检员: ' : 'Lead Inspector: '}</Text>
                    <span style={{ color: token.colorText }}>{grn.inspector}</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 3,
                    padding: '6px 8px',
                    fontSize: 11,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, color: token.colorText }}>
                    {isZh ? grn.itemDescriptionZh : grn.itemDescriptionEn}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: token.colorTextSecondary, marginTop: 2 }}>
                    <span>
                      {isZh ? '实收: ' : 'Received: '}
                      <strong className="tnum" style={{ color: token.colorText }}>{grn.quantityReceived} {grn.unit}</strong>
                    </span>
                    <span style={{ color: isPassed ? '#15803d' : '#ef4444' }}>
                      {isPassed
                        ? isZh
                          ? '尺寸几何检验合格'
                          : 'Zero Dimensional Flaw'
                        : isZh
                          ? '表面氧化待评审'
                          : 'Surface Defect Held'}
                    </span>
                  </div>
                </div>

                {!isPosted && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isPassed && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        style={{ flex: 1, backgroundColor: '#1677ff', fontSize: 11 }}
                        onClick={() => onPostReceipt(grn.id)}
                      >
                        {isZh ? '确认入库上架' : 'Post to Stock'}
                      </Button>
                    )}
                    {isDefect && (
                      <Button
                        danger
                        size="small"
                        icon={<AlertOutlined />}
                        style={{ flex: 1, fontSize: 11 }}
                        onClick={() => message.warning(isZh ? '已开具不合格品评审单 (NCR)' : 'NCR Form Opened')}
                      >
                        {isZh ? '开具异常单 (NCR)' : 'Issue NCR'}
                      </Button>
                    )}
                    <Button
                      size="small"
                      icon={<PrinterOutlined />}
                      style={{ fontSize: 11 }}
                      onClick={() => message.success(isZh ? '正在打印入库条码标签...' : 'Printing Barcode Labels...')}
                    >
                      {isZh ? '打印' : 'Print'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Today's Inbound Dock Schedule */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: token.colorBgContainer,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Space size="small">
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: token.colorText }}>
              {isZh ? '今日货运码头卸车计划' : "Today's Inbound Dock Schedule"}
            </span>
          </Space>
          <span style={{ fontSize: 11, color: token.colorTextSecondary }}>Bays 01 - 04</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              backgroundColor: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 3,
              padding: '6px 8px',
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Tag color="cyan" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>Bay 03</Tag>
              <span style={{ marginLeft: 6, color: token.colorText, fontWeight: 500 }}>
                {isZh ? '宝武钢卷重载配送' : 'Baosteel Coil Delivery'}
              </span>
            </div>
            <span className="tnum" style={{ color: '#15803d', fontWeight: 600 }}>11:45 AM (On Track)</span>
          </div>

          <div
            style={{
              backgroundColor: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 3,
              padding: '6px 8px',
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Tag color="orange" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>Bay 01</Tag>
              <span style={{ marginLeft: 6, color: token.colorText, fontWeight: 500 }}>
                {isZh ? '施耐德电气柜到货' : 'Schneider Switchgear'}
              </span>
            </div>
            <span className="tnum" style={{ color: '#d97706', fontWeight: 600 }}>02:15 PM (+20m)</span>
          </div>
        </div>

        <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 10, borderTop: `1px dashed ${token.colorBorderSecondary}`, paddingTop: 6 }}>
          {isZh ? '批次全程质量追溯: ISO-9001:2026 合规' : 'Lot Serial Tracking: ISO-9001:2026 Compliant'}
        </div>
      </Card>
    </div>
  );
};
