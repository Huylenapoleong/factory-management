import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { dashboardService } from '@/services/dashboardService';
import { useAppStore } from '@/stores/useAppStore';
import { playAlertChime } from '@/utils/audioAlert';
import {
  DashboardSummary,
  WorkOrderProgressItem,
  MaterialShortageItem,
  HourlyThroughputItem,
  StockMovementItem,
} from '../types';
import { KpiMetricsStrip } from './KpiMetricsStrip';
import { PriorityWorkOrdersCard } from './PriorityWorkOrdersCard';
import { HourlyThroughputCard } from './HourlyThroughputCard';
import { MaterialShortageCard } from './MaterialShortageCard';
import { StockMovementsTimelineCard } from './StockMovementsTimelineCard';
import { TaktTimeOeeCard } from '@/features/production/components/TaktTimeOeeCard';

export const DashboardView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrderProgressItem[]>([]);
  const [throughput, setThroughput] = useState<HourlyThroughputItem[]>([]);
  const [shortages, setShortages] = useState<MaterialShortageItem[]>([]);
  const [movements, setMovements] = useState<StockMovementItem[]>([]);

  const { autoRefreshInterval, soundAlertsEnabled } = useAppStore();
  const prevShortageCount = useRef<number>(0);

  const loadData = useCallback(async (isSilent = false) => {
    try {
      const [sumData, woData, tpData, shortData, movData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getPriorityWorkOrders(),
        dashboardService.getHourlyThroughput(),
        dashboardService.getMaterialShortages(),
        dashboardService.getRecentMovements(),
      ]);

      setSummary(sumData);
      setWorkOrders(woData);
      setThroughput(tpData);
      setShortages(shortData);
      setMovements(movData);

      // Play acoustic warning if new shortages detected while sound alerts are active
      if (soundAlertsEnabled && shortData.length > 0 && isSilent && shortData.length !== prevShortageCount.current) {
        playAlertChime();
      }
      prevShortageCount.current = shortData.length;
    } catch {
      message.error('Failed to load dashboard operational data');
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, [soundAlertsEnabled]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      await loadData();
      if (!isMounted) return;
    };

    void run();

    if (autoRefreshInterval <= 0) {
      return () => {
        isMounted = false;
      };
    }

    const interval = setInterval(() => {
      void loadData(true);
    }, autoRefreshInterval * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadData, autoRefreshInterval]);

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading real-time operational telemetry..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* Row 1: KPI Metrics Strip */}
      <KpiMetricsStrip summary={summary} />

      {/* Real-Time Takt Time & Station Rhythm Monitor */}
      <div style={{ marginTop: 12 }}>
        <TaktTimeOeeCard />
      </div>

      {/* Row 2: Operations & Warehouse Grid */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {/* Left Column (65% width): Production Execution & Line Throughput */}
        <Col xs={24} lg={16}>
          <PriorityWorkOrdersCard orders={workOrders} />
          <HourlyThroughputCard data={throughput} />
        </Col>

        {/* Right Column (35% width): Shortage Alerts & Inventory Movements */}
        <Col xs={24} lg={8}>
          <MaterialShortageCard
            shortages={shortages}
            onPoCreated={() => loadData(true)}
          />
          <StockMovementsTimelineCard movements={movements} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardView;
