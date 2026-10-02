import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, message, Card, theme } from 'antd';
import { salesService } from '@/services/salesService';
import { useAppStore } from '@/stores/useAppStore';
import {
  SalesOrderSummary,
  OutboundDeliverySummary,
  SalesOrderStatus,
} from '../types';
import { SalesKpiStrip } from './SalesKpiStrip';
import { SalesFilterBar } from './SalesFilterBar';
import { SalesOrdersTable } from './SalesOrdersTable';
import { OutboundDispatchDrawer } from './OutboundDispatchDrawer';
import { CreateSalesOrderModal } from './CreateSalesOrderModal';
import { CreateDeliveryModal } from './CreateDeliveryModal';

export const SalesView: React.FC = () => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SalesOrderSummary[]>([]);
  const [deliveries, setDeliveries] = useState<OutboundDeliverySummary[]>([]);

  // Filters
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<SalesOrderStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState<string>('');

  // Modals
  const [createSOModalOpen, setCreateSOModalOpen] = useState(false);
  const [createDeliveryModalOpen, setCreateDeliveryModalOpen] = useState(false);
  const [deliveryTargetOrder, setDeliveryTargetOrder] = useState<SalesOrderSummary | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [soData, doData] = await Promise.all([
        salesService.getSalesOrders(searchText, selectedStatus),
        salesService.getDeliveries(),
      ]);
      setOrders(soData);
      setDeliveries(doData);
    } catch {
      message.error('Failed to load sales and delivery data');
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
  }, [fetchData]);

  const handleOpenDelivery = (order?: SalesOrderSummary) => {
    setDeliveryTargetOrder(order || (orders.length > 0 ? orders[0] : null));
    setCreateDeliveryModalOpen(true);
  };

  const handleConfirmOrder = async (id: number) => {
    const success = await salesService.confirmSalesOrder(id);
    if (success) {
      message.success(isZh ? '订单已转为正式执行合同' : 'Sales order confirmed');
      void fetchData();
    }
  };

  const handlePostDispatch = async (id: number) => {
    const success = await salesService.postDispatch(id);
    if (success) {
      message.success(isZh ? '发货出库成功，成品库存已扣减并更新履约台账' : 'Goods dispatched and inventory deducted successfully');
      void fetchData();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Loading sales & outbound logistics console..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* 1. Top KPI Ribbon */}
      <SalesKpiStrip />

      {/* 2. Filter & Action Toolbar */}
      <SalesFilterBar
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchText={searchText}
        onSearchChange={setSearchText}
        onOpenCreateSO={() => setCreateSOModalOpen(true)}
        onOpenCreateDelivery={() => handleOpenDelivery()}
      />

      {/* 3. Main Split View: Dense Sales Orders Ledger (70%) + Outbound Dispatch Drawer (30%) */}
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={16} xl={17}>
          <SalesOrdersTable
            orders={orders}
            loading={loading}
            onCreateDelivery={handleOpenDelivery}
            onConfirmOrder={handleConfirmOrder}
            onRefresh={fetchData}
          />
        </Col>

        <Col xs={24} lg={8} xl={7}>
          <OutboundDispatchDrawer
            deliveries={deliveries}
            onPostDispatch={handlePostDispatch}
          />
        </Col>
      </Row>

      {/* 4. Industrial Telemetry Footer Bar */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', fontSize: 11, color: token.colorTextSecondary }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>● SAP S/4HANA SD Module: <strong style={{ color: '#15803d' }}>Active Sync (18ms)</strong></span>
            <span>● WMS Outbound Staging: <strong style={{ color: '#15803d' }}>Connected (Zone B)</strong></span>
            <span>● Digital Scale #03: <strong style={{ color: '#15803d' }}>Calibrated</strong></span>
          </div>
          <div>
            <span>IATF-16949 / ISO-9001 Validated · <strong>WIFIM INDUSTRIAL 05.4.12</strong></span>
          </div>
        </div>
      </Card>

      {/* 5. Modals */}
      <CreateSalesOrderModal
        open={createSOModalOpen}
        onClose={() => setCreateSOModalOpen(false)}
        onSuccess={fetchData}
      />

      <CreateDeliveryModal
        open={createDeliveryModalOpen}
        order={deliveryTargetOrder}
        onClose={() => {
          setCreateDeliveryModalOpen(false);
          setDeliveryTargetOrder(null);
        }}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default SalesView;
