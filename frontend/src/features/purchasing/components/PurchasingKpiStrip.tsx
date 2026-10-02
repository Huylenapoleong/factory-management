import React from 'react';
import { Row, Col, Card, Statistic, theme } from 'antd';
import {
  FileTextOutlined,
  InboxOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';

export const PurchasingKpiStrip: React.FC = () => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {/* 1. Active Purchase Orders */}
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
                  {isZh ? '在途采购单' : 'ACTIVE PURCHASE ORDERS'}
                </span>
                <FileTextOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={28}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
            suffix={
              <span style={{ fontSize: 11, color: '#10b981', marginLeft: 8, fontWeight: 500 }}>
                +4.2% MoM
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            <span className="tnum" style={{ fontWeight: 600, color: token.colorText }}>$842,500</span> {isZh ? '| 14家合格供方' : '| 14 Active Suppliers'}
          </div>
        </Card>
      </Col>

      {/* 2. Inbound Expected Today */}
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
                  {isZh ? '今日预计到港' : 'INBOUND EXPECTED TODAY'}
                </span>
                <InboxOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={6}
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
                Bays 01-04
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            380 {isZh ? '托盘 | 下次到货: 11:45' : 'pallets | ETA: 11:45 AM'}
          </div>
        </Card>
      </Col>

      {/* 3. Delayed Deliveries */}
      <Col xs={12} sm={8} lg={4} xl={4}>
        <Card
          size="small"
          style={{ borderRadius: 4, border: '1px solid #f87171', backgroundColor: token.colorFillAlter }}
          styles={{ body: { padding: '8px 12px' } }}
        >
          <Statistic
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                  {isZh ? '交付逾期预警' : 'DELAYED DELIVERIES'}
                </span>
                <AlertOutlined style={{ color: '#dc2626', fontSize: 13 }} />
              </div>
            }
            value={2}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: '#dc2626' } }}
            suffix={
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
            }
          />
          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
            RM-STEEL-304, Fastener-M8
          </div>
        </Card>
      </Col>

      {/* 4. Pending QC Inspection */}
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
                  {isZh ? '待质检入库' : 'PENDING QC INSPECTION'}
                </span>
                <SafetyCertificateOutlined style={{ color: '#d97706', fontSize: 13 }} />
              </div>
            }
            value={3}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
            suffix={
              <span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 4 }}>
                {isZh ? '批 (140托盘)' : 'Batches (140p)'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '平均等待: 38分钟 | Bay 02 暂存' : 'Avg wait: 38 mins | Bay 02 Hold'}
          </div>
        </Card>
      </Col>

      {/* 5. Monthly Procurement Spend */}
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
                  {isZh ? '本月累计采购额' : 'MONTHLY PROCUREMENT SPEND'}
                </span>
                <DollarOutlined style={{ color: '#0f766e', fontSize: 13 }} />
              </div>
            }
            value={1.24}
            precision={2}
            prefix="$"
            suffix={
              <span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 4 }}>
                M <span style={{ color: '#10b981' }}>78.4%</span>
              </span>
            }
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
            Optimal Cost Index | FY26-Q4
          </div>
        </Card>
      </Col>
    </Row>
  );
};
