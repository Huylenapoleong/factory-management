import React from 'react';
import { Select, Badge, Avatar, Button, Space, Tag, Tooltip, Dropdown, Modal, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  BankOutlined,
  BellOutlined,
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
  SoundOutlined,
  QuestionCircleOutlined,
  FundProjectionScreenOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore, ThemeMode } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { playSuccessChime } from '@/utils/audioAlert';

export const HeaderBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
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
  } = useAppStore();
  const { user, logout } = useAuthStore();

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
    Modal.confirm({
      title: t('auth.logoutConfirm'),
      content: language === 'zh-CN' ? '退出后将返回终端登录页面。' : 'You will be redirected to the terminal login screen.',
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
            {user?.fullName || (language === 'zh-CN' ? '张厂长' : 'Director Zhang')}
          </div>
          <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
            @{user?.username || 'admin'} • {user?.roles?.[0] || 'ROLE_ADMIN'}
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        padding: '0 16px',
        backgroundColor: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {/* Left: Sidebar toggle, Workshop selector and Shift Badge */}
      <Space orientation="horizontal" size="middle" align="center">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: 16, width: 34, height: 34 }}
          title={sidebarCollapsed ? t('header.expandSidebar') : t('header.collapseSidebar')}
        />

        <Space size="small">
          <BankOutlined style={{ color: token.colorPrimary }} />
          <span style={{ fontSize: 12, color: token.colorTextSecondary, fontWeight: 500 }}>
            {t('header.workshop')}:
          </span>
          <Select
            defaultValue="workshop-01"
            size="small"
            style={{ width: 260 }}
            options={[
              {
                value: 'workshop-01',
                label: language === 'zh-CN' ? '第一车间 - 机加工与总装' : 'Workshop 01 - Heavy Machining & Assembly',
              },
              {
                value: 'workshop-02',
                label: language === 'zh-CN' ? '第二车间 - 精密冲压与焊接' : 'Workshop 02 - Stamping & Welding',
              },
              {
                value: 'workshop-03',
                label: language === 'zh-CN' ? '第三车间 - 电子组装与测试' : 'Workshop 03 - Electronics & SMT',
              },
            ]}
          />
        </Space>

        <Tag
          color="blue"
          style={{
            margin: 0,
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 3,
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
          {t('header.shift')}
        </Tag>

        <Tag color="success" style={{ margin: 0, fontSize: 12, borderRadius: 3 }}>
          <CheckCircleFilled style={{ marginRight: 4 }} />
          {t('header.systemStatus')}
        </Tag>
      </Space>

      {/* Right Controls: Auto-refresh, Density, Theme, Sound Alert, Help SOP, Language, Notifications, Fullscreen, Profile */}
      <Space size="small" align="center">
        {/* Telemetry Refresh Selector */}
        <Dropdown menu={{ items: refreshMenuItems, selectedKeys: [String(autoRefreshInterval)] }} trigger={['click']}>
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

        {/* Display Density Selector */}
        <Dropdown menu={{ items: densityMenuItems, selectedKeys: [displayDensity] }} trigger={['click']}>
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
        <Dropdown menu={{ items: themeMenuItems, selectedKeys: [themeMode] }} trigger={['click']}>
          <Tooltip title={t('header.theme')}>
            <Button
              type="text"
              shape="circle"
              size="small"
              icon={getThemeIcon(themeMode)}
            />
          </Tooltip>
        </Dropdown>

        {/* Sound Alert Toggle (Buzzer) */}
        <Tooltip title={soundAlertsEnabled ? t('header.soundEnabled') : t('header.soundDisabled')}>
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
            icon={<FileDoneOutlined style={{ fontSize: 15, color: token.colorTextSecondary }} />}
            onClick={() => setShiftHandoverVisible(true)}
          />
        </Tooltip>

        {/* User Guide & Hotkeys Cheat Sheet Modal Button */}
        <Tooltip title={t('header.userGuide')}>
          <Button
            type="text"
            shape="circle"
            size="small"
            icon={<QuestionCircleOutlined style={{ fontSize: 15, color: token.colorTextSecondary }} />}
            onClick={() => setUserGuideVisible(true)}
          />
        </Tooltip>

        {/* Language switcher */}
        <Button
          type="text"
          size="small"
          icon={<GlobalOutlined />}
          onClick={handleLanguageChange}
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          {language === 'zh-CN' ? '简中' : 'EN'}
        </Button>

        {/* Alerts / Notifications */}
        <Tooltip title={t('dashboard.criticalDeficitsBadge')}>
          <Badge count={5} size="small" offset={[-2, 4]}>
            <Button
              type="text"
              shape="circle"
              size="small"
              icon={<BellOutlined style={{ fontSize: 15 }} />}
            />
          </Badge>
        </Tooltip>

        {/* Fullscreen */}
        <Tooltip title="Fullscreen / 全屏">
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

        {/* User Profile */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '2px 8px',
              backgroundColor: token.colorFillAlter,
              borderRadius: 4,
              cursor: 'pointer',
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Avatar size={24} icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
                {user?.fullName || (language === 'zh-CN' ? '张厂长' : 'Director Zhang')}
              </div>
              <div style={{ fontSize: 10, color: token.colorTextSecondary }}>
                {user?.roles?.[0] ? user.roles[0].replace('ROLE_', '') : t('header.userRole')}
              </div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
};

export default HeaderBar;
