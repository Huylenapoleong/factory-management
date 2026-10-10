import React from 'react';
import { Result, Button, Space, Tag, Typography, theme } from 'antd';
import { LockOutlined, DashboardOutlined, LoginOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRbac } from '@/hooks/useRbac';
import { ENTERPRISE_ROLES, EnterpriseRole } from '@/utils/rbac';
import { useAuthStore } from '@/stores/useAuthStore';

const { Text, Paragraph } = Typography;

interface AccessDeniedViewProps {
  requiredRoles?: (EnterpriseRole | string)[];
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ requiredRoles = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { token } = theme.useToken();
  const { user, roles } = useRbac();
  const { logout } = useAuthStore();

  const isZh = i18n.language === 'zh-CN';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 620,
          width: '100%',
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <Result
          status="403"
          icon={<LockOutlined style={{ color: token.colorError, fontSize: 64 }} />}
          title={
            <span style={{ fontSize: 22, fontWeight: 700, color: token.colorText }}>
              {isZh ? '403 · 访问受限' : '403 · Access Denied'}
            </span>
          }
          subTitle={
            <div style={{ marginTop: 8 }}>
              <Paragraph
                style={{ color: token.colorTextSecondary, fontSize: 13, marginBottom: 16 }}
              >
                {isZh
                  ? '当前登录账户无权访问该工业控制分系统或管理页面。若需开通权限，请联系工厂系统管理员。'
                  : 'Your account does not possess the operational authorization required for this MES subsystem.'}
              </Paragraph>

              <div
                style={{
                  backgroundColor: token.colorFillAlter,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: 6,
                  padding: '12px 16px',
                  marginBottom: 16,
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <SafetyOutlined style={{ color: token.colorPrimary }} />
                  <Text strong style={{ fontSize: 12 }}>
                    {isZh ? '操作终端安全上下文' : 'Security Context Telemetry'}:
                  </Text>
                  <Text code style={{ fontSize: 11 }}>
                    {location.pathname}
                  </Text>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, color: token.colorTextSecondary, marginRight: 6 }}>
                      {isZh ? '当前用户 / 责任人' : 'Active Operator'}:
                    </span>
                    <Text strong>@{user?.username || 'unknown'}</Text>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: token.colorTextSecondary, marginRight: 6 }}>
                      {isZh ? '当前已分配角色' : 'Current Roles'}:
                    </span>
                    {roles.length > 0 ? (
                      roles.map((r) => {
                        const meta = ENTERPRISE_ROLES[r as EnterpriseRole];
                        return (
                          <Tag color={meta?.color || 'blue'} key={r} style={{ margin: 2 }}>
                            {r}
                          </Tag>
                        );
                      })
                    ) : (
                      <Tag color="default">NONE</Tag>
                    )}
                  </div>
                </div>

                {requiredRoles.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: `1px dashed ${token.colorBorderSecondary}`,
                    }}
                  >
                    <span style={{ fontSize: 12, color: token.colorTextSecondary, marginRight: 6 }}>
                      {isZh ? '准入必要角色' : 'Required Authorizations'}:
                    </span>
                    {requiredRoles.map((r) => (
                      <Tag color="geekblue" key={r} style={{ margin: 2, fontWeight: 600 }}>
                        {String(r).replace(/^ROLE_/i, '')}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
          extra={
            <Space size="middle">
              <Button
                type="primary"
                icon={<DashboardOutlined />}
                onClick={() => navigate('/dashboard', { replace: true })}
                style={{ fontWeight: 600 }}
              >
                {isZh ? '返回控制大屏' : 'Back to Dashboard'}
              </Button>
              <Button icon={<LoginOutlined />} onClick={handleLogout}>
                {isZh ? '切换账户登录' : 'Switch Operator Account'}
              </Button>
            </Space>
          }
        />
      </div>
    </div>
  );
};

export default AccessDeniedView;
