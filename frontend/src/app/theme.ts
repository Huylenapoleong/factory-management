import { ThemeConfig, theme } from 'antd';
import type { DisplayDensity } from '@/stores/useAppStore';

export const getIndustrialTheme = (
  isDark: boolean,
  density: DisplayDensity = 'standard'
): ThemeConfig => {
  const fontSize = density === 'compact' ? 12 : density === 'large' ? 16 : 14;
  const algorithms = [isDark ? theme.darkAlgorithm : theme.defaultAlgorithm];

  if (density === 'compact') {
    algorithms.push(theme.compactAlgorithm);
  }

  return {
    algorithm: algorithms,
    token: {
      colorPrimary: '#1677ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1677ff',
      fontSize,
      borderRadius: 4,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    },
    components: {
      Card: {
        headerHeight: density === 'compact' ? 36 : density === 'large' ? 48 : 42,
        headerFontSize: fontSize,
      },
      Table: {
        fontSize: density === 'compact' ? 12 : density === 'large' ? 15 : 13,
      },
      Button: {
        borderRadius: 4,
        controlHeight: density === 'compact' ? 28 : density === 'large' ? 38 : 32,
        controlHeightSM: density === 'compact' ? 22 : density === 'large' ? 28 : 24,
      },
      Tag: {
        borderRadius: 2,
      },
    },
  };
};

export const industrialTheme: ThemeConfig = getIndustrialTheme(false, 'standard');
