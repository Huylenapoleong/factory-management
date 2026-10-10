import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, Drawer, theme } from 'antd';
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
  BookOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useRbac } from '@/hooks/useRbac';
import { useFactoryHotkeys } from '@/hooks/useFactoryHotkeys';
import { HeaderBar } from './components/HeaderBar';
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
  const { canAccessRoute } = useRbac();

  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth <= 768;

  // Register plant-floor quick keyboard navigation (Alt+D, Alt+P, F1, etc.)
  useFactoryHotkeys();

  const allMenuItems = useMemo(
    () => [
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
      {
        key: '/guide',
        icon: <BookOutlined />,
        label: t('menu.guide', 'User Guide & SOP'),
      },
    ],
    [t],
  );

  const menuItems = useMemo(
    () => allMenuItems.filter((item) => canAccessRoute(item.key)),
    [allMenuItems, canAccessRoute],
  );

  const handleMenuClick = (key: string) => {
    navigate(key);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const brandHeader = (collapsed: boolean) => (
    <div
      style={{
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? 0 : '0 16px',
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
      {!collapsed && (
        <div style={{ lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: token.colorText,
              letterSpacing: '0.02em',
            }}
          >
            WIFIM MES
          </div>
          <div style={{ fontSize: 10, color: token.colorTextSecondary }}>{t('app.shortName')}</div>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: token.colorBgLayout }}>
      {/* Mobile Drawer Navigation */}
      {isMobile && !kioskMode && (
        <Drawer
          placement="left"
          open={!sidebarCollapsed}
          onClose={() => setSidebarCollapsed(true)}
          size={240}
          styles={{ body: { padding: 0 } }}
          title={brandHeader(false)}
          closable={false}
        >
          <Menu
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{
              borderRight: 0,
              backgroundColor: token.colorBgContainer,
            }}
          />
        </Drawer>
      )}

      {/* Desktop Collapsible Sider */}
      {!isMobile && !kioskMode && (
        <Sider
          collapsible
          collapsed={sidebarCollapsed}
          onCollapse={(value) => setSidebarCollapsed(value)}
          trigger={null}
          width={210}
          collapsedWidth={64}
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            zIndex: 101,
            backgroundColor: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          {brandHeader(sidebarCollapsed)}
          <Menu
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{
              borderRight: 0,
              marginTop: 4,
              backgroundColor: token.colorBgContainer,
            }}
          />
        </Sider>
      )}

      <Layout style={{ backgroundColor: token.colorBgLayout, minWidth: 0 }}>
        {kioskMode ? (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <ShopFloorKioskHud />
          </div>
        ) : (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
            }}
          >
            <HeaderBar />
          </div>
        )}
        <Content
          style={{
            padding: kioskMode ? '12px 16px' : isMobile ? '10px 12px' : '16px 20px',
            minHeight: kioskMode ? 'calc(100vh - 56px)' : 'calc(100vh - 50px)',
            backgroundColor: token.colorBgLayout,
            overflowX: 'auto',
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
