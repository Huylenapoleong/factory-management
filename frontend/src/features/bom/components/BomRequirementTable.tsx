import React from 'react';
import { Button, Card, Progress, Segmented, Table, Tag, Tooltip, theme } from 'antd';
import type { TableColumnsType } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { BomAnalysis, BomAnalysisLine, CoverageFilter } from '../types';
import { formatMoney, formatQty, itemNameByCode, materialName, procurementMeta, statusMeta } from '../utils';

interface BomRequirementTableProps {
  analysis: BomAnalysis;
  isZh: boolean;
  filter: CoverageFilter;
  onFilterChange: (filter: CoverageFilter) => void;
  selectedId: number | null;
  onSelect: (materialId: number) => void;
  loading: boolean;
}

const csvCell = (value: string | number): string => `"${String(value).replace(/"/g, '""')}"`;

const exportCsv = (analysis: BomAnalysis, isZh: boolean) => {
  const header = isZh
    ? ['序号', '层级', '物料编码', '物料名称', '来源', '用于', '单位', '单件用量', '损耗率%', '需求量', '可用库存', '缺口', '满足率%', '状态', '单价', '金额']
    : ['#', 'Level', 'Material code', 'Material', 'Source', 'Used in', 'Unit', 'Qty per unit', 'Scrap %', 'Required', 'Available', 'Shortage', 'Coverage %', 'Status', 'Unit cost', 'Amount'];
  const rows = analysis.lines.map((line, index) => [
    index + 1,
    line.level,
    line.materialCode,
    materialName(line, isZh),
    line.makeOrBuy,
    line.usedIn.join(' / '),
    line.unitCode ?? '',
    line.unitQuantity,
    line.scrapRate,
    line.requiredQuantity,
    line.availableQuantity,
    line.shortageQuantity,
    line.coveragePercent,
    line.status,
    line.unitCost,
    line.lineCost,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${analysis.bomCode}_x${analysis.plannedQuantity}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const BomRequirementTable: React.FC<BomRequirementTableProps> = ({
  analysis,
  isZh,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
  loading,
}) => {
  const { token } = theme.useToken();
  const rows = filter === 'ALL' ? analysis.lines : analysis.lines.filter((line) => line.status === filter);

  const columns: TableColumnsType<BomAnalysisLine> = [
    {
      title: '#',
      key: 'index',
      width: 44,
      render: (_, line) => (
        <span style={{ color: token.colorTextTertiary }} className="tnum">
          {analysis.lines.indexOf(line) + 1}
        </span>
      ),
    },
    {
      title: isZh ? '物料' : 'Material',
      key: 'material',
      render: (_, line) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusMeta(line.status, token, isZh).color, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontWeight: 500, lineHeight: 1.35 }}>{materialName(line, isZh)}</span>
            <span style={{ fontSize: 11, color: token.colorTextTertiary, fontFamily: 'ui-monospace, Menlo, monospace' }}>
              {line.materialCode}
            </span>
            {line.usedIn.some((code) => code !== analysis.productCode) && (
              <span style={{ fontSize: 11, color: token.colorPrimary }}>
                ↳ {isZh ? '用于' : 'used in'} {line.usedIn.map((code) => itemNameByCode(analysis, code, isZh)).join(', ')}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '需求量' : 'Required',
      key: 'required',
      align: 'right',
      width: 120,
      render: (_, line) => (
        <Tooltip
          title={
            line.usedIn.some((code) => code !== analysis.productCode)
              ? isZh
                ? '含半成品部件的用量；半成品已先扣除自身库存，只为需自制的部分计算物料'
                : 'Includes use inside sub-assemblies; their own stock is used first, so only the part still to be made needs this material'
              : `${formatQty(line.unitQuantity, 4)} ${line.unitCode ?? ''} × ${formatQty(analysis.plannedQuantity)}${
                  line.scrapRate > 0 ? ` + ${formatQty(line.scrapRate)}% ${isZh ? '损耗' : 'scrap'}` : ''
                }`
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} className="tnum">
            <span style={{ fontWeight: 600 }}>
              {formatQty(line.requiredQuantity)} <span style={{ fontWeight: 400, fontSize: 11, color: token.colorTextTertiary }}>{line.unitCode}</span>
            </span>
            <span style={{ fontSize: 11, color: token.colorTextTertiary }}>
              {formatQty(line.unitQuantity, 4)}/{isZh ? '件' : 'unit'}
              {line.scrapRate > 0 ? ` · +${formatQty(line.scrapRate)}%` : ''}
            </span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: isZh ? '可用库存' : 'In stock',
      key: 'available',
      align: 'right',
      width: 100,
      render: (_, line) => (
        <span className="tnum" style={{ color: token.colorTextSecondary }}>
          {formatQty(line.availableQuantity)}
        </span>
      ),
    },
    {
      title: isZh ? '满足率' : 'Coverage',
      key: 'coverage',
      width: 140,
      render: (_, line) => (
        <Progress
          percent={line.coveragePercent}
          size="small"
          strokeColor={statusMeta(line.status, token, isZh).color}
          format={(p) => <span className="tnum">{formatQty(p ?? 0, 0)}%</span>}
        />
      ),
    },
    {
      title: isZh ? '状态' : 'Status',
      key: 'status',
      width: 160,
      render: (_, line) => {
        if (line.status === 'MAKE') {
          const proc = procurementMeta(line, token, isZh);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Tag color={token.colorPrimary} variant="outlined" style={{ background: token.colorPrimaryBg, borderRadius: 999, width: 'fit-content' }}>
                {statusMeta('MAKE', token, isZh).label}
              </Tag>
              <span style={{ fontSize: 11, fontWeight: 600, color: proc.color }}>{proc.label}</span>
            </div>
          );
        }
        if (line.status !== 'SHORTAGE') {
          const meta = statusMeta(line.status, token, isZh);
          return (
            <Tag color={meta.color} variant="outlined" style={{ background: meta.bg, borderRadius: 999 }}>
              {meta.label}
            </Tag>
          );
        }
        const proc = procurementMeta(line, token, isZh);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Tag color={token.colorError} variant="outlined" style={{ background: token.colorErrorBg, borderRadius: 999, width: 'fit-content' }}>
              {isZh ? '缺' : 'Short'} {formatQty(Math.ceil(line.shortageQuantity), 0)} {line.unitCode ?? ''}
            </Tag>
            <span style={{ fontSize: 11, fontWeight: 600, color: proc.color }}>{proc.label}</span>
          </div>
        );
      },
    },
    {
      title: isZh ? '金额' : 'Amount',
      key: 'cost',
      align: 'right',
      width: 120,
      render: (_, line) => (
        <Tooltip title={`${formatMoney(line.unitCost)} / ${line.unitCode ?? (isZh ? '单位' : 'unit')}`}>
          <span className="tnum">{formatMoney(line.lineCost)}</span>
        </Tooltip>
      ),
    },
  ];

  const filterOptions: Array<{ value: CoverageFilter; label: string }> = [
    { value: 'ALL', label: `${isZh ? '全部' : 'All'} (${analysis.lines.length})` },
    { value: 'SHORTAGE', label: `${isZh ? '缺料' : 'Shortage'} (${analysis.shortageCount})` },
    ...(analysis.makeCount > 0
      ? [{ value: 'MAKE' as CoverageFilter, label: `${isZh ? '自制' : 'Make'} (${analysis.makeCount})` }]
      : []),
    { value: 'LOW', label: `${isZh ? '偏低' : 'Low'} (${analysis.lowCount})` },
    { value: 'SUFFICIENT', label: `${isZh ? '充足' : 'OK'} (${analysis.sufficientCount})` },
  ];

  return (
    <Card
      id="bom-requirements"
      size="small"
      title={isZh ? '物料定额' : 'Material norms'}
      extra={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Segmented size="small" value={filter} onChange={(v) => onFilterChange(v as CoverageFilter)} options={filterOptions} />
          <Button size="small" icon={<DownloadOutlined />} onClick={() => exportCsv(analysis, isZh)}>
            {isZh ? '导出' : 'Export'}
          </Button>
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Table<BomAnalysisLine>
        size="middle"
        rowKey="materialId"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        scroll={{ x: 820 }}
        onRow={(line) => ({
          onClick: () => onSelect(line.materialId),
          style: {
            cursor: 'pointer',
            background: line.materialId === selectedId ? token.colorPrimaryBg : undefined,
          },
        })}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={6}>
              <span style={{ color: token.colorTextSecondary }}>
                {isZh ? '合计' : 'Total'} · {formatQty(analysis.plannedQuantity)} {analysis.productUnitCode ?? 'pcs'}
              </span>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="right">
              <strong className="tnum" style={{ fontSize: 15 }}>
                {formatMoney(analysis.totalMaterialCost)}
              </strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
};
