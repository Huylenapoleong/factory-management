import React, { useState, useEffect } from 'react';
import { Breadcrumb, Button, Space, theme } from 'antd';
import { ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { getLocalTimezoneOffsetString } from '@/utils/timezone';

interface BreadcrumbBarProps {
  onRefresh?: () => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { language, autoRefreshInterval } = useAppStore();
  const [timeString, setTimeString] = useState<string>('');
  const tzString = getLocalTimezoneOffsetString();

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

  const refreshText =
    autoRefreshInterval > 0
      ? `${t('header.autoRefresh')}: ${autoRefreshInterval}s`
      : t('header.refreshOff');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 20px',
        backgroundColor: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        fontSize: 12,
      }}
    >
      <Breadcrumb
        items={[
          {
            title: (
              <span style={{ color: token.colorTextSecondary }}>
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
              <span style={{ fontWeight: 600, color: token.colorPrimary }}>
                {t('header.liveConsole')}
              </span>
            ),
          },
        ]}
      />

      <Space size="middle" align="center" className="tnum">
        <span style={{ color: token.colorTextSecondary }}>
          {t('header.systemTime')} ({tzString}): <strong style={{ color: token.colorText }}>{timeString}</strong>
        </span>
        <span style={{ color: token.colorBorder }}>|</span>
        <span
          style={{
            color: autoRefreshInterval > 0 ? token.colorSuccess : token.colorTextTertiary,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {refreshText}
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

export default BreadcrumbBar;
