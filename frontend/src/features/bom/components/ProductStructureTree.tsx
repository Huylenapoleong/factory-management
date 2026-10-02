import React from 'react';
import { Card, theme } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import type { BomAnalysis } from '../types';
import { formatQty, materialName, statusMeta } from '../utils';

interface ProductStructureTreeProps {
  analysis: BomAnalysis;
  isZh: boolean;
  selectedId: number | null;
  onSelect: (bomItemId: number) => void;
}

const MAX_COLUMNS = 4;

export const ProductStructureTree: React.FC<ProductStructureTreeProps> = ({ analysis, isZh, selectedId, onSelect }) => {
  const { token } = theme.useToken();
  const lines = analysis.lines;
  const columns = Math.max(1, Math.min(lines.length, MAX_COLUMNS));
  const barWidth = columns > 1 ? ((columns - 1) / columns) * 100 : 0;
  const connector = token.colorPrimaryBorder;

  const legend: Array<{ status: 'SUFFICIENT' | 'LOW' | 'SHORTAGE' }> = [
    { status: 'SUFFICIENT' },
    { status: 'LOW' },
    { status: 'SHORTAGE' },
  ];

  return (
    <Card
      size="small"
      title={
        <span>
          <ApartmentOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
          {isZh ? '产品结构' : 'Product structure'}
        </span>
      }
      extra={
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: token.colorTextSecondary }}>
          {legend.map(({ status }) => {
            const meta = statusMeta(status, token, isZh);
            return (
              <span key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                {meta.label}
              </span>
            );
          })}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 4px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            borderRadius: token.borderRadiusLG,
            background: token.colorPrimaryBg,
            border: `1px solid ${token.colorPrimaryBorder}`,
          }}
        >
          <span
            style={{
              minWidth: 34,
              height: 34,
              padding: '0 6px',
              borderRadius: token.borderRadius,
              background: token.colorPrimary,
              color: token.colorTextLightSolid,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {analysis.productCode.slice(0, 6)}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: token.colorText }}>
              {(isZh && analysis.productNameZh) || analysis.productNameEn}
            </span>
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              {isZh ? '成品' : 'Finished good'} · {formatQty(analysis.plannedQuantity)} {analysis.productUnitCode ?? 'pcs'}
            </span>
          </span>
        </div>

        {lines.length > 0 && (
          <>
            <div style={{ width: 0, height: 18, borderLeft: `1px solid ${connector}` }} />
            {barWidth > 0 && <div style={{ width: `${barWidth}%`, height: 0, borderTop: `1px solid ${connector}` }} />}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: '14px 12px',
              }}
              className="bom-tree-grid"
            >
              {lines.map((line) => {
                const meta = statusMeta(line.status, token, isZh);
                const selected = line.bomItemId === selectedId;
                return (
                  <div key={line.bomItemId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 0, height: 14, borderLeft: `1px solid ${connector}` }} />
                    <button
                      type="button"
                      onClick={() => onSelect(line.bomItemId)}
                      aria-pressed={selected}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: '10px 12px',
                        borderRadius: token.borderRadiusLG,
                        border: `1px solid ${selected ? token.colorPrimary : token.colorBorderSecondary}`,
                        boxShadow: selected ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none',
                        background: token.colorBgContainer,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: token.colorText,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={materialName(line, isZh)}
                        >
                          {materialName(line, isZh)}
                        </span>
                      </span>
                      <span style={{ fontSize: 11, color: token.colorTextTertiary, fontFamily: 'ui-monospace, Menlo, monospace' }}>
                        {line.materialCode}
                      </span>
                      <span style={{ fontSize: 12, color: meta.color, fontWeight: 600 }} className="tnum">
                        {formatQty(line.unitQuantity, 4)} {line.unitCode} / {isZh ? '件' : 'unit'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
