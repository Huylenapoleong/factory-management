import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Tag, Checkbox, App } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  BuildFilled,
  GlobalOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  DesktopOutlined,
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
        width: '100%',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 24px 16px',
        boxSizing: 'border-box',
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Bar with Language and Terminal Info */}
      <header
        style={{
          width: '100%',
          maxWidth: 1200,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Tag
            color="blue"
            style={{
              margin: 0,
              padding: '3px 10px',
              fontSize: 12,
              borderRadius: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #1d4ed8',
              backgroundColor: 'rgba(30, 58, 138, 0.45)',
              color: '#93c5fd',
            }}
          >
            <DesktopOutlined />
            <span>{t('auth.terminalReady')}</span>
          </Tag>
          <Tag
            color="success"
            style={{
              margin: 0,
              padding: '3px 10px',
              fontSize: 12,
              borderRadius: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #15803d',
              backgroundColor: 'rgba(20, 83, 45, 0.45)',
              color: '#86efac',
            }}
          >
            <CheckCircleFilled />
            <span>{t('auth.onlineGateway')}</span>
          </Tag>
        </div>

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
            height: 28,
            borderRadius: 6,
            marginLeft: 'auto',
          }}
        >
          {language === 'zh-CN' ? 'English' : '简体中文'}
        </Button>
      </header>

      {/* Main Login Card Section */}
      <main
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto 0',
          padding: '16px 0',
        }}
      >
        <Card
          className="login-card"
          style={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 10,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            border: '1px solid #334155',
            backgroundColor: '#ffffff',
          }}
          styles={{ body: { padding: '28px 24px 20px 24px' } }}
        >
          {/* Factory Header Branding */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
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
                marginBottom: 10,
                boxShadow: '0 4px 6px -1px rgba(22, 119, 255, 0.3)',
              }}
            >
              <BuildFilled style={{ fontSize: 26 }} />
            </div>
            <Title
              level={3}
              style={{ margin: '0 0 4px 0', fontSize: 20, color: '#0f172a', fontWeight: 700 }}
            >
              {t('auth.loginTitle')}
            </Title>
            <Text style={{ fontSize: 13, color: '#64748b' }}>{t('auth.loginSubtitle')}</Text>
          </div>

          {authError && (
            <Alert
              title={authError}
              type="error"
              showIcon
              closable
              onClose={() => setAuthError(null)}
              style={{ marginBottom: 16, fontSize: 13 }}
            />
          )}

          <Form
            form={form}
            name="wifim_login"
            layout="vertical"
            initialValues={{ remember: true }}
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

            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 16 }}>
              <Checkbox style={{ fontSize: 13, color: '#475569' }}>{t('auth.rememberMe')}</Checkbox>
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

          {/* Plant Security Notice */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <SafetyCertificateOutlined
              style={{ color: '#1677ff', fontSize: 16, marginTop: 2, flexShrink: 0 }}
            />
            <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 1.45 }}>
              {t('auth.securityNotice')}
            </Text>
          </div>
        </Card>
      </main>

      {/* Industrial Footer */}
      <footer
        style={{
          width: '100%',
          textAlign: 'center',
          color: '#64748b',
          fontSize: 12,
          paddingTop: 8,
        }}
      >
        <div>WIFIM MES Enterprise Suite | ISO 9001:2015 Manufacturing Standard</div>
        <div style={{ marginTop: 4, fontSize: 11, color: '#475569' }}>
          Plant Operations System v2.6 | Secure Industrial Protocol Active
        </div>
      </footer>
    </div>
  );
};

export default LoginView;
