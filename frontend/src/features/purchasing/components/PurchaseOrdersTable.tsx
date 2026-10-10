import React, { useState } from 'react';
import { Table, Card, Tag, Button, Space, Modal, Descriptions } from 'antd';
import { message } from '@/utils/antdApp';
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
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderSummary | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const columns: TableColumnsType<PurchaseOrderSummary> = [
    {
      title: isZh ? '采购单号' : 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 170,
      render: (poNo: string, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="tnum"
              style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff', fontSize: 12 }}
            >
              {poNo}
            </span>
            {record.isUrgent && (
              <Tag
                color="red"
                style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}
              >
                {isZh ? '加急' : 'URGENT'}
              </Tag>
            )}
            {record.slaWarn && (
              <Tag
                color="warning"
                style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}
              >
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
          case 'DRAFT':
            return <Tag style={{ margin: 0, borderRadius: 2 }}>{isZh ? '草稿' : 'Draft'}</Tag>;
          case 'CONFIRMED':
            return (
              <Tag color="processing" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '已确认' : 'Confirmed'}
              </Tag>
            );
          case 'INBOUND_INSPECTING':
            return (
              <Tag color="warning" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '到货质检' : 'Inspecting'}
              </Tag>
            );
          case 'RECEIVED':
            return (
              <Tag color="success" style={{ margin: 0, borderRadius: 2 }}>
                {isZh ? '已完成入库' : 'Received'}
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
            onClick={() => setSelectedPo(record)}
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
              {isZh
                ? `已选中 ${selectedRowKeys.length} 笔`
                : `Selected ${selectedRowKeys.length} orders`}
            </span>
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => setIsPrintModalOpen(true)}
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
          showTotal: (total) =>
            isZh ? `共 ${total} 笔采购订单` : `Total ${total} purchase orders`,
          size: 'small',
          style: { paddingRight: 14, marginBottom: 10 },
        }}
        scroll={{ x: 1050 }}
      />

      {/* Real PO Lines & Specification Details Modal */}
      <Modal
        title={
          selectedPo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileSearchOutlined style={{ color: '#1677ff' }} />
              <span>
                {isZh ? '采购订单行项明细与履约状态' : 'Purchase Order Specification & Lines'}
              </span>
              <Tag color="blue">{selectedPo.poNumber}</Tag>
            </div>
          ) : (
            ''
          )
        }
        open={Boolean(selectedPo)}
        width={650}
        onCancel={() => setSelectedPo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedPo(null)}>
            {isZh ? '关闭' : 'Close'}
          </Button>,
          selectedPo && selectedPo.status === 'DRAFT' && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                onConfirmPO(selectedPo.id);
                setSelectedPo(null);
              }}
            >
              {isZh ? '确认采购合同' : 'Confirm Order'}
            </Button>
          ),
          selectedPo && selectedPo.status !== 'RECEIVED' && selectedPo.status !== 'DRAFT' && (
            <Button
              key="receive"
              type="primary"
              style={{ backgroundColor: '#15803d' }}
              icon={<InboxOutlined />}
              onClick={() => {
                const po = selectedPo;
                setSelectedPo(null);
                onReceivePO(po);
              }}
            >
              {isZh ? '办理入库收货' : 'Receive Order'}
            </Button>
          ),
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            {isZh ? '打印单据' : 'Print Voucher'}
          </Button>,
        ].filter(Boolean)}
      >
        {selectedPo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Descriptions
              bordered
              size="small"
              column={2}
              items={[
                {
                  key: 'poNumber',
                  label: isZh ? '系统采购单号' : 'PO Number',
                  children: <strong>{selectedPo.poNumber}</strong>,
                },
                {
                  key: 'erpRef',
                  label: isZh ? 'ERP关联凭证' : 'ERP Ref',
                  children: selectedPo.erpPoNumber || '—',
                },
                {
                  key: 'supplier',
                  label: isZh ? '合作供应商' : 'Supplier',
                  children: isZh ? selectedPo.supplierNameZh : selectedPo.supplierNameEn,
                },
                {
                  key: 'contact',
                  label: isZh ? '供应商对接人' : 'Contact',
                  children: selectedPo.supplierContact,
                },
                {
                  key: 'orderDate',
                  label: isZh ? '下单订立日期' : 'Order Date',
                  children: selectedPo.orderDate,
                },
                {
                  key: 'expectedDate',
                  label: isZh ? '要求交货日期' : 'Expected Delivery',
                  children: (
                    <span
                      style={{ fontWeight: 600, color: selectedPo.slaWarn ? '#dc2626' : undefined }}
                    >
                      {selectedPo.expectedDate}
                    </span>
                  ),
                },
                {
                  key: 'amount',
                  label: isZh ? '采购总金额' : 'Total Amount',
                  children: (
                    <span style={{ fontWeight: 700, color: '#1677ff', fontSize: 13 }}>
                      ${selectedPo.totalAmount.toLocaleString()} {selectedPo.currency}
                    </span>
                  ),
                },
                {
                  key: 'paymentTerms',
                  label: isZh ? '商务账期条件' : 'Payment Terms',
                  children: selectedPo.paymentTerms,
                },
                {
                  key: 'overview',
                  label: isZh ? '物资明细概要' : 'Item Overview',
                  span: 2,
                  children: isZh ? selectedPo.itemOverviewZh : selectedPo.itemOverviewEn,
                },
                {
                  key: 'lines',
                  label: isZh ? '采购行项数量' : 'Lines Count',
                  children: `${selectedPo.itemLinesCount} ${isZh ? '项' : 'lines'}`,
                },
                {
                  key: 'status',
                  label: isZh ? '合同履约状态' : 'Status',
                  children: (
                    <Tag
                      color={
                        selectedPo.status === 'RECEIVED'
                          ? 'success'
                          : selectedPo.status === 'DRAFT'
                            ? 'default'
                            : 'processing'
                      }
                    >
                      {selectedPo.status}
                    </Tag>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Batch PO Print Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PrinterOutlined style={{ color: '#1677ff' }} />
            <span>{isZh ? '采购订单批量打印凭证预览' : 'Batch PO Print Preview'}</span>
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
              message.success(isZh ? '打印指令已发送' : 'Print spooler triggered');
            }}
          >
            {isZh ? '确认发送打印机' : 'Send to Printer'}
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: '#4b5563', fontSize: 13 }}>
            {isZh
              ? `共选中 ${selectedRowKeys.length} 笔采购订单，将为以下单据生成标准工业入库采购单据：`
              : `Selected ${selectedRowKeys.length} purchase orders. Standard warehouse PO documents will be generated:`}
          </p>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {orders
              .filter((o) => selectedRowKeys.includes(o.id))
              .map((po) => (
                <div
                  key={po.id}
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
                    <strong>{po.poNumber}</strong> ({po.erpPoNumber || 'N/A'}) -{' '}
                    <span>{isZh ? po.supplierNameZh : po.supplierNameEn}</span>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {isZh ? po.itemOverviewZh : po.itemOverviewEn}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#1677ff' }}>
                      ${po.totalAmount.toLocaleString()} {po.currency}
                    </div>
                    <Tag>{po.status}</Tag>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </Card>
  );
};
