import React, { useEffect } from 'react';
import { Alert, App, DatePicker, Form, InputNumber, Modal, Select } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';
import { bomService } from '@/services/bomService';
import type { BomAnalysis, BomAnalysisLine } from '../types';
import { formatDay, formatQty, materialName } from '../utils';

interface PurchaseRequestModalProps {
  line: BomAnalysisLine | null;
  analysis: BomAnalysis;
  isZh: boolean;
  onClose: () => void;
}

interface FormValues {
  supplierId: number;
  quantity: number;
  unitPrice: number;
  expectedDate: Dayjs;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({ line, analysis, isZh, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const open = line !== null;
  const needBy = dayjs(analysis.startDate);

  const suppliersQuery = useQuery({ queryKey: ['suppliers', 'active'], queryFn: bomService.getSuppliers, enabled: open });

  useEffect(() => {
    if (!line) return;
    form.setFieldsValue({
      supplierId: line.supplierId ?? undefined,
      quantity: line.orderQuantity,
      unitPrice: line.unitCost,
      expectedDate: line.leadTimeDays != null ? dayjs().add(line.leadTimeDays, 'day') : dayjs(analysis.startDate),
    });
  }, [line, form, analysis.startDate]);

  const expectedDate = Form.useWatch('expectedDate', form);
  const arrivesLate = expectedDate ? expectedDate.isAfter(needBy, 'day') : false;

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      bomService.createPurchaseOrder({
        supplierId: values.supplierId,
        orderDate: dayjs().format('YYYY-MM-DD'),
        expectedDate: values.expectedDate.format('YYYY-MM-DD'),
        note: `BOM ${analysis.bomCode} × ${formatQty(analysis.plannedQuantity)} ${analysis.productUnitCode ?? ''}`.trim(),
        items: [{ itemId: (line as BomAnalysisLine).materialId, quantity: values.quantity, unitPrice: values.unitPrice }],
      }),
    onSuccess: (po, values) => {
      const l = line as BomAnalysisLine;
      message.success(
        isZh
          ? `已创建采购单 ${po.poNo}（草稿）· ${formatQty(values.quantity)} ${l.unitCode ?? ''} ${materialName(l, isZh)} · 预计 ${values.expectedDate.format('DD/MM')} 到货`
          : `Purchase order ${po.poNo} created (draft) · ${formatQty(values.quantity)} ${l.unitCode ?? ''} ${materialName(l, isZh)} · arrives ${values.expectedDate.format('DD/MM')}`
      );
      queryClient.invalidateQueries({ queryKey: ['bom-analysis'] });
      onClose();
    },
    onError: (err: unknown) => {
      const detail = (err as { message?: string })?.message;
      message.error(detail || (isZh ? '创建采购单失败' : 'Could not create purchase order'));
    },
  });

  return (
    <Modal
      title={line ? `${isZh ? '采购' : 'Order'} ${materialName(line, isZh)}` : ''}
      open={open}
      onCancel={onClose}
      onOk={() => form.validateFields().then((values) => mutation.mutate(values))}
      okText={isZh ? '创建采购单' : 'Create purchase order'}
      cancelText={isZh ? '取消' : 'Cancel'}
      confirmLoading={mutation.isPending}
      centered
      destroyOnHidden
    >
      {line && (
        <>
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            {line.materialCode} · {isZh ? '缺口' : 'Short by'}{' '}
            <strong>
              {formatQty(line.shortageQuantity)} {line.unitCode}
            </strong>
            {line.onOrderQuantity > 0 && (
              <>
                {' '}· {isZh ? '在途' : 'already on order'} {formatQty(line.onOrderQuantity)} {line.unitCode}
              </>
            )}{' '}
            · {isZh ? '需在' : 'needed by'} <strong>{formatDay(analysis.startDate)}</strong>
          </div>
          {arrivesLate && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              title={isZh ? '预计到货晚于计划开工日期' : 'Expected arrival is after the planned start date'}
            />
          )}
          <Form form={form} layout="vertical">
            <Form.Item
              name="supplierId"
              label={isZh ? '供应商' : 'Supplier'}
              rules={[{ required: true, message: isZh ? '请选择供应商' : 'Choose a supplier' }]}
              extra={line.supplierName ? `${isZh ? '上次采购' : 'Last bought from'}: ${line.supplierName}` : isZh ? '该物料暂无采购记录' : 'No purchase history for this material yet'}
            >
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                loading={suppliersQuery.isLoading}
                options={(suppliersQuery.data ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))}
              />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <Form.Item name="quantity" label={`${isZh ? '数量' : 'Quantity'} (${line.unitCode ?? ''})`} rules={[{ required: true }]}>
                <InputNumber min={0.0001} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="unitPrice" label={isZh ? '单价' : 'Unit price'} rules={[{ required: true }]}>
                <InputNumber min={0} prefix="$" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="expectedDate" label={isZh ? '预计到货' : 'Expected arrival'} rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </Form>
        </>
      )}
    </Modal>
  );
};
