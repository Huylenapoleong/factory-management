import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Tag, Button, Space, Typography, Tooltip, message } from 'antd';
import {
  DashboardOutlined,
  AlertFilled,
  CheckCircleFilled,
  ReloadOutlined,
  ThunderboltOutlined,
  PhoneOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { playAlertChime, playSuccessChime } from '@/utils/audioAlert';

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

const INITIAL_STATIONS: WorkstationTakt[] = [
  {
    id: 'st-01',
    nameEn: 'CNC 5-Axis Milling Cell',
    nameZh: 'CNC 5轴高速机加单元',
    stationCode: 'CNC-01',
    targetTakt: 45,
    currentElapsed: 38,
    partCode: 'P-1002',
    partName: 'Titanium Flange (钛合金法兰)',
    operator: 'Wang Lei (EMP-204)',
  },
  {
    id: 'st-02',
    nameEn: 'High-Speed SMT Line #2',
    nameZh: 'SMT 2号贴片高速线',
    stationCode: 'SMT-02',
    targetTakt: 30,
    currentElapsed: 36, // exceeded by default to showcase feature
    partCode: 'PCB-8801',
    partName: 'Driver Controller (主控板)',
    operator: 'Chen Min (EMP-312)',
  },
  {
    id: 'st-03',
    nameEn: 'Hydraulic Robotic Assembly',
    nameZh: '液压总装自动化单元',
    stationCode: 'ASSY-03',
    targetTakt: 60,
    currentElapsed: 41,
    partCode: 'A-3001',
    partName: 'Drive Pump (液压泵总成)',
    operator: 'Zhao Gang (EMP-118)',
  },
  {
    id: 'st-04',
    nameEn: 'AOI Optical Inspection Station',
    nameZh: 'AOI 自动光学检测站',
    stationCode: 'AOI-04',
    targetTakt: 20,
    currentElapsed: 14,
    partCode: 'C-9002',
    partName: 'Sensor Housing (传感器外壳)',
    operator: 'Auto AOI Robot #4',
  },
];

export const TaktTimeOeeCard: React.FC = () => {
  const { t } = useTranslation();
  const { language, soundAlertsEnabled, kioskMode } = useAppStore();
  const [stations, setStations] = useState<WorkstationTakt[]>(INITIAL_STATIONS);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Live timer tick every 1000ms
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setStations((prev) =>
        prev.map((station) => {
          const nextElapsed = station.currentElapsed + 1;
          // Auto-cycle if it reaches 1.5x target
          if (nextElapsed >= Math.round(station.targetTakt * 1.5)) {
            return { ...station, currentElapsed: 1 };
          }
          return { ...station, currentElapsed: nextElapsed };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const handleResetStation = (id: string) => {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, currentElapsed: 0 } : s))
    );
    playSuccessChime();
    message.success(
      language === 'zh-CN'
        ? '工序已下件重置，新节拍周期开始计测'
        : 'Station cycle reset. Starting new takt cycle.'
    );
  };

  const handleCallSupervisor = (station: WorkstationTakt) => {
    if (soundAlertsEnabled) {
      playAlertChime();
    }
    message.warning(
      language === 'zh-CN'
        ? `已呼叫班组长前往支援：${station.stationCode} (${station.nameZh}) 节拍超时！`
        : `Supervisor dispatched to ${station.stationCode} (${station.nameEn})! Takt bottleneck alert.`
    );
  };

  const handleSimulateToggle = () => {
    setStations((prev) =>
      prev.map((s) =>
        s.id === 'st-02'
          ? {
              ...s,
              currentElapsed: s.currentElapsed > s.targetTakt ? 15 : s.targetTakt + 7,
            }
          : s
      )
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
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
              icon={<ThunderboltOutlined />}
              onClick={handleSimulateToggle}
              style={{ fontSize: 11 }}
            >
              {t('takt.simulateBottleneck')}
            </Button>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => {
                setStations(INITIAL_STATIONS);
                setIsRunning(true);
              }}
              style={{ fontSize: 11 }}
            >
              {language === 'zh-CN' ? '重置全部' : 'Reset All'}
            </Button>
          </Space>
        </div>
      }
      styles={{ body: { padding: '12px 16px' } }}
    >
      {/* 1. Real-time Station Cards Grid */}
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
                  border: isExceeded ? '2px solid #faad14' : '1px solid #e5e7eb',
                  backgroundColor: isExceeded ? '#fffbe6' : '#ffffff',
                  boxShadow: isExceeded ? '0 0 10px rgba(250, 173, 20, 0.35)' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Station Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isExceeded ? '#d48806' : '#1f2937',
                        fontFamily: 'monospace',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {st.stationCode}
                    </span>
                    <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 500, lineHeight: 1.2 }}>
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
                      <AlertFilled style={{ color: '#d48806' }} />
                      +{diff}s {language === 'zh-CN' ? '超时' : 'EXCEEDED'}
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '8px 0 4px 0' }}>
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
                  <span style={{ fontSize: 11, color: '#6b7280' }}>
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
                <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4, marginBottom: 8 }}>
                  <div>
                    <Text type="secondary">{t('takt.activePart')}: </Text>
                    <Text strong style={{ color: '#1f2937' }}>{st.partCode}</Text>
                  </div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {st.partName}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {isExceeded ? (
                    <Tooltip title={language === 'zh-CN' ? '向车间调度中心呼叫支援' : 'Dispatch supervisor to assist station'}>
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<PhoneOutlined />}
                        onClick={() => handleCallSupervisor(st)}
                        style={{ flex: 1, fontSize: 11, height: 26, backgroundColor: '#faad14', borderColor: '#faad14' }}
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

      {/* 2. Real-Time OEE Breakdown Strip */}
      <div
        style={{
          marginTop: 12,
          padding: '10px 16px',
          backgroundColor: '#f8fafc',
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space size="middle" align="center">
          <DashboardOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              {t('takt.meanOee')}
            </div>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              86.8%{' '}
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                ({language === 'zh-CN' ? '达标 ≥85%' : 'Benchmark ≥85%'})
              </span>
            </div>
          </div>
        </Space>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{t('takt.availability')}</div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>
              93.4% <span style={{ fontSize: 11, color: '#6b7280' }}>(28m {language === 'zh-CN' ? '停机' : 'downtime'})</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{t('takt.performance')}</div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>
              94.2% <span style={{ fontSize: 11, color: '#6b7280' }}>(42.1s / 45s)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{t('takt.quality')}</div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>
              98.7% <span style={{ fontSize: 11, color: '#6b7280' }}>(14 {language === 'zh-CN' ? '件报废' : 'scraps'})</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaktTimeOeeCard;
