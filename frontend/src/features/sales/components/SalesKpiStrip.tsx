import React from 'react';
import { Row, Col, Card, Statistic, theme } from 'antd';
import {
  ShoppingCartOutlined,
  SendOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { SalesOrderSummary, OutboundDeliverySummary } from '../types';

interface SalesKpiStripProps {
  orders: SalesOrderSummary[];
  deliveries: OutboundDeliverySummary[];
}

export const SalesKpiStrip: React.FC<SalesKpiStripProps> = ({ orders, deliveries }) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');
  const activeOrdersCount = activeOrders.length;
  const totalSalesAmount = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const uniqueCustomersCount = new Set(orders.map((o) => o.customerId).filter(Boolean)).size;

  const stagedDeliveries = deliveries.filter((d) => d.status === 'STAGED');
  const stagedDeliveriesCount = stagedDeliveries.length;

  const deliveredCount = deliveries.filter(
    (d) => d.status === 'DISPATCHED' || d.status === 'DELIVERED',
  ).length;
  const otifRate =
    deliveries.length > 0 ? Number(((deliveredCount / deliveries.length) * 100).toFixed(1)) : 0.0;

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'QUOTATION' || o.status === 'CONFIRMED',
  ).length;

  const revenueDisplay =
    totalSalesAmount >= 1_000_000
      ? `$${(totalSalesAmount / 1_000_000).toFixed(2)}M`
      : `$${totalSalesAmount.toLocaleString()}`;

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {/* 1. Active Sales Orders */}
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
                  {isZh ? '在手销售订单' : 'ACTIVE SALES ORDERS'}
                </span>
                <ShoppingCartOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={activeOrdersCount}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            <span className="tnum" style={{ fontWeight: 600, color: token.colorText }}>
              ${totalSalesAmount.toLocaleString()}
            </span>{' '}
            {isZh ? `| ${uniqueCustomersCount} 家客户` : `| ${uniqueCustomersCount} Accounts`}
          </div>
        </Card>
      </Col>

      {/* 2. Staged for Shipping */}
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
                  {isZh ? '待发运出库单' : 'STAGED FOR SHIPPING'}
                </span>
                <SendOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={stagedDeliveriesCount}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
            suffix={
              <span
                style={{
                  fontSize: 10,
                  backgroundColor: token.colorPrimaryBg,
                  color: token.colorPrimary,
                  padding: '1px 5px',
                  borderRadius: 2,
                  marginLeft: 6,
                  fontWeight: 600,
                }}
              >
                {stagedDeliveriesCount} {isZh ? '批待运' : 'Queued'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {deliveries.length} {isZh ? '总发运批次' : 'Total Deliveries'}
          </div>
        </Card>
      </Col>

      {/* 3. On-Time Delivery Rate (OTIF) */}
      <Col xs={12} sm={8} lg={4} xl={4}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border: '1px solid #86efac',
            backgroundColor: token.colorFillAlter,
          }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                  {isZh ? '履约完成率' : 'FULFILLMENT RATE'}
                </span>
                <CheckCircleOutlined style={{ color: '#15803d', fontSize: 13 }} />
              </div>
            }
            value={otifRate}
            precision={1}
            suffix="%"
            styles={{ content: { fontSize: 20, fontWeight: 700, color: '#15803d' } }}
          />
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
            {deliveredCount} / {deliveries.length} {isZh ? '已完成出库' : 'Dispatched'}
          </div>
        </Card>
      </Col>

      {/* 4. Pending Production / QC */}
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
                  {isZh ? '待排产/确认订单' : 'PENDING ORDERS'}
                </span>
                <SafetyCertificateOutlined style={{ color: '#d97706', fontSize: 13 }} />
              </div>
            }
            value={pendingOrdersCount}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
            suffix={
              <span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 4 }}>
                {isZh ? '笔在途' : 'Orders'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '等待工程排产或审核' : 'Awaiting dispatch / review'}
          </div>
        </Card>
      </Col>

      {/* 5. Total Order Value */}
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
                  {isZh ? '销售合同总额' : 'TOTAL SALES REVENUE'}
                </span>
                <DollarOutlined style={{ color: '#0f766e', fontSize: 13 }} />
              </div>
            }
            value={revenueDisplay}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
            {isZh ? '已生效合同与在制总计' : 'Active contract valuation'}
          </div>
        </Card>
      </Col>
    </Row>
  );
};
