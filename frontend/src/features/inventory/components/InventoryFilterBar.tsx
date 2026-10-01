import React from 'react';
import { Card, Input, Select, Radio, Button, Space, message } from 'antd';
import {
  SearchOutlined,
  SwapOutlined,
  FormOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { StockStatus } from '../types';

interface InventoryFilterBarProps {
  selectedWarehouse: number | 'ALL';
  onSelectWarehouse: (val: number | 'ALL') => void;
  selectedCategory: string;
  onSelectCategory: (val: string) => void;
  selectedStatus: StockStatus | 'ALL';
  onSelectStatus: (val: StockStatus | 'ALL') => void;
  searchText: string;
  onSearchChange: (val: string) => void;
  onOpenTransfer: () => void;
  onOpenAdjustment: () => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  selectedWarehouse,
  onSelectWarehouse,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchText,
  onSearchChange,
  onOpenTransfer,
  onOpenAdjustment,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const warehouseOptions = [
    { value: 'ALL', label: isZh ? '全部仓库 / All Hubs (4)' : 'All Warehouses (4)' },
    { value: 1, label: isZh ? 'WH-01 原材料一号库 (680)' : 'WH-01 Raw Materials (680)' },
    { value: 2, label: isZh ? 'WH-02 车间在制品库 (210)' : 'WH-02 WIP Workshop (210)' },
    { value: 3, label: isZh ? 'WH-03 成品总装库 (340)' : 'WH-03 Finished Goods (340)' },
    { value: 4, label: isZh ? 'WH-04 保税物流中心 (252)' : 'WH-04 Bonded Logistics (252)' },
  ];

  const categoryOptions = [
    { value: 'ALL', label: isZh ? '全部物料类别 (1,482)' : 'All Categories (1,482)' },
    { value: 'Raw Alloys', label: isZh ? '特种合金 / Raw Alloys (340)' : 'Raw Alloys (340)' },
    { value: 'Fasteners', label: isZh ? '标准紧固件 / Fasteners (520)' : 'Fasteners (520)' },
    { value: 'Electrical', label: isZh ? '电气伺服 / Electrical (280)' : 'Electrical (280)' },
    { value: 'Packaging & Consumables', label: isZh ? '包材辅料 / Packaging (342)' : 'Packaging & Consumables (342)' },
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
      {/* Upper row: Selectors, Search, Actions */}
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
              {isZh ? '仓库:' : 'Warehouse:'}
            </span>
            <Select
              size="small"
              value={selectedWarehouse}
              onChange={onSelectWarehouse}
              style={{ width: 190 }}
              options={warehouseOptions}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
              {isZh ? '类别:' : 'Category:'}
            </span>
            <Select
              size="small"
              value={selectedCategory}
              onChange={onSelectCategory}
              style={{ width: 190 }}
              options={categoryOptions}
            />
          </div>

          <Input
            placeholder={
              isZh
                ? '搜索物料号、批次、库位、规格...'
                : 'Search SKU, Lot, Bin location, Spec...'
            }
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            size="small"
            allowClear
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 250 }}
          />
        </Space>

        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<SwapOutlined />}
            onClick={onOpenTransfer}
            style={{ backgroundColor: '#1677ff' }}
          >
            {isZh ? '+ 库位调拨' : '+ Stock Transfer'}
          </Button>

          <Button
            size="small"
            icon={<FormOutlined />}
            onClick={onOpenAdjustment}
          >
            {isZh ? '盘点调整' : 'Stocktake / Adjust'}
          </Button>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => message.success(isZh ? '正在导出实时库存台账...' : 'Exporting Stock Ledger CSV...')}
          >
            {isZh ? '导出台账' : 'Export CSV'}
          </Button>
        </Space>
      </div>

      {/* Lower row: Quick alert status filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
          {isZh ? '状态筛选:' : 'ALERT FILTERS:'}
        </span>
        <Radio.Group
          size="small"
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="ALL">
            {isZh ? '全部 (1,482)' : 'All (1,482)'}
          </Radio.Button>
          <Radio.Button value="NORMAL">
            <span style={{ color: selectedStatus === 'NORMAL' ? '#fff' : '#15803d' }}>
              ● {isZh ? '充足 (1,418)' : 'Normal (1,418)'}
            </span>
          </Radio.Button>
          <Radio.Button value="LOW_STOCK">
            <span style={{ color: selectedStatus === 'LOW_STOCK' ? '#fff' : '#b45309' }}>
              ▲ {isZh ? '低于安全线 (14)' : 'Below Safety (14)'}
            </span>
          </Radio.Button>
          <Radio.Button value="STOCKOUT">
            <span style={{ color: selectedStatus === 'STOCKOUT' ? '#fff' : '#b91c1c' }}>
              ✖ {isZh ? '缺料断货 (4)' : 'Zero Stock (4)'}
            </span>
          </Radio.Button>
          <Radio.Button value="QUARANTINE">
            <span style={{ color: selectedStatus === 'QUARANTINE' ? '#fff' : '#6b7280' }}>
              ⚑ {isZh ? '待检隔离 (46)' : 'Quarantine (46)'}
            </span>
          </Radio.Button>
        </Radio.Group>
      </div>
    </Card>
  );
};
