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
  shiftHandoverVisible: boolean;
  kioskMode: boolean;
  kioskPlaying: boolean;
  kioskInterval: number; // seconds, default 30
  language: 'en' | 'zh-CN';
  activeWarehouseId: number | null;
  refreshKey: number;
  triggerRefresh: () => void;
  setActiveWarehouseId: (id: number | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDisplayDensity: (density: DisplayDensity) => void;
  setAutoRefreshInterval: (seconds: number) => void;
  toggleSoundAlerts: () => void;
  setUserGuideVisible: (visible: boolean) => void;
  setShiftHandoverVisible: (visible: boolean) => void;
  toggleKioskMode: () => void;
  setKioskMode: (enabled: boolean) => void;
  setKioskPlaying: (playing: boolean) => void;
  setLanguage: (lang: 'en' | 'zh-CN') => void;
}

const initialTheme = (localStorage.getItem('wifim_theme_mode') as ThemeMode) || 'light';
const initialDensity =
  (localStorage.getItem('wifim_display_density') as DisplayDensity) || 'standard';
const initialRefresh = Number(localStorage.getItem('wifim_refresh_interval') || '30');
const initialSound = localStorage.getItem('wifim_sound_alerts') !== 'false'; // default enabled

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  themeMode: initialTheme,
  displayDensity: initialDensity,
  autoRefreshInterval: Number.isNaN(initialRefresh) ? 30 : initialRefresh,
  soundAlertsEnabled: initialSound,
  userGuideVisible: false,
  shiftHandoverVisible: false,
  kioskMode: false,
  kioskPlaying: true,
  kioskInterval: 30,
  language: (localStorage.getItem('i18nextLng') as 'en' | 'zh-CN') || 'en',
  activeWarehouseId: localStorage.getItem('wifim_active_warehouse_id')
    ? Number(localStorage.getItem('wifim_active_warehouse_id'))
    : null,
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  setActiveWarehouseId: (id) => {
    if (id !== null) {
      localStorage.setItem('wifim_active_warehouse_id', String(id));
    } else {
      localStorage.removeItem('wifim_active_warehouse_id');
    }
    set({ activeWarehouseId: id });
  },
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
  setShiftHandoverVisible: (visible) => set({ shiftHandoverVisible: visible }),
  toggleKioskMode: () => set((state) => ({ kioskMode: !state.kioskMode })),
  setKioskMode: (enabled) => set({ kioskMode: enabled }),
  setKioskPlaying: (playing) => set({ kioskPlaying: playing }),
  setLanguage: (lang) => {
    localStorage.setItem('i18nextLng', lang);
    set({ language: lang });
  },
}));
