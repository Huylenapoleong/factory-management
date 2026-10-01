import React from 'react';
import { Select, Badge, Avatar, Button, Space, Tag, Tooltip } from 'antd';
import {
  BankOutlined,
  BellOutlined,
  UserOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  FullscreenOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

export const HeaderBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = () => {
    const nextLang = language === 'zh-CN' ? 'en' : 'zh-CN';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        padding: '0 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {/* Left / Middle: Workshop selector and Shift Badge */}
      <Space orientation="horizontal" size="middle" align="center">
        <Space size="small">
          <BankOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
            {t('header.workshop')}:
          </span>
          <Select
            defaultValue="workshop-01"
            size="small"
            style={{ width: 280 }}
            options={[
              {
                value: 'workshop-01',
                label: language === 'zh-CN' ? '第一车间 - 机加工与总装' : 'Workshop 01 - Heavy Machining & Assembly',
              },
              {
                value: 'workshop-02',
                label: language === 'zh-CN' ? '第二车间 - 精密冲压与焊接' : 'Workshop 02 - Stamping & Welding',
              },
              {
                value: 'workshop-03',
                label: language === 'zh-CN' ? '第三车间 - 电子组装与测试' : 'Workshop 03 - Electronics & SMT',
              },
            ]}
          />
        </Space>

        <Tag
          color="blue"
          style={{
            margin: 0,
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#52c41a',
              display: 'inline-block',
            }}
          />
          {t('header.shift')}
        </Tag>

        <Tag color="success" style={{ margin: 0, fontSize: 12, borderRadius: 3 }}>
          <CheckCircleFilled style={{ marginRight: 4 }} />
          {t('header.systemStatus')}
        </Tag>
      </Space>

      {/* Right Controls: Language toggle, Notifications, Profile */}
      <Space size="middle" align="center">
        <Button
          type="text"
          size="small"
          icon={<GlobalOutlined />}
          onClick={handleLanguageChange}
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          {language === 'zh-CN' ? '简中 / EN' : 'EN / 简中'}
        </Button>

        <Tooltip title={t('dashboard.criticalDeficitsBadge')}>
          <Badge count={5} size="small" offset={[-2, 4]}>
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined style={{ fontSize: 16, color: '#4b5563' }} />}
            />
          </Badge>
        </Tooltip>

        <Tooltip title="Help / 帮助">
          <Button
            type="text"
            shape="circle"
            icon={<QuestionCircleOutlined style={{ fontSize: 15, color: '#6b7280' }} />}
          />
        </Tooltip>

        <Tooltip title="Fullscreen / 全屏">
          <Button
            type="text"
            shape="circle"
            icon={<FullscreenOutlined style={{ fontSize: 15, color: '#6b7280' }} />}
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }}
          />
        </Tooltip>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '2px 8px',
            backgroundColor: '#f3f4f6',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          <Avatar size={24} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
              {language === 'zh-CN' ? '张厂长' : 'Director Zhang'}
            </div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>
              {t('header.userRole')}
            </div>
          </div>
        </div>
      </Space>
    </div>
  );
};
