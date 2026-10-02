import React from 'react';
import { Button, Card, DatePicker, InputNumber, Progress, Slider, theme } from 'antd';
import { MinusOutlined, PlusOutlined, InfoCircleOutlined, CheckOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { BomAnalysis, BomAnalysisLine } from '../types';
import { formatDay, formatMoney, formatQty, materialName, procurementMeta, statusMeta } from '../utils';

interface PlanningInspectorProps {
  analysis: BomAnalysis | undefined;
  isZh: boolean;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  startDate: Dayjs;
  onStartDateChange: (date: Dayjs) => void;
  selectedLine: BomAnalysisLine | null;
  onOrder: (line: BomAnalysisLine) => void;
}

const PRESETS = [50, 100, 500, 1000];
const STEP = 10;

export const PlanningInspector: React.FC<PlanningInspectorProps> = ({
  analysis,
  isZh,
  quantity,
  onQuantityChange,
  startDate,
  onStartDateChange,
  selectedLine,
  onOrder,
}) => {
  const { token } = theme.useToken();
  const unit = analysis?.productUnitCode ?? 'pcs';
  const setQty = (value: number) => onQuantityChange(Math.max(1, Math.round(value)));
  const sliderMax = Math.max(1000, Math.ceil(((analysis?.maxBuildableQuantity ?? 0) * 1.5) / 100) * 100, quantity);

  const feasible = analysis ? Math.min(analysis.maxBuildableQuantity, analysis.plannedQuantity) : 0;
  const feasPct = analysis && analysis.plannedQuantity > 0 ? Math.round((feasible / analysis.plannedQuantity) * 100) : 0;
  const ok = analysis ? analysis.shortageCount === 0 : true;
  const verdictColor = ok ? token.colorSuccess : token.colorError;
  const bottleneck = analysis ? (isZh && analysis.bottleneckMaterialNameZh) || analysis.bottleneckMaterialNameEn : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card size="small" styles={{ body: { display: 'flex', flexDirection: 'column', gap: 12, padding: 14 } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: token.colorTextSecondary }}>
            {isZh ? '生产计划' : 'Production plan'}
          </span>
          <span style={{ fontSize: 12, color: token.colorTextTertiary }}>
            {isZh ? '单位' : 'unit'}: {unit}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button shape="circle" icon={<MinusOutlined />} aria-label={isZh ? '减少' : 'Decrease'} onClick={() => setQty(quantity - STEP)} disabled={quantity <= 1} />
          <InputNumber
            variant="borderless"
            min={1}
            max={1000000}
            precision={0}
            value={quantity}
            onChange={(v) => typeof v === 'number' && setQty(v)}
            className="bom-qty-input tnum"
            style={{ flexGrow: 1 }}
            controls={false}
            aria-label={isZh ? '计划数量' : 'Planned quantity'}
          />
          <Button shape="circle" icon={<PlusOutlined />} aria-label={isZh ? '增加' : 'Increase'} onClick={() => setQty(quantity + STEP)} />
        </div>

        <Slider
          min={1}
          max={sliderMax}
          step={STEP}
          value={quantity}
          onChange={(v) => setQty(v)}
          tooltip={{ formatter: (v) => `${formatQty(v ?? 0, 0)} ${unit}` }}
          style={{ margin: '0 4px' }}
          aria-label={isZh ? '计划数量滑块' : 'Planned quantity slider'}
        />

        <div role="group" aria-label={isZh ? '快速数量' : 'Quick quantity'} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
          {PRESETS.map((q) => (
            <Button key={q} size="small" type={q === quantity ? 'primary' : 'default'} ghost={q === quantity} onClick={() => setQty(q)}>
              {formatQty(q, 0)}
            </Button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{isZh ? '计划开工' : 'Production starts'}</span>
          <DatePicker
            size="small"
            allowClear={false}
            value={startDate}
            onChange={(d) => d && onStartDateChange(d)}
            format="DD/MM/YYYY"
            style={{ width: 140 }}
          />
        </div>

        {analysis && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${ok ? token.colorSuccessBorder : token.colorErrorBorder}`,
                background: ok ? token.colorSuccessBg : token.colorErrorBg,
              }}
            >
              <Progress
                type="circle"
                size={60}
                percent={feasPct}
                strokeColor={verdictColor}
                format={(p) => <span className="tnum" style={{ fontSize: 13, fontWeight: 600, color: token.colorText }}>{p}%</span>}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: verdictColor }}>
                  {ok
                    ? isZh ? '物料齐套' : 'All materials available'
                    : isZh ? `缺 ${analysis.shortageCount} 种物料` : `${analysis.shortageCount} material${analysis.shortageCount > 1 ? 's' : ''} short`}
                </span>
                <span style={{ fontSize: 12, lineHeight: 1.5, color: token.colorText }}>
                  {isZh ? '可生产' : 'Can build'} <strong className="tnum">{formatQty(analysis.maxBuildableQuantity, 0)}</strong> {unit}
                  {bottleneck ? ` · ${isZh ? '瓶颈' : 'limited by'} ${bottleneck}` : ''}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              <Tile label={isZh ? '物料总成本' : 'Material cost'} value={formatMoney(analysis.totalMaterialCost)} />
              <Tile label={`${isZh ? '物料成本' : 'Material cost'} / ${unit}`} value={formatMoney(analysis.costPerUnit)} />
            </div>
          </>
        )}
      </Card>

      <Card size="small" styles={{ body: { padding: 14 } }}>
        {selectedLine && analysis ? (
          <MaterialDetail line={selectedLine} analysis={analysis} isZh={isZh} onOrder={onOrder} />
        ) : (
          <div style={{ display: 'flex', gap: 8, color: token.colorTextSecondary, fontSize: 13 }}>
            <InfoCircleOutlined style={{ marginTop: 3 }} />
            <span>{isZh ? '在结构图或表格中点击一项物料以查看详情。' : 'Click a material in the structure or table to see its details.'}</span>
          </div>
        )}
      </Card>
    </div>
  );
};

const Tile: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { token } = theme.useToken();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 10, borderRadius: token.borderRadius, background: token.colorFillQuaternary }}>
      <span style={{ fontSize: 11, color: token.colorTextSecondary }}>{label}</span>
      <span className="tnum" style={{ fontSize: 14, fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
};

const MaterialDetail: React.FC<{
  line: BomAnalysisLine;
  analysis: BomAnalysis;
  isZh: boolean;
  onOrder: (line: BomAnalysisLine) => void;
}> = ({ line, analysis, isZh, onOrder }) => {
  const { token } = theme.useToken();
  const meta = statusMeta(line.status, token, isZh);
  const proc = procurementMeta(line, token, isZh);
  const unit = line.unitCode ?? '';
  const productUnit = analysis.productUnitCode ?? 'pcs';
  const index = analysis.lines.findIndex((l) => l.bomItemId === line.bomItemId) + 1;

  const facts: Array<{ label: string; value: string; color?: string; strong?: boolean }> = [
    { label: isZh ? '定额' : 'Norm', value: `${formatQty(line.unitQuantity, 4)} ${unit}/${productUnit}` },
    { label: isZh ? '损耗' : 'Scrap', value: `${formatQty(line.scrapRate)}%` },
    { label: isZh ? '本单需求' : 'Needed for plan', value: `${formatQty(line.requiredQuantity)} ${unit}` },
    { label: isZh ? '库存' : 'In stock', value: `${formatQty(line.availableQuantity)} ${unit}` },
    {
      label: isZh ? '缺口' : 'Short',
      value: `${formatQty(Math.ceil(line.shortageQuantity), 0)} ${unit}`,
      color: line.shortageQuantity > 0 ? token.colorError : token.colorSuccess,
      strong: true,
    },
    { label: isZh ? '单价' : 'Unit price', value: `${formatMoney(line.unitCost)} / ${unit}` },
  ];

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: isZh ? '需要日期' : 'Needed from', value: formatDay(analysis.startDate) },
    {
      label: isZh ? '采购期限' : 'Order deadline',
      value: <span style={{ color: proc.color, fontWeight: 700 }}>{proc.label}</span>,
    },
    {
      label: isZh ? '供应商' : 'Supplier',
      value: line.supplierName
        ? `${line.supplierName}${line.leadTimeDays != null ? ` · ${line.leadTimeDays} ${isZh ? '天' : 'days'}` : ''}`
        : isZh ? '暂无采购记录' : 'No purchase history',
    },
  ];
  if (line.onOrderQuantity > 0) {
    rows.push({ label: isZh ? '在途' : 'On order', value: `${formatQty(line.onOrderQuantity)} ${unit}` });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span
          className="tnum"
          style={{
            width: 34,
            height: 34,
            borderRadius: token.borderRadius,
            background: meta.bg,
            border: `1px solid ${meta.color}`,
            color: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {index}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flexGrow: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>{materialName(line, isZh)}</span>
          <span style={{ fontSize: 11, color: token.colorTextTertiary, fontFamily: 'ui-monospace, Menlo, monospace' }}>{line.materialCode}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, color: meta.color, background: meta.bg, whiteSpace: 'nowrap' }}>
          {meta.label}
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: token.colorTextSecondary }}>{isZh ? '库存满足率' : 'Stock coverage'}</span>
          <strong className="tnum">{formatQty(line.coveragePercent, 0)}%</strong>
        </div>
        <Progress percent={line.coveragePercent} showInfo={false} strokeColor={meta.color} size="small" />
      </div>

      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {facts.map((f) => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <dt style={{ fontSize: 11, color: token.colorTextSecondary }}>{f.label}</dt>
            <dd className="tnum" style={{ margin: 0, fontSize: 13, fontWeight: f.strong ? 700 : 600, color: f.color }}>
              {f.value}
            </dd>
          </div>
        ))}
      </dl>

      <div style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadius, fontSize: 12 }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 10px',
              borderTop: i === 0 ? 'none' : `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <span style={{ color: token.colorTextSecondary, whiteSpace: 'nowrap' }}>{r.label}</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {line.procurementStatus === 'TO_ORDER' && (
        <Button type="primary" danger block size="large" icon={<ShoppingCartOutlined />} onClick={() => onOrder(line)}>
          {isZh ? '采购' : 'Order'} {formatQty(line.orderQuantity, 0)} {unit}
        </Button>
      )}
      {line.procurementStatus === 'ORDERED' && (
        <div
          style={{
            height: 40,
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorSuccessBorder}`,
            background: token.colorSuccessBg,
            color: token.colorSuccess,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <CheckOutlined /> {proc.label}
        </div>
      )}
    </div>
  );
};
