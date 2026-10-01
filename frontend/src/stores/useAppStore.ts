import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  themeMode: 'light' | 'dark';
  language: 'en' | 'zh-CN';
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'zh-CN') => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  themeMode: 'light',
  language: (localStorage.getItem('i18nextLng') as 'en' | 'zh-CN') || 'en',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setLanguage: (lang) => {
    localStorage.setItem('i18nextLng', lang);
    set({ language: lang });
  },
}));
