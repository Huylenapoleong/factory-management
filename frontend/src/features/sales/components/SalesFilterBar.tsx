import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Radio, Button, Space } from 'antd';
import { message } from '@/utils/antdApp';
import { SearchOutlined, PlusOutlined, SendOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { masterDataService } from '@/services/masterDataService';
import { CustomerRecord } from '@/features/customers/types';
import { SalesOrderStatus, SalesOrderSummary } from '../types';

interface SalesFilterBarProps {
  orders: SalesOrderSummary[];
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
  orders,
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
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  useEffect(() => {
    void masterDataService.getCustomers().then(setCustomers);
  }, []);

  const customerOptions = [
    {
      value: 'ALL',
      label: `${isZh ? '全部重点客户' : 'All Key Accounts'} (${customers.length})`,
    },
    ...customers.map((c) => ({
      value: String(c.id),
      label: `${isZh ? c.nameZh : c.name} (${c.code})`,
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
          <PermissionGuard action="CREATE_SALES_ORDER">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={onOpenCreateSO}
              style={{ backgroundColor: '#1677ff' }}
            >
              {isZh ? '新建销售订单' : 'New Sales Order'}
            </Button>
          </PermissionGuard>

          <PermissionGuard action="DISPATCH_DELIVERY">
            <Button size="small" icon={<SendOutlined />} onClick={onOpenCreateDelivery}>
              {isZh ? '销售发货出库' : 'Create Outbound Delivery'}
            </Button>
          </PermissionGuard>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (orders.length === 0) {
                message.warning(isZh ? '无销售订单数据可导出' : 'No data to export');
                return;
              }
              const headers = ['OrderNo,Customer,TotalAmount,Status,OrderDate,DeliveryDate'];
              const rows = orders.map(
                (o) =>
                  `"${o.orderNo}","${isZh ? o.customerNameZh : o.customerNameEn}",${o.totalAmount},"${o.status}","${o.orderDate}","${o.deliveryDate}"`,
              );
              const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute(
                'download',
                `sales_orders_${new Date().toISOString().slice(0, 10)}.csv`,
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              message.success(isZh ? '销售订单数据已成功导出' : 'Sales orders exported');
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
          {isZh ? '履约状态:' : 'ORDER STATUS:'}
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
          <Radio.Button value="QUOTATION">
            {isZh
              ? `报价中 (${orders.filter((o) => o.status === 'QUOTATION').length})`
              : `Quotation (${orders.filter((o) => o.status === 'QUOTATION').length})`}
          </Radio.Button>
          <Radio.Button value="CONFIRMED">
            {isZh
              ? `已确认 (${orders.filter((o) => o.status === 'CONFIRMED').length})`
              : `Confirmed (${orders.filter((o) => o.status === 'CONFIRMED').length})`}
          </Radio.Button>
          <Radio.Button value="IN_PRODUCTION">
            {isZh
              ? `生产在制 (${orders.filter((o) => o.status === 'IN_PRODUCTION').length})`
              : `Production WIP (${orders.filter((o) => o.status === 'IN_PRODUCTION').length})`}
          </Radio.Button>
          <Radio.Button value="READY_TO_SHIP">
            <span style={{ color: selectedStatus === 'READY_TO_SHIP' ? '#fff' : '#15803d' }}>
              ●{' '}
              {isZh
                ? `待发货 (${orders.filter((o) => o.status === 'READY_TO_SHIP').length})`
                : `Ready to Ship (${orders.filter((o) => o.status === 'READY_TO_SHIP').length})`}
            </span>
          </Radio.Button>
          <Radio.Button value="SHIPPED">
            {isZh
              ? `已出库 (${orders.filter((o) => o.status === 'SHIPPED').length})`
              : `Shipped (${orders.filter((o) => o.status === 'SHIPPED').length})`}
          </Radio.Button>
        </Radio.Group>
      </div>
    </Card>
  );
};
