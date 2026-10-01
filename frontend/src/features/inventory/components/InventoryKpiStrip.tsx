import React from 'react';
import { Row, Col, Card, Statistic, theme } from 'antd';
import {
  AppstoreOutlined,
  DollarOutlined,
  AlertOutlined,
  InboxOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';

export const InventoryKpiStrip: React.FC = () => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {/* 1. Total Active SKUs */}
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
                  {isZh ? '在库物料种类' : 'TOTAL ACTIVE SKUS'}
                </span>
                <AppstoreOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={1482}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
            suffix={
              <span style={{ fontSize: 11, color: '#10b981', marginLeft: 8, fontWeight: 500 }}>
                +12 {isZh ? '本周新增' : 'this week'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            98.4% {isZh ? '已赋条码/RFID' : 'RFID/Bar Tracked'}
          </div>
        </Card>
      </Col>

      {/* 2. Total Valuation */}
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
                  {isZh ? '库存总货值' : 'INVENTORY VALUATION'}
                </span>
                <DollarOutlined style={{ color: '#0f766e', fontSize: 13 }} />
              </div>
            }
            value={4.28}
            precision={2}
            prefix="$"
            suffix={
              <span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 6 }}>
                M <span style={{ color: token.colorTextSecondary }}>({isZh ? '约¥30.8M' : '¥30.8M'})</span>
              </span>
            }
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
          />
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
            MoM -2.4% | {isZh ? '周转率 14.2天' : 'Turnover 14.2d'}
          </div>
        </Card>
      </Col>

      {/* 3. Safety Stock Alerts */}
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
                  {isZh ? '安全库存预警' : 'LOW SAFETY STOCK'}
                </span>
                <AlertOutlined style={{ color: '#dc2626', fontSize: 13 }} />
              </div>
            }
            value={14}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}
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
                {isZh ? '严重缺料' : 'Critical'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
            4 {isZh ? '笔采购单在途' : 'POs in transit'}
          </div>
        </Card>
      </Col>

      {/* 4. Inbound Staging */}
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
                  {isZh ? '待检入库暂存' : 'INBOUND STAGING'}
                </span>
                <InboxOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={180}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
            suffix={<span style={{ fontSize: 11, color: token.colorTextSecondary, marginLeft: 4 }}>{isZh ? '托盘' : 'pallets'}</span>}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            6 {isZh ? '批到货待检 (Dock 01-04)' : 'ASN arriving (Dock 01-04)'}
          </div>
        </Card>
      </Col>

      {/* 5. Staged for Lines */}
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
                  {isZh ? '产线备料待出库' : 'STAGED FOR LINES'}
                </span>
                <SendOutlined style={{ color: '#10b981', fontSize: 13 }} />
              </div>
            }
            value={42}
            valueStyle={{ fontSize: 20, fontWeight: 700, color: token.colorText }}
            suffix={
              <span
                style={{
                  fontSize: 10,
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '1px 5px',
                  borderRadius: 2,
                  marginLeft: 6,
                  fontWeight: 600,
                }}
              >
                {isZh ? '备料完成' : 'Picked'}
              </span>
            }
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '下次派送料: 25分钟后' : 'Next dispatch: 25 min'}
          </div>
        </Card>
      </Col>
    </Row>
  );
};
