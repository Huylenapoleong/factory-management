import React from 'react';
import { Card, Space, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { HourlyThroughputItem } from '../types';

interface HourlyThroughputCardProps {
  data: HourlyThroughputItem[];
}

export const HourlyThroughputCard: React.FC<HourlyThroughputCardProps> = ({ data }) => {
  const { t } = useTranslation();
  const { kioskMode } = useAppStore();
  const maxQty = Math.max(...data.map((d) => Math.max(d.targetQty, d.actualQty)), 250);

  const chartHeight = kioskMode ? 240 : 160;
  const maxBarHeight = kioskMode ? 180 : 120;

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: kioskMode ? 16 : 14, fontWeight: 700, color: '#1f2937' }}>
            {t('dashboard.hourlyThroughput')}
          </span>
          <Space size="middle" style={{ fontSize: kioskMode ? 13 : 12 }}>
            <Badge color="#e5e7eb" text={<span style={{ color: '#6b7280' }}>{t('dashboard.targetOutput')}</span>} />
            <Badge color="#1677ff" text={<span style={{ color: '#1f2937', fontWeight: 500 }}>{t('dashboard.actualOutput')}</span>} />
            <Badge color="#52c41a" text={<span style={{ color: '#52c41a', fontWeight: 600 }}>{t('dashboard.yieldRate')} (98.6%)</span>} />
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
      {/* Industrial SVG/CSS Bar + Line Chart */}
      <div style={{ width: '100%', height: chartHeight, display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 24, position: 'relative' }}>
        {/* Subtle horizontal grid lines */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: 1, borderTop: '1px dashed #f0f0f0' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, borderTop: '1px dashed #f0f0f0' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', height: 1, borderTop: '1px dashed #f0f0f0' }} />

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

      {/* Industrial OEE Footer Strip */}
      <div
        style={{
          marginTop: 4,
          padding: '6px 12px',
          backgroundColor: '#fafafa',
          borderRadius: 3,
          border: '1px solid #f0f0f0',
          fontSize: 11,
          color: '#4b5563',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span>
          <strong>OEE:</strong> 88.4% &nbsp;|&nbsp; <strong>Availability (稼动率):</strong> 92.1% &nbsp;|&nbsp;{' '}
          <strong>Performance (性能):</strong> 94.8% &nbsp;|&nbsp; <strong>Quality (良品率):</strong> 98.6%
        </span>
        <span className="tnum" style={{ color: '#1677ff', fontWeight: 600 }}>
          Cycle Time: 42.4s / part (Standard: 45.0s)
        </span>
      </div>
    </Card>
  );
};

export default HourlyThroughputCard;
