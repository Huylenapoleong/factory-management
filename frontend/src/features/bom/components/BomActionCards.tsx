import React from 'react';
import { Badge, Button, Card, theme } from 'antd';
import {
  ShoppingCartOutlined,
  EyeOutlined,
  CheckOutlined,
  ScissorOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { BomAnalysis, BomAnalysisLine } from '../types';
import { formatDay, formatQty, materialName } from '../utils';

interface BomActionCardsProps {
  analysis: BomAnalysis;
  isZh: boolean;
  onSelect: (materialId: number) => void;
  onOrder: (line: BomAnalysisLine) => void;
  onUseMaxQuantity: () => void;
  onShowAllShortages: () => void;
}

interface TodoCard {
  key: string;
  icon: React.ReactNode;
  color: string;
  soft: string;
  highlight: boolean;
  value: string;
  unit: string;
  label: string;
  chip?: { text: string; color: string; bg: string };
  action?: { text: string; onClick: () => void; primary?: boolean };
  doneText?: string;
  idleText?: string;
  onClick?: () => void;
}

const MAX_CARDS = 4;

const byUrgency = (a: BomAnalysisLine, b: BomAnalysisLine) => {
  const ordered = Number(a.procurementStatus === 'ORDERED') - Number(b.procurementStatus === 'ORDERED');
  if (ordered !== 0) return ordered;
  return (a.orderByDate ?? '').localeCompare(b.orderByDate ?? '');
};

export const BomActionCards: React.FC<BomActionCardsProps> = ({
  analysis,
  isZh,
  onSelect,
  onOrder,
  onUseMaxQuantity,
  onShowAllShortages,
}) => {
  const { token } = theme.useToken();
  const productUnit = analysis.productUnitCode ?? 'pcs';
  const cards: TodoCard[] = [];

  analysis.lines
    .filter((line) => line.makeOrBuy === 'BUY' && line.shortageQuantity > 0)
    .sort(byUrgency)
    .forEach((line) => {
      const ordered = line.procurementStatus === 'ORDERED';
      const urgent = !ordered && (line.urgency === 'LATE' || line.urgency === 'TODAY');
      const chip = ordered
        ? { text: formatDay(line.expectedArrivalDate), color: line.urgency === 'LATE' ? token.colorWarning : token.colorSuccess, bg: line.urgency === 'LATE' ? token.colorWarningBg : token.colorSuccessBg }
        : urgent
          ? { text: line.urgency === 'TODAY' ? (isZh ? '今天' : 'Today') : (isZh ? '紧急' : 'Urgent'), color: token.colorError, bg: token.colorErrorBg }
          : { text: formatDay(line.orderByDate), color: token.colorWarning, bg: token.colorWarningBg };

      cards.push({
        key: `buy-${line.materialId}`,
        icon: <ShoppingCartOutlined />,
        color: ordered ? token.colorSuccess : token.colorError,
        soft: ordered ? token.colorSuccessBg : token.colorErrorBg,
        highlight: urgent,
        value: formatQty(ordered ? Math.ceil(line.shortageQuantity) : line.orderQuantity, 0),
        unit: line.unitCode ?? '',
        label: materialName(line, isZh),
        chip,
        action: ordered ? undefined : { text: isZh ? '下单采购' : 'Order', onClick: () => onOrder(line), primary: true },
        doneText: ordered ? (isZh ? '已下单' : 'Ordered') : undefined,
        onClick: () => onSelect(line.materialId),
      });
    });

  analysis.lines
    .filter((line) => line.procurementStatus === 'TO_MAKE')
    .forEach((line) => {
      cards.push({
        key: `make-${line.materialId}`,
        icon: <ToolOutlined />,
        color: token.colorPrimary,
        soft: token.colorPrimaryBg,
        highlight: false,
        value: formatQty(line.toMakeQuantity, 0),
        unit: line.unitCode ?? '',
        label: materialName(line, isZh),
        idleText: isZh ? '按子BOM自制' : 'Make in-house from sub-BOM',
        onClick: () => onSelect(line.materialId),
      });
    });

  if (analysis.shortageCount > 0 && analysis.maxBuildableQuantity > 0 && analysis.maxBuildableQuantity < analysis.plannedQuantity) {
    cards.push({
      key: 'split',
      icon: <ScissorOutlined />,
      color: token.colorPrimary,
      soft: token.colorPrimaryBg,
      highlight: false,
      value: formatQty(analysis.maxBuildableQuantity, 0),
      unit: productUnit,
      label: isZh ? '先生产（现有库存可满足）' : 'Build first with current stock',
      action: { text: isZh ? '应用' : 'Apply', onClick: onUseMaxQuantity },
    });
  }

  analysis.lines
    .filter((line) => line.status === 'LOW')
    .forEach((line) => {
      cards.push({
        key: `watch-${line.materialId}`,
        icon: <EyeOutlined />,
        color: token.colorWarning,
        soft: token.colorWarningBg,
        highlight: false,
        value: formatQty(line.surplusQuantity),
        unit: line.unitCode ?? '',
        label: `${materialName(line, isZh)} · ${isZh ? '剩余' : 'left after use'}`,
        idleText: isZh ? '关注（低于安全库存）' : 'Watch — below safety stock',
        onClick: () => onSelect(line.materialId),
      });
    });

  if (cards.length === 0) {
    cards.push({
      key: 'ok',
      icon: <CheckOutlined />,
      color: token.colorSuccess,
      soft: token.colorSuccessBg,
      highlight: false,
      value: '100',
      unit: '%',
      label: isZh ? '物料齐套' : 'All materials available',
      idleText: isZh ? '可以开工' : 'Ready to produce',
    });
  }

  const visible = cards.slice(0, MAX_CARDS);
  const hidden = cards.length - visible.length;

  return (
    <section aria-labelledby="todo-heading" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 id="todo-heading" style={{ margin: 0, fontSize: 13, fontWeight: 600, color: token.colorTextSecondary }}>
          {isZh ? '待办事项' : 'To do'}
        </h2>
        {analysis.toOrderCount > 0 && <Badge count={analysis.toOrderCount} color={token.colorError} />}
        <div style={{ flexGrow: 1, height: 1, background: token.colorBorderSecondary }} />
        {hidden > 0 && (
          <Button type="link" size="small" onClick={onShowAllShortages} style={{ padding: 0 }}>
            {isZh ? `还有 ${hidden} 项` : `${hidden} more`} <ArrowRightOutlined />
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        {visible.map((card) => (
          <Card
            key={card.key}
            size="small"
            hoverable={!!card.onClick}
            onClick={card.onClick}
            style={{ borderColor: card.highlight ? card.color : undefined }}
            styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12, padding: 14 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: card.soft,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                {card.icon}
              </span>
              {card.chip && (
                <span
                  className="tnum"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    height: 24,
                    padding: '0 9px',
                    borderRadius: 999,
                    background: card.chip.bg,
                    color: card.chip.color,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <CalendarOutlined /> {card.chip.text}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="tnum" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.1, color: token.colorText }}>
                  {card.value}
                </span>
                <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{card.unit}</span>
              </div>
              <div
                title={card.label}
                style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {card.label}
              </div>
            </div>
            {card.action ? (
              <Button
                size="small"
                type={card.action.primary ? 'primary' : 'default'}
                danger={card.action.primary}
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
                onClick={(e) => {
                  e.stopPropagation();
                  card.action?.onClick();
                }}
              >
                {card.action.text}
              </Button>
            ) : card.doneText ? (
              <span style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 999, background: token.colorSuccessBg, color: token.colorSuccess, fontSize: 12, fontWeight: 600 }}>
                <CheckOutlined /> {card.doneText}
              </span>
            ) : (
              <span style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: token.colorTextTertiary }}>
                {card.idleText}
              </span>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};
