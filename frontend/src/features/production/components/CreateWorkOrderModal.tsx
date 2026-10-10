import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch } from 'antd';
import { message } from '@/utils/antdApp';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { productionService } from '@/services/productionService';
import { masterDataService } from '@/services/masterDataService';
import { ItemRecord } from '@/features/items/types';
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
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<ItemRecord[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    masterDataService
      .getItems()
      .then((items) => {
        if (!active) return;
        const targetItems = items.filter(
          (i) =>
            i.type === 'FINISHED_GOOD' ||
            i.type === 'FINISHED_GOODS' ||
            i.type === 'SEMI_FINISHED' ||
            i.type === 'WIP',
        );
        setProducts(targetItems.length > 0 ? targetItems : items);
      })
      .catch(() => {
        // handled
      });
    return () => {
      active = false;
    };
  }, [open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const selectedItem = products.find((p) => p.id === values.productId);
      const payload: CreateProductionOrderRequest = {
        productId: values.productId,
        productCode: selectedItem ? selectedItem.itemCode : '',
        workstation: values.workstation,
        plannedQty: values.plannedQty,
        scheduledEnd: values.scheduledEnd.format('YYYY-MM-DD HH:mm'),
        isUrgent: values.isUrgent,
        notes: values.notes,
      };

      const res = await productionService.createOrder(payload);
      message.success(
        language === 'zh-CN'
          ? `生产工单 ${res.orderNo} 创建成功！`
          : `Work Order ${res.orderNo} created successfully!`,
      );
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
      title={language === 'zh-CN' ? '新建生产工单' : 'Create New Work Order'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      centered
      confirmLoading={submitting}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      width={560}
      forceRender
      styles={{ body: { paddingTop: 12 } }}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        initialValues={{ isUrgent: false, plannedQty: 500 }}
      >
        <Form.Item
          name="productId"
          label={language === 'zh-CN' ? '目标产品型号' : 'Product & Model'}
          rules={[
            {
              required: true,
              message: language === 'zh-CN' ? '请选择目标产品' : 'Please select a product',
            },
          ]}
        >
          <Select
            placeholder={
              language === 'zh-CN' ? '请选择目标产品型号...' : 'Select target product...'
            }
            showSearch
            loading={products.length === 0}
            optionFilterProp="label"
            options={products.map((p) => ({
              value: p.id,
              label: `${language === 'zh-CN' ? p.nameZh : p.nameEn} (${p.itemCode})`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="workstation"
          label={language === 'zh-CN' ? '指派生产产线' : 'Workstation / Production Line'}
          rules={[
            {
              required: true,
              message: language === 'zh-CN' ? '请指派生产产线' : 'Please select workstation line',
            },
          ]}
        >
          <Select
            placeholder={language === 'zh-CN' ? '请选择生产产线...' : 'Select production line...'}
            options={[
              {
                value: 'Line A-02',
                label:
                  language === 'zh-CN' ? 'A线 牧野五轴加工中心' : 'Line A-02 (CNC Makino 5-Axis)',
              },
              {
                value: 'Line B-01',
                label:
                  language === 'zh-CN' ? 'B线 德马吉数控车削单元' : 'Line B-01 (DMG Mori Lathe)',
              },
              {
                value: 'Line C-04',
                label:
                  language === 'zh-CN' ? 'C线 自动化总装流水线' : 'Line C-04 (Auto Assembly Line)',
              },
              {
                value: 'Line A-05',
                label: language === 'zh-CN' ? 'A线 精密压铸成型单元' : 'Line A-05 (Die-cast Cell)',
              },
              {
                value: 'Line B-03',
                label:
                  language === 'zh-CN' ? 'B线 外圆精密磨削工作站' : 'Line B-03 (Grinding Cell)',
              },
            ]}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="plannedQty"
            label={language === 'zh-CN' ? '计划投产数量' : 'Target Quantity'}
            rules={[
              {
                required: true,
                message: language === 'zh-CN' ? '请输入计划数量' : 'Please enter planned quantity',
              },
            ]}
          >
            <InputNumber min={1} max={100000} style={{ width: '100%' }} suffix="pcs" />
          </Form.Item>

          <Form.Item
            name="scheduledEnd"
            label={language === 'zh-CN' ? '要求交付时间' : 'Target Delivery Time'}
            rules={[
              {
                required: true,
                message: language === 'zh-CN' ? '请选择交付时间' : 'Please select completion date',
              },
            ]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item
          name="isUrgent"
          valuePropName="checked"
          label={language === 'zh-CN' ? '加急排产' : 'Expedite / Urgent Priority'}
        >
          <Switch
            checkedChildren={language === 'zh-CN' ? '加急' : 'Urgent'}
            unCheckedChildren={language === 'zh-CN' ? '常规' : 'Normal'}
          />
        </Form.Item>

        <Form.Item name="notes" label={language === 'zh-CN' ? '工艺技术备注' : 'Technical Notes'}>
          <Input.TextArea
            rows={2}
            placeholder={
              language === 'zh-CN'
                ? '技术要求、专用刀具指定、包装要求等...'
                : 'Inspection standard, material lot requirement...'
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWorkOrderModal;
