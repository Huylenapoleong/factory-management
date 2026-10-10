import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Radio, Button, Space } from 'antd';
import { message } from '@/utils/antdApp';
import { SearchOutlined, PlusOutlined, InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { masterDataService } from '@/services/masterDataService';
import { SupplierRecord } from '@/features/suppliers/types';
import { PurchaseOrderStatus, PurchaseOrderSummary } from '../types';

interface PurchasingFilterBarProps {
  orders: PurchaseOrderSummary[];
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
  orders,
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
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);

  useEffect(() => {
    void masterDataService.getSuppliers().then(setSuppliers);
  }, []);

  const supplierOptions = [
    {
      value: 'ALL',
      label: `${isZh ? '全部合格供应商' : 'All Qualified Suppliers'} (${suppliers.length})`,
    },
    ...suppliers.map((s) => ({
      value: String(s.id),
      label: `${isZh ? s.nameZh : s.name} (${s.code})`,
    })),
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
          <PermissionGuard action="CREATE_PURCHASE_ORDER">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={onOpenCreatePO}
              style={{ backgroundColor: '#1677ff' }}
            >
              {isZh ? '新建采购单' : 'New Purchase Order'}
            </Button>
          </PermissionGuard>

          <PermissionGuard action="RECEIVE_GOODS">
            <Button size="small" icon={<InboxOutlined />} onClick={onOpenCreateReceipt}>
              {isZh ? '采购收货入库' : 'Create Goods Receipt'}
            </Button>
          </PermissionGuard>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (orders.length === 0) {
                message.warning(isZh ? '无采购订单数据可导出' : 'No data to export');
                return;
              }
              const headers = ['OrderNo,Supplier,TotalAmount,Status,OrderDate,ExpectedDate'];
              const rows = orders.map(
                (o) =>
                  `"${o.poNumber}","${isZh ? o.supplierNameZh : o.supplierNameEn}",${o.totalAmount},"${o.status}","${o.orderDate}","${o.expectedDate}"`,
              );
              const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute(
                'download',
                `purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`,
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              message.success(isZh ? '采购订单数据已成功导出' : 'Purchase orders exported');
            }}
          >
            {isZh ? '导出报表' : 'Export CSV'}
          </Button>
        </Space>
      </div>

      {/* Lower row: Status tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}
        >
          {isZh ? '订单状态:' : 'PO STATUS:'}
        </span>
        <Radio.Group
          size="small"
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="ALL">
            {isZh ? `全部 (${orders.length})` : `All (${orders.length})`}
          </Radio.Button>
          <Radio.Button value="DRAFT">
            {isZh
              ? `草稿 (${orders.filter((o) => o.status === 'DRAFT').length})`
              : `Draft (${orders.filter((o) => o.status === 'DRAFT').length})`}
          </Radio.Button>
          <Radio.Button value="CONFIRMED">
            {isZh
              ? `已确认 (${orders.filter((o) => o.status === 'CONFIRMED').length})`
              : `Confirmed (${orders.filter((o) => o.status === 'CONFIRMED').length})`}
          </Radio.Button>
          <Radio.Button value="INBOUND_INSPECTING">
            {isZh
              ? `到货质检中 (${orders.filter((o) => o.status === 'INBOUND_INSPECTING').length})`
              : `Inbound Inspecting (${orders.filter((o) => o.status === 'INBOUND_INSPECTING').length})`}
          </Radio.Button>
          <Radio.Button value="RECEIVED">
            {isZh
              ? `已入库 (${orders.filter((o) => o.status === 'RECEIVED').length})`
              : `Received (${orders.filter((o) => o.status === 'RECEIVED').length})`}
          </Radio.Button>
        </Radio.Group>
      </div>
    </Card>
  );
};
