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
import { InventoryBalanceItem } from '../types';

interface InventoryKpiStripProps {
  balances?: InventoryBalanceItem[];
}

export const InventoryKpiStrip: React.FC<InventoryKpiStripProps> = ({ balances = [] }) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  const totalSkus = balances.length;
  const totalValuation = balances.reduce((s, b) => s + (b.totalValuation || 0), 0);
  const lowStockCount = balances.filter(
    (b) => b.status === 'LOW_STOCK' || b.status === 'STOCKOUT',
  ).length;
  const totalAvailable = balances.reduce((s, b) => s + (b.availableQuantity || 0), 0);
  const reservedCount = balances.reduce((s, b) => s + (b.reservedQuantity || 0), 0);

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {/* 1. Total Active SKUs */}
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
                  {isZh ? '在库物料种类' : 'TOTAL ACTIVE SKUS'}
                </span>
                <AppstoreOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={totalSkus}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '系统台账跟踪中' : 'Tracked in ledger'}
          </div>
        </Card>
      </Col>

      {/* 2. Total Valuation */}
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
                  {isZh ? '库存总货值' : 'INVENTORY VALUATION'}
                </span>
                <DollarOutlined style={{ color: '#0f766e', fontSize: 13 }} />
              </div>
            }
            value={totalValuation}
            precision={2}
            prefix="$"
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '实时账面货值' : 'Book valuation'}
          </div>
        </Card>
      </Col>

      {/* 3. Safety Stock Alerts */}
      <Col xs={12} sm={8} lg={4} xl={4}>
        <Card
          size="small"
          style={{
            borderRadius: 4,
            border:
              lowStockCount > 0 ? '1px solid #f87171' : `1px solid ${token.colorBorderSecondary}`,
            backgroundColor: lowStockCount > 0 ? token.colorFillAlter : token.colorBgContainer,
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
                    color: lowStockCount > 0 ? '#dc2626' : token.colorTextSecondary,
                    fontWeight: 600,
                  }}
                >
                  {isZh ? '安全库存预警' : 'LOW SAFETY STOCK'}
                </span>
                <AlertOutlined
                  style={{ color: lowStockCount > 0 ? '#dc2626' : '#10b981', fontSize: 13 }}
                />
              </div>
            }
            value={lowStockCount}
            styles={{
              content: {
                fontSize: 20,
                fontWeight: 700,
                color: lowStockCount > 0 ? '#dc2626' : token.colorText,
              },
            }}
            suffix={
              lowStockCount > 0 ? (
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
                  {isZh ? '缺料预警' : 'Alert'}
                </span>
              ) : null
            }
          />
          <div
            style={{
              fontSize: 11,
              color: lowStockCount > 0 ? '#ef4444' : token.colorTextSecondary,
              marginTop: 2,
            }}
          >
            {lowStockCount > 0
              ? isZh
                ? '低于安全库存水位'
                : 'Below safety threshold'
              : isZh
                ? '全部处于安全库存内'
                : 'Stock levels normal'}
          </div>
        </Card>
      </Col>

      {/* 4. Total Available Stock */}
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
                  {isZh ? '可用库存总数' : 'TOTAL AVAILABLE STOCK'}
                </span>
                <InboxOutlined style={{ color: '#1677ff', fontSize: 13 }} />
              </div>
            }
            value={totalAvailable}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
            suffix={<span style={{ fontSize: 11, color: token.colorTextSecondary }}>pcs</span>}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '现场可即时领用' : 'Available on hand'}
          </div>
        </Card>
      </Col>

      {/* 5. Reserved Stock */}
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
                  {isZh ? '已锁定/预留库存' : 'RESERVED STOCK'}
                </span>
                <SendOutlined style={{ color: '#10b981', fontSize: 13 }} />
              </div>
            }
            value={reservedCount}
            styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
            suffix={<span style={{ fontSize: 11, color: token.colorTextSecondary }}>pcs</span>}
          />
          <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
            {isZh ? '已分配给工单/订单' : 'Allocated to orders'}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default InventoryKpiStrip;
