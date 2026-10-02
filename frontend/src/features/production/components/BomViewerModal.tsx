import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Button, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  InboxOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { productionService } from '@/services/productionService';
import { ProductionOrder, BomComponentItem } from '../types';

interface BomViewerModalProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
  onMaterialsIssued?: () => void;
}

export const BomViewerModal: React.FC<BomViewerModalProps> = ({
  order,
  open,
  onClose,
  onMaterialsIssued,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [bomItems, setBomItems] = useState<BomComponentItem[]>([]);

  useEffect(() => {
    if (!order || !open) return;
    const fetchBom = async () => {
      setLoading(true);
      try {
        const items = await productionService.getBomItems(order.productCode);
        setBomItems(items);
      } finally {
        setLoading(false);
      }
    };
    fetchBom();
  }, [order, open]);

  const handleIssueMaterials = async () => {
    if (!order) return;
    setIssuing(true);
    try {
      await productionService.issueMaterials(order.id);
      message.success(`Materials issued to Work Order ${order.orderNo} successfully!`);
      onMaterialsIssued?.();
      onClose();
    } catch {
      message.error('Failed to issue materials');
    } finally {
      setIssuing(false);
    }
  };

  const columns: ColumnsType<BomComponentItem> = [
    {
      title: language === 'zh-CN' ? '物料编码 (Item Code)' : 'Component Code',
      dataIndex: 'componentCode',
      key: 'code',
      width: 160,
      render: (text) => <strong className="tnum" style={{ color: '#1677ff' }}>{text}</strong>,
    },
    {
      title: language === 'zh-CN' ? '物料名称与规格 (Name & Spec)' : 'Name & Spec',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>
            {language === 'zh-CN' ? record.componentNameZh : record.componentName}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{record.spec}</div>
        </div>
      ),
    },
    {
      title: language === 'zh-CN' ? '单件定额 (Unit Norm)' : 'Unit Norm',
      dataIndex: 'unitConsumption',
      key: 'unitConsumption',
      width: 100,
      align: 'right',
      render: (val, record) => <span className="tnum">{val} {record.uom}</span>,
    },
    {
      title: language === 'zh-CN' ? '总需求量 (Req Total)' : 'Required Total',
      dataIndex: 'requiredTotal',
      key: 'requiredTotal',
      width: 120,
      align: 'right',
      render: (val, record) => <span className="tnum" style={{ fontWeight: 600 }}>{val.toLocaleString()} {record.uom}</span>,
    },
    {
      title: language === 'zh-CN' ? '当前库存 (In Stock)' : 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 120,
      align: 'right',
      render: (val, record) => (
        <span
          className="tnum"
          style={{
            fontWeight: 600,
            color: record.isSufficient ? '#52c41a' : '#ff4d4f',
          }}
        >
          {val.toLocaleString()} {record.uom}
        </span>
      ),
    },
    {
      title: language === 'zh-CN' ? '齐套状态 (Status)' : 'Status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (_, record) =>
        record.isSufficient ? (
          <Tag color="success" style={{ borderRadius: 2, margin: 0 }}>
            <CheckCircleOutlined style={{ marginRight: 3 }} />
            {language === 'zh-CN' ? '库存充足' : 'Sufficient'}
          </Tag>
        ) : (
          <Tag color="error" style={{ borderRadius: 2, margin: 0, fontWeight: 600 }}>
            <AlertOutlined style={{ marginRight: 3 }} />
            {language === 'zh-CN' ? '缺料预警' : 'Shortage'}
          </Tag>
        ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InboxOutlined style={{ color: '#1677ff' }} />
          <span>
            {language === 'zh-CN' ? '物料清单 (BOM) 与齐套核算' : 'Bill of Materials (BOM) & Material Demand'}
            {order && <span style={{ color: '#6b7280', fontSize: 13, marginLeft: 8 }}>— {order.orderNo} ({order.productCode})</span>}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      centered
      width={820}
      footer={[
        <Button key="cancel" size="small" onClick={onClose}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="issue"
          type="primary"
          size="small"
          icon={<ShoppingOutlined />}
          loading={issuing}
          onClick={handleIssueMaterials}
        >
          {language === 'zh-CN' ? '确认领料出库 (Issue Materials)' : 'Confirm Issue Materials'}
        </Button>,
      ]}
      styles={{ body: { paddingTop: 8 } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin description="Calculating BOM material requirements..." />
        </div>
      ) : (
        <Table
          dataSource={bomItems}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          bordered
        />
      )}
    </Modal>
  );
};

export default BomViewerModal;
