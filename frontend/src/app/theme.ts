import { ThemeConfig, theme } from 'antd';

export const industrialTheme: ThemeConfig = {
  algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    colorBgBase: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorTextBase: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f0f0f0',
    borderRadius: 4,
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Card: {
      headerHeight: 42,
      headerFontSize: 14,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#4b5563',
      headerSortActiveBg: '#f3f4f6',
      rowHoverBg: '#f9fafb',
      fontSize: 13,
    },
    Button: {
      borderRadius: 4,
      controlHeight: 32,
      controlHeightSM: 24,
    },
    Tag: {
      borderRadius: 2,
    },
  },
};
