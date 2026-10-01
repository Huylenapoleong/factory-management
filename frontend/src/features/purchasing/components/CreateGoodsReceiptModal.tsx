import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Descriptions, Alert } from 'antd';
import { useAppStore } from '@/stores/useAppStore';
import { purchasingService } from '@/services/purchasingService';
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

  useEffect(() => {
    if (open) {
      if (po) {
        form.setFieldsValue({
          purchaseOrderId: po.id,
          warehouseId: 1,
          receivingBay: 'Bay 02 - Heavy Freight',
          carrierTracking: 'SF Heavy 顺丰重运 884910249',
          receivedQuantity: 500,
          locationCode: 'WH-01 / A-03-02',
        });
      } else {
        form.setFieldsValue({
          purchaseOrderId: 1,
          warehouseId: 1,
          receivingBay: 'Bay 02 - Heavy Freight',
          carrierTracking: 'SF Heavy 顺丰重运 884910249',
          receivedQuantity: 500,
          locationCode: 'WH-01 / A-03-02',
        });
      }
    } else {
      form.resetFields();
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
            poItemId: 1,
            receivedQuantity: values.receivedQuantity,
          },
        ],
      });

      if (success) {
        message.success(isZh ? '到货收货单已建立，进入现场质检队列' : 'Goods receipt created, queued for dock QC');
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

  return (
    <Modal
      open={open}
      title={isZh ? '办理采购到货收货 (Create Goods Receipt)' : 'Create Goods Receipt'}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      okText={isZh ? '确认到货建单' : 'Submit Receipt'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={560}
      styles={{ body: { paddingTop: 10 } }}
    >
      {po && (
        <div style={{ marginBottom: 14 }}>
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label={isZh ? '采购单号' : 'PO No'}>
              <span style={{ fontWeight: 600, color: '#1677ff' }}>{po.poNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '供应商' : 'Supplier'}>
              {isZh ? po.supplierNameZh : po.supplierNameEn}
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '物料概览' : 'Item Info'}>
              {isZh ? po.itemOverviewZh : po.itemOverviewEn}
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '承诺交付' : 'Promised Date'}>
              <span className="tnum">{po.expectedDate}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Form form={form} layout="vertical" size="small">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="receivingBay"
            label={isZh ? '卸货码头 / 卸货泊位' : 'Receiving Dock Bay'}
            rules={[{ required: true, message: 'Please select bay' }]}
          >
            <Select
              options={[
                { value: 'Bay 01 - Small Parts', label: 'Bay 01 - Small Parts / 小件泊位' },
                { value: 'Bay 02 - Heavy Freight', label: 'Bay 02 - Heavy Freight / 重货泊位' },
                { value: 'Bay 03 - Coil & Raw Metal', label: 'Bay 03 - Coil & Raw Metal / 钢卷泊位' },
                { value: 'Bay 04 - Chemical & Hazardous', label: 'Bay 04 - Consumables / 辅料泊位' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="carrierTracking"
            label={isZh ? '承运物流及运单号' : 'Carrier Tracking'}
            rules={[{ required: true, message: 'Please enter tracking info' }]}
          >
            <Input placeholder="e.g. SF Heavy 884910249" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="receivedQuantity"
            label={isZh ? '实收数量 (件/kg)' : 'Received Quantity'}
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="locationCode"
            label={isZh ? '暂存预指派库位' : 'Staging Bin Location'}
            rules={[{ required: true, message: 'Please enter target bin' }]}
          >
            <Input placeholder="e.g. WH-01 / A-03-02" />
          </Form.Item>
        </div>

        <Alert
          type="info"
          showIcon
          message={
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
