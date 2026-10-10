import React from 'react';
import { Card, Input, Select, Radio, Button, Space } from 'antd';
import { message } from '@/utils/antdApp';
import { SearchOutlined, SwapOutlined, FormOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { inventoryService } from '@/services/inventoryService';
import { StockStatus, WarehouseSummary, InventoryBalanceItem } from '../types';

interface InventoryFilterBarProps {
  balances?: InventoryBalanceItem[];
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
  balances = [],
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
  const [warehouses, setWarehouses] = React.useState<WarehouseSummary[]>([]);

  React.useEffect(() => {
    let active = true;
    void inventoryService.getWarehouses().then((whs) => {
      if (active) setWarehouses(whs);
    });
    return () => {
      active = false;
    };
  }, []);

  const warehouseOptions = [
    { value: 'ALL', label: isZh ? '全部仓库' : 'All Warehouses' },
    ...warehouses.map((w) => ({
      value: w.id,
      label: `${w.code} - ${isZh ? w.nameZh || w.nameEn : w.nameEn}`,
    })),
  ];

  const categoryOptions = [
    { value: 'ALL', label: isZh ? '全部物料类别' : 'All Categories' },
    { value: 'Raw Alloys', label: isZh ? '特种合金' : 'Raw Alloys' },
    { value: 'Fasteners', label: isZh ? '标准紧固件' : 'Fasteners' },
    { value: 'Electrical', label: isZh ? '电气伺服' : 'Electrical' },
    {
      value: 'Packaging & Consumables',
      label: isZh ? '包材辅料' : 'Packaging & Consumables',
    },
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
              isZh ? '搜索物料号、批次、库位、规格...' : 'Search SKU, Lot, Bin location, Spec...'
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
          <PermissionGuard action="TRANSFER_STOCK">
            <Button
              type="primary"
              size="small"
              icon={<SwapOutlined />}
              onClick={onOpenTransfer}
              style={{ backgroundColor: '#1677ff' }}
            >
              {isZh ? '库位调拨' : 'Stock Transfer'}
            </Button>
          </PermissionGuard>

          <PermissionGuard action="ADJUST_STOCK">
            <Button size="small" icon={<FormOutlined />} onClick={onOpenAdjustment}>
              {isZh ? '盘点调整' : 'Stocktake / Adjust'}
            </Button>
          </PermissionGuard>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (balances.length === 0) {
                message.warning(isZh ? '暂无库存台账数据可导出' : 'No inventory data to export');
                return;
              }
              const headers = [
                'ItemCode,ItemNameZh,ItemNameEn,Category,LotNo,Warehouse,LocationBin,AvailableQty,ReservedQty,TotalQty,UOM,UnitCost,TotalValuation,Status',
              ];
              const rows = balances.map(
                (b) =>
                  `"${b.itemCode}","${b.itemNameZh}","${b.itemNameEn}","${isZh ? b.itemCategoryZh : b.itemCategory}","${b.lotNumber}","${isZh ? b.warehouseNameZh : b.warehouseNameEn}","${b.locationCode}",${b.availableQuantity},${b.reservedQuantity},${b.quantity},"${b.itemUnitCode}",${b.unitCost},${b.totalValuation},"${b.status}"`,
              );
              const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute(
                'download',
                `inventory_ledger_${new Date().toISOString().slice(0, 10)}.csv`,
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              message.success(
                isZh ? '实时库存台账已成功导出' : 'Stock ledger exported successfully',
              );
            }}
          >
            {isZh ? '导出台账' : 'Export CSV'}
          </Button>
        </Space>
      </div>

      {/* Lower row: Quick alert status filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}
        >
          {isZh ? '状态筛选:' : 'ALERT FILTERS:'}
        </span>
        <Radio.Group
          size="small"
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="ALL">{isZh ? '全部' : 'All'}</Radio.Button>
          <Radio.Button value="NORMAL">
            <span style={{ color: selectedStatus === 'NORMAL' ? '#fff' : '#15803d' }}>
              {isZh ? '充足' : 'Normal'}
            </span>
          </Radio.Button>
          <Radio.Button value="LOW_STOCK">
            <span style={{ color: selectedStatus === 'LOW_STOCK' ? '#fff' : '#b45309' }}>
              {isZh ? '低于安全线' : 'Below Safety'}
            </span>
          </Radio.Button>
          <Radio.Button value="STOCKOUT">
            <span style={{ color: selectedStatus === 'STOCKOUT' ? '#fff' : '#b91c1c' }}>
              {isZh ? '缺料断货' : 'Zero Stock'}
            </span>
          </Radio.Button>
          <Radio.Button value="QUARANTINE">
            <span style={{ color: selectedStatus === 'QUARANTINE' ? '#fff' : '#6b7280' }}>
              {isZh ? '待检隔离' : 'Quarantine'}
            </span>
          </Radio.Button>
        </Radio.Group>
      </div>
    </Card>
  );
};
