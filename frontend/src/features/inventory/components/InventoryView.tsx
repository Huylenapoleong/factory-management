import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, message } from 'antd';
import { inventoryService } from '@/services/inventoryService';
import {
  InventoryBalanceItem,
  StockAuditLogItem,
  StockStatus,
} from '../types';
import { InventoryKpiStrip } from './InventoryKpiStrip';
import { InventoryFilterBar } from './InventoryFilterBar';
import { InventoryLedgerTable } from './InventoryLedgerTable';
import { RealtimeLotAuditFeed } from './RealtimeLotAuditFeed';
import { StockTransferModal } from './StockTransferModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';

export const InventoryView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<InventoryBalanceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<StockAuditLogItem[]>([]);

  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState<string>('');

  // Modals
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetItem, setTransferTargetItem] = useState<InventoryBalanceItem | null>(null);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [adjustmentTargetItem, setAdjustmentTargetItem] = useState<InventoryBalanceItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [balData, logData] = await Promise.all([
        inventoryService.getBalances({
          warehouseId: selectedWarehouse,
          category: selectedCategory,
          status: selectedStatus,
          search: searchText,
        }),
        inventoryService.getRecentAuditLogs(),
      ]);
      setBalances(balData);
      setAuditLogs(logData);
    } catch {
      message.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse, selectedCategory, selectedStatus, searchText]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await fetchData();
      if (!isMounted) return;
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const handleOpenTransfer = (item?: InventoryBalanceItem) => {
    setTransferTargetItem(item || (balances.length > 0 ? balances[0] : null));
    setTransferModalOpen(true);
  };

  const handleOpenAdjustment = (item?: InventoryBalanceItem) => {
    setAdjustmentTargetItem(item || (balances.length > 0 ? balances[0] : null));
    setAdjustmentModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Loading warehouse inventory ledger..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* 1. Top KPI Ribbon */}
      <InventoryKpiStrip />

      {/* 2. Filter & Action Toolbar */}
      <InventoryFilterBar
        selectedWarehouse={selectedWarehouse}
        onSelectWarehouse={setSelectedWarehouse}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchText={searchText}
        onSearchChange={setSearchText}
        onOpenTransfer={() => handleOpenTransfer()}
        onOpenAdjustment={() => handleOpenAdjustment()}
      />

      {/* 3. Main Split View: Dense Stock Ledger (70%) + Lot Audit Feed (30%) */}
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={16} xl={17}>
          <InventoryLedgerTable
            balances={balances}
            loading={loading}
            onTransferItem={(item) => handleOpenTransfer(item)}
            onAdjustItem={(item) => handleOpenAdjustment(item)}
          />
        </Col>

        <Col xs={24} lg={8} xl={7}>
          <RealtimeLotAuditFeed
            logs={auditLogs}
            onRefresh={fetchData}
          />
        </Col>
      </Row>

      {/* 4. Modals */}
      <StockTransferModal
        open={transferModalOpen}
        item={transferTargetItem}
        onClose={() => {
          setTransferModalOpen(false);
          setTransferTargetItem(null);
        }}
        onSuccess={fetchData}
      />

      <StockAdjustmentModal
        open={adjustmentModalOpen}
        item={adjustmentTargetItem}
        onClose={() => {
          setAdjustmentModalOpen(false);
          setAdjustmentTargetItem(null);
        }}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default InventoryView;
