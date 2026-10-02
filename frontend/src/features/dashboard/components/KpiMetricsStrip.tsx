import React from 'react';
import { Row, Col, Card, Progress, Tag, theme } from 'antd';
import {
  RiseOutlined,
  ToolOutlined,
  AlertOutlined,
  SendOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DashboardSummary } from '../types';

interface KpiMetricsStripProps {
  summary: DashboardSummary;
}

export const KpiMetricsStrip: React.FC<KpiMetricsStripProps> = ({ summary }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: token.colorBgContainer,
  };

  const bodyStyle: React.CSSProperties = {
    padding: '12px 14px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <Row gutter={[12, 12]} style={{ alignItems: 'stretch' }}>
      {/* 1. Daily Plan Completion */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card size="small" style={cardStyle} styles={{ body: bodyStyle }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                {t('dashboard.planCompletion')}
              </span>
              <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minHeight: 30, marginBottom: 8 }} className="tnum">
              <span style={{ fontSize: 24, fontWeight: 700, color: token.colorText, lineHeight: 1 }}>
                {summary.dailyPlanCompletionRate}%
              </span>
              <span style={{ fontSize: 11, color: '#52c41a', fontWeight: 600 }}>
                ↑ {t('dashboard.planCompletionTrend')}
              </span>
            </div>

            <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
              <Progress
                percent={summary.dailyPlanCompletionRate}
                strokeColor="#52c41a"
                railColor={token.colorFillAlter}
                size={['100%', 6]}
                showInfo={false}
                style={{ margin: 0, width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: token.colorTextSecondary }}>
            <span>{t('dashboard.planCompletionTarget')}</span>
            <span className="tnum">Produced: 2,820 / 3,000 {t('common.pcs')}</span>
          </div>
        </Card>
      </Col>

      {/* 2. Active Work Orders */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card size="small" style={cardStyle} styles={{ body: bodyStyle }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                {t('dashboard.activeWorkOrders')}
              </span>
              <ToolOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 30, marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: token.colorText, lineHeight: 1 }} className="tnum">
                {summary.activeProductionOrders} <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>Orders</span>
              </span>
              <Tag color="warning" style={{ fontSize: 11, borderRadius: 2, margin: 0, padding: '1px 6px' }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />
                {summary.activeOrdersNearDeadline} {t('dashboard.nearDeadline')}
              </Tag>
            </div>

            <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
              <div style={{ height: 6, width: '100%', backgroundColor: token.colorFillAlter, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '78%', backgroundColor: '#1677ff' }} />
                <div style={{ width: '11%', backgroundColor: '#faad14' }} />
                <div style={{ width: '11%', backgroundColor: '#ff4d4f' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: token.colorTextSecondary }}>
            <span>{t('dashboard.activeWorkOrdersSub')}</span>
            <span className="tnum">Floor WIP: 4,490 {t('common.pcs')}</span>
          </div>
        </Card>
      </Col>

      {/* 3. Safety Stock Alerts */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card size="small" style={cardStyle} styles={{ body: bodyStyle }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                {t('dashboard.safetyStockAlerts')}
              </span>
              <AlertOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 30, marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#cf1322', lineHeight: 1 }} className="tnum">
                {summary.lowStockItemsCount} <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>Items</span>
              </span>
              <Tag color="error" style={{ fontSize: 11, borderRadius: 2, margin: 0, padding: '1px 6px', fontWeight: 600 }}>
                {t('dashboard.criticalShortage')}
              </Tag>
            </div>

            <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
              <div style={{ height: 6, width: '100%', backgroundColor: '#fff1f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '100%', backgroundColor: '#ff4d4f' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: token.colorTextSecondary }}>
            <span>{t('dashboard.safetyStockAlertsSub')}</span>
            <span style={{ color: '#cf1322', fontWeight: 500 }}>Risk: Stage 2 CNC</span>
          </div>
        </Card>
      </Col>

      {/* 4. Pending Outbound Shipments */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card size="small" style={cardStyle} styles={{ body: bodyStyle }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                {t('dashboard.outboundDeliveries')}
              </span>
              <SendOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 30, marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: token.colorText, lineHeight: 1 }} className="tnum">
                {summary.openSalesOrders} <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>Orders</span>
              </span>
              <Tag color="processing" style={{ fontSize: 11, borderRadius: 2, margin: 0, padding: '1px 6px' }}>
                {summary.dispatchedSalesOrdersToday} {t('dashboard.dispatched')}
              </Tag>
            </div>

            <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
              <Progress
                percent={Math.round((summary.dispatchedSalesOrdersToday / summary.openSalesOrders) * 100)}
                strokeColor="#1677ff"
                railColor={token.colorFillAlter}
                size={['100%', 6]}
                showInfo={false}
                style={{ margin: 0, width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: token.colorTextSecondary }}>
            <span>{t('dashboard.outboundDeliveriesSub')}</span>
            <span className="tnum">Volume: 4.8 CBM</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default KpiMetricsStrip;
