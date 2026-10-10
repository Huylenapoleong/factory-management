import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col } from 'antd';
import { message } from '@/utils/antdApp';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { CreateItemPayload, ItemType } from '../types';

interface CreateItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: number; code: string; nameEn: string; nameZh?: string }>
  >([]);
  const [units, setUnits] = useState<
    Array<{ id: number; code: string; nameEn: string; nameZh?: string }>
  >([]);

  useEffect(() => {
    if (visible) {
      Promise.all([
        masterDataService.getItemCategories(),
        masterDataService.getUnitsOfMeasurement(),
      ]).then(([catList, unitList]) => {
        setCategories(catList);
        setUnits(unitList);
        if (catList.length > 0 && !form.getFieldValue('categoryId')) {
          form.setFieldValue('categoryId', catList[0].id);
        }
        if (unitList.length > 0 && !form.getFieldValue('uomId')) {
          form.setFieldValue('uomId', unitList[0].id);
        }
      });
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: CreateItemPayload = {
        itemCode: values.itemCode,
        nameEn: values.nameEn,
        nameZh: values.nameZh,
        specification: values.specification || '',
        categoryId: Number(values.categoryId),
        type: values.type as ItemType,
        uomId: Number(values.uomId),
        minStock: Number(values.minStock ?? 0),
        maxStock: Number(values.maxStock ?? 0),
        safetyStock: Number(values.safetyStock ?? 0),
        standardCost: Number(values.standardCost ?? 0),
        leadTimeDays: Number(values.leadTimeDays ?? 0),
      };

      await masterDataService.createItem(payload);
      message.success(isZh ? '新物料/产品定义创建成功' : 'New item created successfully');
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
      title={isZh ? '新增主数据物料 / 产品编码' : 'Create Master Data Item / SKU'}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      width={680}
      okText={isZh ? '确认创建' : 'Create Item'}
      cancelText={isZh ? '取消' : 'Cancel'}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" size="small" initialValues={{ type: 'RAW_MATERIAL' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="itemCode"
              label={isZh ? '物料编码' : 'Item / SKU Code'}
              rules={[{ required: true, message: isZh ? '请输入物料编码' : 'Required' }]}
            >
              <Input placeholder="e.g. RM-STEEL-4140" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label={isZh ? '物料属性分类' : 'Item Type Classification'}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'RAW_MATERIAL', label: isZh ? '原材料' : 'Raw Material' },
                  {
                    value: 'SEMI_FINISHED',
                    label: isZh ? '半成品/在制品' : 'Semi-Finished / WIP',
                  },
                  {
                    value: 'FINISHED_GOOD',
                    label: isZh ? '产成品' : 'Finished Goods',
                  },
                  {
                    value: 'CONSUMABLE',
                    label: isZh ? '耗材/备品备件' : 'Consumables & Spares',
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nameZh"
              label={isZh ? '物料中文名称' : 'Item Name (Chinese)'}
              rules={[{ required: true, message: isZh ? '请输入中文名称' : 'Required' }]}
            >
              <Input placeholder="e.g. 4140合金圆钢" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nameEn"
              label={isZh ? '物料英文名称' : 'Item Name (English)'}
              rules={[{ required: true, message: isZh ? '请输入英文名称' : 'Required' }]}
            >
              <Input placeholder="e.g. 4140 Alloy Round Bar" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label={isZh ? '所属类目' : 'Item Category'}
              rules={[{ required: true, message: isZh ? '请选择类目' : 'Category required' }]}
            >
              <Select
                placeholder={isZh ? '选择类目' : 'Select Category'}
                options={categories.map((c) => ({
                  value: c.id,
                  label: isZh && c.nameZh ? `${c.nameZh} (${c.code})` : `${c.nameEn} (${c.code})`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="uomId"
              label={isZh ? '计量单位' : 'Unit of Measurement'}
              rules={[{ required: true, message: isZh ? '请选择计量单位' : 'UoM required' }]}
            >
              <Select
                placeholder={isZh ? '选择单位' : 'Select Unit'}
                options={units.map((u) => ({
                  value: u.id,
                  label: isZh && u.nameZh ? `${u.nameZh} (${u.code})` : `${u.nameEn} (${u.code})`,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="specification"
          label={isZh ? '规格型号与公差标准' : 'Specification & Tolerances'}
        >
          <Input placeholder="e.g. Ø50mm × 6000mm Annealed | ASTM A29" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="safetyStock"
              label={isZh ? '安全库存下限' : 'Safety Stock Min'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxStock"
              label={isZh ? '最高库容限额' : 'Max Stock Capacity'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="leadTimeDays"
              label={isZh ? '前置期（天）' : 'Lead Time (Days)'}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="standardCost"
              label={isZh ? '计划标准成本（美元）' : 'Standard Cost (USD)'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
