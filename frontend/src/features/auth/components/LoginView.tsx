import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Tag, Checkbox, Divider, App } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BuildFilled,
  GlobalOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  DesktopOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

export const LoginView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm<LoginFormValues>();

  const { login, isLoading } = useAuthStore();
  const { language, setLanguage } = useAppStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleLanguageToggle = () => {
    const nextLang = language === 'zh-CN' ? 'en' : 'zh-CN';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleFillDemo = (username: string, pass: string) => {
    form.setFieldsValue({
      username,
      password: pass,
      remember: true,
    });
    setAuthError(null);
  };

  const onFinish = async (values: LoginFormValues) => {
    setAuthError(null);
    const res = await login(values.username, values.password);
    if (res.success) {
      message.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } else {
      setAuthError(res.error || t('auth.loginFailed'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Bar with Language and Terminal Info */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space size="middle">
          <Tag color="blue" style={{ margin: 0, padding: '2px 8px', fontSize: 12 }}>
            <DesktopOutlined style={{ marginRight: 4 }} />
            {t('auth.terminalId')}
          </Tag>
          <Tag color="success" style={{ margin: 0, padding: '2px 8px', fontSize: 12 }}>
            <CheckCircleFilled style={{ marginRight: 4 }} />
            {t('auth.onlineGateway')}
          </Tag>
        </Space>

        <Button
          type="default"
          size="small"
          icon={<GlobalOutlined />}
          onClick={handleLanguageToggle}
          style={{
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            borderColor: '#334155',
            fontSize: 12,
          }}
        >
          {language === 'zh-CN' ? 'English (EN)' : '简体中文 (ZH)'}
        </Button>
      </div>

      {/* Main Login Card */}
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 8,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          border: '1px solid #334155',
          backgroundColor: '#ffffff',
        }}
        styles={{ body: { padding: '32px 32px 24px 32px' } }}
      >
        {/* Factory Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: '#1677ff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: 12,
              boxShadow: '0 4px 6px -1px rgba(22, 119, 255, 0.3)',
            }}
          >
            <BuildFilled style={{ fontSize: 26 }} />
          </div>
          <Title level={3} style={{ margin: '0 0 4px 0', fontSize: 20, color: '#0f172a', fontWeight: 700 }}>
            {t('auth.loginTitle')}
          </Title>
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            {t('auth.loginSubtitle')}
          </Text>
        </div>

        {authError && (
          <Alert
            title={authError}
            type="error"
            showIcon
            closable
            onClose={() => setAuthError(null)}
            style={{ marginBottom: 20, fontSize: 13 }}
          />
        )}

        <Form
          form={form}
          name="wifim_login"
          layout="vertical"
          initialValues={{ username: 'admin', password: 'admin123', remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label={<span style={{ fontSize: 13, fontWeight: 600 }}>{t('auth.username')}</span>}
            rules={[{ required: true, message: t('auth.usernamePlaceholder') }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder={t('auth.usernamePlaceholder')}
              size="large"
              style={{ borderRadius: 6, fontSize: 14 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontSize: 13, fontWeight: 600 }}>{t('auth.password')}</span>}
            rules={[{ required: true, message: t('auth.passwordPlaceholder') }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder={t('auth.passwordPlaceholder')}
              size="large"
              style={{ borderRadius: 6, fontSize: 14 }}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 20 }}>
            <Checkbox style={{ fontSize: 13, color: '#475569' }}>
              {t('auth.rememberMe')}
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              block
              style={{
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                height: 42,
                backgroundColor: '#1677ff',
              }}
            >
              {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '16px 0', fontSize: 12, color: '#94a3b8' }}>
          {t('auth.demoAccounts')}
        </Divider>

        {/* Demo Fast-Fill Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button
            size="small"
            icon={<UserOutlined />}
            onClick={() => handleFillDemo('admin', 'admin123')}
            style={{
              fontSize: 12,
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderColor: '#cbd5e1',
            }}
          >
            {t('auth.adminDemo')}
          </Button>
          <Button
            size="small"
            icon={<ToolOutlined />}
            onClick={() => handleFillDemo('operator', 'operator123')}
            style={{
              fontSize: 12,
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderColor: '#cbd5e1',
            }}
          >
            {t('auth.operatorDemo')}
          </Button>
        </div>

        {/* Plant Policy Notice */}
        <div
          style={{
            marginTop: 20,
            padding: '8px 10px',
            backgroundColor: '#f8fafc',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <SafetyCertificateOutlined style={{ color: '#0284c7', marginTop: 2, fontSize: 14 }} />
          <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
            {t('auth.securityNotice')}
          </Text>
        </div>
      </Card>

      {/* Industrial Footer */}
      <div style={{ marginTop: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
        <div>WIFIM MES Enterprise Suite | ISO 9001:2015 Manufacturing Standard</div>
        <div style={{ marginTop: 4, fontSize: 11, color: '#475569' }}>
          Plant Operations System v2.6 | Secure Industrial Protocol Active
        </div>
      </div>
    </div>
  );
};

export default LoginView;
