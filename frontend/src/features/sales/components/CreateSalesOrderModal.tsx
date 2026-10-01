import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Button, message, Space, Alert, theme } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { salesService } from '@/services/salesService';

interface CreateSalesOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateSalesOrderModal: React.FC<CreateSalesOrderModalProps> = ({
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
      const success = await salesService.createSalesOrder({
        customerId: values.customerId,
        deliveryDate: values.deliveryDate ? values.deliveryDate.format('YYYY-MM-DD') : '2026-10-20',
        isUrgent: values.isUrgent || false,
        note: values.note,
        items: values.items || [
          { itemId: 1006, quantity: 100, unitPrice: 120.0 },
        ],
      });

      if (success) {
        message.success(isZh ? '销售合同订单已建立并下达生产计划' : 'Sales order created and queued for production');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(isZh ? '创建销售订单失败' : 'Failed to create sales order');
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
      title={isZh ? '新建客户销售订单 (Create Sales Order)' : 'Create Sales Order'}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      okText={isZh ? '确认生成订单' : 'Create Order'}
      cancelText={isZh ? '取消' : 'Cancel'}
      width={680}
      styles={{ body: { paddingTop: 10 } }}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        initialValues={{
          customerId: 1,
          isUrgent: false,
          items: [
            { itemId: 1006, quantity: 120, unitPrice: 1500.0 },
          ],
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Form.Item
            name="customerId"
            label={isZh ? '采购客户 / 订购方' : 'Customer Account'}
            rules={[{ required: true, message: 'Please select customer' }]}
          >
            <Select
              options={[
                { value: 1, label: isZh ? '特斯拉能源超级工厂 (Tesla Energy)' : 'Tesla Energy Gigafactory' },
                { value: 2, label: isZh ? '比亚迪汽车西安总装基地 (BYD Auto)' : "BYD Auto Xi'an Plant" },
                { value: 3, label: isZh ? '西门子能源系统 (Siemens Energy)' : 'Siemens Energy AG' },
                { value: 4, label: isZh ? '富士康工业互联 (Foxconn FII)' : 'Foxconn Industrial Internet' },
                { value: 5, label: isZh ? '三一重工股份有限公司 (Sany Heavy)' : 'Sany Heavy Industry' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="deliveryDate"
            label={isZh ? '承诺交付截止日' : 'Promised Delivery Date'}
            rules={[{ required: true, message: 'Please select delivery date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 12, color: '#1f2937' }}>
            {isZh ? '订单物料行明细 (SO Lines)' : 'Order Item Lines'}
          </span>
          <Form.Item name="isUrgent" valuePropName="checked" noStyle>
            <Space size="small">
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {isZh ? '优先插单加急 (Priority Expedite):' : 'Priority Expedite:'}
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
                    rules={[{ required: true, message: 'Select product' }]}
                  >
                    <Select
                      options={[
                        { value: 1006, label: 'HV-204 / Precision Hydraulic Valve Core' },
                        { value: 1002, label: 'ELEC-SRV-750 / Inverter Drive Unit 150kW' },
                        { value: 1005, label: 'FS-880 / CNC Flange Shaft 45#' },
                        { value: 1008, label: 'BMS-48V / BMS Low-Voltage Harness Module' },
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
                      placeholder={isZh ? '合同单价' : 'Unit Price'}
                      min={0.1}
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
                {isZh ? '添加产品行明细' : 'Add Product Line Item'}
              </Button>
            </div>
          )}
        </Form.List>

        <Form.Item name="note" label={isZh ? '发货包装与合同特殊约定' : 'Packaging & Shipping Instructions'}>
          <Input.TextArea
            rows={2}
            placeholder={isZh ? '防静电托盘包装，附出厂检验报告 (COA) 与原产地证明...' : 'ESD pallet packaging with COA test reports...'}
          />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          message={
            isZh
              ? '确认订单后，系统将自动检查成品在库数并驱动车间工单排产调度。'
              : 'Order confirmation triggers inventory allocation and production order scheduling.'
          }
          style={{ fontSize: 12 }}
        />
      </Form>
    </Modal>
  );
};
