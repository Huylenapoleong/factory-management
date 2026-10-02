import React from 'react';
import { Card, Tooltip, theme } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import type { BomAnalysis } from '../types';
import { COST_PALETTE, formatMoney, formatQty, materialName } from '../utils';

interface CostStructureCardProps {
  analysis: BomAnalysis;
  isZh: boolean;
}

const TOP_COUNT = 5;

export const CostStructureCard: React.FC<CostStructureCardProps> = ({ analysis, isZh }) => {
  const { token } = theme.useToken();
  const total = analysis.totalMaterialCost;

  const sorted = [...analysis.lines]
    .sort((a, b) => b.lineCost - a.lineCost)
    .map((line, index) => ({
      key: line.materialId,
      name: materialName(line, isZh),
      cost: line.lineCost,
      share: total > 0 ? (line.lineCost / total) * 100 : 0,
      color: COST_PALETTE[index % COST_PALETTE.length],
    }));

  const top = sorted.slice(0, TOP_COUNT);
  const rest = sorted.slice(TOP_COUNT);
  const list = rest.length > 0
    ? [
        ...top,
        {
          key: -1,
          name: isZh ? `其他 ${rest.length} 项` : `${rest.length} others`,
          cost: rest.reduce((sum, item) => sum + item.cost, 0),
          share: rest.reduce((sum, item) => sum + item.share, 0),
          color: token.colorTextQuaternary,
        },
      ]
    : top;

  const leader = sorted[0];
  const tip = leader && total > 0
    ? isZh
      ? `${leader.name} 占物料成本 ${formatQty(leader.share, 1)}%。采购价每降低 5%，本批可节省 ${formatMoney(leader.cost * 0.05)}。`
      : `${leader.name} makes up ${formatQty(leader.share, 1)}% of material cost. A 5% lower purchase price saves ${formatMoney(leader.cost * 0.05)} on this batch.`
    : isZh
      ? '物料尚未设置采购单价，无法分析成本结构。'
      : 'No purchase prices are set on these materials yet, so cost cannot be broken down.';

  return (
    <Card id="bom-cost" size="small" title={isZh ? '成本结构' : 'Cost structure'}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {isZh ? '计划' : 'For'} {formatQty(analysis.plannedQuantity)} {analysis.productUnitCode ?? 'pcs'} ·{' '}
            <strong style={{ color: token.colorText }}>{formatMoney(total)}</strong>
          </span>
          <div style={{ display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden', gap: 2, background: token.colorFillTertiary }}>
            {sorted.map((item) => (
              <Tooltip key={item.key} title={`${item.name} · ${formatQty(item.share, 1)}%`}>
                <div style={{ width: `${item.share}%`, background: item.color }} />
              </Tooltip>
            ))}
          </div>
          <div>
            {list.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                <span style={{ flexGrow: 1, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                <span className="tnum" style={{ fontSize: 12, color: token.colorTextSecondary }}>
                  {formatMoney(item.cost)}
                </span>
                <span className="tnum" style={{ width: 52, textAlign: 'right', fontWeight: 600 }}>
                  {formatQty(item.share, 1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              padding: 14,
              borderRadius: token.borderRadiusLG,
              background: token.colorPrimaryBg,
              border: `1px solid ${token.colorPrimaryBorder}`,
              display: 'flex',
              gap: 10,
            }}
          >
            <BulbOutlined style={{ color: token.colorPrimary, fontSize: 18, marginTop: 2 }} />
            <span style={{ fontSize: 13, lineHeight: 1.6 }}>{tip}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: token.borderRadiusLG, background: token.colorFillQuaternary }}>
              <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{isZh ? '成本最高物料' : 'Most expensive material'}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{leader?.name ?? '—'}</div>
            </div>
            <div style={{ padding: 12, borderRadius: token.borderRadiusLG, background: token.colorFillQuaternary }}>
              <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{isZh ? '损耗成本' : 'Scrap cost'}</div>
              <div className="tnum" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: token.colorWarning }}>
                {formatMoney(analysis.totalScrapCost)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
