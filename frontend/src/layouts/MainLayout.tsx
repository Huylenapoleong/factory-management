import React from 'react';
import { Layout, Menu } from 'antd';
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
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { HeaderBar } from './components/HeaderBar';
import { BreadcrumbBar } from './components/BreadcrumbBar';

const { Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

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
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={(value) => setSidebarCollapsed(value)}
        theme="light"
        width={210}
        collapsedWidth={64}
        style={{
          borderRight: '1px solid #e5e7eb',
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
            borderBottom: '1px solid #e5e7eb',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              backgroundColor: '#1677ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BuildFilled style={{ fontSize: 16 }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', letterSpacing: '0.02em' }}>
                WIFIM MES
              </div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>
                {t('app.shortName')}
              </div>
            </div>
          )}
        </div>
        <Menu
          theme="light"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 4, fontSize: 13 }}
        />
      </Sider>

      <Layout style={{ backgroundColor: '#f0f2f5' }}>
        <HeaderBar />
        <BreadcrumbBar />
        <Content style={{ padding: '16px 20px', minHeight: 'calc(100vh - 86px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
