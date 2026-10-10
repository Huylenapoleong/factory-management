import React from 'react';
import { Row, Col, Card, Progress, Tag, theme, Tooltip } from 'antd';
import {
  RiseOutlined,
  ToolOutlined,
  AlertOutlined,
  SendOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardSummary } from '../types';

interface KpiMetricsStripProps {
  summary: DashboardSummary;
}

export const KpiMetricsStrip: React.FC<KpiMetricsStripProps> = ({ summary }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: token.colorBgContainer,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
        <Tooltip
          title={t(
            'dashboard.viewProductionDetails',
            'Click to view production schedules & work orders',
          )}
        >
          <Card
            hoverable
            size="small"
            style={cardStyle}
            styles={{ body: bodyStyle }}
            onClick={() => navigate('/production')}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                  {t('dashboard.planCompletion')}
                </span>
                <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  minHeight: 30,
                  marginBottom: 8,
                }}
                className="tnum"
              >
                <span
                  style={{ fontSize: 24, fontWeight: 700, color: token.colorText, lineHeight: 1 }}
                >
                  {summary.dailyPlanCompletionRate}%
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color:
                      summary.dailyPlanCompletionRate > 0 ? '#52c41a' : token.colorTextTertiary,
                    fontWeight: 600,
                  }}
                >
                  {summary.dailyPlanCompletionRate > 0
                    ? `↑ ${summary.dailyPlanCompletionRate}% ${t('dashboard.attainmentRate')}`
                    : t('dashboard.shiftStandby')}
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                fontSize: 11,
                color: token.colorTextSecondary,
              }}
            >
              <span>{t('dashboard.planCompletionTarget')}</span>
              <span className="tnum">
                {summary.dailyPlanCompletionRate >= 100
                  ? t('dashboard.targetMet')
                  : summary.dailyPlanCompletionRate > 0
                    ? t('dashboard.activeShift')
                    : t('dashboard.standby')}
              </span>
            </div>
          </Card>
        </Tooltip>
      </Col>

      {/* 2. Active Work Orders */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Tooltip
          title={t('dashboard.viewActiveWorkOrders', 'Click to view active production work orders')}
        >
          <Card
            hoverable
            size="small"
            style={cardStyle}
            styles={{ body: bodyStyle }}
            onClick={() => navigate('/production')}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                  {t('dashboard.activeWorkOrders')}
                </span>
                <ToolOutlined style={{ color: '#1677ff', fontSize: 16 }} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 30,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 24, fontWeight: 700, color: token.colorText, lineHeight: 1 }}
                  className="tnum"
                >
                  {summary.activeProductionOrders}{' '}
                  <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                    {t('dashboard.ordersUnit')}
                  </span>
                </span>
                <Tag
                  color="warning"
                  style={{ fontSize: 11, borderRadius: 2, margin: 0, padding: '1px 6px' }}
                >
                  <ClockCircleOutlined style={{ marginRight: 3 }} />
                  {summary.activeOrdersNearDeadline} {t('dashboard.nearDeadline')}
                </Tag>
              </div>

              <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    height: 6,
                    width: '100%',
                    backgroundColor: token.colorFillAlter,
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                  }}
                >
                  {summary.activeProductionOrders > 0 ? (
                    <>
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            100 -
                              Math.round(
                                (summary.activeOrdersNearDeadline /
                                  summary.activeProductionOrders) *
                                  100,
                              ),
                          )}%`,
                          backgroundColor: '#1677ff',
                        }}
                      />
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (summary.activeOrdersNearDeadline / summary.activeProductionOrders) *
                                100,
                            ),
                          )}%`,
                          backgroundColor: '#faad14',
                        }}
                      />
                    </>
                  ) : (
                    <div style={{ width: '100%', backgroundColor: token.colorFillAlter }} />
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                fontSize: 11,
                color: token.colorTextSecondary,
              }}
            >
              <span>
                {summary.activeProductionOrders === 0
                  ? t('dashboard.noActiveOrders')
                  : `${Math.max(0, summary.activeProductionOrders - summary.activeOrdersNearDeadline)} ${t('dashboard.onSchedule')} | ${summary.activeOrdersNearDeadline} ${t('dashboard.urgentOrders')}`}
              </span>
              <span className="tnum">
                {summary.activeProductionOrders > 0
                  ? `${summary.activeProductionOrders} ${t('dashboard.activeLines')}`
                  : t('dashboard.allLinesIdle')}
              </span>
            </div>
          </Card>
        </Tooltip>
      </Col>

      {/* 3. Safety Stock Alerts */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Tooltip
          title={t(
            'dashboard.viewInventoryLedger',
            'Click to view inventory ledger & stock balances',
          )}
        >
          <Card
            hoverable
            size="small"
            style={cardStyle}
            styles={{ body: bodyStyle }}
            onClick={() => navigate('/inventory')}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                  {t('dashboard.safetyStockAlerts')}
                </span>
                <AlertOutlined
                  style={{
                    color: summary.lowStockItemsCount > 0 ? '#ff4d4f' : token.colorSuccess,
                    fontSize: 16,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 30,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: summary.lowStockItemsCount > 0 ? '#cf1322' : token.colorText,
                    lineHeight: 1,
                  }}
                  className="tnum"
                >
                  {summary.lowStockItemsCount}{' '}
                  <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                    {t('dashboard.itemsUnit')}
                  </span>
                </span>
                {summary.lowStockItemsCount > 0 ? (
                  <Tag
                    color="error"
                    style={{
                      fontSize: 11,
                      borderRadius: 2,
                      margin: 0,
                      padding: '1px 6px',
                      fontWeight: 600,
                    }}
                  >
                    {t('dashboard.criticalShortage')}
                  </Tag>
                ) : (
                  <Tag
                    color="success"
                    style={{
                      fontSize: 11,
                      borderRadius: 2,
                      margin: 0,
                      padding: '1px 6px',
                      fontWeight: 600,
                    }}
                  >
                    {t('dashboard.nominalStatus')}
                  </Tag>
                )}
              </div>

              <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    height: 6,
                    width: '100%',
                    backgroundColor:
                      summary.lowStockItemsCount > 0 ? '#fff1f0' : token.colorFillAlter,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: summary.lowStockItemsCount > 0 ? '100%' : '0%',
                      backgroundColor: '#ff4d4f',
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                fontSize: 11,
                color: token.colorTextSecondary,
              }}
            >
              <span>
                {summary.lowStockItemsCount > 0
                  ? `${summary.lowStockItemsCount} ${t('dashboard.lowStockSkus')}`
                  : t('dashboard.allStockSafe')}
              </span>
              <span
                style={{
                  color: summary.lowStockItemsCount > 0 ? '#cf1322' : '#52c41a',
                  fontWeight: 500,
                }}
              >
                {summary.lowStockItemsCount > 0
                  ? `${summary.lowStockItemsCount} ${t('dashboard.shortages')}`
                  : t('dashboard.nominalStatus')}
              </span>
            </div>
          </Card>
        </Tooltip>
      </Col>

      {/* 4. Pending Outbound Shipments */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Tooltip
          title={t('dashboard.viewSalesOrders', 'Click to view sales orders & outbound dispatches')}
        >
          <Card
            hoverable
            size="small"
            style={cardStyle}
            styles={{ body: bodyStyle }}
            onClick={() => navigate('/sales')}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                  {t('dashboard.outboundDeliveries')}
                </span>
                <SendOutlined style={{ color: '#1677ff', fontSize: 16 }} />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 30,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 24, fontWeight: 700, color: token.colorText, lineHeight: 1 }}
                  className="tnum"
                >
                  {summary.openSalesOrders}{' '}
                  <span style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary }}>
                    {t('dashboard.ordersUnit')}
                  </span>
                </span>
                <Tag
                  color="processing"
                  style={{ fontSize: 11, borderRadius: 2, margin: 0, padding: '1px 6px' }}
                >
                  {summary.dispatchedSalesOrdersToday} {t('dashboard.dispatched')}
                </Tag>
              </div>

              <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <Progress
                  percent={
                    summary.openSalesOrders > 0
                      ? Math.round(
                          (summary.dispatchedSalesOrdersToday / summary.openSalesOrders) * 100,
                        )
                      : 0
                  }
                  strokeColor="#1677ff"
                  railColor={token.colorFillAlter}
                  size={['100%', 6]}
                  showInfo={false}
                  style={{ margin: 0, width: '100%' }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                fontSize: 11,
                color: token.colorTextSecondary,
              }}
            >
              <span>
                {summary.openSalesOrders > 0
                  ? `${summary.openSalesOrders} ${t('dashboard.awaitingDispatch')}`
                  : t('dashboard.noPendingDeliveries')}
              </span>
              <span className="tnum">
                {summary.dispatchedSalesOrdersToday} / {summary.openSalesOrders}{' '}
                {t('dashboard.fulfilled')}
              </span>
            </div>
          </Card>
        </Tooltip>
      </Col>
    </Row>
  );
};

export default KpiMetricsStrip;
