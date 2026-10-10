import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Descriptions, Alert } from 'antd';
import { message } from '@/utils/antdApp';
import { useAppStore } from '@/stores/useAppStore';
import { purchasingService } from '@/services/purchasingService';
import { inventoryService } from '@/services/inventoryService';
import { masterDataService } from '@/services/masterDataService';
import { WarehouseSummary } from '@/features/inventory/types';
import { ItemRecord } from '@/features/items/types';
import { PurchaseOrderSummary } from '../types';

interface CreateGoodsReceiptModalProps {
  open: boolean;
  po: PurchaseOrderSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGoodsReceiptModal: React.FC<CreateGoodsReceiptModalProps> = ({
  open,
  po,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([]);
  const [items, setItems] = useState<ItemRecord[]>([]);

  useEffect(() => {
    if (open) {
      void inventoryService.getWarehouses().then((whs) => {
        setWarehouses(whs);
        if (whs.length > 0 && !form.getFieldValue('warehouseId')) {
          form.setFieldValue('warehouseId', whs[0].id);
        }
      });
      void masterDataService.getItems().then(setItems);

      if (po) {
        form.setFieldsValue({
          purchaseOrderId: po.id,
        });
      }
    }
  }, [open, po, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const success = await purchasingService.createGoodsReceipt({
        purchaseOrderId: po ? po.id : values.purchaseOrderId,
        warehouseId: values.warehouseId,
        receivingBay: values.receivingBay,
        carrierTracking: values.carrierTracking,
        items: [
          {
            itemId: values.itemId,
            quantity: values.receivedQuantity,
          },
        ],
      });

      if (success) {
        message.success(
          isZh ? '到货收货单已建立，进入现场质检队列' : 'Goods receipt created, queued for dock QC',
        );
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(isZh ? '办理收货失败' : 'Failed to create goods receipt');
      }
    } catch {
      // validation error
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
      title={isZh ? '办理采购到货收货' : 'Create Goods Receipt'}
      onCancel={handleCancel}
      onOk={handleSubmit}
      centered
      forceRender
      confirmLoading={submitting}
      okText={isZh ? '确认到货建单' : 'Submit Receipt'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={560}
      styles={{ body: { paddingTop: 10 } }}
    >
      {po && (
        <div style={{ marginBottom: 14 }}>
          <Descriptions
            size="small"
            column={2}
            bordered
            items={[
              {
                key: 'poNumber',
                label: isZh ? '采购单号' : 'PO No',
                children: <span style={{ fontWeight: 600, color: '#1677ff' }}>{po.poNumber}</span>,
              },
              {
                key: 'supplier',
                label: isZh ? '供应商' : 'Supplier',
                children: isZh ? po.supplierNameZh : po.supplierNameEn,
              },
              {
                key: 'overview',
                label: isZh ? '物料概览' : 'Item Info',
                children: isZh ? po.itemOverviewZh : po.itemOverviewEn,
              },
              {
                key: 'expectedDate',
                label: isZh ? '承诺交付' : 'Promised Date',
                children: <span className="tnum">{po.expectedDate}</span>,
              },
            ]}
          />
        </div>
      )}

      <Form form={form} layout="vertical" size="small">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="warehouseId"
            label={isZh ? '入库目标仓库' : 'Destination Warehouse'}
            rules={[{ required: true, message: 'Please select warehouse' }]}
          >
            <Select
              placeholder={isZh ? '选择仓库' : 'Select warehouse'}
              options={warehouses.map((wh) => ({
                value: wh.id,
                label: `${wh.code} - ${isZh ? wh.nameZh : wh.nameEn}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="itemId"
            label={isZh ? '收货物料' : 'Received Item'}
            rules={[{ required: true, message: 'Please select item' }]}
          >
            <Select
              showSearch
              placeholder={isZh ? '选择物料' : 'Select item'}
              optionFilterProp="label"
              options={items.map((i) => ({
                value: i.id,
                label: `${i.itemCode} - ${isZh ? i.nameZh : i.nameEn}`,
              }))}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="receivingBay"
            label={isZh ? '卸货码头 / 卸货泊位' : 'Receiving Dock Bay'}
            rules={[{ required: true, message: 'Please enter bay' }]}
          >
            <Input placeholder={isZh ? '例: 一号卸货泊位' : 'e.g. Inbound Dock A'} />
          </Form.Item>

          <Form.Item name="carrierTracking" label={isZh ? '承运物流及运单号' : 'Carrier Tracking'}>
            <Input placeholder={isZh ? '例: 顺丰速运 884910249' : 'e.g. Carrier / Tracking No'} />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="receivedQuantity"
            label={isZh ? '实收数量' : 'Received Quantity'}
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="locationCode"
            label={isZh ? '暂存预指派库位' : 'Staging Bin Location (Optional)'}
          >
            <Input placeholder={isZh ? '例: A-01-01' : 'e.g. A-01-01'} />
          </Form.Item>
        </div>

        <Alert
          type="info"
          showIcon
          title={
            isZh
              ? '创建收货单后，质检员在码头抽检通过即可一键上架入库，库存与财务应付账款同步增加。'
              : 'QC inspection at bay is required before posting to stock and AP accrual.'
          }
          style={{ fontSize: 12 }}
        />
      </Form>
    </Modal>
  );
};
