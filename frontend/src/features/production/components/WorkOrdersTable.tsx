import React from 'react';
import { Table, Tag, Progress, Button, Space, Tooltip, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  InboxOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { productionService } from '@/services/productionService';
import { ProductionOrder, ProductionOrderStatus } from '../types';

interface WorkOrdersTableProps {
  orders: ProductionOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (order: ProductionOrder) => void;
  onOpenBom: (order: ProductionOrder) => void;
  onRefresh: () => void;
}

export const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onOpenBom,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const { modal, message } = App.useApp();

  const handleFinishReceipt = (order: ProductionOrder) => {
    modal.confirm({
      title: language === 'zh-CN' ? `确认完工入库: ${order.orderNo}` : `Confirm Finished Goods Receipt: ${order.orderNo}`,
      icon: <ExclamationCircleOutlined style={{ color: '#1677ff' }} />,
      content: (
        <div>
          <p>
            {language === 'zh-CN'
              ? `确认将工单 ${order.orderNo} 的合格产品 (${order.completedQty} ${order.uom}) 办理入库到成品库？`
              : `Confirm receipt of ${order.completedQty} ${order.uom} into Finished Goods Warehouse?`}
          </p>
          <div style={{ fontSize: 12, color: '#6b7280', padding: 8, backgroundColor: '#f9fafb', borderRadius: 4 }}>
            <div>Product: {order.productCode} - {order.productName}</div>
            <div>Batch: {order.batchNo}</div>
          </div>
        </div>
      ),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          const res = await productionService.finishReceipt(order.id);
          message.success(`Finished Goods Receipt generated: ${res.lotNo}`);
          onRefresh();
        } catch {
          message.error('Failed to process finished receipt');
        }
      },
    });
  };

  const getStatusBadge = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'IN_PRODUCTION':
        return (
          <Tag color="processing" style={{ borderRadius: 2, margin: 0 }}>
            {language === 'zh-CN' ? '生产中' : 'In Production'}
          </Tag>
        );
      case 'QC_TESTING':
        return (
          <Tag color="warning" style={{ borderRadius: 2, margin: 0 }}>
            {language === 'zh-CN' ? '质检中' : 'QC Testing'}
          </Tag>
        );
      case 'COMPLETED':
        return (
          <Tag color="success" style={{ borderRadius: 2, margin: 0 }}>
            {language === 'zh-CN' ? '已完工' : 'Completed'}
          </Tag>
        );
      case 'PLANNED':
        return (
          <Tag color="default" style={{ borderRadius: 2, margin: 0 }}>
            {language === 'zh-CN' ? '待开工' : 'Planned'}
          </Tag>
        );
      case 'CANCELLED':
        return (
          <Tag color="error" style={{ borderRadius: 2, margin: 0 }}>
            {language === 'zh-CN' ? '已取消' : 'Cancelled'}
          </Tag>
        );
    }
  };

  const columns: ColumnsType<ProductionOrder> = [
    {
      title: language === 'zh-CN' ? '工单号 (WO#)' : 'Work Order No.',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 145,
      render: (text, record) => (
        <div onClick={() => onSelectOrder(record)} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="tnum" style={{ fontWeight: 700, color: '#1677ff' }}>
              {text}
            </span>
            {record.isUrgent && (
              <Tag color="error" style={{ fontSize: 9, padding: '0 3px', borderRadius: 2, margin: 0, fontWeight: 700 }}>
                {language === 'zh-CN' ? '加急' : 'URGENT'}
              </Tag>
            )}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{record.batchNo}</div>
        </div>
      ),
    },
    {
      title: language === 'zh-CN' ? '产品型号与图号 (Product & Part)' : 'Product & Part No.',
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {language === 'zh-CN' ? record.productNameZh : record.productName}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            Part: <strong>{record.productCode}</strong> ({record.spec})
          </div>
        </div>
      ),
    },
    {
      title: language === 'zh-CN' ? '产线工位 (Station)' : 'Station / Line',
      key: 'workstation',
      width: 150,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: '#4b5563' }}>
          {language === 'zh-CN' ? record.workstationZh : record.workstation}
        </span>
      ),
    },
    {
      title: language === 'zh-CN' ? '计划/完成 (Plan/Done)' : 'Plan / Done',
      key: 'qtys',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <div className="tnum" style={{ fontSize: 12, textAlign: 'right' }}>
          <strong style={{ color: '#111827' }}>{record.completedQty.toLocaleString()}</strong>
          <span style={{ color: '#9ca3af' }}> / {record.plannedQty.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: language === 'zh-CN' ? '报废 (Scrap)' : 'Scrap',
      dataIndex: 'scrapQty',
      key: 'scrap',
      width: 70,
      align: 'right',
      render: (val, record) =>
        val > 0 ? (
          <span className="tnum" style={{ color: '#cf1322', fontWeight: 600, fontSize: 11 }}>
            {val} {record.uom}
          </span>
        ) : (
          <span style={{ color: '#9ca3af', fontSize: 11 }}>0</span>
        ),
    },
    {
      title: language === 'zh-CN' ? '工序进度 (Route Progress)' : 'Route Progress',
      key: 'progress',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 2 }}>
            {language === 'zh-CN' ? record.currentStepZh : record.currentStep}
          </div>
          <Progress
            percent={record.progressPercent}
            size="small"
            strokeColor={record.status === 'COMPLETED' ? '#52c41a' : '#1677ff'}
            railColor="#e5e7eb"
          />
        </div>
      ),
    },
    {
      title: language === 'zh-CN' ? '状态 (Status)' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center',
      render: (status) => getStatusBadge(status),
    },
    {
      title: language === 'zh-CN' ? '操作 (Actions)' : 'Actions',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={language === 'zh-CN' ? '查看BOM并领料' : 'BOM & Material Issue'}>
            <Button
              type="text"
              size="small"
              icon={<InboxOutlined />}
              onClick={() => onOpenBom(record)}
              style={{ fontSize: 11, color: '#1677ff', padding: '0 4px' }}
            >
              {language === 'zh-CN' ? '物料' : 'BOM'}
            </Button>
          </Tooltip>
          <Tooltip title={language === 'zh-CN' ? '工序快速报工' : 'Quick Dispatch Report'}>
            <Button
              type="text"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => onSelectOrder(record)}
              style={{ fontSize: 11, color: '#0958d9', padding: '0 4px', fontWeight: 600 }}
            >
              {language === 'zh-CN' ? '报工' : 'Dispatch'}
            </Button>
          </Tooltip>
          {record.progressPercent === 100 && (
            <Tooltip title={language === 'zh-CN' ? '完工入库' : 'FG Receipt'}>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleFinishReceipt(record)}
                style={{ fontSize: 11, height: 22, padding: '0 6px', backgroundColor: '#52c41a' }}
              >
                {language === 'zh-CN' ? '入库' : 'Receipt'}
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={orders}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={{
        pageSize: 5,
        size: 'small',
        showTotal: (total) => `Total ${total} orders / 共 ${total} 条工单`,
      }}
      rowClassName={(record) => (record.id === selectedOrderId ? 'ant-table-row-selected' : '')}
      bordered
    />
  );
};

export default WorkOrdersTable;
