import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Descriptions, Alert } from 'antd';
import { message } from '@/utils/antdApp';
import { useAppStore } from '@/stores/useAppStore';
import { salesService } from '@/services/salesService';
import { inventoryService } from '@/services/inventoryService';
import { masterDataService } from '@/services/masterDataService';
import { WarehouseSummary } from '@/features/inventory/types';
import { ItemRecord } from '@/features/items/types';
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

      if (order) {
        form.setFieldsValue({
          salesOrderId: order.id,
        });
      }
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
          {
            itemId: values.itemId,
            quantity: values.quantity,
          },
        ],
      });

      if (success) {
        message.success(
          isZh ? '销售发货单已生成并排定装车泊位' : 'Outbound delivery note staged at dock bay',
        );
        form.resetFields();
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

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isZh ? '办理销售出库发运' : 'Stage Outbound Delivery'}
      onCancel={handleCancel}
      onOk={handleSubmit}
      centered
      forceRender
      confirmLoading={submitting}
      okText={isZh ? '生成发货单' : 'Stage Delivery'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={600}
      styles={{ body: { paddingTop: 10 } }}
    >
      {order && (
        <div style={{ marginBottom: 14 }}>
          <Descriptions
            size="small"
            column={2}
            bordered
            items={[
              {
                key: 'soNo',
                label: isZh ? '销售单号' : 'SO No',
                children: (
                  <span style={{ fontWeight: 600, color: '#1677ff' }}>{order.orderNo}</span>
                ),
              },
              {
                key: 'customer',
                label: isZh ? '订货客户' : 'Customer',
                children: isZh ? order.customerNameZh : order.customerNameEn,
              },
              {
                key: 'overview',
                label: isZh ? '出库物料' : 'Item Overview',
                children: isZh ? order.itemOverviewZh : order.itemOverviewEn,
              },
              {
                key: 'readiness',
                label: isZh ? '履约就绪度' : 'Readiness',
                children: (
                  <span className="tnum" style={{ fontWeight: 700, color: '#15803d' }}>
                    {order.fulfillmentPercent}%
                  </span>
                ),
              },
            ]}
          />
        </div>
      )}

      <Form form={form} layout="vertical" size="small">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="warehouseId"
            label={isZh ? '发货出库仓库' : 'Source Warehouse'}
            rules={[{ required: true, message: 'Select warehouse' }]}
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
            label={isZh ? '发货物料 / 产品' : 'Shipped Item'}
            rules={[{ required: true, message: 'Select item' }]}
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
            name="quantity"
            label={isZh ? '发运数量' : 'Quantity'}
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="shippingBay"
            label={isZh ? '装车发运码头泊位' : 'Shipping Dock Bay'}
            rules={[{ required: true, message: 'Select bay' }]}
          >
            <Input placeholder={isZh ? '例: 一号码头泊位' : 'e.g. Shipping Dock A'} />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="carrierName"
            label={isZh ? '承运物流公司' : 'Carrier Partner'}
            rules={[{ required: true, message: 'Input carrier' }]}
          >
            <Input placeholder={isZh ? '例: 顺丰速运 / 德邦物流' : 'e.g. Carrier Name'} />
          </Form.Item>

          <Form.Item name="carrierTrackingNo" label={isZh ? '物流运单号' : 'Tracking Number'}>
            <Input placeholder={isZh ? '运单号 (可选)' : 'Tracking No (Optional)'} />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="truckPlate" label={isZh ? '承运货车车牌' : 'Truck License Plate'}>
            <Input placeholder={isZh ? '例: 粤B-12345' : 'e.g. Plate number'} />
          </Form.Item>

          <Form.Item name="driverContact" label={isZh ? '驾驶员姓名及手机号' : 'Driver Contact'}>
            <Input placeholder={isZh ? '例: 司机姓名与联系电话' : 'e.g. Driver name & phone'} />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Form.Item name="palletsCount" label={isZh ? '打托盘数' : 'Pallets (Optional)'}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="grossWeightKg" label={isZh ? '总毛重（千克）' : 'Gross Wt (kg)'}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="volumeCbm" label={isZh ? '总容积（立方米）' : 'Volume (CBM)'}>
            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Alert
          type="info"
          showIcon
          title={
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
