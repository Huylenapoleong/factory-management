import React from 'react';
import { Card, theme } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import type { BomAnalysis, BomAnalysisLine, BomStructureNode, CoverageStatus } from '../types';
import { formatQty, statusMeta } from '../utils';
import { ProductImagePanel } from './ProductImagePanel';

interface ProductStructureTreeProps {
  analysis: BomAnalysis;
  isZh: boolean;
  selectedId: number | null;
  onSelect: (materialId: number) => void;
}

interface Column {
  key: string;
  title: string;
  subtitle: string;
  status: { text: string; color: string };
  group?: BomStructureNode;
  parentUnit: string;
  leaves: BomStructureNode[];
}

const LEGEND: CoverageStatus[] = ['SUFFICIENT', 'LOW', 'SHORTAGE', 'MAKE'];
const HEADER_MIN_HEIGHT = 84;

const nodeName = (node: BomStructureNode, isZh: boolean) => (isZh && node.itemNameZh) || node.itemNameEn;

const countSubAssemblies = (node: BomStructureNode): number =>
  node.children.reduce((sum, child) => sum + (child.makeOrBuy === 'MAKE' ? 1 : 0) + countSubAssemblies(child), 0);

export const ProductStructureTree: React.FC<ProductStructureTreeProps> = ({ analysis, isZh, selectedId, onSelect }) => {
  const { token } = theme.useToken();
  const root = analysis.structure;
  const productUnit = analysis.productUnitCode ?? 'pcs';
  const lines = new Map<number, BomAnalysisLine>(analysis.lines.map((line) => [line.materialId, line]));
  const connector = token.colorPrimaryBorder;
  const subAssemblies = countSubAssemblies(root);

  const groups = root.children.filter((child) => child.makeOrBuy === 'MAKE');
  const direct = root.children.filter((child) => child.makeOrBuy === 'BUY');
  const directShort = direct.filter((node) => lines.get(node.itemId)?.status === 'SHORTAGE').length;

  const columns: Column[] = [
    ...groups.map((group): Column => {
      const line = lines.get(group.itemId);
      const make = group.makeQuantity ?? 0;
      const stock = formatQty(line?.availableQuantity ?? 0);
      return {
        key: `group-${group.itemId}`,
        title: nodeName(group, isZh),
        subtitle: isZh
          ? `每件成品用 ${formatQty(group.quantityPer, 4)} ${group.unitCode ?? ''}`
          : `${formatQty(group.quantityPer, 4)} ${group.unitCode ?? ''} per ${productUnit}`,
        status:
          make > 0
            ? { text: isZh ? `需自制 ${formatQty(make, 0)} · 库存 ${stock}` : `Make ${formatQty(make, 0)} · ${stock} in stock`, color: token.colorPrimary }
            : { text: isZh ? `库存 ${stock}，无需自制` : `${stock} in stock · no need to make`, color: token.colorSuccess },
        group,
        parentUnit: group.unitCode ?? '',
        leaves: group.children,
      };
    }),
    ...(direct.length > 0
      ? [
          {
            key: 'direct',
            title: isZh ? '直接装配' : 'Fitted directly',
            subtitle: isZh ? `${direct.length} 项物料直接装到成品` : `${direct.length} parts go straight into the ${productUnit}`,
            status:
              directShort > 0
                ? { text: isZh ? `${directShort} 项缺料` : `${directShort} short`, color: token.colorError }
                : { text: isZh ? '物料齐全' : 'All parts available', color: token.colorSuccess },
            parentUnit: productUnit,
            leaves: direct,
          },
        ]
      : []),
  ];

  const renderLeaf = (node: BomStructureNode, parentUnit: string, depth: number): React.ReactNode => {
    const line = lines.get(node.itemId);
    if (!line) return null;
    const meta = statusMeta(line.status, token, isZh);
    const selected = node.itemId === selectedId;
    const notNeeded = node.requiredQuantity === 0;
    const unit = node.unitCode ?? '';
    const norm = `${formatQty(node.quantityPer, 4)} ${unit}/${parentUnit}${node.scrapRate > 0 ? ` +${formatQty(node.scrapRate)}%` : ''}`;
    const isGroup = node.makeOrBuy === 'MAKE';

    return (
      <div key={`${node.itemId}-${depth}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          onClick={() => onSelect(node.itemId)}
          aria-pressed={selected}
          title={
            notNeeded
              ? `${nodeName(node, isZh)} — ${isZh ? '上级部件库存充足，本次无需此物料' : 'its parent is covered by stock, so none is needed for this plan'}`
              : nodeName(node, isZh)
          }
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '8px minmax(0, 1fr) auto',
            alignItems: 'center',
            columnGap: 8,
            rowGap: 2,
            padding: '8px 10px',
            borderRadius: token.borderRadius,
            border: `1px solid ${selected ? token.colorPrimary : token.colorBorderSecondary}`,
            boxShadow: selected ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none',
            background: token.colorBgContainer,
            color: token.colorText,
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'inherit',
            opacity: notNeeded ? 0.55 : 1,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: notNeeded ? token.colorTextQuaternary : meta.color }} />
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {nodeName(node, isZh)}
          </span>
          <span className="tnum" style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', color: notNeeded ? token.colorTextTertiary : token.colorText }}>
            {notNeeded ? '' : `${formatQty(node.requiredQuantity)} ${unit}`}
          </span>
          <span />
          <span className="tnum" style={{ gridColumn: '2 / 4', fontSize: 11, color: token.colorTextTertiary }}>
            {notNeeded ? (isZh ? `本次无需 · 定额 ${norm}` : `Not needed this time · ${norm}`) : `${isZh ? '定额' : 'norm'} ${norm}`}
          </span>
        </button>
        {isGroup && node.children.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 12, paddingLeft: 10, borderLeft: `1px dashed ${connector}` }}>
            {node.children.map((child) => renderLeaf(child, unit, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderHeader = (column: Column) => {
    const selected = column.group ? column.group.itemId === selectedId : false;
    const style: React.CSSProperties = {
      width: '100%',
      minHeight: HEADER_MIN_HEIGHT,
      boxSizing: 'border-box',
      padding: '10px 12px',
      borderRadius: token.borderRadiusLG,
      background: column.group ? token.colorPrimaryBg : token.colorFillQuaternary,
      border: `1px solid ${selected ? token.colorPrimary : column.group ? token.colorPrimaryBorder : token.colorBorder}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 3,
      textAlign: 'center',
      fontFamily: 'inherit',
      color: token.colorText,
    };
    const content = (
      <>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{column.title}</span>
        <span className="tnum" style={{ fontSize: 12, color: token.colorTextSecondary }}>
          {column.subtitle}
        </span>
        <span className="tnum" style={{ fontSize: 12, fontWeight: 600, color: column.status.color }}>
          {column.status.text}
        </span>
      </>
    );
    return column.group ? (
      <button type="button" onClick={() => onSelect(column.group!.itemId)} aria-pressed={selected} style={{ ...style, cursor: 'pointer' }}>
        {content}
      </button>
    ) : (
      <div style={style}>{content}</div>
    );
  };

  return (
    <Card
      size="small"
      title={
        <span>
          <ApartmentOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
          {isZh ? '产品结构' : 'Product structure'}
        </span>
      }
    >
      <div className="bom-structure-layout">
        <ProductImagePanel analysis={analysis} isZh={isZh} />

        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div style={{ minWidth: 'fit-content', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  borderRadius: token.borderRadiusLG,
                  background: token.colorPrimary,
                  color: token.colorTextLightSolid,
                }}
              >
                <span
                  style={{
                    minWidth: 34,
                    height: 34,
                    padding: '0 6px',
                    borderRadius: token.borderRadius,
                    background: 'rgba(255,255,255,0.18)',
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
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{(isZh && analysis.productNameZh) || analysis.productNameEn}</span>
                  <span className="tnum" style={{ fontSize: 12, opacity: 0.85 }}>
                    {isZh ? '成品' : 'Finished good'} · {formatQty(analysis.plannedQuantity)} {productUnit}
                  </span>
                </span>
              </div>

              {columns.length > 0 && <div style={{ width: 0, height: 18, borderLeft: `1px solid ${connector}` }} />}

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                {columns.map((column, index) => {
                  const first = index === 0;
                  const last = index === columns.length - 1;
                  return (
                    <div key={column.key} style={{ position: 'relative', width: 270, flexShrink: 0, padding: '18px 8px 0', boxSizing: 'border-box' }}>
                      {columns.length > 1 && (
                        <div
                          aria-hidden="true"
                          style={{ position: 'absolute', top: 0, left: first ? '50%' : 0, right: last ? '50%' : 0, borderTop: `1px solid ${connector}` }}
                        />
                      )}
                      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', height: 18, borderLeft: `1px solid ${connector}` }} />
                      {renderHeader(column)}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 0, height: 12, borderLeft: `1px dashed ${connector}` }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {column.leaves.map((leaf) => renderLeaf(leaf, column.parentUnit, 1))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 10,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              fontSize: 12,
              color: token.colorTextSecondary,
            }}
          >
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {LEGEND.filter((s) => s !== 'MAKE' || subAssemblies > 0).map((status) => {
                const meta = statusMeta(status, token, isZh);
                return (
                  <span key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                    {meta.label}
                  </span>
                );
              })}
            </div>
            <span>
              {isZh
                ? `${analysis.lines.length} 项物料 · ${subAssemblies} 个半成品 · ${analysis.levelCount} 层 · 点击查看详情`
                : `${analysis.lines.length} materials · ${subAssemblies} sub-assembl${subAssemblies === 1 ? 'y' : 'ies'} · ${analysis.levelCount} level${analysis.levelCount === 1 ? '' : 's'} · click to inspect`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
