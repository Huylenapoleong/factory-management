import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Button, message, Space, Alert, theme } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { purchasingService } from '@/services/purchasingService';

interface CreatePurchaseOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const success = await purchasingService.createPurchaseOrder({
        supplierId: values.supplierId,
        expectedDeliveryDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : '2026-10-15',
        isUrgent: values.isUrgent || false,
        note: values.note,
        items: values.items || [
          { itemId: 1001, quantity: 1000, unitPrice: 18.5 },
        ],
      });

      if (success) {
        message.success(isZh ? '采购订单已成功生成并下达' : 'Purchase order created and issued');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(isZh ? '创建采购单失败' : 'Failed to create purchase order');
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
      title={isZh ? '新建采购订单 (Create Purchase Order)' : 'Create Purchase Order'}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      okText={isZh ? '确认下达采购单' : 'Issue Purchase Order'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={680}
      forceRender
      styles={{ body: { paddingTop: 10 } }}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        initialValues={{
          supplierId: 1,
          isUrgent: false,
          items: [
            { itemId: 1001, quantity: 1000, unitPrice: 18.5 },
          ],
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Form.Item
            name="supplierId"
            label={isZh ? '供货商 / 制造商' : 'Supplier'}
            rules={[{ required: true, message: 'Please select supplier' }]}
          >
            <Select
              options={[
                { value: 1, label: isZh ? '宝武特钢股份有限公司 (Baosteel)' : 'Baosteel Precision Steel Ltd' },
                { value: 2, label: isZh ? '汇川精密伺服技术 (Inovance)' : 'Shenzhen Inovance Servo Tech' },
                { value: 3, label: isZh ? '派克汉尼汾流体传动 (Parker)' : 'Parker Hannifin Hydraulics' },
                { value: 4, label: isZh ? '东莞五金紧固件实业 (Dongguan)' : 'Dongguan Standard Fasteners' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="expectedDate"
            label={isZh ? '承诺交付截止日' : 'Promised Delivery Date'}
            rules={[{ required: true, message: 'Please select delivery date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 12, color: '#1f2937' }}>
            {isZh ? '采购物料明细行 (PO Lines)' : 'Purchase Order Item Lines'}
          </span>
          <Form.Item name="isUrgent" valuePropName="checked" noStyle>
            <Space size="small">
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {isZh ? '产线加急单 (Urgent Expedite):' : 'Urgent Expedite:'}
              </span>
              <Switch size="small" />
            </Space>
          </Form.Item>
        </div>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: 8,
                    alignItems: 'center',
                    backgroundColor: token.colorFillAlter,
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'itemId']}
                    noStyle
                    rules={[{ required: true, message: 'Select item' }]}
                  >
                    <Select
                      options={[
                        { value: 1001, label: 'RM-STEEL-304 / 304 Stainless Round Bar' },
                        { value: 1002, label: 'ELEC-MOTOR-750W / AC Servo Motor 750W' },
                        { value: 1004, label: 'FASTENER-M8-30 / Hex Bolt M8×30 Gr 12.9' },
                        { value: 1005, label: 'ALLOY-AL6061-T6 / Aluminum Plate AL6061' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'quantity']}
                    noStyle
                    rules={[{ required: true, message: 'Qty' }]}
                  >
                    <InputNumber placeholder={isZh ? '数量' : 'Qty'} min={1} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'unitPrice']}
                    noStyle
                    rules={[{ required: true, message: 'Price' }]}
                  >
                    <InputNumber
                      prefix="$"
                      placeholder={isZh ? '单价' : 'Price'}
                      min={0.01}
                      step={0.1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={fields.length === 1}
                    onClick={() => remove(name)}
                  />
                </div>
              ))}

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                size="small"
              >
                {isZh ? '添加采购物料行' : 'Add PO Line Item'}
              </Button>
            </div>
          )}
        </Form.List>

        <Form.Item name="note" label={isZh ? '采购单备注及质量技术协议' : 'PO Notes & Technical Spec'}>
          <Input.TextArea
            rows={2}
            placeholder={isZh ? '按国标GB/T 1220-2020供货，随货提供材质质保书 (MTR)...' : 'Deliver per standard spec with MTR certificate...'}
          />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          title={
            isZh
              ? '采购单下达后将自动同步至 ERP 主台账并向供方发送 EDI 订单通知。'
              : 'PO will synchronize to ERP and trigger vendor EDI notification.'
          }
          style={{ fontSize: 12 }}
        />
      </Form>
    </Modal>
  );
};
