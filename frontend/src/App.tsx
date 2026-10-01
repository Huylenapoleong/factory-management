import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { industrialTheme } from '@/app/theme';
import { useAppStore } from '@/stores/useAppStore';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginView } from '@/features/auth';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { ProductionView } from '@/features/production';
import { InventoryView } from '@/features/inventory';
import { PurchasingView } from '@/features/purchasing';
import { SalesView } from '@/features/sales';
import { AuditView, SettingsView } from '@/features/settings';

export const App: React.FC = () => {
  const { language } = useAppStore();
  const antdLocale = language === 'zh-CN' ? zhCN : enUS;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={industrialTheme}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            {/* Public Terminal Authentication */}
            <Route path="/login" element={<LoginView />} />

            {/* Protected Enterprise Industrial Console Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/production" element={<ProductionView />} />
                <Route path="/inventory" element={<InventoryView />} />
                <Route path="/items" element={<InventoryView />} />
                <Route path="/purchasing" element={<PurchasingView />} />
                <Route path="/sales" element={<SalesView />} />
                <Route path="/audit" element={<AuditView />} />
                <Route path="/settings" element={<SettingsView />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
