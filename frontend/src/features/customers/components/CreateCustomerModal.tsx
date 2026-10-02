import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { CreateCustomerPayload } from '../types';

interface CreateCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
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
      const payload: CreateCustomerPayload = {
        code: values.code,
        name: values.name,
        nameZh: values.nameZh,
        industry: values.industry || 'Machinery Manufacturing',
        contactPerson: values.contactPerson,
        email: values.email || '',
        phone: values.phone || '',
        shippingAddress: values.shippingAddress || '',
        billingAddress: values.billingAddress || '',
        creditLimit: values.creditLimit || 1000000,
        paymentTerms: values.paymentTerms || 'Net 30',
      };

      await masterDataService.createCustomer(payload);
      message.success(isZh ? '新企业客户档案建档成功' : 'Customer registered successfully');
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
      title={isZh ? '新增商业客户与渠道档案' : 'Register Commercial Client Account'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      width={680}
      okText={isZh ? '确认保存' : 'Save Customer'}
      cancelText={isZh ? '取消' : 'Cancel'}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" size="small" initialValues={{ paymentTerms: 'Net 30', creditLimit: 2000000 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label={isZh ? '客户编码 (Account Code)' : 'Client Account Code'}
              rules={[{ required: true, message: isZh ? '请输入客户编码' : 'Required' }]}
            >
              <Input placeholder="e.g. CUST-VOLVO-05" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="industry"
              label={isZh ? '所属行业领域' : 'Industry Segment'}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'Heavy Machinery', label: isZh ? '重工与工程装备' : 'Heavy Machinery' },
                  { value: 'Automotive & Commercial Vehicles', label: isZh ? '汽车制造与商用车' : 'Automotive' },
                  { value: 'Aerospace & Marine', label: isZh ? '航空航天与船舶' : 'Aerospace & Marine' },
                  { value: 'Energy & Power Equipment', label: isZh ? '能源与电力装备' : 'Energy & Power' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nameZh"
              label={isZh ? '客户企业名称 (中文)' : 'Client Name (Chinese)'}
              rules={[{ required: true, message: isZh ? '请输入客户企业名称' : 'Required' }]}
            >
              <Input placeholder="e.g. 沃尔沃建筑设备亚太中心" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label={isZh ? '客户企业名称 (英文)' : 'Client Name (English)'}
              rules={[{ required: true, message: isZh ? '请输入英文名称' : 'Required' }]}
            >
              <Input placeholder="e.g. Volvo Construction Equipment APAC" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label={isZh ? '采购/商务负责人' : 'Commercial Contact'}
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Director Zhang (张总监)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={isZh ? '联系电话' : 'Phone'}
              rules={[{ required: true }]}
            >
              <Input placeholder="+86-..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="email" label={isZh ? '业务电子邮箱' : 'Email Address'}>
              <Input placeholder="procurement@client.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="creditLimit"
              label={isZh ? '授信信用额度 (USD)' : 'Credit Limit (USD)'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} step={10000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="shippingAddress" label={isZh ? '指定发货/收货厂区地址' : 'Default Delivery Site Address'}>
          <Input placeholder="Dock Bay, Logistics Park..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
