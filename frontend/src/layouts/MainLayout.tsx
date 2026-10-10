import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  InboxOutlined,
  AuditOutlined,
  BuildFilled,
  ShopOutlined,
  TeamOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useFactoryHotkeys } from '@/hooks/useFactoryHotkeys';
import { HeaderBar } from './components/HeaderBar';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { UserGuideModal } from '@/components/guide/UserGuideModal';
import { ShopFloorKioskHud } from '@/components/kiosk/ShopFloorKioskHud';
import { ShiftHandoverModal } from '@/components/handover/ShiftHandoverModal';

const { Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { sidebarCollapsed, setSidebarCollapsed, kioskMode } = useAppStore();

  // Register plant-floor quick keyboard navigation (Alt+D, Alt+P, F1, etc.)
  useFactoryHotkeys();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: '/production',
      icon: <ToolOutlined />,
      label: t('menu.production'),
    },
    {
      key: '/production/bom',
      icon: <PartitionOutlined />,
      label: t('menu.boms'),
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: t('menu.inventory'),
    },
    {
      key: '/purchasing',
      icon: <ShoppingOutlined />,
      label: t('menu.purchasing'),
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: t('menu.sales'),
    },
    {
      key: '/items',
      icon: <AppstoreOutlined />,
      label: t('menu.items'),
    },
    {
      key: '/suppliers',
      icon: <ShopOutlined />,
      label: t('menu.suppliers'),
    },
    {
      key: '/customers',
      icon: <TeamOutlined />,
      label: t('menu.customers'),
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: t('menu.audit'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: token.colorBgLayout }}>
      {/* Hide sidebar completely in overhead TV Kiosk Mode */}
      {!kioskMode && (
        <Sider
          collapsible
          collapsed={sidebarCollapsed}
          onCollapse={(value) => setSidebarCollapsed(value)}
          trigger={null}
          width={210}
          collapsedWidth={64}
          style={{
            backgroundColor: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? 0 : '0 16px',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                backgroundColor: token.colorPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <BuildFilled style={{ fontSize: 16 }} />
            </div>
            {!sidebarCollapsed && (
              <div style={{ lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: token.colorText, letterSpacing: '0.02em' }}>
                  WIFIM MES
                </div>
                <div style={{ fontSize: 10, color: token.colorTextSecondary }}>
                  {t('app.shortName')}
                </div>
              </div>
            )}
          </div>
          <Menu
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              borderRight: 0,
              marginTop: 4,
              backgroundColor: token.colorBgContainer,
            }}
          />
        </Sider>
      )}

      <Layout style={{ backgroundColor: token.colorBgLayout }}>
        {kioskMode ? (
          <ShopFloorKioskHud />
        ) : (
          <>
            <HeaderBar />
            <BreadcrumbBar />
          </>
        )}
        <Content
          style={{
            padding: kioskMode ? '12px 16px' : '16px 20px',
            minHeight: kioskMode ? 'calc(100vh - 56px)' : 'calc(100vh - 86px)',
            backgroundColor: token.colorBgLayout,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Global Plant Floor User Guide & SOP Modal */}
      <UserGuideModal />

      {/* Global Electronic Shift Handover Docket Modal */}
      <ShiftHandoverModal />
    </Layout>
  );
};

export default MainLayout;
