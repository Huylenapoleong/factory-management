import React, { useState } from 'react';
import { Card, Table, Tag, Progress, Button, Space, Input, Radio, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  DownloadOutlined,
  ToolOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { WorkOrderProgressItem, WorkOrderStatus } from '../types';

interface PriorityWorkOrdersCardProps {
  orders: WorkOrderProgressItem[];
}

export const PriorityWorkOrdersCard: React.FC<PriorityWorkOrdersCardProps> = ({ orders }) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.woNo.toLowerCase().includes(searchText.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.productNameZh.includes(searchText) ||
      order.workstation.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return order.status === statusFilter;
  });

  const getStatusTag = (status: WorkOrderStatus) => {
    switch (status) {
      case 'IN_PRODUCTION':
        return (
          <Tag color="processing" style={{ borderRadius: 2, margin: 0 }}>
            {t('dashboard.inProduction')}
          </Tag>
        );
      case 'QC_INSPECTION':
        return (
          <Tag color="warning" style={{ borderRadius: 2, margin: 0 }}>
            {t('dashboard.qcInspection')}
          </Tag>
        );
      case 'COMPLETED':
        return (
          <Tag color="success" style={{ borderRadius: 2, margin: 0 }}>
            {t('dashboard.completed')}
          </Tag>
        );
      case 'NEAR_DEADLINE':
        return (
          <Tag color="error" style={{ borderRadius: 2, margin: 0, fontWeight: 600 }}>
            {t('dashboard.nearDeadlineTag')}
          </Tag>
        );
    }
  };

  const columns: ColumnsType<WorkOrderProgressItem> = [
    {
      title: t('columns.workOrderNo'),
      dataIndex: 'woNo',
      key: 'woNo',
      width: 140,
      render: (text) => (
        <span className="tnum" style={{ fontWeight: 600, color: '#1677ff', cursor: 'pointer' }}>
          {text}
        </span>
      ),
    },
    {
      title: t('columns.productSpec'),
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {language === 'zh-CN' ? record.productNameZh : record.productName}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {record.spec}
          </div>
        </div>
      ),
    },
    {
      title: t('columns.workstationLine'),
      key: 'workstation',
      width: 160,
      render: (_, record) => (
        <Space size={4} style={{ fontSize: 12, color: '#4b5563' }}>
          <ToolOutlined style={{ color: '#1677ff' }} />
          <span>{language === 'zh-CN' ? record.workstationZh : record.workstation}</span>
        </Space>
      ),
    },
    {
      title: t('columns.planActual'),
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="tnum" style={{ fontSize: 12, textAlign: 'right' }}>
          <strong style={{ color: '#111827' }}>{record.completedQty.toLocaleString()}</strong>
          <span style={{ color: '#9ca3af' }}> / {record.plannedQty.toLocaleString()} {record.uom}</span>
        </div>
      ),
    },
    {
      title: t('columns.progress'),
      dataIndex: 'progressPercent',
      key: 'progress',
      width: 120,
      render: (percent, record) => (
        <Progress
          percent={percent}
          size="small"
          status={record.status === 'NEAR_DEADLINE' ? 'exception' : percent === 100 ? 'success' : 'active'}
          strokeColor={record.status === 'NEAR_DEADLINE' ? '#ff4d4f' : percent === 100 ? '#52c41a' : '#1677ff'}
        />
      ),
    },
    {
      title: t('columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: t('columns.actions'),
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={t('actions.viewDetails')}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => message.info(`Order ${record.woNo} details opened`)}
              style={{ padding: '0 4px', fontSize: 12 }}
            >
              {t('actions.viewDetails')}
            </Button>
          </Tooltip>
          <Tooltip title={t('actions.dispatch')}>
            <Button
              type="primary"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => message.success(`Dispatch reported for ${record.woNo}`)}
              style={{ fontSize: 11, height: 22, padding: '0 6px' }}
            >
              {t('actions.dispatch')}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            {t('dashboard.priorityWorkOrders')}
          </span>
          <Space size="small">
            <Radio.Group
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="ALL">{t('dashboard.allOrders')}</Radio.Button>
              <Radio.Button value="IN_PRODUCTION">{t('dashboard.inProduction')}</Radio.Button>
              <Radio.Button value="QC_INSPECTION">{t('dashboard.qcInspection')}</Radio.Button>
              <Radio.Button value="COMPLETED">{t('dashboard.completed')}</Radio.Button>
            </Radio.Group>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.success('Exporting Work Orders CSV...')}
            >
              {t('dashboard.exportCsv')}
            </Button>
          </Space>
        </div>
      }
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
      styles={{ body: { padding: '8px 12px' } }}
    >
      <div style={{ marginBottom: 10 }}>
        <Input
          placeholder={t('dashboard.searchWorkOrders')}
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          size="small"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{
          pageSize: 5,
          size: 'small',
          showTotal: (total) => `Total ${total} orders`,
        }}
        bordered
      />
    </Card>
  );
};

export default PriorityWorkOrdersCard;
