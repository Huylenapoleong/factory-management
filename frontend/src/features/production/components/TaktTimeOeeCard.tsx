import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Button,
  Space,
  Typography,
  Tooltip,
  theme,
  Empty,
} from 'antd';
import { message } from '@/utils/antdApp';
import {
  DashboardOutlined,
  AlertFilled,
  CheckCircleFilled,
  ReloadOutlined,
  PhoneOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { playAlertChime, playSuccessChime } from '@/utils/audioAlert';
import { productionService } from '@/services/productionService';

const { Text } = Typography;

export interface WorkstationTakt {
  id: string;
  nameEn: string;
  nameZh: string;
  stationCode: string;
  targetTakt: number; // seconds
  currentElapsed: number; // seconds
  partCode: string;
  partName: string;
  operator: string;
}

interface OrdersSummary {
  totalPlanned: number;
  totalCompleted: number;
  totalScrap: number;
  attainmentRate: number;
  qualityRate: number;
  availabilityRate: number;
  oeePercent: number;
}

export const TaktTimeOeeCard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { language, soundAlertsEnabled, kioskMode } = useAppStore();
  const [stations, setStations] = useState<WorkstationTakt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ordersSummary, setOrdersSummary] = useState<OrdersSummary>({
    totalPlanned: 0,
    totalCompleted: 0,
    totalScrap: 0,
    attainmentRate: 0,
    qualityRate: 0,
    availabilityRate: 0,
    oeePercent: 0,
  });

  const loadTelemetryData = useCallback(
    (orders: Awaited<ReturnType<typeof productionService.getProductionOrders>>) => {
      if (!orders || orders.length === 0) {
        setStations([]);
        setOrdersSummary({
          totalPlanned: 0,
          totalCompleted: 0,
          totalScrap: 0,
          attainmentRate: 0,
          qualityRate: 0,
          availabilityRate: 0,
          oeePercent: 0,
        });
        return;
      }

      const activeRunningOrders = orders.filter(
        (o) => o.status === 'IN_PRODUCTION' || o.status === 'QC_TESTING',
      );
      const plannedSum = orders.reduce((s, o) => s + (o.plannedQty || 0), 0);
      const completedSum = orders.reduce((s, o) => s + (o.completedQty || 0), 0);
      const scrapSum = orders.reduce((s, o) => s + (o.scrapQty || 0), 0);

      const attainment = plannedSum > 0 ? (completedSum / plannedSum) * 100 : 0;
      const totalUnits = completedSum + scrapSum;
      const quality = totalUnits > 0 ? (completedSum / totalUnits) * 100 : 0;
      const availability =
        orders.length > 0 ? (activeRunningOrders.length / orders.length) * 100 : 0;
      const oee = (availability / 100) * (Math.min(100, attainment) / 100) * (quality / 100) * 100;

      setOrdersSummary({
        totalPlanned: plannedSum,
        totalCompleted: completedSum,
        totalScrap: scrapSum,
        attainmentRate: Math.round(attainment * 10) / 10,
        qualityRate: totalUnits > 0 ? Math.round(quality * 10) / 10 : 0,
        availabilityRate: Math.round(availability * 10) / 10,
        oeePercent: Math.round(oee * 10) / 10,
      });

      if (activeRunningOrders.length === 0) {
        setStations([]);
        return;
      }

      const mapped: WorkstationTakt[] = activeRunningOrders.slice(0, 4).map((order, idx) => ({
        id: `st-${order.id}`,
        nameEn: `Line 0${idx + 1} (${order.orderNo})`,
        nameZh: `产线 0${idx + 1} (${order.orderNo})`,
        stationCode: `WS-0${idx + 1}`,
        targetTakt: 60,
        currentElapsed: 0,
        partCode: order.productCode,
        partName: language === 'zh-CN' ? order.productNameZh : order.productName,
        operator: language === 'zh-CN' ? '产线操作员' : 'Line Operator',
      }));
      setStations(mapped);
    },
    [language],
  );

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const orders = await productionService.getProductionOrders();
      loadTelemetryData(orders);
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void productionService.getProductionOrders().then((orders) => {
      if (!active) return;
      loadTelemetryData(orders);
    });
    return () => {
      active = false;
    };
  }, [loadTelemetryData]);

  // Live timer tick every 1000ms
  useEffect(() => {
    if (stations.length === 0) return;

    const timer = setInterval(() => {
      setStations((prev) =>
        prev.map((station) => {
          const nextElapsed = station.currentElapsed + 1;
          // Auto-cycle if it reaches 1.5x target
          if (nextElapsed >= Math.round(station.targetTakt * 1.5)) {
            return { ...station, currentElapsed: 1 };
          }
          return { ...station, currentElapsed: nextElapsed };
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [stations.length]);

  const handleResetStation = (id: string) => {
    setStations((prev) => prev.map((s) => (s.id === id ? { ...s, currentElapsed: 0 } : s)));
    playSuccessChime();
    message.success(
      language === 'zh-CN'
        ? '工序已下件重置，新节拍周期开始计测'
        : 'Station cycle reset. Starting new takt cycle.',
    );
  };

  const handleCallSupervisor = (station: WorkstationTakt) => {
    if (soundAlertsEnabled) {
      playAlertChime();
    }
    message.warning(
      language === 'zh-CN'
        ? `已呼叫班组长前往支援：${station.stationCode} (${station.nameZh}) 节拍超时！`
        : `Supervisor dispatched to ${station.stationCode} (${station.nameEn})! Takt bottleneck alert.`,
    );
  };

  return (
    <Card
      size="small"
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        marginBottom: 12,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Space align="center" size="small">
            <FieldTimeOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            <span style={{ fontSize: kioskMode ? 16 : 14, fontWeight: 700, color: '#1f2937' }}>
              {t('takt.title')}
            </span>
            <Tag color="processing" style={{ borderRadius: 2, fontSize: 11, margin: 0 }}>
              {language === 'zh-CN' ? '实时节拍 1Hz 脉冲' : 'Live 1Hz Telemetry'}
            </Tag>
          </Space>

          <Space size="small">
            <Button
              size="small"
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => void handleManualRefresh()}
              style={{ fontSize: 11 }}
            >
              {language === 'zh-CN' ? '刷新遥测' : 'Refresh Telemetry'}
            </Button>
          </Space>
        </div>
      }
      styles={{ body: { padding: '12px 16px' } }}
    >
      {/* 1. Real-time Station Cards Grid */}
      {stations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            language === 'zh-CN'
              ? '当前无运行中的生产工单/产线节拍'
              : 'No active production orders running'
          }
          style={{ margin: '24px 0' }}
        />
      ) : (
        <Row gutter={[12, 12]}>
          {stations.map((st) => {
            const isExceeded = st.currentElapsed > st.targetTakt;
            const diff = st.currentElapsed - st.targetTakt;
            const percent = Math.min(Math.round((st.currentElapsed / st.targetTakt) * 100), 100);

            return (
              <Col xs={24} sm={12} lg={6} key={st.id}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 4,
                    border: isExceeded
                      ? `2px solid ${token.colorWarning}`
                      : `1px solid ${token.colorBorderSecondary}`,
                    backgroundColor: isExceeded ? token.colorWarningBg : token.colorBgContainer,
                    boxShadow: isExceeded ? '0 0 10px rgba(250, 173, 20, 0.35)' : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Station Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isExceeded ? token.colorWarningText : token.colorText,
                          fontFamily: 'monospace',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {st.stationCode}
                      </span>
                      <div
                        style={{
                          fontSize: 11,
                          color: token.colorTextSecondary,
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {language === 'zh-CN' ? st.nameZh : st.nameEn}
                      </div>
                    </div>

                    {isExceeded ? (
                      <Tag
                        color="warning"
                        style={{
                          margin: 0,
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          animation: 'pulse 1.5s infinite',
                        }}
                      >
                        <AlertFilled style={{ color: '#d48806' }} />+{diff}s{' '}
                        {language === 'zh-CN' ? '超时' : 'EXCEEDED'}
                      </Tag>
                    ) : (
                      <Tag
                        color="success"
                        style={{
                          margin: 0,
                          fontSize: 10,
                          fontWeight: 600,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CheckCircleFilled />
                        {language === 'zh-CN' ? '正常' : 'NORMAL'}
                      </Tag>
                    )}
                  </div>

                  {/* Big Takt Countdown / Elapsed Display */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 6,
                      margin: '8px 0 4px 0',
                    }}
                  >
                    <span
                      className="tnum"
                      style={{
                        fontSize: kioskMode ? 32 : 26,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: isExceeded ? '#d48806' : '#1677ff',
                        fontFamily: 'monospace',
                      }}
                    >
                      {st.currentElapsed.toFixed(0)}
                      <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 2 }}>s</span>
                    </span>
                    <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                      / {t('takt.targetTakt')}: <strong>{st.targetTakt}s</strong>
                    </span>
                  </div>

                  {/* Cycle Progress Bar */}
                  <Progress
                    percent={percent}
                    status={isExceeded ? 'exception' : 'active'}
                    strokeColor={isExceeded ? '#faad14' : '#1677ff'}
                    showInfo={false}
                    size="small"
                    style={{ marginBottom: 8 }}
                  />

                  {/* Part & Operator Details */}
                  <div
                    style={{
                      fontSize: 11,
                      color: token.colorTextSecondary,
                      lineHeight: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <Text type="secondary">{t('takt.activePart')}: </Text>
                      <Text strong style={{ color: token.colorText }}>
                        {st.partCode}
                      </Text>
                    </div>
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {st.partName}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {isExceeded ? (
                      <Tooltip
                        title={
                          language === 'zh-CN'
                            ? '向车间调度中心呼叫支援'
                            : 'Dispatch supervisor to assist station'
                        }
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<PhoneOutlined />}
                          onClick={() => handleCallSupervisor(st)}
                          style={{
                            flex: 1,
                            fontSize: 11,
                            height: 26,
                            backgroundColor: '#faad14',
                            borderColor: '#faad14',
                          }}
                        >
                          {t('takt.callSupervisor')}
                        </Button>
                      </Tooltip>
                    ) : null}
                    <Button
                      size="small"
                      onClick={() => handleResetStation(st.id)}
                      style={{ flex: isExceeded ? '0 0 auto' : 1, fontSize: 11, height: 26 }}
                    >
                      {t('takt.resetCycle')}
                    </Button>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* 2. Real-Time OEE Breakdown Strip */}
      <div
        style={{
          marginTop: 12,
          padding: '10px 16px',
          backgroundColor: token.colorFillAlter,
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space size="middle" align="center">
          <DashboardOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
          <div>
            <div
              style={{
                fontSize: 11,
                color: token.colorTextSecondary,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {t('takt.meanOee')}
            </div>
            <div
              className="tnum"
              style={{ fontSize: 22, fontWeight: 800, color: token.colorText, lineHeight: 1.1 }}
            >
              {ordersSummary.oeePercent}%{' '}
              <span
                style={{
                  fontSize: 11,
                  color:
                    ordersSummary.oeePercent >= 85 ? token.colorSuccess : token.colorTextSecondary,
                  fontWeight: 600,
                }}
              >
                (
                {ordersSummary.oeePercent > 0
                  ? language === 'zh-CN'
                    ? '综合加权 OEE'
                    : 'Weighted OEE'
                  : language === 'zh-CN'
                    ? '待机'
                    : 'Standby'}
                )
              </span>
            </div>
          </div>
        </Space>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
              {t('takt.availability')}
            </div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: token.colorText }}>
              {ordersSummary.availabilityRate}%{' '}
              <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                (
                {ordersSummary.availabilityRate > 0
                  ? language === 'zh-CN'
                    ? '产线排产运行'
                    : 'Active Lines'
                  : language === 'zh-CN'
                    ? '待机'
                    : 'Standby'}
                )
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
              {t('takt.performance')}
            </div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: token.colorText }}>
              {ordersSummary.attainmentRate}%{' '}
              <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                ({ordersSummary.totalCompleted} / {ordersSummary.totalPlanned} pcs)
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: token.colorTextSecondary }}>{t('takt.quality')}</div>
            <div
              className="tnum"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color:
                  ordersSummary.totalCompleted > 0 && ordersSummary.qualityRate >= 98
                    ? token.colorSuccess
                    : token.colorText,
              }}
            >
              {ordersSummary.totalCompleted + ordersSummary.totalScrap > 0
                ? `${ordersSummary.qualityRate}%`
                : '0%'}{' '}
              <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                ({ordersSummary.totalScrap} {language === 'zh-CN' ? '件报废' : 'scraps'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaktTimeOeeCard;
