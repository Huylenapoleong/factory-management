import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { industrialTheme } from '@/app/theme';
import { useAppStore } from '@/stores/useAppStore';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardView } from '@/features/dashboard/components/DashboardView';

export const App: React.FC = () => {
  const { language } = useAppStore();
  const antdLocale = language === 'zh-CN' ? zhCN : enUS;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={industrialTheme}
    >
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/items" element={<div style={{ padding: 24 }}>Items Module</div>} />
            <Route path="/purchasing" element={<div style={{ padding: 24 }}>Purchasing Module</div>} />
            <Route path="/production" element={<div style={{ padding: 24 }}>Production Module</div>} />
            <Route path="/sales" element={<div style={{ padding: 24 }}>Sales Module</div>} />
            <Route path="/settings" element={<div style={{ padding: 24 }}>Settings Module</div>} />
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
