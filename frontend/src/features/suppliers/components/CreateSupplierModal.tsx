import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { CreateSupplierPayload } from '../types';

interface CreateSupplierModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: CreateSupplierPayload = {
        code: values.code,
        name: values.name,
        nameZh: values.nameZh,
        contactPerson: values.contactPerson,
        email: values.email || '',
        phone: values.phone || '',
        address: values.address || '',
        taxNumber: values.taxNumber || '',
        paymentTerms: values.paymentTerms || 'Net 30',
        ratingGrade: values.ratingGrade || 'A',
        leadTimeDays: values.leadTimeDays || 7,
      };

      await masterDataService.createSupplier(payload);
      message.success(isZh ? '新合格供应商已成功建档' : 'Supplier registered successfully');
      form.resetFields();
      onSuccess();
      onClose();
    } catch {
      // validation error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isZh ? '新增合格供应链厂商档案' : 'Register Qualified Supplier Profile'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={680}
      okText={isZh ? '确认保存' : 'Save Supplier'}
      cancelText={isZh ? '取消' : 'Cancel'}
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="small" initialValues={{ ratingGrade: 'A', paymentTerms: 'Net 30' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label={isZh ? '供应商编码 (Supplier Code)' : 'Supplier Code'}
              rules={[{ required: true, message: isZh ? '请输入编码' : 'Required' }]}
            >
              <Input placeholder="e.g. SUP-ANSTEEL-06" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ratingGrade"
              label={isZh ? '供应商资质等级' : 'Audit Rating Grade'}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'A', label: isZh ? 'A级 (战略合格供应商)' : 'Grade A (Strategic)' },
                  { value: 'B', label: isZh ? 'B级 (标准供货商)' : 'Grade B (Standard)' },
                  { value: 'C', label: isZh ? 'C级 (考察期备选商)' : 'Grade C (Probation)' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nameZh"
              label={isZh ? '企业全称 (中文)' : 'Vendor Name (Chinese)'}
              rules={[{ required: true, message: isZh ? '请输入企业名称' : 'Required' }]}
            >
              <Input placeholder="e.g. 鞍钢特种精密钢管有限公司" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label={isZh ? '企业全称 (英文)' : 'Vendor Name (English)'}
              rules={[{ required: true, message: isZh ? '请输入英文名称' : 'Required' }]}
            >
              <Input placeholder="e.g. Ansteel Precision Tubes Ltd." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label={isZh ? '业务对接人' : 'Contact Person'}
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Manager Chen (陈经理)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={isZh ? '联系电话' : 'Phone'}
              rules={[{ required: true }]}
            >
              <Input placeholder="+86-21-..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="email" label={isZh ? '商务电子邮箱' : 'Email Address'}>
              <Input placeholder="sales@vendor.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="taxNumber" label={isZh ? '统一社会信用代码/税号' : 'Tax / Registration No.'}>
              <Input placeholder="9131..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="paymentTerms" label={isZh ? '结算账期' : 'Payment Terms'}>
              <Select
                options={[
                  { value: 'Net 30', label: 'Net 30 Days' },
                  { value: 'Net 45', label: 'Net 45 Days' },
                  { value: 'Net 60', label: 'Net 60 Days' },
                  { value: 'COD', label: 'Cash on Delivery (COD)' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="leadTimeDays"
              label={isZh ? '平均交货周期 (天)' : 'Mean Lead Time (Days)'}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label={isZh ? '厂区注册地址' : 'Plant / Warehouse Address'}>
          <Input placeholder="Industrial Park Road..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
