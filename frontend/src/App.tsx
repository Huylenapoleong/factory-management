import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { getIndustrialTheme } from '@/app/theme';
import { useAppStore } from '@/stores/useAppStore';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginView } from '@/features/auth';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { ProductionView } from '@/features/production';
import { BomWorkbenchView } from '@/features/bom';
import { InventoryView } from '@/features/inventory';
import { PurchasingView } from '@/features/purchasing';
import { SalesView } from '@/features/sales';
import { ItemsView } from '@/features/items';
import { SuppliersView } from '@/features/suppliers';
import { CustomersView } from '@/features/customers';
import { AuditView, SettingsView } from '@/features/settings';
import { UserGuideView } from '@/features/guide';
import { AntdAppBridge } from '@/utils/antdApp';

export const App: React.FC = () => {
  const { language, themeMode, displayDensity } = useAppStore();
  const antdLocale = language === 'zh-CN' ? zhCN : enUS;

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const activeTheme = getIndustrialTheme(isDark, displayDensity);

  return (
    <ConfigProvider locale={antdLocale} theme={activeTheme}>
      <AntdApp>
        <AntdAppBridge />
        <BrowserRouter>
          <Routes>
            {/* Public Terminal Authentication */}
            <Route path="/login" element={<LoginView />} />

            {/* Protected Enterprise Industrial Console Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/items" element={<ItemsView />} />

                {/* Production Subsystem */}
                <Route
                  element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PRODUCTION']} />}
                >
                  <Route path="/production" element={<ProductionView />} />
                  <Route path="/production/bom" element={<BomWorkbenchView />} />
                </Route>

                {/* Inventory & Logistics Subsystem */}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={['ADMIN', 'MANAGER', 'WAREHOUSE', 'PURCHASING', 'SALES']}
                    />
                  }
                >
                  <Route path="/inventory" element={<InventoryView />} />
                </Route>

                {/* Purchasing & Supply Chain */}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE']}
                    />
                  }
                >
                  <Route path="/purchasing" element={<PurchasingView />} />
                  <Route path="/suppliers" element={<SuppliersView />} />
                </Route>

                {/* Sales & Outbound Order Fulfillment */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE']} />
                  }
                >
                  <Route path="/sales" element={<SalesView />} />
                  <Route path="/customers" element={<CustomersView />} />
                </Route>

                {/* Audit & Compliance (System Administrator Exclusive) */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/audit" element={<AuditView />} />
                </Route>

                {/* System Settings & Factory Master Parameters */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                  <Route path="/settings" element={<SettingsView />} />
                </Route>

                {/* Global Role-Adaptive User Guide & SOP Screen */}
                <Route path="/guide" element={<UserGuideView />} />
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
