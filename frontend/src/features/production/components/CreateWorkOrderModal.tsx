import React from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { productionService } from '@/services/productionService';
import { CreateProductionOrderRequest } from '../types';

interface CreateWorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: CreateProductionOrderRequest = {
        productCode: values.productCode,
        workstation: values.workstation,
        plannedQty: values.plannedQty,
        scheduledEnd: values.scheduledEnd.format('YYYY-MM-DD HH:mm'),
        isUrgent: values.isUrgent,
        notes: values.notes,
      };

      const res = await productionService.createOrder(payload);
      message.success(`Work Order ${res.orderNo} created successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch {
      // Form validation error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={language === 'zh-CN' ? '新建生产工单 (Create Work Order)' : 'Create New Work Order'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      width={560}
      styles={{ body: { paddingTop: 12 } }}
    >
      <Form form={form} layout="vertical" size="small" initialValues={{ isUrgent: false, plannedQty: 500 }}>
        <Form.Item
          name="productCode"
          label={language === 'zh-CN' ? '目标产品型号 (Product Spec)' : 'Product & Model'}
          rules={[{ required: true, message: 'Please select a product' }]}
        >
          <Select
            placeholder="Select target product..."
            options={[
              { value: 'HV-204', label: 'Precision Hydraulic Valve V2 / 精密液压阀 (HV-204)' },
              { value: 'FS-880', label: 'CNC Flange Shaft 45# / CNC法兰轴 (FS-880)' },
              { value: 'GB-300', label: 'Industrial Gearbox C3 / 工业减速箱 (GB-300)' },
              { value: 'SH-120', label: 'Servo Drive Housing / 伺服电机外壳 (SH-120)' },
              { value: 'PR-95', label: 'High-Pressure Piston Rod / 高压活塞杆 (PR-95)' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="workstation"
          label={language === 'zh-CN' ? '指派生产产线 (Assigned Line)' : 'Workstation / Production Line'}
          rules={[{ required: true, message: 'Please select workstation line' }]}
        >
          <Select
            placeholder="Select production line..."
            options={[
              { value: 'Line A-02', label: 'Line A-02 (CNC Makino 5-Axis) / A线牧野五轴' },
              { value: 'Line B-01', label: 'Line B-01 (DMG Mori Lathe) / B线德马吉数控车' },
              { value: 'Line C-04', label: 'Line C-04 (Auto Assembly Line) / C线自动化总装' },
              { value: 'Line A-05', label: 'Line A-05 (Die-cast Cell) / A线精密压铸单元' },
              { value: 'Line B-03', label: 'Line B-03 (Grinding Cell) / B线外圆精密磨床' },
            ]}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="plannedQty"
            label={language === 'zh-CN' ? '计划投产数量 (Planned Qty)' : 'Target Quantity'}
            rules={[{ required: true, message: 'Please enter planned quantity' }]}
          >
            <InputNumber min={1} max={100000} style={{ width: '100%' }} addonAfter="pcs" />
          </Form.Item>

          <Form.Item
            name="scheduledEnd"
            label={language === 'zh-CN' ? '要求交付时间 (Due Date)' : 'Target Delivery Time'}
            rules={[{ required: true, message: 'Please select completion date' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item
          name="isUrgent"
          valuePropName="checked"
          label={language === 'zh-CN' ? '是否加急排产 (Urgent Priority)' : 'Expedite / Urgent Priority'}
        >
          <Switch checkedChildren="Urgent" unCheckedChildren="Normal" />
        </Form.Item>

        <Form.Item name="notes" label={language === 'zh-CN' ? '工艺技术备注 (Notes)' : 'Technical Notes'}>
          <Input.TextArea rows={2} placeholder="Inspection standard, material lot requirement..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWorkOrderModal;
