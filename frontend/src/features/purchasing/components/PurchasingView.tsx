import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Card, theme } from 'antd';
import { message } from '@/utils/antdApp';
import { purchasingService } from '@/services/purchasingService';
import { useAppStore } from '@/stores/useAppStore';
import { PurchaseOrderSummary, GoodsReceiptSummary, PurchaseOrderStatus } from '../types';
import { PurchasingKpiStrip } from './PurchasingKpiStrip';
import { PurchasingFilterBar } from './PurchasingFilterBar';
import { PurchaseOrdersTable } from './PurchaseOrdersTable';
import { ActiveInboundQcDrawer } from './ActiveInboundQcDrawer';
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal';
import { CreateGoodsReceiptModal } from './CreateGoodsReceiptModal';

export const PurchasingView: React.FC = () => {
  const { language, refreshKey } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PurchaseOrderSummary[]>([]);
  const [receipts, setReceipts] = useState<GoodsReceiptSummary[]>([]);

  // Filters
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState<string>('');

  // Modals
  const [createPOModalOpen, setCreatePOModalOpen] = useState(false);
  const [createReceiptModalOpen, setCreateReceiptModalOpen] = useState(false);
  const [receiptTargetPO, setReceiptTargetPO] = useState<PurchaseOrderSummary | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [poData, grnData] = await Promise.all([
        purchasingService.getPurchaseOrders(searchText, selectedStatus),
        purchasingService.getGoodsReceipts(),
      ]);
      setOrders(poData);
      setReceipts(grnData);
    } catch {
      message.error('Failed to load purchasing data');
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedStatus]);

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
  }, [fetchData, refreshKey]);

  const handleOpenReceive = (po?: PurchaseOrderSummary) => {
    setReceiptTargetPO(po || (orders.length > 0 ? orders[0] : null));
    setCreateReceiptModalOpen(true);
  };

  const handleConfirmPO = async (id: number) => {
    const success = await purchasingService.confirmPurchaseOrder(id);
    if (success) {
      message.success(isZh ? '采购单已下达供方' : 'Purchase order confirmed');
      void fetchData();
    }
  };

  const handlePostReceipt = async (id: number) => {
    const success = await purchasingService.postGoodsReceipt(id);
    if (success) {
      message.success(
        isZh
          ? '到货物料已确认上架入库，库存已实时更新'
          : 'Goods posted to stock, inventory updated',
      );
      void fetchData();
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
      >
        <Spin size="large" description="Loading purchasing & inbound dock console..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* 1. Top KPI Ribbon */}
      <PurchasingKpiStrip orders={orders} receipts={receipts} />

      {/* 2. Filter & Action Toolbar */}
      <PurchasingFilterBar
        orders={orders}
        selectedSupplier={selectedSupplier}
        onSelectSupplier={setSelectedSupplier}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchText={searchText}
        onSearchChange={setSearchText}
        onOpenCreatePO={() => setCreatePOModalOpen(true)}
        onOpenCreateReceipt={() => handleOpenReceive()}
      />

      {/* 3. Main Split View: Dense Purchase Orders Ledger (70%) + Inbound QC Drawer (30%) */}
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={16} xl={17}>
          <PurchaseOrdersTable
            orders={orders}
            loading={loading}
            onReceivePO={handleOpenReceive}
            onConfirmPO={handleConfirmPO}
            onRefresh={fetchData}
          />
        </Col>

        <Col xs={24} lg={8} xl={7}>
          <ActiveInboundQcDrawer receipts={receipts} onPostReceipt={handlePostReceipt} />
        </Col>
      </Row>

      {/* 4. Operational Status Bar */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          marginTop: 12,
          backgroundColor: token.colorFillAlter,
        }}
        styles={{ body: { padding: '8px 14px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            fontSize: 11,
            color: token.colorTextSecondary,
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <span>
              {isZh ? '采购订单总计: ' : 'Total Purchase Orders: '}
              <strong style={{ color: token.colorText }}>{orders.length}</strong>
            </span>
            <span>
              {isZh ? '到货入库单总计: ' : 'Total Goods Receipts: '}
              <strong style={{ color: token.colorText }}>{receipts.length}</strong>
            </span>
          </div>
          <div>
            <span>{isZh ? '供应链协同状态: 实时连接' : 'Procurement Gateway: Connected'}</span>
          </div>
        </div>
      </Card>

      {/* 5. Modals */}
      <CreatePurchaseOrderModal
        open={createPOModalOpen}
        onClose={() => setCreatePOModalOpen(false)}
        onSuccess={fetchData}
      />

      <CreateGoodsReceiptModal
        open={createReceiptModalOpen}
        po={receiptTargetPO}
        onClose={() => {
          setCreateReceiptModalOpen(false);
          setReceiptTargetPO(null);
        }}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default PurchasingView;
