import React from 'react';
import { Row, Col, Card, Statistic, theme } from 'antd';
import {
  FileTextOutlined,
  InboxOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { PurchaseOrderSummary, GoodsReceiptSummary } from '../types';

interface PurchasingKpiStripProps {
  orders?: PurchaseOrderSummary[];
  receipts?: GoodsReceiptSummary[];
}

export const PurchasingKpiStrip: React.FC<PurchasingKpiStripProps> = ({
  orders = [],
  receipts = [],
}) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  const activeOrdersCount = orders.length;
  const totalSpend = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingInspect = receipts.filter((r) => r.status === 'INSPECTING').length;
  const delayedOrders = orders.filter((o) => o.slaWarn).length;
  const postedReceipts = receipts.filter((r) => r.status === 'POSTED').length;

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {/* 1. Active Purchase Orders */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border: `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: token.colorBgContainer,
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '在途采购单' : 'ACTIVE PURCHASE ORDERS'}
                </span>
                <FileTextOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={activeOrdersCount}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            <span className="tnum" style={{ fontWeight: 600, color: token.colorText }}>
              $
              {totalSpend.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>{' '}
            {isZh ? '总采购额' : 'total amount'}
          </div>
        </Card>
      </Col>

      {/* 2. Inbound Receipts */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border: `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: token.colorBgContainer,
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '已建到货单' : 'INBOUND RECEIPTS'}
                </span>
                <InboxOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={receipts.length}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {pendingInspect > 0
              ? `${pendingInspect} ${isZh ? '笔质检中' : 'in inspection'}`
              : isZh
                ? '无待检积压'
                : 'No inspection backlog'}
          </div>
        </Card>
      </Col>

      {/* 3. Delayed Deliveries */}
      <Col xs={12} sm={8} lg={4} xl={4}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border:
              delayedOrders > 0 ? '1px solid #f87171' : `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: delayedOrders > 0 ? token.colorFillAlter : token.colorBgContainer,
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: delayedOrders > 0 ? '#dc2626' : token.colorTextSecondary,
                    fontWeight: 600,
                  }}
                >
                  {isZh ? '交付逾期预警' : 'DELAYED DELIVERIES'}
                </span>
                <AlertOutlined
                  style={{ color: delayedOrders > 0 ? '#dc2626' : '#10b981', fontSize: 13 }}
                />
              </div>
            }
            value={delayedOrders}
            styles={{
              content: {
                fontSize: 20,
                fontWeight: 700,
                color: delayedOrders > 0 ? '#dc2626' : token.colorText,
              },
            }}
            suffix={
              delayedOrders > 0 ? (
                <span
                  style={{
                    fontSize: 10,
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '1px 5px',
                    borderRadius: 2,
                    marginLeft: 6,
                    fontWeight: 600,
                  }}
                >
                  CRITICAL
                </span>
              ) : null
            }
          />
          <div
            style={{
              fontSize: 11,
              color: delayedOrders > 0 ? '#ef4444' : token.colorTextSecondary,
              marginTop: 2,
            }}
          >
            {delayedOrders > 0
              ? isZh
                ? '存在交期风险订单'
                : 'Overdue SLA orders'
              : isZh
                ? '全部按期交付'
                : 'All orders on track'}
          </div>
        </Card>
      </Col>

      {/* 4. Pending QC Inspection */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border: `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: token.colorBgContainer,
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '待质检收货' : 'PENDING QC INSPECTION'}
                </span>
                <SafetyCertificateOutlined style={{ color: '#d97706', fontSize: 13 }} />
              </div>
            }
            value={pendingInspect}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '码头现场质检中' : 'Awaiting QC release'}
          </div>
        </Card>
      </Col>

      {/* 5. Completed Posted Inbound */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border: `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: token.colorBgContainer,
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '已过账入库' : 'POSTED TO INVENTORY'}
                </span>
                <CheckCircleOutlined style={{ color: '#15803d', fontSize: 13 }} />
              </div>
            }
            value={postedReceipts}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: '#15803d' } }}
          />
          <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>
            {isZh ? '已完成库存上架' : 'Shelved & updated'}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default PurchasingKpiStrip;
