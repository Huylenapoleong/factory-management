import React, { useEffect } from 'react';
import { Alert, App, DatePicker, Form, InputNumber, Modal } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { bomService } from '@/services/bomService';
import type { BomAnalysis } from '../types';

interface ReleaseOrderModalProps {
  open: boolean;
  onClose: () => void;
  analysis: BomAnalysis;
  isZh: boolean;
}

interface FormValues {
  plannedQuantity: number;
  startDate: Dayjs;
  dueDate: Dayjs;
}

export const ReleaseOrderModal: React.FC<ReleaseOrderModalProps> = ({ open, onClose, analysis, isZh }) => {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        plannedQuantity: analysis.plannedQuantity,
        startDate: dayjs(analysis.startDate),
        dueDate: dayjs(analysis.startDate).add(7, 'day'),
      });
    }
  }, [open, analysis.plannedQuantity, analysis.startDate, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      bomService.createProductionOrder({
        productId: analysis.productId,
        bomId: analysis.bomId,
        plannedQuantity: values.plannedQuantity,
        startDate: values.startDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      }),
    onSuccess: (order) => {
      message.success(isZh ? `已创建生产工单 ${order.moNo}（草稿）` : `Production order ${order.moNo} created as draft`);
      onClose();
      navigate('/production');
    },
    onError: (err: unknown) => {
      const detail = (err as { message?: string })?.message;
      message.error(detail || (isZh ? '创建生产工单失败' : 'Could not create production order'));
    },
  });

  return (
    <Modal
      title={isZh ? '下达生产工单' : 'Create production order'}
      open={open}
      onCancel={onClose}
      onOk={() => form.validateFields().then((values) => mutation.mutate(values))}
      okText={isZh ? '创建工单' : 'Create order'}
      cancelText={isZh ? '取消' : 'Cancel'}
      confirmLoading={mutation.isPending}
      centered
      destroyOnHidden
    >
      <div style={{ marginBottom: 12, fontSize: 13 }}>
        <strong>{(isZh && analysis.productNameZh) || analysis.productNameEn}</strong> · {analysis.productCode} · BOM {analysis.bomCode} v{analysis.version}
      </div>
      {analysis.toOrderCount > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          title={
            isZh
              ? `还有 ${analysis.toOrderCount} 项缺料尚未下采购单。工单将以草稿状态创建，备料完成后再下达。`
              : `${analysis.toOrderCount} short material(s) have no purchase order yet. The order is created as a draft so you can release it once stock arrives.`
          }
        />
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          name="plannedQuantity"
          label={`${isZh ? '计划数量' : 'Planned quantity'} (${analysis.productUnitCode ?? 'pcs'})`}
          rules={[{ required: true }]}
        >
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item name="startDate" label={isZh ? '计划开工' : 'Start date'} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label={isZh ? '交付日期' : 'Due date'}
            dependencies={['startDate']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator: (_, value?: Dayjs) =>
                  !value || !getFieldValue('startDate') || !value.isBefore(getFieldValue('startDate'), 'day')
                    ? Promise.resolve()
                    : Promise.reject(new Error(isZh ? '交付日期不能早于开工日期' : 'Due date must be on or after the start date')),
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
