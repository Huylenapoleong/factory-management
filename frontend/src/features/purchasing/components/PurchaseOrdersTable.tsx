import React, { useState } from 'react';
import { Table, Card, Tag, Button, Space, message } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  FileSearchOutlined,
  InboxOutlined,
  PrinterOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { PurchaseOrderSummary } from '../types';

interface PurchaseOrdersTableProps {
  orders: PurchaseOrderSummary[];
  loading?: boolean;
  onReceivePO: (po: PurchaseOrderSummary) => void;
  onConfirmPO: (id: number) => void;
  onRefresh: () => void;
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders,
  loading = false,
  onReceivePO,
  onConfirmPO,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<PurchaseOrderSummary> = [
    {
      title: isZh ? '采购单编号 / ERP关联' : 'PO Number / ERP Ref',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 170,
      render: (poNo: string, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="tnum" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff', fontSize: 12 }}>
              {poNo}
            </span>
            {record.isUrgent && (
              <Tag color="red" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
                {isZh ? '加急' : 'URGENT'}
              </Tag>
            )}
            {record.slaWarn && (
              <Tag color="warning" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
                {isZh ? '交付预警' : 'SLA WARN'}
              </Tag>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 }}>
            {record.erpPoNumber}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '供应商及联络人' : 'Supplier & Contact',
      key: 'supplierInfo',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
            {isZh ? record.supplierNameZh : record.supplierNameEn}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
            {record.supplierContact}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '采购物料明细概览' : 'Item Lines Overview',
      key: 'itemOverview',
      render: (_, record) => (
        <div>
          <Tag color="default" style={{ borderRadius: 2, fontSize: 11, margin: '0 6px 0 0' }}>
            {record.itemLinesCount} {isZh ? '行物料' : 'Lines'}
          </Tag>
          <span style={{ fontSize: 12, color: '#374151' }}>
            {isZh ? record.itemOverviewZh : record.itemOverviewEn}
          </span>
        </div>
      ),
    },
    {
      title: isZh ? '承诺交付日' : 'Promised Date',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 115,
      render: (date: string, record) => (
        <div>
          <span
            className="tnum"
            style={{
              fontWeight: record.slaWarn ? 700 : 500,
              color: record.slaWarn ? '#dc2626' : '#374151',
              fontSize: 12,
            }}
          >
            {date}
          </span>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            {isZh ? '下单: ' : 'Ordered: '}
            {record.orderDate.slice(5)}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '订单总额' : 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 125,
      align: 'right',
      render: (amount: number, record) => (
        <div style={{ textAlign: 'right' }}>
          <div className="tnum" style={{ fontWeight: 700, color: '#1f2937', fontSize: 13 }}>
            ${amount.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>
            {record.paymentTerms}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '状态' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        switch (status) {
          case 'DRAFT':
            return <Tag style={{ margin: 0, borderRadius: 2 }}>{isZh ? '草稿' : 'Draft'}</Tag>;
          case 'CONFIRMED':
            return <Tag color="processing" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '已确认' : 'Confirmed'}</Tag>;
          case 'INBOUND_INSPECTING':
            return <Tag color="warning" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '到货质检' : 'Inspecting'}</Tag>;
          case 'RECEIVED':
            return <Tag color="success" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '已完成入库' : 'Received'}</Tag>;
          case 'CANCELLED':
            return <Tag color="error" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '已取消' : 'Cancelled'}</Tag>;
          default:
            return <Tag style={{ margin: 0 }}>{status}</Tag>;
        }
      },
    },
    {
      title: isZh ? '操作' : 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              style={{ padding: 0, fontSize: 12, color: '#1677ff' }}
              onClick={() => onConfirmPO(record.id)}
            >
              {isZh ? '下达' : 'Confirm'}
            </Button>
          )}

          {record.status !== 'RECEIVED' && record.status !== 'DRAFT' && (
            <Button
              type="link"
              size="small"
              icon={<InboxOutlined />}
              style={{ padding: 0, fontSize: 12, color: '#15803d' }}
              onClick={() => onReceivePO(record)}
            >
              {isZh ? '办理收货' : 'Receive'}
            </Button>
          )}

          <Button
            type="link"
            size="small"
            icon={<FileSearchOutlined />}
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => message.info(`PO Lines details: ${record.poNumber}`)}
          >
            {isZh ? '明细' : 'Lines'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      size="small"
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
      }}
      styles={{ body: { padding: 0 } }}
    >
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
            {isZh ? '采购订单执行台账' : 'Purchase Orders Ledger'}
          </span>
          <Tag color="blue" style={{ borderRadius: 2, margin: 0, fontSize: 11 }}>
            {orders.length} {isZh ? '笔采购单' : 'POs'}
          </Tag>
        </div>

        {selectedRowKeys.length > 0 && (
          <Space size="small">
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {isZh ? `已选中 ${selectedRowKeys.length} 笔` : `Selected ${selectedRowKeys.length} orders`}
            </span>
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => message.success(isZh ? '正在批量打印采购单凭证...' : 'Printing PO Documents...')}
            >
              {isZh ? '批量打印凭单' : 'Batch Print POs'}
            </Button>
          </Space>
        )}
      </div>

      <Table
        rowKey="id"
        size="small"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => (isZh ? `共 ${total} 笔采购订单` : `Total ${total} purchase orders`),
          size: 'small',
          style: { paddingRight: 14, marginBottom: 10 },
        }}
        scroll={{ x: 1050 }}
      />
    </Card>
  );
};
