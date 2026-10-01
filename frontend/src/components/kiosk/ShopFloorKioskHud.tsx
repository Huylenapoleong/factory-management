import React, { useState, useEffect } from 'react';
import { Space, Tag, Button, Progress } from 'antd';
import {
  FundProjectionScreenOutlined,
  PlayCircleFilled,
  PauseCircleFilled,
  StepForwardOutlined,
  CompressOutlined,
  DashboardOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

export const ShopFloorKioskHud: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    kioskMode,
    setKioskMode,
    kioskPlaying,
    setKioskPlaying,
    kioskInterval,
    language,
  } = useAppStore();

  const [countdown, setCountdown] = useState<number>(kioskInterval);
  const [currentTime, setCurrentTime] = useState<string>('');

  const isDashboard = location.pathname.includes('/dashboard');
  const nextRoute = isDashboard ? '/production' : '/dashboard';

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 30s Auto-rotation countdown
  useEffect(() => {
    if (!kioskMode || !kioskPlaying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(nextRoute);
          return kioskInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [kioskMode, kioskPlaying, kioskInterval, nextRoute, navigate]);

  // Handle escape key to exit kiosk mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && kioskMode) {
        setKioskMode(false);
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [kioskMode, setKioskMode]);

  if (!kioskMode) return null;

  const handleNextScreen = () => {
    navigate(nextRoute);
    setCountdown(kioskInterval);
  };

  const handleExitKiosk = () => {
    setKioskMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  };

  const progressPercent = Math.round(((kioskInterval - countdown) / kioskInterval) * 100);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#091e42',
        color: '#ffffff',
        borderBottom: '2px solid #1677ff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* Left: TV Kiosk Status & Workshop Branding */}
      <Space size="middle" align="center">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FundProjectionScreenOutlined style={{ fontSize: 22, color: '#38bdf8' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.04em', color: '#f8fafc', lineHeight: 1.2 }}>
              {t('kiosk.title')}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>
              {t('kiosk.subTitle')}
            </div>
          </div>
        </div>

        <Tag
          color="blue"
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 2,
            padding: '2px 8px',
            backgroundColor: '#0c4a6e',
            borderColor: '#0284c7',
            color: '#e0f2fe',
          }}
        >
          {language === 'zh-CN' ? '第一车间 (Heavy Machining)' : 'Workshop 01'}
        </Tag>

        <Tag
          color="success"
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#52c41a',
              display: 'inline-block',
            }}
          />
          {t('kiosk.statusLive')}
        </Tag>
      </Space>

      {/* Middle: Screen Carousel Tracker & Rotation Countdown */}
      <Space size="middle" align="center">
        {/* Screen Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button
            size="small"
            type={isDashboard ? 'primary' : 'default'}
            icon={<DashboardOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{
              fontSize: 12,
              fontWeight: isDashboard ? 700 : 400,
              backgroundColor: isDashboard ? '#1677ff' : '#1e293b',
              borderColor: isDashboard ? '#1677ff' : '#334155',
              color: '#ffffff',
            }}
          >
            {language === 'zh-CN' ? '1. 运营综合看板' : '1. Dashboard'}
          </Button>

          <Button
            size="small"
            type={!isDashboard ? 'primary' : 'default'}
            icon={<ToolOutlined />}
            onClick={() => navigate('/production')}
            style={{
              fontSize: 12,
              fontWeight: !isDashboard ? 700 : 400,
              backgroundColor: !isDashboard ? '#1677ff' : '#1e293b',
              borderColor: !isDashboard ? '#1677ff' : '#334155',
              color: '#ffffff',
            }}
          >
            {language === 'zh-CN' ? '2. 生产派工工单' : '2. Work Orders'}
          </Button>
        </div>

        {/* Rotation Countdown pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '3px 10px',
            backgroundColor: '#1e293b',
            borderRadius: 14,
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            {kioskPlaying
              ? t('kiosk.nextRotationIn', { sec: countdown })
              : (language === 'zh-CN' ? '已暂停轮播' : 'Rotation Paused')}
          </span>
          <Progress
            type="line"
            percent={progressPercent}
            showInfo={false}
            strokeColor="#38bdf8"
            trailColor="#334155"
            size="small"
            style={{ width: 60, margin: 0 }}
          />
        </div>
      </Space>

      {/* Right Controls: Play/Pause, Step Next, Clock, Exit */}
      <Space size="small" align="center">
        <Button
          type="text"
          size="small"
          icon={kioskPlaying ? <PauseCircleFilled style={{ color: '#faad14', fontSize: 18 }} /> : <PlayCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />}
          onClick={() => setKioskPlaying(!kioskPlaying)}
          title={kioskPlaying ? t('kiosk.pause') : t('kiosk.resume')}
        />

        <Button
          type="text"
          size="small"
          icon={<StepForwardOutlined style={{ color: '#38bdf8', fontSize: 16 }} />}
          onClick={handleNextScreen}
          title={t('kiosk.next')}
        />

        {/* Live Clock */}
        <div
          className="tnum"
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 700,
            color: '#38bdf8',
            backgroundColor: '#1e293b',
            padding: '2px 8px',
            borderRadius: 3,
            border: '1px solid #334155',
          }}
        >
          {currentTime}
        </div>

        {/* Exit Kiosk Button */}
        <Button
          size="small"
          danger
          icon={<CompressOutlined />}
          onClick={handleExitKiosk}
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          {t('kiosk.exit')}
        </Button>
      </Space>
    </div>
  );
};

export default ShopFloorKioskHud;
