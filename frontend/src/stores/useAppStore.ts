import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type DisplayDensity = 'compact' | 'standard' | 'large';

interface AppState {
  sidebarCollapsed: boolean;
  themeMode: ThemeMode;
  displayDensity: DisplayDensity;
  autoRefreshInterval: number; // seconds, 0 = disabled
  soundAlertsEnabled: boolean;
  userGuideVisible: boolean;
  language: 'en' | 'zh-CN';
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDisplayDensity: (density: DisplayDensity) => void;
  setAutoRefreshInterval: (seconds: number) => void;
  toggleSoundAlerts: () => void;
  setUserGuideVisible: (visible: boolean) => void;
  setLanguage: (lang: 'en' | 'zh-CN') => void;
}

const initialTheme = (localStorage.getItem('wifim_theme_mode') as ThemeMode) || 'light';
const initialDensity = (localStorage.getItem('wifim_display_density') as DisplayDensity) || 'standard';
const initialRefresh = Number(localStorage.getItem('wifim_refresh_interval') || '30');
const initialSound = localStorage.getItem('wifim_sound_alerts') !== 'false'; // default enabled

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  themeMode: initialTheme,
  displayDensity: initialDensity,
  autoRefreshInterval: Number.isNaN(initialRefresh) ? 30 : initialRefresh,
  soundAlertsEnabled: initialSound,
  userGuideVisible: false,
  language: (localStorage.getItem('i18nextLng') as 'en' | 'zh-CN') || 'en',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setThemeMode: (mode) => {
    localStorage.setItem('wifim_theme_mode', mode);
    set({ themeMode: mode });
  },
  setDisplayDensity: (density) => {
    localStorage.setItem('wifim_display_density', density);
    set({ displayDensity: density });
  },
  setAutoRefreshInterval: (seconds) => {
    localStorage.setItem('wifim_refresh_interval', String(seconds));
    set({ autoRefreshInterval: seconds });
  },
  toggleSoundAlerts: () =>
    set((state) => {
      const next = !state.soundAlertsEnabled;
      localStorage.setItem('wifim_sound_alerts', String(next));
      return { soundAlertsEnabled: next };
    }),
  setUserGuideVisible: (visible) => set({ userGuideVisible: visible }),
  setLanguage: (lang) => {
    localStorage.setItem('i18nextLng', lang);
    set({ language: lang });
  },
}));
