import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Input, Radio, Select, Button, Space, message, Spin, Statistic } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  ShoppingOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { productionService } from '@/services/productionService';
import { ProductionOrder, ProductionOrderStatus } from '../types';
import { WorkOrdersTable } from './WorkOrdersTable';
import { OperationTrackingDrawer } from './OperationTrackingDrawer';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';
import { BomViewerModal } from './BomViewerModal';
import { TaktTimeOeeCard } from './TaktTimeOeeCard';

export const ProductionView: React.FC = () => {
  const { language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lineFilter, setLineFilter] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [bomTargetOrder, setBomTargetOrder] = useState<ProductionOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await productionService.getProductionOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch {
      message.error('Failed to load production orders');
    } finally {
      setLoading(false);
    }
  }, [selectedOrder]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await fetchOrders();
      if (!isMounted) return;
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.productNameZh.includes(searchText) ||
      order.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
      order.workstation.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && order.status !== (statusFilter as ProductionOrderStatus)) return false;
    if (lineFilter !== 'ALL' && !order.workstation.includes(lineFilter)) return false;
    return true;
  });

  const handleOpenBom = (order: ProductionOrder) => {
    setBomTargetOrder(order);
    setBomModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading production dispatch console..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* 1. Top Operational KPI Ribbon */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#6b7280' }}>{language === 'zh-CN' ? '调度工单数' : 'Active Dispatch'}</span>}
              value={18}
              valueStyle={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}
              prefix={<ToolOutlined />}
              suffix={<span style={{ fontSize: 11, color: '#faad14', marginLeft: 6 }}>2 {language === 'zh-CN' ? '临期' : 'Due'}</span>}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#6b7280' }}>{language === 'zh-CN' ? '按期开工率' : 'On-Schedule Rate'}</span>}
              value={94.4}
              precision={1}
              valueStyle={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}
              prefix={<FieldTimeOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#6b7280' }}>{language === 'zh-CN' ? '车间在制品 (WIP)' : 'Shop Floor WIP'}</span>}
              value={3420}
              valueStyle={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}
              suffix={<span style={{ fontSize: 12, color: '#6b7280' }}>pcs</span>}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#6b7280' }}>{language === 'zh-CN' ? '一次合格率 (Yield)' : 'First Pass Yield'}</span>}
              value={98.6}
              precision={1}
              valueStyle={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#6b7280' }}>{language === 'zh-CN' ? '综合报废率 (Scrap)' : 'Scrap Rate'}</span>}
              value={0.8}
              precision={1}
              valueStyle={{ fontSize: 20, fontWeight: 700, color: '#cf1322' }}
              prefix={<AlertOutlined />}
              suffix={<span style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>(&lt;1.2%)</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Real-Time Takt Time & Station Rhythm Monitor */}
      <TaktTimeOeeCard />

      {/* 2. Filter & Action Toolbar */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          marginBottom: 12,
        }}
        styles={{ body: { padding: '10px 14px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Space wrap size="small">
            <Input
              placeholder={language === 'zh-CN' ? '搜索工单、产品或产线...' : 'Search WO#, Part, or Line...'}
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              size="small"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 260 }}
            />

            <Radio.Group
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="ALL">{language === 'zh-CN' ? '全部 (18)' : 'All (18)'}</Radio.Button>
              <Radio.Button value="IN_PRODUCTION">{language === 'zh-CN' ? '生产中 (11)' : 'In Production'}</Radio.Button>
              <Radio.Button value="QC_TESTING">{language === 'zh-CN' ? '质检中 (3)' : 'QC Testing'}</Radio.Button>
              <Radio.Button value="COMPLETED">{language === 'zh-CN' ? '已完工 (1)' : 'Completed'}</Radio.Button>
            </Radio.Group>

            <Select
              size="small"
              value={lineFilter}
              onChange={setLineFilter}
              style={{ width: 160 }}
              options={[
                { value: 'ALL', label: language === 'zh-CN' ? '全部产线 (All Lines)' : 'All Lines' },
                { value: 'Line A', label: 'Line A (CNC 5-Axis)' },
                { value: 'Line B', label: 'Line B (Grinding)' },
                { value: 'Line C', label: 'Line C (Assembly)' },
              ]}
            />
          </Space>

          <Space size="small">
            <Button
              size="small"
              icon={<ShoppingOutlined />}
              onClick={() => message.info('Batch Material Issue initiated for ready orders')}
            >
              {language === 'zh-CN' ? '批量领料' : 'Batch Material Issue'}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.success('Exporting Work Orders CSV...')}
            >
              {language === 'zh-CN' ? '导出 CSV' : 'Export CSV'}
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
              style={{ backgroundColor: '#1677ff' }}
            >
              {language === 'zh-CN' ? '+ 新建工单' : '+ New Work Order'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* 3. Main Split View: Table (65%) + Routing/Dispatch Drawer (35%) */}
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={15} xl={16}>
          <WorkOrdersTable
            orders={filteredOrders}
            selectedOrderId={selectedOrder?.id || null}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onOpenBom={handleOpenBom}
            onRefresh={fetchOrders}
          />
        </Col>

        <Col xs={24} lg={9} xl={8}>
          <OperationTrackingDrawer
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onReportSubmitted={fetchOrders}
          />
        </Col>
      </Row>

      {/* 4. Modals */}
      <CreateWorkOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchOrders}
      />

      <BomViewerModal
        order={bomTargetOrder}
        open={bomModalOpen}
        onClose={() => {
          setBomModalOpen(false);
          setBomTargetOrder(null);
        }}
        onMaterialsIssued={fetchOrders}
      />
    </div>
  );
};

export default ProductionView;
