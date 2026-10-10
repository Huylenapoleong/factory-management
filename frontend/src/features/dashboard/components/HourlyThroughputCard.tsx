import React from 'react';
import { Card, Space, Badge, theme, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { HourlyThroughputItem } from '../types';

interface HourlyThroughputCardProps {
  data: HourlyThroughputItem[];
}

export const HourlyThroughputCard: React.FC<HourlyThroughputCardProps> = ({ data }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { kioskMode } = useAppStore();
  const maxQty =
    data.length > 0 ? Math.max(...data.map((d) => Math.max(d.targetQty, d.actualQty)), 100) : 100;

  const avgYield =
    data.length > 0
      ? (data.reduce((s, d) => s + d.yieldRatePercent, 0) / data.length).toFixed(1)
      : null;

  const totalTarget = data.reduce((s, d) => s + d.targetQty, 0);
  const totalActual = data.reduce((s, d) => s + d.actualQty, 0);
  const performanceRate = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : '0.0';

  const chartHeight = kioskMode ? 240 : 160;
  const maxBarHeight = kioskMode ? 180 : 120;

  return (
    <Card
      size="small"
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
          <span style={{ fontSize: kioskMode ? 16 : 14, fontWeight: 700, color: token.colorText }}>
            {t('dashboard.hourlyThroughput')}
          </span>
          <Space size="middle" style={{ fontSize: kioskMode ? 13 : 12 }}>
            <Badge
              color={token.colorFillAlter}
              text={
                <span style={{ color: token.colorTextSecondary }}>
                  {t('dashboard.targetOutput')}
                </span>
              }
            />
            <Badge
              color="#1677ff"
              text={
                <span style={{ color: token.colorText, fontWeight: 500 }}>
                  {t('dashboard.actualOutput')}
                </span>
              }
            />
            <Badge
              color="#52c41a"
              text={
                <span style={{ color: '#52c41a', fontWeight: 600 }}>
                  {t('dashboard.yieldRate')}
                  {avgYield ? ` (${avgYield}%)` : ''}
                </span>
              }
            />
          </Space>
        </div>
      }
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        marginTop: 12,
      }}
      styles={{ body: { padding: kioskMode ? '16px 20px 10px 20px' : '12px 16px 8px 16px' } }}
    >
      {data.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('dashboard.noThroughputData') || 'No hourly production records yet'}
          style={{ margin: '24px 0' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: chartHeight,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            paddingBottom: 24,
            position: 'relative',
          }}
        >
          {/* Subtle horizontal grid lines */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '25%',
              height: 1,
              borderTop: '1px dashed #f0f0f0',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: 1,
              borderTop: '1px dashed #f0f0f0',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '75%',
              height: 1,
              borderTop: '1px dashed #f0f0f0',
            }}
          />

          {data.map((item) => {
            const actualHeight = Math.round((item.actualQty / maxQty) * maxBarHeight);
            const targetHeight = Math.round((item.targetQty / maxQty) * maxBarHeight);
            const isExceeded = item.actualQty >= item.targetQty;

            return (
              <div
                key={item.hourSlot}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative',
                }}
              >
                {/* Optional data labels on kiosk mode */}
                {kioskMode && (
                  <div
                    className="tnum"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isExceeded ? '#1677ff' : '#6b7280',
                      marginBottom: 2,
                    }}
                  >
                    {item.actualQty}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 3,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {/* Target Bar (Gray Outline) */}
                  <div
                    title={`Target: ${item.targetQty} pcs`}
                    style={{
                      width: '38%',
                      height: targetHeight,
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '2px 2px 0 0',
                      transition: 'all 0.2s',
                    }}
                  />
                  {/* Actual Bar (Solid Blue / Green) */}
                  <div
                    title={`Actual: ${item.actualQty} pcs (Yield: ${item.yieldRatePercent}%)`}
                    style={{
                      width: '38%',
                      height: actualHeight,
                      backgroundColor: isExceeded ? '#1677ff' : '#0958d9',
                      borderRadius: '2px 2px 0 0',
                      boxShadow: '0 1px 2px rgba(22, 119, 255, 0.2)',
                      transition: 'all 0.2s',
                    }}
                  />
                </div>

                {/* Bottom Hour Label */}
                <div
                  className="tnum"
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    fontSize: kioskMode ? 11 : 10,
                    color: '#6b7280',
                    fontWeight: kioskMode ? 700 : 500,
                  }}
                >
                  {item.hourSlot}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Industrial Summary Footer Strip */}
      <div
        style={{
          marginTop: 4,
          padding: '6px 12px',
          backgroundColor: token.colorFillAlter,
          borderRadius: 3,
          border: `1px solid ${token.colorBorderSecondary}`,
          fontSize: 11,
          color: token.colorTextSecondary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        {data.length > 0 ? (
          <>
            <span>
              <strong>{t('dashboard.totalTarget')}:</strong> {totalTarget.toLocaleString()} units
              &nbsp;|&nbsp; <strong>{t('dashboard.totalActual')}:</strong>{' '}
              {totalActual.toLocaleString()} units &nbsp;|&nbsp;{' '}
              <strong>{t('dashboard.attainmentRate')}:</strong> {performanceRate}% &nbsp;|&nbsp;{' '}
              <strong>{t('dashboard.avgYield')}:</strong> {avgYield ?? '0.0'}%
            </span>
            <span
              className="tnum"
              style={{
                color: totalActual >= totalTarget ? '#52c41a' : '#faad14',
                fontWeight: 600,
              }}
            >
              {totalActual >= totalTarget
                ? t('dashboard.onSchedule')
                : `${(totalTarget - totalActual).toLocaleString()} ${t('dashboard.unitsBehind')}`}
            </span>
          </>
        ) : (
          <>
            <span>
              <strong>{t('dashboard.telemetryStatus')}:</strong> {t('dashboard.awaitingShiftLogs')}
            </span>
            <span className="tnum" style={{ color: token.colorTextSecondary, fontWeight: 500 }}>
              {t('dashboard.idleStatus')}
            </span>
          </>
        )}
      </div>
    </Card>
  );
};

export default HourlyThroughputCard;
