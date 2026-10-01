import React from 'react';
import { Card, Input, Select, Radio, Button, Space, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  InboxOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { PurchaseOrderStatus } from '../types';

interface PurchasingFilterBarProps {
  selectedSupplier: string;
  onSelectSupplier: (val: string) => void;
  selectedStatus: PurchaseOrderStatus | 'ALL';
  onSelectStatus: (val: PurchaseOrderStatus | 'ALL') => void;
  searchText: string;
  onSearchChange: (val: string) => void;
  onOpenCreatePO: () => void;
  onOpenCreateReceipt: () => void;
}

export const PurchasingFilterBar: React.FC<PurchasingFilterBarProps> = ({
  selectedSupplier,
  onSelectSupplier,
  selectedStatus,
  onSelectStatus,
  searchText,
  onSearchChange,
  onOpenCreatePO,
  onOpenCreateReceipt,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const supplierOptions = [
    { value: 'ALL', label: isZh ? '全部合格供应商 / All Suppliers (42)' : 'All Suppliers (42)' },
    { value: 'Baosteel', label: isZh ? '宝武特钢股份有限公司 (Baosteel)' : 'Baosteel Precision Steel Ltd' },
    { value: 'Inovance', label: isZh ? '汇川精密伺服技术 (Inovance)' : 'Shenzhen Inovance Servo Tech' },
    { value: 'Parker', label: isZh ? '派克汉尼汾流体传动 (Parker)' : 'Parker Hannifin Hydraulics' },
    { value: 'Dongguan', label: isZh ? '东莞五金紧固件实业 (Dongguan)' : 'Dongguan Standard Fasteners' },
    { value: 'Omron', label: isZh ? '欧姆龙工业自动化 (Omron)' : 'Omron Industrial Automation' },
    { value: 'Festo', label: isZh ? '费斯托气动系统 (Festo)' : 'Festo Pneumatic Systems' },
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
              {isZh ? '供应商:' : 'Supplier:'}
            </span>
            <Select
              size="small"
              value={selectedSupplier}
              onChange={onSelectSupplier}
              style={{ width: 230 }}
              options={supplierOptions}
            />
          </div>

          <Input
            placeholder={
              isZh
                ? '搜索采购单号、供应商、物料SKU、GRN...'
                : 'Search PO#, Supplier, Material SKU, GRN...'
            }
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            size="small"
            allowClear
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 270 }}
          />
        </Space>

        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOpenCreatePO}
            style={{ backgroundColor: '#1677ff' }}
          >
            {isZh ? '新建采购单' : 'New Purchase Order'}
          </Button>

          <Button
            size="small"
            icon={<InboxOutlined />}
            onClick={onOpenCreateReceipt}
          >
            {isZh ? '采购收货入库' : 'Create Goods Receipt'}
          </Button>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => message.success(isZh ? '正在导出采购总台账...' : 'Exporting Procurement CSV...')}
          >
            {isZh ? '导出报表' : 'Export CSV'}
          </Button>
        </Space>
      </div>

      {/* Lower row: Status tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
          {isZh ? '订单状态:' : 'PO STATUS:'}
        </span>
        <Radio.Group
          size="small"
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="ALL">
            {isZh ? '全部 (28)' : 'All (28)'}
          </Radio.Button>
          <Radio.Button value="DRAFT">
            {isZh ? '草稿 (3)' : 'Draft (3)'}
          </Radio.Button>
          <Radio.Button value="CONFIRMED">
            {isZh ? '已确认 (12)' : 'Confirmed (12)'}
          </Radio.Button>
          <Radio.Button value="INBOUND_INSPECTING">
            {isZh ? '到货质检中 (5)' : 'Inbound Inspecting (5)'}
          </Radio.Button>
          <Radio.Button value="RECEIVED">
            {isZh ? '已入库 (8)' : 'Received (8)'}
          </Radio.Button>
        </Radio.Group>
      </div>
    </Card>
  );
};
