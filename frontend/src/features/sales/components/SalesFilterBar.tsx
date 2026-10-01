import React from 'react';
import { Card, Input, Select, Radio, Button, Space, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  SendOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { SalesOrderStatus } from '../types';

interface SalesFilterBarProps {
  selectedCustomer: string;
  onSelectCustomer: (val: string) => void;
  selectedStatus: SalesOrderStatus | 'ALL';
  onSelectStatus: (val: SalesOrderStatus | 'ALL') => void;
  searchText: string;
  onSearchChange: (val: string) => void;
  onOpenCreateSO: () => void;
  onOpenCreateDelivery: () => void;
}

export const SalesFilterBar: React.FC<SalesFilterBarProps> = ({
  selectedCustomer,
  onSelectCustomer,
  selectedStatus,
  onSelectStatus,
  searchText,
  onSearchChange,
  onOpenCreateSO,
  onOpenCreateDelivery,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const customerOptions = [
    { value: 'ALL', label: isZh ? '全部重点客户 / All Key Accounts (45)' : 'All Key Accounts (45)' },
    { value: 'Tesla', label: isZh ? '特斯拉能源超级工厂 (Tesla Energy)' : 'Tesla Energy Gigafactory' },
    { value: 'BYD', label: isZh ? '比亚迪汽车西安总装基地 (BYD Auto)' : "BYD Auto Xi'an Plant" },
    { value: 'Siemens', label: isZh ? '西门子能源系统 (Siemens Energy)' : 'Siemens Energy AG' },
    { value: 'Foxconn', label: isZh ? '富士康工业互联 (Foxconn FII)' : 'Foxconn Industrial Internet' },
    { value: 'Sany', label: isZh ? '三一重工股份有限公司 (Sany Heavy)' : 'Sany Heavy Industry' },
  ];

  return (
    <Card
      size="small"
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        marginBottom: 12,
      }}
      styles={{ body: { padding: '10px 14px' } }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <Space wrap size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
              {isZh ? '客户:' : 'Customer:'}
            </span>
            <Select
              size="small"
              value={selectedCustomer}
              onChange={onSelectCustomer}
              style={{ width: 250 }}
              options={customerOptions}
            />
          </div>

          <Input
            placeholder={
              isZh
                ? '搜索销售单号、客户、物料号、发货单...'
                : 'Search SO#, Customer, Part SKU, Delivery Note...'
            }
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            size="small"
            allowClear
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 280 }}
          />
        </Space>

        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOpenCreateSO}
            style={{ backgroundColor: '#1677ff' }}
          >
            {isZh ? '新建销售订单' : 'New Sales Order'}
          </Button>

          <Button
            size="small"
            icon={<SendOutlined />}
            onClick={onOpenCreateDelivery}
          >
            {isZh ? '销售发货出库' : 'Create Outbound Delivery'}
          </Button>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => message.success(isZh ? '正在导出销售订单总台账...' : 'Exporting Sales Ledger CSV...')}
          >
            {isZh ? '导出报表' : 'Export CSV'}
          </Button>
        </Space>
      </div>

      {/* Lower row: Status tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
          {isZh ? '履约状态:' : 'ORDER STATUS:'}
        </span>
        <Radio.Group
          size="small"
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="ALL">
            {isZh ? '全部 (45)' : 'All (45)'}
          </Radio.Button>
          <Radio.Button value="QUOTATION">
            {isZh ? '报价中 (6)' : 'Quotation (6)'}
          </Radio.Button>
          <Radio.Button value="CONFIRMED">
            {isZh ? '已确认 (18)' : 'Confirmed (18)'}
          </Radio.Button>
          <Radio.Button value="IN_PRODUCTION">
            {isZh ? '生产在制 (12)' : 'Production WIP (12)'}
          </Radio.Button>
          <Radio.Button value="READY_TO_SHIP">
            <span style={{ color: selectedStatus === 'READY_TO_SHIP' ? '#fff' : '#15803d' }}>
              ● {isZh ? '待发货 (7)' : 'Ready to Ship (7)'}
            </span>
          </Radio.Button>
          <Radio.Button value="SHIPPED">
            {isZh ? '已出库 (2)' : 'Shipped (2)'}
          </Radio.Button>
        </Radio.Group>
      </div>
    </Card>
  );
};
