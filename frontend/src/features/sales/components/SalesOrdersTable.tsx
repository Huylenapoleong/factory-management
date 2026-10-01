import React, { useState } from 'react';
import { Table, Card, Tag, Button, Space, message, Progress } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  SendOutlined,
  FileSearchOutlined,
  PrinterOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { SalesOrderSummary } from '../types';

interface SalesOrdersTableProps {
  orders: SalesOrderSummary[];
  loading?: boolean;
  onCreateDelivery: (order: SalesOrderSummary) => void;
  onConfirmOrder: (id: number) => void;
  onRefresh: () => void;
}

export const SalesOrdersTable: React.FC<SalesOrdersTableProps> = ({
  orders,
  loading = false,
  onCreateDelivery,
  onConfirmOrder,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<SalesOrderSummary> = [
    {
      title: isZh ? '销售单号 / SAP SD' : 'SO Number / SAP SD',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 170,
      render: (soNo: string, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="tnum" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff', fontSize: 12 }}>
              {soNo}
            </span>
            {record.isUrgent && (
              <Tag color="red" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
                {isZh ? '加急' : 'URGENT'}
              </Tag>
            )}
            {record.slaOverdue && (
              <Tag color="error" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
                {isZh ? '逾期' : 'OVERDUE'}
              </Tag>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 }}>
            {record.erpSoNumber}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '客户名称与销区' : 'Customer & Region',
      key: 'customerInfo',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
            {isZh ? record.customerNameZh : record.customerNameEn}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
            {record.customerRegion}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '物料明细概览' : 'Item Lines Overview',
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
      title: isZh ? '承诺交期' : 'Promised Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (date: string, record) => (
        <div>
          <span
            className="tnum"
            style={{
              fontWeight: record.slaOverdue ? 700 : 500,
              color: record.slaOverdue ? '#dc2626' : '#1f2937',
              fontSize: 12,
            }}
          >
            {date}
          </span>
          {record.deliveryStatusLabel && (
            <div
              style={{
                fontSize: 10,
                color: record.slaOverdue ? '#dc2626' : '#15803d',
                fontWeight: 600,
              }}
            >
              ● {record.deliveryStatusLabel}
            </div>
          )}
        </div>
      ),
    },
    {
      title: isZh ? '履约进度' : 'Fulfillment',
      dataIndex: 'fulfillmentPercent',
      key: 'fulfillmentPercent',
      width: 110,
      render: (pct: number) => (
        <Progress
          percent={pct}
          size="small"
          strokeColor={pct === 100 ? '#52c41a' : '#1677ff'}
          format={(p) => <span className="tnum" style={{ fontSize: 11 }}>{p}%</span>}
        />
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
          case 'QUOTATION':
            return <Tag style={{ margin: 0, borderRadius: 2 }}>{isZh ? '报价中' : 'Quotation'}</Tag>;
          case 'CONFIRMED':
            return <Tag color="processing" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '已确认' : 'Confirmed'}</Tag>;
          case 'IN_PRODUCTION':
            return <Tag color="warning" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '车间在制' : 'In Production'}</Tag>;
          case 'READY_TO_SHIP':
            return <Tag color="cyan" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '就绪待发' : 'Ready to Ship'}</Tag>;
          case 'SHIPPED':
            return <Tag color="success" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '已完成出库' : 'Shipped'}</Tag>;
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
          {record.status === 'QUOTATION' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              style={{ padding: 0, fontSize: 12, color: '#1677ff' }}
              onClick={() => onConfirmOrder(record.id)}
            >
              {isZh ? '转正式单' : 'Confirm'}
            </Button>
          )}

          {record.status !== 'SHIPPED' && record.status !== 'QUOTATION' && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              style={{ padding: 0, fontSize: 12, color: '#15803d' }}
              onClick={() => onCreateDelivery(record)}
            >
              {isZh ? '发货出库' : 'Dispatch'}
            </Button>
          )}

          <Button
            type="link"
            size="small"
            icon={<FileSearchOutlined />}
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => message.info(`SO Lines overview: ${record.orderNo}`)}
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
            {isZh ? '销售合同与订单总台账' : 'Sales Orders Master Ledger'}
          </span>
          <Tag color="blue" style={{ borderRadius: 2, margin: 0, fontSize: 11 }}>
            {orders.length} {isZh ? '笔合同单' : 'Orders'}
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
              onClick={() => message.success(isZh ? '正在批量打印送货单据...' : 'Printing Delivery Notes...')}
            >
              {isZh ? '批量打印送货单' : 'Print Delivery Notes'}
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
          showTotal: (total) => (isZh ? `共 ${total} 笔销售订单` : `Total ${total} sales orders`),
          size: 'small',
          style: { paddingRight: 14, marginBottom: 10 },
        }}
        scroll={{ x: 1100 }}
      />
    </Card>
  );
};
