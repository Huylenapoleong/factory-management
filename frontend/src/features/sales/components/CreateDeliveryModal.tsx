import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Descriptions, Alert } from 'antd';
import { useAppStore } from '@/stores/useAppStore';
import { salesService } from '@/services/salesService';
import { SalesOrderSummary } from '../types';

interface CreateDeliveryModalProps {
  open: boolean;
  order: SalesOrderSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
  open,
  order,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (order) {
        form.setFieldsValue({
          salesOrderId: order.id,
          warehouseId: 3, // finished goods warehouse
          shippingBay: 'Dock Bay 07 - Outbound Export',
          carrierName: 'SF Heavy Freight Express (顺丰重货专运)',
          carrierTrackingNo: 'SF-LOG-8849201948',
          truckPlate: '苏E-98K21',
          driverContact: 'Master Liu (刘师傅) · +86 138-1920-3341',
          palletsCount: 4,
          grossWeightKg: 1840,
          volumeCbm: 5.6,
        });
      }
    } else {
      form.resetFields();
    }
  }, [open, order, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const success = await salesService.createDelivery({
        salesOrderId: order ? order.id : values.salesOrderId,
        warehouseId: values.warehouseId,
        shippingBay: values.shippingBay,
        carrierName: values.carrierName,
        carrierTrackingNo: values.carrierTrackingNo,
        truckPlate: values.truckPlate,
        driverContact: values.driverContact,
        palletsCount: values.palletsCount,
        grossWeightKg: values.grossWeightKg,
        volumeCbm: values.volumeCbm,
        items: [
          { soItemId: 1, quantity: 120 },
        ],
      });

      if (success) {
        message.success(isZh ? '销售发货单已生成并排定装车泊位' : 'Outbound delivery note staged at dock bay');
        onSuccess();
        onClose();
      } else {
        message.error(isZh ? '创建发货单失败' : 'Failed to stage delivery note');
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
      title={isZh ? '办理销售出库发运 (Stage Outbound Delivery)' : 'Stage Outbound Delivery'}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={isZh ? '生成发货单' : 'Stage Delivery'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={600}
      styles={{ body: { paddingTop: 10 } }}
    >
      {order && (
        <div style={{ marginBottom: 14 }}>
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label={isZh ? '销售单号' : 'SO No'}>
              <span style={{ fontWeight: 600, color: '#1677ff' }}>{order.orderNo}</span>
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '订货客户' : 'Customer'}>
              {isZh ? order.customerNameZh : order.customerNameEn}
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '出库物料' : 'Item Overview'}>
              {isZh ? order.itemOverviewZh : order.itemOverviewEn}
            </Descriptions.Item>
            <Descriptions.Item label={isZh ? '履约就绪度' : 'Readiness'}>
              <span className="tnum" style={{ fontWeight: 700, color: '#15803d' }}>
                {order.fulfillmentPercent}%
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <Form form={form} layout="vertical" size="small">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="shippingBay"
            label={isZh ? '装车发运码头泊位' : 'Shipping Dock Bay'}
            rules={[{ required: true, message: 'Select bay' }]}
          >
            <Select
              options={[
                { value: 'Dock Bay 05 - Domestic Rapid', label: 'Bay 05 - Domestic Rapid / 国内快运' },
                { value: 'Dock Bay 06 - Customer Staging', label: 'Bay 06 - Customer QC / 待客检泊位' },
                { value: 'Dock Bay 07 - Outbound Export', label: 'Bay 07 - Outbound Export / 出海专运' },
                { value: 'Dock Bay 08 - Heavy Carrier', label: 'Bay 08 - Heavy Carrier / 重载干线' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="carrierName"
            label={isZh ? '承运物流公司' : 'Carrier Partner'}
            rules={[{ required: true, message: 'Select carrier' }]}
          >
            <Select
              options={[
                { value: 'SF Heavy Freight Express (顺丰重货专运)', label: 'SF Heavy Freight Express (顺丰重货)' },
                { value: 'Deppon Logistics (德邦物流)', label: 'Deppon Logistics (德邦物流)' },
                { value: 'DHL Global Forwarding (中外运敦豪)', label: 'DHL Global Forwarding (敦豪国际)' },
                { value: 'Customer Dedicated Fleet (客户自提车队)', label: 'Customer Dedicated Fleet (客户自提)' },
              ]}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="truckPlate"
            label={isZh ? '承运货车车牌' : 'Truck License Plate'}
            rules={[{ required: true, message: 'Input plate' }]}
          >
            <Input placeholder="e.g. 苏E-98K21" />
          </Form.Item>

          <Form.Item
            name="driverContact"
            label={isZh ? '驾驶员姓名及手机号' : 'Driver Contact'}
            rules={[{ required: true, message: 'Input driver' }]}
          >
            <Input placeholder="e.g. Master Liu · 138-1920-3341" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Form.Item name="palletsCount" label={isZh ? '打托盘数' : 'Pallets'}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="grossWeightKg" label={isZh ? '总毛重 (kg)' : 'Gross Wt (kg)'}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="volumeCbm" label={isZh ? '总容积 (CBM)' : 'Volume (CBM)'}>
            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Alert
          type="info"
          showIcon
          message={
            isZh
              ? '生成发货单后，现场调度点击【确认发货出库】将自动扣减对应仓库的可用与现有库存。'
              : 'Posting outbound dispatch will deduct inventory stock balance atomically.'
          }
          style={{ fontSize: 12 }}
        />
      </Form>
    </Modal>
  );
};
