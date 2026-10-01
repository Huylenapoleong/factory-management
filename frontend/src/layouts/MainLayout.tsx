import React from 'react';
import { Layout, Menu, Button, Space, Select } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, language, setLanguage } = useAppStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: '/items',
      icon: <AppstoreOutlined />,
      label: t('menu.items'),
    },
    {
      key: '/purchasing',
      icon: <ShoppingOutlined />,
      label: t('menu.purchasing'),
    },
    {
      key: '/production',
      icon: <ToolOutlined />,
      label: t('menu.production'),
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: t('menu.sales'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={(value) => setSidebarCollapsed(value)}
        theme="light"
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {sidebarCollapsed ? 'FM' : 'Factory Management'}
        </div>
        <Menu
          theme="light"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space orientation="horizontal" size="middle">
            <GlobalOutlined />
            <Select
              value={language}
              onChange={(value: 'en' | 'zh-CN') => setLanguage(value)}
              style={{ width: 120 }}
              options={[
                { value: 'en', label: 'English' },
                { value: 'zh-CN', label: '简体中文' },
              ]}
            />
            <Button type="text">{t('app.logout')}</Button>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
