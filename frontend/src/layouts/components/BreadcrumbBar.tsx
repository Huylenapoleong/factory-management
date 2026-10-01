import React, { useState, useEffect } from 'react';
import { Breadcrumb, Button, Space } from 'antd';
import { ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

interface BreadcrumbBarProps {
  onRefresh?: () => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleString(language === 'zh-CN' ? 'zh-CN' : 'en-US', {
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        fontSize: 12,
      }}
    >
      <Breadcrumb
        items={[
          {
            title: (
              <span style={{ color: '#6b7280' }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {language === 'zh-CN' ? '华东制造基地' : 'East China Facility'}
              </span>
            ),
          },
          {
            title: language === 'zh-CN' ? '一车间 (机加工)' : 'Workshop 01',
          },
          {
            title: (
              <span style={{ fontWeight: 600, color: '#1677ff' }}>
                {t('header.liveConsole')}
              </span>
            ),
          },
        ]}
      />

      <Space size="middle" align="center" className="tnum">
        <span style={{ color: '#6b7280' }}>
          {t('header.systemTime')}: <strong style={{ color: '#1f2937' }}>{timeString}</strong>
        </span>
        <span style={{ color: '#9ca3af' }}>|</span>
        <span style={{ color: '#52c41a', fontSize: 11, fontWeight: 500 }}>
          {t('header.autoRefresh')}
        </span>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          style={{ fontSize: 11, height: 24, padding: '0 8px' }}
        >
          {t('header.manualRefresh')}
        </Button>
      </Space>
    </div>
  );
};
