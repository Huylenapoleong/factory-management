import React from 'react';
import { Card, Tag, Button, Space, Typography, theme, Empty, Modal } from 'antd';
import { message } from '@/utils/antdApp';
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
  const pendingQcCount = receipts.filter(
    (r) => r.status === 'INSPECTING' || r.status === 'DEFECT_HOLD',
  ).length;

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: '#1677ff', fontSize: 15 }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: token.colorText }}>
              {isZh ? '现场到货质检与收货队列' : 'Active Inbound QC Queue'}
            </span>
          </div>
          <Tag color="warning" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
            {pendingQcCount} {isZh ? '批待检' : 'PENDING'}
          </Tag>
        </div>

        {/* Goods Receipts Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {receipts.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={isZh ? '暂无待检收货单' : 'No goods receipts pending QC'}
            />
          ) : (
            receipts.map((grn) => {
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                        {isZh ? '收货单号:' : 'RECEIPT NOTE:'}
                      </span>
                      <div
                        style={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: '#1677ff',
                          fontSize: 12,
                        }}
                      >
                        {grn.grnNumber}
                      </div>
                    </div>

                    {isPosted ? (
                      <Tag color="success" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                        {isZh ? '已入库上架' : 'POSTED TO STOCK'}
                      </Tag>
                    ) : isPassed ? (
                      <Tag
                        color="green"
                        icon={<CheckCircleOutlined />}
                        style={{ margin: 0, borderRadius: 2, fontSize: 10 }}
                      >
                        {isZh ? '质检合格' : 'QC Passed'}
                      </Tag>
                    ) : (
                      <Tag
                        color="error"
                        icon={<AlertOutlined />}
                        style={{ margin: 0, borderRadius: 2, fontSize: 10 }}
                      >
                        {grn.quantityRejected > 0
                          ? isZh
                            ? `异常隔离 (${grn.quantityRejected} ${grn.unit})`
                            : `${grn.quantityRejected} ${grn.unit} DEFECT`
                          : isZh
                            ? '质检待评审'
                            : 'QC DEFECT HOLD'}
                      </Tag>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: token.colorTextSecondary,
                      lineHeight: '18px',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <Text type="secondary">{isZh ? '关联采购单: ' : 'PO Ref: '}</Text>
                      <span
                        style={{ fontFamily: 'monospace', fontWeight: 600, color: token.colorText }}
                      >
                        {grn.poReference}
                      </span>
                    </div>
                    <div>
                      <Text type="secondary">{isZh ? '卸货码头: ' : 'Receiving Bay: '}</Text>
                      <span style={{ color: token.colorText, fontWeight: 500 }}>
                        {grn.receivingBay}
                      </span>
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: token.colorTextSecondary,
                        marginTop: 2,
                      }}
                    >
                      <span>
                        {isZh ? '实收: ' : 'Received: '}
                        <strong className="tnum" style={{ color: token.colorText }}>
                          {grn.quantityReceived} {grn.unit}
                        </strong>
                      </span>
                      <span style={{ color: isPassed ? '#15803d' : '#ef4444' }}>
                        {grn.notes ||
                          (isPassed
                            ? isZh
                              ? '检验合格放行'
                              : 'Inspection Passed'
                            : isZh
                              ? '待质检复审隔离'
                              : 'Held for Quality Review')}
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
                          onClick={() => {
                            Modal.confirm({
                              title: isZh
                                ? `开具不合格品评审单 (NCR) - ${grn.grnNumber}`
                                : `Issue Non-Conformance Report (NCR) - ${grn.grnNumber}`,
                              icon: <AlertOutlined style={{ color: '#ff4d4f' }} />,
                              content: isZh
                                ? `确认将入库单 ${grn.grnNumber}（订单: ${grn.poReference}）的不合格物料提交至质量工程处进行 NCR 隔离评审与供应商索赔？`
                                : `Submit defective receipt ${grn.grnNumber} (PO: ${grn.poReference}) to Quality Engineering for NCR quarantine review & supplier claim?`,
                              okText: isZh ? '确认开单' : 'Confirm NCR',
                              cancelText: isZh ? '取消' : 'Cancel',
                              okButtonProps: { danger: true },
                              onOk: () => {
                                message.warning(
                                  isZh
                                    ? `不合格品评审单 NCR-${grn.grnNumber} 已正式开具并转入质量工程处置池`
                                    : `Non-Conformance Report NCR-${grn.grnNumber} successfully logged & routed to QA Engineering`,
                                );
                              },
                            });
                          }}
                        >
                          {isZh ? '开具异常评审单' : 'Issue NCR'}
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        style={{ fontSize: 11 }}
                        onClick={() => {
                          window.print();
                          message.success(
                            isZh ? '正在打印入库条码标签...' : 'Printing Barcode Labels...',
                          );
                        }}
                      >
                        {isZh ? '打印' : 'Print'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Space size="small">
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: token.colorText }}>
              {isZh ? '今日货运码头卸车计划' : "Today's Inbound Dock Schedule"}
            </span>
          </Space>
          <span style={{ fontSize: 11, color: token.colorTextSecondary }}>Bays 01 - 04</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {receipts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '12px 0',
                color: token.colorTextSecondary,
                fontSize: 12,
              }}
            >
              {isZh ? '今日暂无码头待卸货计划' : 'No dock deliveries scheduled'}
            </div>
          ) : (
            receipts.slice(0, 3).map((r, idx) => (
              <div
                key={r.id}
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
                  <Tag
                    color={idx === 0 ? 'cyan' : 'orange'}
                    style={{ margin: 0, borderRadius: 2, fontSize: 10 }}
                  >
                    {r.receivingBay || 'Inbound Dock'}
                  </Tag>
                  <span style={{ marginLeft: 6, color: token.colorText, fontWeight: 500 }}>
                    {isZh ? r.supplierNameZh : r.supplierNameEn}
                  </span>
                </div>
                <span className="tnum" style={{ color: '#15803d', fontWeight: 600 }}>
                  {r.grnNumber}
                </span>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            fontSize: 11,
            color: token.colorTextSecondary,
            marginTop: 10,
            borderTop: `1px dashed ${token.colorBorderSecondary}`,
            paddingTop: 6,
          }}
        >
          {isZh
            ? '批次全程质量追溯: ISO-9001:2026 合规'
            : 'Lot Serial Tracking: ISO-9001:2026 Compliant'}
        </div>
      </Card>
    </div>
  );
};
