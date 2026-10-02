import React, { useState, useEffect } from 'react';
import { Card, Tag, InputNumber, Select, Button, Form, message, Steps, theme } from 'antd';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  PrinterOutlined,
  ThunderboltFilled,
  UserOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { productionService } from '@/services/productionService';
import { ProductionOrder, OperationStep } from '../types';

interface OperationTrackingDrawerProps {
  order: ProductionOrder | null;
  onClose?: () => void;
  onReportSubmitted?: () => void;
}

export const OperationTrackingDrawer: React.FC<OperationTrackingDrawerProps> = ({
  order,
  onClose,
  onReportSubmitted,
}) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const [steps, setSteps] = useState<OperationStep[]>([]);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!order) return;
    const fetchSteps = async () => {
      const data = await productionService.getOperationSteps(order.id);
      setSteps(data);
    };
    fetchSteps();
  }, [order]);

  if (!order) {
    return (
      <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb', textAlign: 'center', padding: 32 }}>
        <span style={{ color: '#9ca3af' }}>
          {language === 'zh-CN' ? '请选择一个生产工单以查看工序与现场报工' : 'Select a work order to view operation routing & dispatch'}
        </span>
      </Card>
    );
  }

  const activeStep = steps.find((s) => s.status === 'ACTIVE') || steps[0];

  const handleReportSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await productionService.submitOperationReport(order.id, activeStep?.id || 'step-30', {
        qualifiedQty: values.qualifiedQty,
        scrapQty: values.scrapQty,
        defectReason: values.defectReason,
        machineRunHours: values.machineRunHours,
        operatorId: 'operator-chen',
      });
      message.success(
        language === 'zh-CN'
          ? `工序报工已提交成功: +${values.qualifiedQty} 件合格!`
          : `Operation report submitted: +${values.qualifiedQty} pcs qualified!`
      );
      form.resetFields();
      onReportSubmitted?.();
    } catch {
      // validation error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="tnum" style={{ fontWeight: 700, color: '#1677ff', fontSize: 14 }}>
              {order.orderNo}
            </span>
            <Tag color="processing" style={{ marginLeft: 8, borderRadius: 2 }}>
              {language === 'zh-CN' ? '生产中' : 'In Production'}
            </Tag>
          </div>
          {onClose && (
            <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
          )}
        </div>
      }
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
      styles={{ body: { padding: '12px 14px' } }}
    >
      {/* Product Summary Header */}
      <div style={{ padding: '8px 10px', backgroundColor: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, color: token.colorText, fontSize: 13 }}>
          {language === 'zh-CN' ? order.productNameZh : order.productName}
        </div>
        <div style={{ fontSize: 11, color: token.colorTextSecondary, display: 'flex', gap: 12, marginTop: 2 }}>
          <span>Part: <strong style={{ color: token.colorText }}>{order.productCode}</strong></span>
          <span>Batch: <strong style={{ color: token.colorText }}>{order.batchNo}</strong></span>
          <span>Total: <strong style={{ color: token.colorPrimary }}>{order.plannedQty} {order.uom}</strong></span>
        </div>
      </div>

      {/* 5-Step Routing Process */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>
          {language === 'zh-CN' ? '标准工艺工序进度 (5-Step Routing)' : 'Standard Routing Progress (5 Steps)'}
        </div>

        <Steps
          orientation="vertical"
          size="small"
          current={order.stepNumber - 1}
          items={steps.map((st) => ({
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: st.status === 'ACTIVE' ? '#1677ff' : '#1f2937' }}>
                  {st.stepCode}: {language === 'zh-CN' ? st.stepNameZh : st.stepName}
                </span>
                {st.status === 'COMPLETED' && (
                  <Tag color="success" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
                    <CheckCircleFilled style={{ marginRight: 2 }} />
                    {st.completedQty} / {st.targetQty}
                  </Tag>
                )}
                {st.status === 'ACTIVE' && (
                  <Tag color="processing" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 2 }}>
                    <ClockCircleFilled style={{ marginRight: 2 }} />
                    {st.progressPercent}% ({st.completedQty} pcs)
                  </Tag>
                )}
              </div>
            ),
            description: (
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                <span>Machine: {st.machineId}</span> &nbsp;|&nbsp;{' '}
                <span>Operator: {language === 'zh-CN' ? st.workerNameZh : st.workerName}</span>
                {st.scrapQty > 0 && <span style={{ color: '#ff4d4f', marginLeft: 8 }}>Scrap: {st.scrapQty}</span>}
              </div>
            ),
          }))}
        />
      </div>

      {/* Quick Operation Reporting Form */}
      <div
        style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          paddingTop: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: token.colorText }}>
            {language === 'zh-CN' ? '现场工位快速报工 (Quick Dispatch)' : 'Quick Operation Reporting'}
          </span>
          <Tag color="blue" style={{ fontSize: 10, borderRadius: 2 }}>
            <UserOutlined style={{ marginRight: 3 }} />
            {language === 'zh-CN' ? '陈斌 (工号: M-204)' : 'Chen Bin (Op-204)'}
          </Tag>
        </div>

        <Form
          form={form}
          layout="vertical"
          size="small"
          initialValues={{ qualifiedQty: 25, scrapQty: 0, machineRunHours: 1.5, defectReason: 'NONE' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Form.Item
              name="qualifiedQty"
              label={language === 'zh-CN' ? '本次合格数 (Qualified)' : 'Qualified Output'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} max={1000} style={{ width: '100%' }} suffix="pcs" />
            </Form.Item>

            <Form.Item
              name="scrapQty"
              label={language === 'zh-CN' ? '报废数 (Defect/Scrap)' : 'Scrap Qty'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} max={500} style={{ width: '100%' }} suffix="pcs" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
            <Form.Item
              name="defectReason"
              label={language === 'zh-CN' ? '不良原因代码 (Defect Code)' : 'Defect Reason'}
            >
              <Select
                options={[
                  { value: 'NONE', label: language === 'zh-CN' ? '无异常 (Normal)' : 'None (Normal)' },
                  { value: 'POROSITY', label: language === 'zh-CN' ? '铸造气孔 (Porosity)' : 'Porosity Defect' },
                  { value: 'DIMENSION', label: language === 'zh-CN' ? '尺寸超差 (Dimensional)' : 'Dimension Error' },
                  { value: 'ROUGHNESS', label: language === 'zh-CN' ? '表面光洁度不达标' : 'Surface Roughness' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="machineRunHours"
              label={language === 'zh-CN' ? '设备工时 (Hours)' : 'Run Hours'}
              rules={[{ required: true }]}
            >
              <InputNumber min={0.1} max={24} step={0.5} style={{ width: '100%' }} suffix="h" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button
              type="primary"
              icon={<ThunderboltFilled />}
              loading={submitting}
              onClick={handleReportSubmit}
              style={{ flex: 1, backgroundColor: '#1677ff' }}
            >
              {language === 'zh-CN' ? '确认提交报工' : 'Submit Dispatch Report'}
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => message.success('Printing Barcode Traveler: ' + order.orderNo)}
            >
              {language === 'zh-CN' ? '条码标签' : 'Barcode'}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};

export default OperationTrackingDrawer;
