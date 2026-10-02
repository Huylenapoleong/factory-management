import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Descriptions, Alert } from 'antd';
import { useAppStore } from '@/stores/useAppStore';
import { inventoryService } from '@/services/inventoryService';
import { InventoryBalanceItem, WarehouseSummary } from '../types';

interface StockTransferModalProps {
  open: boolean;
  item: InventoryBalanceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  open,
  item,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      void inventoryService.getWarehouses().then(setWarehouses);
      if (item) {
        form.setFieldsValue({
          itemId: item.itemId,
          fromWarehouseId: item.warehouseId,
          fromLocationCode: item.locationCode,
          quantity: 1,
          toWarehouseId: item.warehouseId === 1 ? 2 : 1,
          toLocationCode: item.warehouseId === 1 ? 'WH-02 / B-02-01' : 'WH-01 / A-02-05',
          reason: isZh ? '车间产线领用调拨' : 'Line replenishment transfer',
        });
      }
    }
  }, [open, item, form, isZh]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const success = await inventoryService.transferStock({
        itemId: item ? item.itemId : values.itemId,
        fromWarehouseId: values.fromWarehouseId,
        fromLocationCode: values.fromLocationCode,
        toWarehouseId: values.toWarehouseId,
        toLocationCode: values.toLocationCode,
        quantity: values.quantity,
        reason: values.reason,
      });

      if (success) {
        message.success(isZh ? '物料调拨成功，台账已实时同步' : 'Stock transfer completed successfully');
        onSuccess();
        onClose();
      } else {
        message.error(isZh ? '调拨失败，请核查可用库存' : 'Transfer failed');
      }
    } catch {
      // form validation error
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isZh ? '库位物料调拨单 (Stock Transfer)' : 'Stock Transfer Order'}
      onCancel={handleCancel}
      onOk={handleSubmit}
      centered
      forceRender
      confirmLoading={submitting}
      okText={isZh ? '确认调拨' : 'Confirm Transfer'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={560}
      styles={{ body: { paddingTop: 10 } }}
    >
      {item && (
        <div style={{ marginBottom: 14 }}>
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label={isZh ? '调拨物料' : 'Item'}>
              <span style={{ fontWeight: 600, color: '#1677ff' }}>{item.itemCode}</span>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {isZh ? item.itemNameZh : item.itemNameEn}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '当前批次' : 'Lot No'}>
              <span className="tnum" style={{ fontFamily: 'monospace' }}>{item.lotNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '源库位' : 'From Location'}>
              {item.locationCode}
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '当前可用' : 'Available Qty'}>
              <span className="tnum" style={{ fontWeight: 700, color: '#15803d' }}>
                {item.availableQuantity} {item.itemUnitCode}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Form form={form} layout="vertical" size="small">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="toWarehouseId"
            label={isZh ? '目的仓库' : 'Destination Warehouse'}
            rules={[{ required: true, message: 'Please select destination warehouse' }]}
          >
            <Select
              options={warehouses.map((w) => ({
                value: w.id,
                label: isZh ? `${w.code} ${w.nameZh}` : `${w.code} ${w.nameEn}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="toLocationCode"
            label={isZh ? '目的库位 (Bin Code)' : 'Destination Bin'}
            rules={[{ required: true, message: 'Please input target bin code' }]}
          >
            <Input placeholder="e.g. WH-02 / B-02-01" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="quantity"
            label={isZh ? '调拨数量' : 'Transfer Quantity'}
            rules={[
              { required: true, message: 'Please enter quantity' },
              {
                validator: (_, val) => {
                  if (item && val > item.availableQuantity) {
                    return Promise.reject(new Error(isZh ? '调拨数量不可超过当前可用库存' : 'Exceeds available quantity'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={item ? item.availableQuantity : undefined}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label={isZh ? '调拨原因' : 'Transfer Reason'}
            rules={[{ required: true, message: 'Please input transfer reason' }]}
          >
            <Select
              options={[
                { value: isZh ? '车间产线领用调拨' : 'Line replenishment transfer', label: isZh ? '车间产线领用调拨' : 'Line Replenishment' },
                { value: isZh ? '仓库库容均衡移库' : 'Warehouse balancing', label: isZh ? '仓库库容均衡移库' : 'Warehouse Balancing' },
                { value: isZh ? '不良品隔离入库' : 'Defect quarantine', label: isZh ? '不良品隔离入库' : 'Defect Quarantine' },
              ]}
            />
          </Form.Item>
        </div>

        <Alert
          type="info"
          showIcon
          title={
            isZh
              ? '调拨确认后，系统将自动核减源库位可用数，并在目标库位生成在途接收凭证。'
              : 'Transfer will instantly adjust available balance and create receipt ledger record.'
          }
          style={{ fontSize: 12 }}
        />
      </Form>
    </Modal>
  );
};
