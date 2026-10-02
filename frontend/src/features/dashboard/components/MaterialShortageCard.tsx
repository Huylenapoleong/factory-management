import React, { useState } from 'react';
import { Card, Table, Tag, Button, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AlertFilled,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { MaterialShortageItem } from '../types';
import { dashboardService } from '@/services/dashboardService';

interface MaterialShortageCardProps {
  shortages: MaterialShortageItem[];
  onPoCreated?: () => void;
}

export const MaterialShortageCard: React.FC<MaterialShortageCardProps> = ({
  shortages,
  onPoCreated,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const { modal, message } = App.useApp();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const handleQuickPo = (item: MaterialShortageItem) => {
    modal.confirm({
      title: `${t('dashboard.quickPo')} - ${language === 'zh-CN' ? item.materialNameZh : item.materialName}`,
      icon: <ShoppingCartOutlined style={{ color: '#1677ff' }} />,
      content: (
        <div>
          <p>{t('dashboard.quickPoConfirm')}</p>
          <div style={{ padding: 8, backgroundColor: '#f9fafb', borderRadius: 4, fontSize: 12 }}>
            <div><strong>Item:</strong> {item.materialCode}</div>
            <div><strong>Deficit to purchase:</strong> <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{item.deficitQty} {item.uom}</span></div>
            <div><strong>Notice:</strong> {item.leadTimeNotice}</div>
          </div>
        </div>
      ),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        try {
          setLoadingCode(item.materialCode);
          const result = await dashboardService.quickCreatePo(item.materialCode, item.deficitQty);
          message.success({
            content: `Purchase Order ${result.poNo} created successfully!`,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          });
          onPoCreated?.();
        } catch {
          message.error('Failed to create purchase order');
        } finally {
          setLoadingCode(null);
        }
      },
    });
  };

  const columns: ColumnsType<MaterialShortageItem> = [
    {
      title: t('columns.materialName'),
      key: 'material',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 12 }}>
            {language === 'zh-CN' ? record.materialNameZh : record.materialName}
          </div>
          <div className="tnum" style={{ fontSize: 11, color: '#6b7280' }}>
            {record.materialCode}
          </div>
        </div>
      ),
    },
    {
      title: t('columns.safetyMin'),
      key: 'stock',
      width: 110,
      render: (_, record) => (
        <div className="tnum" style={{ fontSize: 11 }}>
          <span style={{ color: '#cf1322', fontWeight: 600 }}>{record.currentStock} {record.uom}</span>
          <div style={{ color: '#9ca3af' }}>Min: {record.minStock} {record.uom}</div>
        </div>
      ),
    },
    {
      title: t('columns.deficit'),
      dataIndex: 'deficitQty',
      key: 'deficit',
      width: 80,
      align: 'right',
      render: (deficit, record) => (
        <span className="tnum" style={{ fontWeight: 700, color: '#cf1322', fontSize: 12 }}>
          -{deficit} {record.uom}
        </span>
      ),
    },
    {
      title: t('columns.actions'),
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          loading={loadingCode === record.materialCode}
          onClick={() => handleQuickPo(record)}
          style={{
            fontSize: 11,
            height: 22,
            padding: '0 6px',
            backgroundColor: '#1677ff',
          }}
        >
          {t('dashboard.quickPo')}
        </Button>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            {t('dashboard.criticalShortages')}
          </span>
          <Tag color="error" style={{ margin: 0, fontWeight: 600, borderRadius: 2 }}>
            <AlertFilled style={{ marginRight: 4 }} />
            {t('dashboard.criticalDeficitsBadge')}
          </Tag>
        </div>
      }
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
      styles={{ body: { padding: '4px 8px 8px 8px' } }}
    >
      <Table
        dataSource={shortages}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        bordered
      />

      <div
        style={{
          marginTop: 8,
          padding: '6px 10px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 3,
          fontSize: 11,
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <InfoCircleOutlined style={{ color: '#2563eb' }} />
        <span>{t('dashboard.leadTimeNotice')}</span>
      </div>
    </Card>
  );
};

export default MaterialShortageCard;
