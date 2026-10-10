import React, { useState, useEffect } from 'react';
import { Breadcrumb, Button, Space, theme } from 'antd';
import { ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { message } from '@/utils/antdApp';
import { useAppStore } from '@/stores/useAppStore';
import { getLocalTimezoneOffsetString } from '@/utils/timezone';

interface BreadcrumbBarProps {
  onRefresh?: () => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { language, autoRefreshInterval, triggerRefresh } = useAppStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState<boolean>(false);
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
        }),
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

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerRefresh();
    try {
      await queryClient.invalidateQueries();
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('wifim:refresh'));
    message.success({
      content:
        language === 'zh-CN' ? '系统数据与遥测已刷新' : 'Plant operational telemetry refreshed',
      key: 'wifim-refresh-msg',
    });
    setTimeout(() => setRefreshing(false), 600);
    if (onRefresh) onRefresh();
  };

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
                {t('header.factoryFacility', 'Central Manufacturing Plant')}
              </span>
            ),
          },
          {
            title: t('header.workshop', 'Workshop Operations'),
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
          {t('header.systemTime')} ({tzString}):{' '}
          <strong style={{ color: token.colorText }}>{timeString}</strong>
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
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          style={{ fontSize: 11, height: 24, padding: '0 8px' }}
        >
          {t('header.manualRefresh')}
        </Button>
      </Space>
    </div>
  );
};

export default BreadcrumbBar;
