import apiClient from './api';

export interface SystemSettings {
  applicationName: string;
  companyName: string;
  defaultLanguage: string;
  supportedLanguages: string;
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  features: Record<string, boolean>;
  allSettings: Record<string, string>;
}

export const settingService = {
  async getSettings(): Promise<SystemSettings> {
    const res = (await apiClient.get('/settings')) as { data?: SystemSettings };
    return (
      res?.data || {
        applicationName: 'Smart Factory MES',
        companyName: 'WIFIM Manufacturing Co., Ltd.',
        defaultLanguage: 'en',
        supportedLanguages: 'en,zh-CN',
        defaultCurrency: 'USD',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        numberFormat: '#,##0.00',
        features: {},
        allSettings: {},
      }
    );
  },

  async updateSettings(settings: Record<string, string>): Promise<SystemSettings> {
    const res = (await apiClient.put('/settings', { settings })) as { data?: SystemSettings };
    return res?.data || (await this.getSettings());
  },
};

export default settingService;
