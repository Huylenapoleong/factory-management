import React, { useState } from 'react';
import { Table, Card, Tag, Button, Space, message, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  SwapOutlined,
  BarcodeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { InventoryBalanceItem } from '../types';

const { Text } = Typography;

interface InventoryLedgerTableProps {
  balances: InventoryBalanceItem[];
  loading?: boolean;
  onTransferItem: (item: InventoryBalanceItem) => void;
  onAdjustItem: (item: InventoryBalanceItem) => void;
}

export const InventoryLedgerTable: React.FC<InventoryLedgerTableProps> = ({
  balances,
  loading = false,
  onTransferItem,
  onAdjustItem,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<InventoryBalanceItem> = [
    {
      title: isZh ? '物料编码 (SKU)' : 'SKU / Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 140,
      render: (code: string) => (
        <span className="tnum" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff', fontSize: 12 }}>
          {code}
        </span>
      ),
    },
    {
      title: isZh ? '物料名称与规格' : 'Material Description & Spec',
      key: 'materialInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
            {isZh ? record.itemNameZh : record.itemNameEn}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
            {record.itemSpec}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '仓库 / 库位' : 'Warehouse / Bin',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: 150,
      render: (loc: string) => (
        <Tag
          icon={<InboxOutlined />}
          style={{
            margin: 0,
            borderRadius: 3,
            fontSize: 11,
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb',
            color: '#374151',
          }}
        >
          {loc}
        </Tag>
      ),
    },
    {
      title: isZh ? '生产批次号' : 'Lot / Batch No',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 125,
      render: (lot: string) => (
        <span className="tnum" style={{ fontFamily: 'monospace', fontSize: 11, color: '#4b5563' }}>
          {lot}
        </span>
      ),
    },
    {
      title: isZh ? '现有库存' : 'On-Hand',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty: number, record) => (
        <span className="tnum" style={{ fontWeight: 600, color: '#1f2937' }}>
          {qty.toLocaleString()} <Text type="secondary" style={{ fontSize: 11 }}>{record.itemUnitCode}</Text>
        </span>
      ),
    },
    {
      title: isZh ? '可用库存' : 'Available',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 95,
      align: 'right',
      render: (avail: number, record) => {
        const isLow = avail < record.minStock;
        return (
          <span
            className="tnum"
            style={{
              fontWeight: 600,
              color: avail === 0 ? '#dc2626' : isLow ? '#d97706' : '#15803d',
            }}
          >
            {avail.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: isZh ? '锁定 (Alloc)' : 'Allocated',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 90,
      align: 'right',
      render: (res: number) => (
        <span className="tnum" style={{ color: '#6b7280', fontSize: 12 }}>
          {res > 0 ? res.toLocaleString() : '-'}
        </span>
      ),
    },
    {
      title: isZh ? '安全基线' : 'Safety Min',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 90,
      align: 'right',
      render: (min: number) => (
        <span className="tnum" style={{ color: '#9ca3af', fontSize: 11 }}>
          {min > 0 ? min.toLocaleString() : '-'}
        </span>
      ),
    },
    {
      title: isZh ? '单价 / 估值' : 'Valuation',
      key: 'valuation',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div className="tnum" style={{ fontWeight: 600, color: '#1f2937', fontSize: 12 }}>
            ${record.totalValuation.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            ${record.unitCost.toFixed(2)}/{record.itemUnitCode}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '状态' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        switch (status) {
          case 'NORMAL':
            return <Tag color="success" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '充足' : 'Normal'}</Tag>;
          case 'LOW_STOCK':
            return <Tag color="warning" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '预警' : 'Under Safety'}</Tag>;
          case 'STOCKOUT':
            return <Tag color="error" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '缺料' : 'Stockout'}</Tag>;
          case 'QUARANTINE':
            return <Tag color="purple" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '待检隔离' : 'Quarantine'}</Tag>;
          default:
            return <Tag style={{ margin: 0 }}>{status}</Tag>;
        }
      },
    },
    {
      title: isZh ? '操作' : 'Actions',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => onTransferItem(record)}
          >
            {isZh ? '调拨' : 'Transfer'}
          </Button>
          <span style={{ color: '#e5e7eb' }}>|</span>
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => onAdjustItem(record)}
          >
            {isZh ? '盘点' : 'Adjust'}
          </Button>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Card
      size="small"
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Table Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderBottom: '1px solid #f0f2f5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
            {isZh ? '实时物料在库台账' : 'Real-Time Inventory Stock Ledger'}
          </span>
          <Tag color="blue" style={{ borderRadius: 2, margin: 0, fontSize: 11 }}>
            {balances.length} {isZh ? '种物料' : 'SKUs'}
          </Tag>
        </div>

        {selectedRowKeys.length > 0 && (
          <Space size="small">
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {isZh ? `已选中 ${selectedRowKeys.length} 项` : `Selected ${selectedRowKeys.length} items`}
            </span>
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => message.info(isZh ? '批量调拨已暂存' : 'Batch Transfer Staged')}
            >
              {isZh ? '批量调拨' : 'Batch Transfer'}
            </Button>
            <Button
              size="small"
              icon={<BarcodeOutlined />}
              onClick={() => message.success(isZh ? '正在打印条码标签...' : 'Printing Barcode Labels...')}
            >
              {isZh ? '打印条码标签' : 'Print Barcode'}
            </Button>
          </Space>
        )}
      </div>

      <Table
        rowKey="id"
        size="small"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={balances}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => (isZh ? `共 ${total} 条物料台账` : `Total ${total} items`),
          size: 'small',
          style: { paddingRight: 14, marginBottom: 10 },
        }}
        scroll={{ x: 1100 }}
      />
    </Card>
  );
};
