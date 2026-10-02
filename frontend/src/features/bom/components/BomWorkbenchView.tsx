import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Result, Select, Skeleton, Tag, theme } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { useAppStore } from '@/stores/useAppStore';
import { bomService } from '@/services/bomService';
import type { BomAnalysis, BomAnalysisLine, CoverageFilter } from '../types';
import { BomActionCards } from './BomActionCards';
import { ProductStructureTree } from './ProductStructureTree';
import { BomRequirementTable } from './BomRequirementTable';
import { CostStructureCard } from './CostStructureCard';
import { PlanningInspector } from './PlanningInspector';
import { ReleaseOrderModal } from './ReleaseOrderModal';
import { PurchaseRequestModal } from './PurchaseRequestModal';

const DEFAULT_QUANTITY = 100;
const QUANTITY_DEBOUNCE_MS = 300;
const DEFAULT_LEAD_DAYS = 7;

const defaultSelection = (analysis: BomAnalysis): number | null => {
  const toOrder = analysis.lines
    .filter((line) => line.procurementStatus === 'TO_ORDER')
    .sort((a, b) => (a.orderByDate ?? '').localeCompare(b.orderByDate ?? ''));
  return toOrder[0]?.bomItemId ?? analysis.bottleneckBomItemId ?? analysis.lines[0]?.bomItemId ?? null;
};

export const BomWorkbenchView: React.FC = () => {
  const { token } = theme.useToken();
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';
  const [searchParams, setSearchParams] = useSearchParams();

  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
  const [debouncedQuantity, setDebouncedQuantity] = useState(DEFAULT_QUANTITY);
  const [filter, setFilter] = useState<CoverageFilter>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs>(() => dayjs().add(DEFAULT_LEAD_DAYS, 'day').startOf('day'));
  const [purchaseLine, setPurchaseLine] = useState<BomAnalysisLine | null>(null);
  const startDateParam = startDate.format('YYYY-MM-DD');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuantity(quantity), QUANTITY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [quantity]);

  const bomsQuery = useQuery({ queryKey: ['boms'], queryFn: bomService.getBoms });
  const boms = useMemo(() => bomsQuery.data ?? [], [bomsQuery.data]);

  const paramId = Number(searchParams.get('bomId'));
  const bomId = boms.some((b) => b.id === paramId)
    ? paramId
    : (boms.find((b) => b.status === 'ACTIVE') ?? boms[0])?.id;

  const analysisQuery = useQuery({
    queryKey: ['bom-analysis', bomId, debouncedQuantity, startDateParam],
    queryFn: () => bomService.getAnalysis(bomId as number, debouncedQuantity, startDateParam),
    enabled: bomId !== undefined,
    placeholderData: keepPreviousData,
  });
  const analysis = analysisQuery.data;
  const effectiveSelectedId = analysis?.lines.some((line) => line.bomItemId === selectedId)
    ? selectedId
    : analysis
      ? defaultSelection(analysis)
      : null;
  const selectedLine = analysis?.lines.find((line) => line.bomItemId === effectiveSelectedId) ?? null;

  const selectBom = (id: number) => {
    setSearchParams({ bomId: String(id) });
    setSelectedId(null);
    setFilter('ALL');
  };

  const applyFilter = (next: CoverageFilter) => {
    setFilter(next);
    document.getElementById('bom-requirements')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (bomsQuery.isError) {
    return (
      <Result
        status="error"
        title={isZh ? '无法加载物料清单' : 'Could not load bills of materials'}
        extra={<Button onClick={() => bomsQuery.refetch()}>{isZh ? '重试' : 'Retry'}</Button>}
      />
    );
  }

  if (bomsQuery.isSuccess && boms.length === 0) {
    return (
      <Card>
        <Empty description={isZh ? '尚未建立任何产品的物料清单' : 'No product has a bill of materials yet'} />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card size="small" styles={{ body: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 14px' } }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, minWidth: 260 }}>
          <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{isZh ? '产品与物料定额' : 'Product & material norms'}</span>
          <Select
            size="large"
            variant="borderless"
            loading={bomsQuery.isLoading}
            value={bomId}
            onChange={selectBom}
            showSearch={{ optionFilterProp: 'search' }}
            style={{ maxWidth: 520, marginLeft: -11, fontWeight: 600 }}
            aria-label={isZh ? '选择产品' : 'Choose product'}
            options={boms.map((bom) => ({
              value: bom.id,
              search: `${bom.productCode} ${bom.productNameEn} ${bom.code}`,
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{bom.productNameEn}</span>
                  <span style={{ fontSize: 12, color: token.colorTextTertiary, fontWeight: 400 }}>
                    {bom.productCode} · v{bom.version} · {bom.itemCount} {isZh ? '项物料' : 'materials'}
                  </span>
                  {bom.status !== 'ACTIVE' && <Tag style={{ marginInlineEnd: 0 }}>{bom.status}</Tag>}
                </span>
              ),
            }))}
          />
        </div>
        {analysis && (
          <Tag color={analysis.status === 'ACTIVE' ? 'success' : 'default'} style={{ marginInlineEnd: 0 }}>
            {analysis.bomCode} · {analysis.status === 'ACTIVE' ? (isZh ? '生效中' : 'Active') : analysis.status}
          </Tag>
        )}
        <Button type="primary" size="large" icon={<PlayCircleOutlined />} disabled={!analysis} onClick={() => setReleaseOpen(true)}>
          {isZh ? '下达生产工单' : 'Create production order'}
        </Button>
      </Card>

      {analysisQuery.isError && (
        <Alert
          type="error"
          showIcon
          title={isZh ? '无法计算物料需求' : 'Could not calculate material requirements'}
          action={<Button size="small" onClick={() => analysisQuery.refetch()}>{isZh ? '重试' : 'Retry'}</Button>}
        />
      )}

      <div className="bom-workbench-body" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!analysis ? (
            <Card>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          ) : (
            <>
              <BomActionCards
                analysis={analysis}
                isZh={isZh}
                onSelect={setSelectedId}
                onOrder={setPurchaseLine}
                onUseMaxQuantity={() => setQuantity(analysis.maxBuildableQuantity)}
                onShowAllShortages={() => applyFilter('SHORTAGE')}
              />
              <ProductStructureTree analysis={analysis} isZh={isZh} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
              <BomRequirementTable
                analysis={analysis}
                isZh={isZh}
                filter={filter}
                onFilterChange={setFilter}
                selectedId={effectiveSelectedId}
                onSelect={setSelectedId}
                loading={analysisQuery.isFetching}
              />
              <CostStructureCard analysis={analysis} isZh={isZh} />
            </>
          )}
        </div>

        <aside className="bom-workbench-inspector" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 12 }}>
          <PlanningInspector
            analysis={analysis}
            isZh={isZh}
            quantity={quantity}
            onQuantityChange={setQuantity}
            startDate={startDate}
            onStartDateChange={setStartDate}
            selectedLine={selectedLine}
            onOrder={setPurchaseLine}
          />
        </aside>
      </div>

      {analysis && <ReleaseOrderModal open={releaseOpen} onClose={() => setReleaseOpen(false)} analysis={analysis} isZh={isZh} />}
      {analysis && <PurchaseRequestModal line={purchaseLine} analysis={analysis} isZh={isZh} onClose={() => setPurchaseLine(null)} />}
    </div>
  );
};

export default BomWorkbenchView;
