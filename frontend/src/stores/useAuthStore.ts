import { create } from 'zustand';
import apiClient from '@/services/api';

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
}

const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = localStorage.getItem('access_token');
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  refreshToken: localStorage.getItem('refresh_token'),
  user: initialUser,
  isAuthenticated: Boolean(initialToken),
  isLoading: false,

  setAuth: (token: string, refreshToken: string, user: AuthUser) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
    });
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      // 1. Try real enterprise backend gateway (/api/v1/auth/login)
      const res = await apiClient.post<{
        code: number;
        message: string;
        data: {
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          expiresIn: number;
          user: AuthUser;
        };
      }>('/auth/login', { username, password });

      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(user));

      set({
        token: accessToken,
        refreshToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch {
      // 2. Standalone fallback for offline testing or demo environments
      if (
        (username === 'admin' && password === 'admin123') ||
        (username === 'operator' && password === 'operator123')
      ) {
        const isAdmin = username === 'admin';
        const demoUser: AuthUser = {
          id: isAdmin ? 1 : 2,
          username,
          fullName: isAdmin ? 'Zhang Yong (张厂长)' : 'Li Jun (李班长)',
          email: `${username}@wifim-factory.com`,
          phone: '+86-13800000001',
          roles: isAdmin ? ['ROLE_ADMIN', 'ROLE_PLANT_DIRECTOR'] : ['ROLE_OPERATOR', 'ROLE_QC'],
        };
        const demoToken = `wifim_demo_jwt_${username}_${Date.now()}`;
        const demoRefresh = `wifim_demo_refresh_${username}_${Date.now()}`;

        localStorage.setItem('access_token', demoToken);
        localStorage.setItem('refresh_token', demoRefresh);
        localStorage.setItem('auth_user', JSON.stringify(demoUser));

        set({
          token: demoToken,
          refreshToken: demoRefresh,
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      }

      set({ isLoading: false });
      return {
        success: false,
        error: 'Invalid credentials. Default: admin / admin123',
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
