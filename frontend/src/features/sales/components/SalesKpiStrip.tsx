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

export const SalesKpiStrip: React.FC = () => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {/* 1. Active Sales Orders */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '在手销售订单' : 'ACTIVE SALES ORDERS'}
                </span>
                <ShoppingCartOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={45}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
            suffix={
              <span style={{ fontSize: 11, color: '#10b981', marginLeft: 8, fontWeight: 500 }}>
                +8.4% MoM
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            <span className="tnum" style={{ fontWeight: 600, color: token.colorText }}>$2.18M</span> {isZh ? '| 28家大客户管道' : '| 28 Key Accounts'}
          </div>
        </Card>
      </Col>

      {/* 2. Staged for Shipping Today */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '今日待发货' : 'STAGED FOR SHIPPING TODAY'}
                </span>
                <SendOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={12}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
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
                Bays 05-08
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            480 {isZh ? '箱 / 32托盘 | 14:30 顺丰接驳' : 'Cartons / 32p | 14:30 SF Freight'}
          </div>
        </Card>
      </Col>

      {/* 3. On-Time Delivery Rate (OTIF) */}
      <Col xs={12} sm={8} lg={4} xl={4}>
        <Card
          size="small"
          style={{ borderRadius: 4, border: '1px solid #86efac', backgroundColor: token.colorFillAlter }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                  {isZh ? '准时交付率 (OTIF)' : 'ON-TIME DELIVERY RATE'}
                </span>
                <CheckCircleOutlined style={{ color: '#15803d', fontSize: 13 }} />
              </div>
            }
            value={96.8}
            precision={1}
            suffix="%"
            valueStyle={{ fontSize: 20, fontWeight: 700, color: '#15803d' }}
          />
          <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
            {isZh ? '基线: ≥96.0% (A+评级)' : 'Target: ≥96.0% (Grade A+)'}
          </div>
        </Card>
      </Col>

      {/* 4. Pending Customer QC Approval */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '待客检确认' : 'PENDING CUSTOMER QC'}
                </span>
                <SafetyCertificateOutlined style={{ color: '#d97706', fontSize: 13 }} />
              </div>
            }
            value={4}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
            suffix={
              <span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 4 }}>
                {isZh ? '批出海产品' : 'Export Batches'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? 'Bay 06 暂存 | 平均客检耗时 45分' : 'Bay 06 Staging | Avg 45 mins'}
          </div>
        </Card>
      </Col>

      {/* 5. Monthly Invoiced Revenue */}
      <Col xs={12} sm={8} lg={5} xl={5}>
        <Card
          size="small"
          style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: token.colorTextSecondary, fontWeight: 600 }}>
                  {isZh ? '本月累计开票交付' : 'MONTHLY INVOICED REVENUE'}
                </span>
                <DollarOutlined style={{ color: '#0f766e', fontSize: 13 }} />
              </div>
            }
            value={3.85}
            precision={2}
            prefix="$"
            suffix={
              <span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 4 }}>
                M <span style={{ color: '#10b981' }}>88.2%</span>
              </span>
            }
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
          />
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
            {isZh ? '约¥27.7M | 达成率 88.2%' : '¥27.7M | 88.2% Q4 Target'}
          </div>
        </Card>
      </Col>
    </Row>
  );
};
