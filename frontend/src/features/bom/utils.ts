import type { GlobalToken } from 'antd';
import dayjs from 'dayjs';
import type { BomAnalysisLine, CoverageStatus } from './types';

export const COST_PALETTE = ['#1677ff', '#13c2c2', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#fa8c16', '#2f54eb'];

export const formatQty = (value: number, maxFractionDigits = 2): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits });

export const formatMoney = (value: number): string =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDay = (date?: string | null): string => (date ? dayjs(date).format('DD/MM') : '—');

export const materialName = (line: BomAnalysisLine, isZh: boolean): string =>
  (isZh && line.materialNameZh) || line.materialNameEn;

export const statusMeta = (status: CoverageStatus, token: GlobalToken, isZh: boolean) => {
  switch (status) {
    case 'SHORTAGE':
      return { color: token.colorError, bg: token.colorErrorBg, label: isZh ? '缺料' : 'Shortage' };
    case 'LOW':
      return { color: token.colorWarning, bg: token.colorWarningBg, label: isZh ? '低于安全库存' : 'Low stock' };
    default:
      return { color: token.colorSuccess, bg: token.colorSuccessBg, label: isZh ? '充足' : 'Sufficient' };
  }
};

export const procurementMeta = (line: BomAnalysisLine, token: GlobalToken, isZh: boolean) => {
  if (line.procurementStatus === 'COVERED') {
    return { label: isZh ? '库存充足' : 'In stock', color: token.colorSuccess, bg: token.colorSuccessBg };
  }
  if (line.procurementStatus === 'ORDERED') {
    const arrive = line.expectedArrivalDate ? ` · ${isZh ? '预计' : 'arrives'} ${formatDay(line.expectedArrivalDate)}` : '';
    return line.urgency === 'LATE'
      ? { label: `${isZh ? '已下单，晚于开工' : 'Ordered, arrives late'}${arrive}`, color: token.colorWarning, bg: token.colorWarningBg }
      : { label: `${isZh ? '已下单' : 'Ordered'}${arrive}`, color: token.colorSuccess, bg: token.colorSuccessBg };
  }
  if (line.urgency === 'LATE') {
    return { label: isZh ? '紧急' : 'Urgent', color: token.colorError, bg: token.colorErrorBg };
  }
  if (line.urgency === 'TODAY') {
    return { label: isZh ? '今天下单' : 'Order today', color: token.colorError, bg: token.colorErrorBg };
  }
  const prefix = line.leadTimeDays == null ? (isZh ? '需在此前到货' : 'Needed by') : isZh ? '下单截止' : 'Order by';
  return {
    label: `${prefix} ${formatDay(line.orderByDate)}`,
    color: token.colorWarning,
    bg: token.colorWarningBg,
  };
};
