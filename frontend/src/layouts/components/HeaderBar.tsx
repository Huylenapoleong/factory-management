import React, { useState, useEffect } from 'react';
import { Avatar, Button, Space, Tag, Tooltip, Dropdown, App, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  FontSizeOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SoundOutlined,
  QuestionCircleOutlined,
  FundProjectionScreenOutlined,
  FileDoneOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore, ThemeMode } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { playSuccessChime } from '@/utils/audioAlert';
import { getFactoryShift } from '@/utils/shift';
import { useQueryClient } from '@tanstack/react-query';
import { message } from '@/utils/antdApp';
import { getLocalTimezoneOffsetString } from '@/utils/timezone';
import { NotificationCenterPopover } from '@/components/notifications/NotificationCenterPopover';

export const HeaderBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const {
    language,
    setLanguage,
    sidebarCollapsed,
    toggleSidebar,
    themeMode,
    setThemeMode,
    displayDensity,
    setDisplayDensity,
    autoRefreshInterval,
    setAutoRefreshInterval,
    soundAlertsEnabled,
    toggleSoundAlerts,
    setUserGuideVisible,
    toggleKioskMode,
    setShiftHandoverVisible,
    triggerRefresh,
  } = useAppStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [timeString, setTimeString] = useState('');
  const tzString = getLocalTimezoneOffsetString();
  const { user, logout } = useAuthStore();
  const currentShift = getFactoryShift();
  const shiftText = language === 'zh-CN' ? currentShift.badgeZh : currentShift.badgeEn;

  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  };

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth < 1024;

  const handleLanguageChange = () => {
    const nextLang = language === 'zh-CN' ? 'en' : 'zh-CN';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleToggleSound = () => {
    toggleSoundAlerts();
    if (!soundAlertsEnabled) {
      playSuccessChime();
    }
  };

  const handleLogout = () => {
    modal.confirm({
      title: t('auth.logoutConfirm'),
      content:
        language === 'zh-CN'
          ? '退出后将返回终端登录页面。'
          : 'You will be redirected to the terminal login screen.',
      okText: t('auth.logout'),
      cancelText: t('common.cancel'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await logout();
        navigate('/login', { replace: true });
      },
    });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0', minWidth: 160 }}>
          <div style={{ fontWeight: 600, color: token.colorText }}>
            {user?.fullName ||
              user?.username ||
              (language === 'zh-CN' ? '系统用户' : 'System User')}
          </div>
          <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
            @{user?.username || 'user'} • {user?.roles?.[0]?.replace('ROLE_', '') || 'USER'}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'terminal-status',
      disabled: true,
      icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
      label: (
        <span style={{ fontSize: 12 }}>
          {language === 'zh-CN' ? '工控终端安全认证已激活' : 'Terminal TLS Verified'}
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: handleLogout,
    },
  ];

  const themeMenuItems: MenuProps['items'] = [
    {
      key: 'light',
      icon: <SunOutlined style={{ color: '#faad14' }} />,
      label: t('header.themeLight'),
      onClick: () => setThemeMode('light'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined style={{ color: '#1677ff' }} />,
      label: t('header.themeDark'),
      onClick: () => setThemeMode('dark'),
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: t('header.themeSystem'),
      onClick: () => setThemeMode('system'),
    },
  ];

  const densityMenuItems: MenuProps['items'] = [
    {
      key: 'compact',
      label: t('header.densityCompact'),
      onClick: () => setDisplayDensity('compact'),
    },
    {
      key: 'standard',
      label: t('header.densityStandard'),
      onClick: () => setDisplayDensity('standard'),
    },
    {
      key: 'large',
      label: t('header.densityLarge'),
      onClick: () => setDisplayDensity('large'),
    },
  ];

  const refreshMenuItems: MenuProps['items'] = [
    {
      key: '10',
      label: t('header.refresh10s'),
      onClick: () => setAutoRefreshInterval(10),
    },
    {
      key: '30',
      label: t('header.refresh30s'),
      onClick: () => setAutoRefreshInterval(30),
    },
    {
      key: '60',
      label: t('header.refresh60s'),
      onClick: () => setAutoRefreshInterval(60),
    },
    {
      key: '0',
      label: t('header.refreshOff'),
      onClick: () => setAutoRefreshInterval(0),
    },
  ];

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return <SunOutlined style={{ fontSize: 16, color: '#faad14' }} />;
      case 'dark':
        return <MoonOutlined style={{ fontSize: 16, color: '#1677ff' }} />;
      case 'system':
      default:
        return <DesktopOutlined style={{ fontSize: 16 }} />;
    }
  };

  const getRefreshLabel = (seconds: number) => {
    if (seconds === 0) return 'Off';
    return `${seconds}s`;
  };

  // Overflow menu for tablets/mobiles
  const moreToolsItems: MenuProps['items'] = [
    {
      key: 'density-menu',
      icon: <FontSizeOutlined />,
      label: t('header.density'),
      children: densityMenuItems,
    },
    {
      key: 'theme-menu',
      icon: getThemeIcon(themeMode),
      label: t('header.theme'),
      children: themeMenuItems,
    },
    {
      key: 'sound',
      icon: (
        <SoundOutlined
          style={{ color: soundAlertsEnabled ? '#52c41a' : token.colorTextTertiary }}
        />
      ),
      label: soundAlertsEnabled ? t('header.soundEnabled') : t('header.soundDisabled'),
      onClick: handleToggleSound,
    },
    {
      key: 'kiosk',
      icon: <FundProjectionScreenOutlined style={{ color: '#1677ff' }} />,
      label: t('header.kioskMode'),
      onClick: () => {
        toggleKioskMode();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        }
      },
    },
    {
      key: 'shift-handover',
      icon: <FileDoneOutlined />,
      label: t('header.shiftHandover'),
      onClick: () => setShiftHandoverVisible(true),
    },
    {
      key: 'sop',
      icon: <QuestionCircleOutlined />,
      label: t('header.userGuide'),
      onClick: () => setUserGuideVisible(true),
    },
    {
      key: 'fullscreen',
      icon: <FullscreenOutlined />,
      label: language === 'zh-CN' ? '全屏显示' : 'Fullscreen',
      onClick: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        padding: isMobile ? '0 8px' : '0 16px',
        backgroundColor: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        flexWrap: 'nowrap',
      }}
    >
      {/* Left: Sidebar toggle, Shift Badge, System Status, Clock */}
      <Space
        size={isMobile ? 4 : 'middle'}
        align="center"
        style={{ minWidth: 0, overflow: 'hidden', flexShrink: 1 }}
      >
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: 16, width: 32, height: 32, flexShrink: 0 }}
          title={sidebarCollapsed ? t('header.expandSidebar') : t('header.collapseSidebar')}
        />

        {/* Shift Tag */}
        <Tooltip
          title={
            language === 'zh-CN'
              ? `当前班次: ${currentShift.nameZh} (${currentShift.timeRange}) · 点击打开交接记录`
              : `Active Shift: ${currentShift.nameEn} (${currentShift.timeRange}) · Click to open Docket`
          }
        >
          <Tag
            color="blue"
            onClick={() => setShiftHandoverVisible(true)}
            style={{
              margin: 0,
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              flexShrink: 0,
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
            {shiftText}
          </Tag>
        </Tooltip>

        {/* System status tag */}
        {!isMobile && (
          <Tag color="success" style={{ margin: 0, fontSize: 12, borderRadius: 3, flexShrink: 0 }}>
            <CheckCircleFilled style={{ marginRight: 4 }} />
            {t('header.systemStatus')}
          </Tag>
        )}

        {/* Live System Time */}
        {!isMobile && (
          <Space
            size={4}
            className="tnum"
            style={{ fontSize: 12, color: token.colorTextSecondary, marginLeft: 4 }}
          >
            <ClockCircleOutlined style={{ fontSize: 13, color: token.colorTextTertiary }} />
            <span style={{ fontWeight: 600, color: token.colorText }}>{timeString}</span>
            <span style={{ fontSize: 11, color: token.colorTextTertiary }}>({tzString})</span>
          </Space>
        )}
      </Space>

      {/* Right Controls: Manual Refresh, Auto-refresh, Density, Theme, Sound Alert, Help SOP, Language, Notifications, Fullscreen, Profile */}
      <Space size={isMobile ? 4 : 8} align="center" style={{ flexShrink: 0 }}>
        {/* Manual Refresh Button */}
        <Tooltip title={t('header.manualRefresh')}>
          <Button
            size="small"
            icon={<ReloadOutlined spin={refreshing} style={{ fontSize: 12 }} />}
            onClick={handleRefresh}
            style={{ fontSize: 11, height: 26, padding: '0 8px' }}
          >
            {!isMobile && t('header.manualRefresh')}
          </Button>
        </Tooltip>

        {/* Telemetry Refresh Selector */}
        {!isMobile && (
          <Dropdown
            menu={{ items: refreshMenuItems, selectedKeys: [String(autoRefreshInterval)] }}
            trigger={['click']}
          >
            <Tooltip title={t('header.autoRefreshInterval')}>
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined spin={autoRefreshInterval > 0} style={{ fontSize: 13 }} />}
                style={{ fontSize: 11, padding: '0 6px', height: 26 }}
              >
                {getRefreshLabel(autoRefreshInterval)}
              </Button>
            </Tooltip>
          </Dropdown>
        )}

        {/* Desktop Direct Action Buttons */}
        {!isTablet && (
          <>
            {/* Display Density Selector */}
            <Dropdown
              menu={{ items: densityMenuItems, selectedKeys: [displayDensity] }}
              trigger={['click']}
            >
              <Tooltip title={t('header.density')}>
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={<FontSizeOutlined style={{ fontSize: 14 }} />}
                />
              </Tooltip>
            </Dropdown>

            {/* Theme Mode Switcher */}
            <Dropdown
              menu={{ items: themeMenuItems, selectedKeys: [themeMode] }}
              trigger={['click']}
            >
              <Tooltip title={t('header.theme')}>
                <Button type="text" shape="circle" size="small" icon={getThemeIcon(themeMode)} />
              </Tooltip>
            </Dropdown>

            {/* Sound Alert Toggle (Buzzer) */}
            <Tooltip
              title={soundAlertsEnabled ? t('header.soundEnabled') : t('header.soundDisabled')}
            >
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={
                  <SoundOutlined
                    style={{
                      fontSize: 15,
                      color: soundAlertsEnabled ? '#52c41a' : token.colorTextTertiary,
                    }}
                  />
                }
                onClick={handleToggleSound}
              />
            </Tooltip>

            {/* Shop-Floor TV Kiosk Mode */}
            <Tooltip title={t('header.kioskMode')}>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<FundProjectionScreenOutlined style={{ fontSize: 15, color: '#1677ff' }} />}
                onClick={() => {
                  toggleKioskMode();
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                  }
                }}
              />
            </Tooltip>

            {/* Shift Handover Docket Modal */}
            <Tooltip title={t('header.shiftHandover')}>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={
                  <FileDoneOutlined style={{ fontSize: 15, color: token.colorTextSecondary }} />
                }
                onClick={() => setShiftHandoverVisible(true)}
              />
            </Tooltip>

            {/* User Guide & Hotkeys Cheat Sheet Modal Button */}
            <Tooltip title={t('header.userGuide')}>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={
                  <QuestionCircleOutlined
                    style={{ fontSize: 15, color: token.colorTextSecondary }}
                  />
                }
                onClick={() => setUserGuideVisible(true)}
              />
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip title={language === 'zh-CN' ? '全屏显示' : 'Fullscreen'}>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<FullscreenOutlined style={{ fontSize: 14 }} />}
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                  } else {
                    document.exitFullscreen?.();
                  }
                }}
              />
            </Tooltip>
          </>
        )}

        {/* Tablet / Mobile Overflow Menu */}
        {isTablet && (
          <Dropdown menu={{ items: moreToolsItems }} trigger={['click']}>
            <Tooltip title={language === 'zh-CN' ? '更多功能' : 'More Controls'}>
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<MoreOutlined style={{ fontSize: 16 }} />}
              />
            </Tooltip>
          </Dropdown>
        )}

        {/* Language switcher */}
        <Button
          type="text"
          size="small"
          icon={<GlobalOutlined />}
          onClick={handleLanguageChange}
          style={{ fontSize: 12, fontWeight: 500, padding: '0 4px' }}
        >
          {language === 'zh-CN' ? '简中' : 'EN'}
        </Button>

        {/* Live Plant Telemetry Alerts & Notifications */}
        <NotificationCenterPopover />

        {/* User Profile */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: isMobile ? '2px 4px' : '2px 8px',
              backgroundColor: token.colorFillAlter,
              borderRadius: 4,
              cursor: 'pointer',
              border: `1px solid ${token.colorBorderSecondary}`,
              maxWidth: isMobile ? 36 : isTablet ? 110 : 160,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Avatar
              size={24}
              icon={<UserOutlined />}
              style={{ backgroundColor: token.colorPrimary, flexShrink: 0 }}
            />
            {!isMobile && (
              <div style={{ lineHeight: 1.2, overflow: 'hidden', minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: token.colorText,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.fullName ||
                    user?.username ||
                    (language === 'zh-CN' ? '系统用户' : 'System User')}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: token.colorTextSecondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.roles?.[0] ? user.roles[0].replace('ROLE_', '') : t('header.userRole')}
                </div>
              </div>
            )}
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};

export default HeaderBar;
