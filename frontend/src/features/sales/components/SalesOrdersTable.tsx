import React, { useState } from 'react';
import { Table, Card, Tag, Button, Space, Progress, Modal, Descriptions } from 'antd';
import { message } from '@/utils/antdApp';
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
  const [selectedSo, setSelectedSo] = useState<SalesOrderSummary | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const columns: TableColumnsType<SalesOrderSummary> = [
    {
      title: isZh ? '销售单号' : 'SO Number',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 170,
      render: (soNo: string, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="tnum"
              style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff', fontSize: 12 }}
            >
              {soNo}
            </span>
            {record.isUrgent && (
              <Tag
                color="red"
                style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}
              >
                {isZh ? '加急' : 'URGENT'}
              </Tag>
            )}
            {record.slaOverdue && (
              <Tag
                color="error"
                style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}
              >
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
          format={(p) => (
            <span className="tnum" style={{ fontSize: 11 }}>
              {p}%
            </span>
          )}
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
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{record.paymentTerms}</div>
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
            return (
              <Tag style={{ margin: 0, borderRadius: 2 }}>{isZh ? '报价中' : 'Quotation'}</Tag>
            );
          case 'CONFIRMED':
            return (
              <Tag color="processing" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '已确认' : 'Confirmed'}
              </Tag>
            );
          case 'IN_PRODUCTION':
            return (
              <Tag color="warning" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '车间在制' : 'In Production'}
              </Tag>
            );
          case 'READY_TO_SHIP':
            return (
              <Tag color="cyan" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '就绪待发' : 'Ready to Ship'}
              </Tag>
            );
          case 'SHIPPED':
            return (
              <Tag color="success" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '已完成出库' : 'Shipped'}
              </Tag>
            );
          case 'CANCELLED':
            return (
              <Tag color="error" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '已取消' : 'Cancelled'}
              </Tag>
            );
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
            onClick={() => setSelectedSo(record)}
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
              {isZh
                ? `已选中 ${selectedRowKeys.length} 笔`
                : `Selected ${selectedRowKeys.length} orders`}
            </span>
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => setIsPrintModalOpen(true)}
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

      {/* Real SO Details & Lines Modal */}
      <Modal
        title={
          selectedSo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileSearchOutlined style={{ color: '#1677ff' }} />
              <span>
                {isZh ? '销售订单物料行明细与交付进度' : 'Sales Order Lines & Fulfillment'}
              </span>
              <Tag color="blue">{selectedSo.orderNo}</Tag>
            </div>
          ) : (
            ''
          )
        }
        open={Boolean(selectedSo)}
        width={650}
        onCancel={() => setSelectedSo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedSo(null)}>
            {isZh ? '关闭' : 'Close'}
          </Button>,
          selectedSo && selectedSo.status === 'QUOTATION' && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                onConfirmOrder(selectedSo.id);
                setSelectedSo(null);
              }}
            >
              {isZh ? '确认转为正式订单' : 'Confirm Order'}
            </Button>
          ),
          selectedSo && selectedSo.status !== 'SHIPPED' && selectedSo.status !== 'QUOTATION' && (
            <Button
              key="dispatch"
              type="primary"
              style={{ backgroundColor: '#15803d' }}
              icon={<SendOutlined />}
              onClick={() => {
                const so = selectedSo;
                setSelectedSo(null);
                onCreateDelivery(so);
              }}
            >
              {isZh ? '安排发货出库' : 'Dispatch Order'}
            </Button>
          ),
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            {isZh ? '打印凭单' : 'Print Voucher'}
          </Button>,
        ].filter(Boolean)}
      >
        {selectedSo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Descriptions
              bordered
              size="small"
              column={2}
              items={[
                {
                  key: 'orderNo',
                  label: isZh ? '销售合同单号' : 'Order No',
                  children: <strong>{selectedSo.orderNo}</strong>,
                },
                {
                  key: 'erpRef',
                  label: isZh ? 'ERP关联凭证' : 'ERP Ref',
                  children: selectedSo.erpSoNumber || '—',
                },
                {
                  key: 'customer',
                  label: isZh ? '客户企业' : 'Customer',
                  children: isZh ? selectedSo.customerNameZh : selectedSo.customerNameEn,
                },
                {
                  key: 'region',
                  label: isZh ? '所属区域' : 'Region',
                  children: selectedSo.customerRegion,
                },
                {
                  key: 'orderDate',
                  label: isZh ? '签约订立日期' : 'Order Date',
                  children: selectedSo.orderDate,
                },
                {
                  key: 'deliveryDate',
                  label: isZh ? '承诺交付日期' : 'Delivery Date',
                  children: (
                    <span
                      style={{
                        fontWeight: 600,
                        color: selectedSo.slaOverdue ? '#dc2626' : undefined,
                      }}
                    >
                      {selectedSo.deliveryDate}
                    </span>
                  ),
                },
                {
                  key: 'amount',
                  label: isZh ? '合同总金额' : 'Total Amount',
                  children: (
                    <span style={{ fontWeight: 700, color: '#1677ff', fontSize: 13 }}>
                      ${selectedSo.totalAmount.toLocaleString()} {selectedSo.currency}
                    </span>
                  ),
                },
                {
                  key: 'paymentTerms',
                  label: isZh ? '结算账期条件' : 'Payment Terms',
                  children: selectedSo.paymentTerms,
                },
                {
                  key: 'fulfillment',
                  label: isZh ? '交付达成进度' : 'Fulfillment',
                  children: <Progress percent={selectedSo.fulfillmentPercent} size="small" />,
                },
                {
                  key: 'status',
                  label: isZh ? '合同状态' : 'Status',
                  children: (
                    <Tag
                      color={
                        selectedSo.status === 'SHIPPED'
                          ? 'success'
                          : selectedSo.status === 'QUOTATION'
                            ? 'default'
                            : 'processing'
                      }
                    >
                      {selectedSo.status}
                    </Tag>
                  ),
                },
                {
                  key: 'overview',
                  label: isZh ? '物料订购概要' : 'Item Overview',
                  span: 2,
                  children: isZh ? selectedSo.itemOverviewZh : selectedSo.itemOverviewEn,
                },
                {
                  key: 'lines',
                  label: isZh ? '订单物料行数' : 'Lines Count',
                  span: 2,
                  children: `${selectedSo.itemLinesCount} ${isZh ? '项商品' : 'item lines'}`,
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Real Batch Delivery Note Print Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PrinterOutlined style={{ color: '#1677ff' }} />
            <span>
              {isZh ? '销售订单批量打印送货单预览' : 'Batch Delivery Notes Print Preview'}
            </span>
          </div>
        }
        open={isPrintModalOpen}
        width={700}
        onCancel={() => setIsPrintModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPrintModalOpen(false)}>
            {isZh ? '取消' : 'Cancel'}
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              window.print();
              setIsPrintModalOpen(false);
              message.success(isZh ? '送货单打印任务已提交' : 'Delivery notes print job sent');
            }}
          >
            {isZh ? '发送至送货单打印机' : 'Send to Printer'}
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: '#4b5563', fontSize: 13 }}>
            {isZh
              ? `共选中 ${selectedRowKeys.length} 笔销售订单，将为以下出库任务批量生成标准送货签收单：`
              : `Selected ${selectedRowKeys.length} sales orders. Standard logistics delivery dispatch notes will be generated:`}
          </p>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {orders
              .filter((o) => selectedRowKeys.includes(o.id))
              .map((so) => (
                <div
                  key={so.id}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{so.orderNo}</strong> ({so.erpSoNumber || 'N/A'}) -{' '}
                    <span>{isZh ? so.customerNameZh : so.customerNameEn}</span>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {isZh ? so.itemOverviewZh : so.itemOverviewEn}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#1677ff' }}>
                      ${so.totalAmount.toLocaleString()} {so.currency}
                    </div>
                    <Tag>{so.status}</Tag>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </Card>
  );
};
