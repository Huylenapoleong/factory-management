import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Descriptions, Alert } from 'antd';
import { useAppStore } from '@/stores/useAppStore';
import { inventoryService } from '@/services/inventoryService';
import { InventoryBalanceItem } from '../types';

interface StockAdjustmentModalProps {
  open: boolean;
  item: InventoryBalanceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  open,
  item,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const watchedPhysicalCount = Form.useWatch('physicalCount', form);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({
        itemId: item.itemId,
        warehouseId: item.warehouseId,
        physicalCount: item.quantity,
        reasonType: isZh ? '周期盘点差异调整' : 'Cycle count discrepancy',
        note: '',
      });
    } else {
      form.resetFields();
    }
  }, [open, item, form, isZh]);

  const systemQty = item ? item.quantity : 0;
  const physicalCount = watchedPhysicalCount !== undefined ? Number(watchedPhysicalCount) : systemQty;
  const delta = physicalCount - systemQty;

  const handleSubmit = async () => {
    if (!item) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const success = await inventoryService.adjustStock({
        warehouseId: item.warehouseId,
        locationId: item.locationId,
        itemId: item.itemId,
        quantity: delta,
        note: `${values.reasonType}: ${values.note || (isZh ? '实盘确认' : 'Confirmed count')}`,
      });

      if (success) {
        message.success(isZh ? '盘点台账已调整更新' : 'Inventory adjusted successfully');
        onSuccess();
        onClose();
      } else {
        message.error(isZh ? '调整失败' : 'Adjustment failed');
      }
    } catch {
      // validation error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isZh ? '库存盘点与台账调整 (Stocktake Adjustment)' : 'Stocktake Adjustment'}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={isZh ? '确认调账' : 'Confirm Adjustment'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={540}
      styles={{ body: { paddingTop: 10 } }}
    >
      {item && (
        <div style={{ marginBottom: 14 }}>
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label={isZh ? '物料' : 'Item'}>
              <span style={{ fontWeight: 600, color: '#1677ff' }}>{item.itemCode}</span>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {isZh ? item.itemNameZh : item.itemNameEn}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '库位' : 'Location'}>
              {item.locationCode}
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '系统在库数' : 'System Count'}>
              <span className="tnum" style={{ fontWeight: 700, color: '#1f2937' }}>
                {item.quantity} {item.itemUnitCode}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '安全库存基线' : 'Safety Min'}>
              <span className="tnum">{item.minStock} {item.itemUnitCode}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Form form={form} layout="vertical" size="small">
        <Form.Item
          name="physicalCount"
          label={isZh ? '实盘数量 (Physical Count)' : 'Physical Counted Quantity'}
          rules={[{ required: true, message: 'Please input physical count' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        {/* Real-time Variance preview */}
        <div
          style={{
            backgroundColor: delta === 0 ? '#f0fdf4' : delta > 0 ? '#eff6ff' : '#fef2f2',
            border: `1px solid ${delta === 0 ? '#bbf7d0' : delta > 0 ? '#bfdbfe' : '#fecaca'}`,
            borderRadius: 4,
            padding: '8px 12px',
            marginBottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
            {isZh ? '盘盈 / 盘亏差额 (Variance Delta):' : 'Variance Delta:'}
          </span>
          <span
            className="tnum"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: delta === 0 ? '#15803d' : delta > 0 ? '#1d4ed8' : '#b91c1c',
            }}
          >
            {delta > 0 ? `+${delta}` : delta} {item?.itemUnitCode}
          </span>
        </div>

        <Form.Item
          name="reasonType"
          label={isZh ? '差异原因分类' : 'Reason Classification'}
          rules={[{ required: true, message: 'Please select reason' }]}
        >
          <Select
            options={[
              { value: isZh ? '周期盘点差异调整' : 'Cycle count discrepancy', label: isZh ? '周期盘点差异调整' : 'Cycle count discrepancy' },
              { value: isZh ? '车间边角损耗报废' : 'Scrap & spillage adjustment', label: isZh ? '车间边角损耗报废' : 'Scrap & spillage adjustment' },
              { value: isZh ? '入库质检数量复核修正' : 'Inbound quantity correction', label: isZh ? '入库质检数量复核修正' : 'Inbound quantity correction' },
            ]}
          />
        </Form.Item>

        <Form.Item name="note" label={isZh ? '详细核查说明' : 'Adjustment Note'}>
          <Input.TextArea
            rows={2}
            placeholder={isZh ? '请输入具体核对工单或现场责任人...' : 'Enter discrepancy details or audit note...'}
          />
        </Form.Item>

        <Alert
          type="warning"
          showIcon
          message={
            isZh
              ? '调账操作将记入实时审计台账，影响当期物料成本核算。'
              : 'Adjustment will be logged into the permanent stock audit ledger.'
          }
          style={{ fontSize: 12 }}
        />
      </Form>
    </Modal>
  );
};
