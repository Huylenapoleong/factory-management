import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Radio,
  Select,
  Button,
  Space,
  App,
  Spin,
  Statistic,
  Modal,
  Tag,
  theme,
} from 'antd';
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
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { productionService } from '@/services/productionService';
import { ProductionOrder, ProductionOrderStatus } from '../types';
import { WorkOrdersTable } from './WorkOrdersTable';
import { OperationTrackingDrawer } from './OperationTrackingDrawer';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';
import { BomViewerModal } from './BomViewerModal';
import { TaktTimeOeeCard } from './TaktTimeOeeCard';

export const ProductionView: React.FC = () => {
  const { language, refreshKey } = useAppStore();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lineFilter, setLineFilter] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [bomTargetOrder, setBomTargetOrder] = useState<ProductionOrder | null>(null);
  const [batchIssueModalOpen, setBatchIssueModalOpen] = useState(false);
  const [batchIssuing, setBatchIssuing] = useState(false);

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
  }, [selectedOrder, message]);

  const handleBatchIssueConfirm = async () => {
    const plannedOrders = orders.filter((o) => o.status === 'PLANNED');
    if (plannedOrders.length === 0) return;
    setBatchIssuing(true);
    try {
      for (const order of plannedOrders) {
        await productionService.issueMaterials(order.id);
      }
      message.success(
        language === 'zh-CN'
          ? `已成功为 ${plannedOrders.length} 个计划工单办理齐套发料！`
          : `Successfully issued materials for ${plannedOrders.length} planned work orders!`,
      );
      setBatchIssueModalOpen(false);
      await fetchOrders();
    } catch {
      message.error(
        language === 'zh-CN'
          ? '批量发料处理异常，请检查库存'
          : 'Failed to issue materials in batch',
      );
    } finally {
      setBatchIssuing(false);
    }
  };

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
  }, [fetchOrders, refreshKey]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.productNameZh.includes(searchText) ||
      order.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
      order.workstation.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && order.status !== (statusFilter as ProductionOrderStatus))
      return false;
    if (
      lineFilter !== 'ALL' &&
      order.workstation !== lineFilter &&
      order.workstationZh !== lineFilter
    )
      return false;
    return true;
  });

  const lineOptions = React.useMemo(() => {
    const rawLines = Array.from(
      new Set(
        orders.map((o) => (language === 'zh-CN' ? o.workstationZh : o.workstation)).filter(Boolean),
      ),
    );
    return [
      {
        value: 'ALL',
        label: language === 'zh-CN' ? '全部产线' : 'All Lines',
      },
      ...rawLines.map((line) => ({ value: line, label: line })),
    ];
  }, [orders, language]);

  const handleOpenBom = (order: ProductionOrder) => {
    setBomTargetOrder(order);
    setBomModalOpen(true);
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
      >
        <Spin size="large" description="Loading production dispatch console..." />
      </div>
    );
  }

  const totalOrders = orders.length;
  const inProductionCount = orders.filter((o) => o.status === 'IN_PRODUCTION').length;
  const qcTestingCount = orders.filter((o) => o.status === 'QC_TESTING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const urgentCount = orders.filter((o) => o.isUrgent).length;
  const totalPlanned = orders.reduce((sum, o) => sum + o.plannedQty, 0);
  const totalCompleted = orders.reduce((sum, o) => sum + o.completedQty, 0);
  const totalScrap = orders.reduce((sum, o) => sum + o.scrapQty, 0);
  const totalWip = Math.max(0, totalPlanned - totalCompleted);
  const yieldRate =
    totalCompleted + totalScrap > 0
      ? Number(((totalCompleted / (totalCompleted + totalScrap)) * 100).toFixed(1))
      : 0.0;
  const scrapRate =
    totalCompleted + totalScrap > 0
      ? Number(((totalScrap / (totalCompleted + totalScrap)) * 100).toFixed(1))
      : 0.0;
  const onScheduleRate =
    totalOrders > 0 ? Number((((totalOrders - urgentCount) / totalOrders) * 100).toFixed(1)) : 0.0;

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* 1. Top Operational KPI Ribbon */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {language === 'zh-CN' ? '调度工单数' : 'Active Dispatch'}
                </span>
              }
              value={totalOrders}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#1677ff' } }}
              prefix={<ToolOutlined />}
              suffix={
                urgentCount > 0 ? (
                  <span style={{ fontSize: 11, color: '#faad14', marginLeft: 6 }}>
                    {urgentCount} {language === 'zh-CN' ? '加急' : 'Due'}
                  </span>
                ) : null
              }
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {language === 'zh-CN' ? '按期开工率' : 'On-Schedule Rate'}
                </span>
              }
              value={onScheduleRate}
              precision={1}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#52c41a' } }}
              prefix={<FieldTimeOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {language === 'zh-CN' ? '车间在制品' : 'Shop Floor WIP'}
                </span>
              }
              value={totalWip}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#1f2937' } }}
              suffix={<span style={{ fontSize: 12, color: '#6b7280' }}>pcs</span>}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {language === 'zh-CN' ? '一次合格率' : 'First Pass Yield'}
                </span>
              }
              value={yieldRate}
              precision={1}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#52c41a' } }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={5}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {language === 'zh-CN' ? '综合报废率' : 'Scrap Rate'}
                </span>
              }
              value={scrapRate}
              precision={1}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#cf1322' } }}
              prefix={<AlertOutlined />}
              suffix="%"
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Space wrap size="small">
            <Input
              placeholder={
                language === 'zh-CN' ? '搜索工单、产品或产线...' : 'Search WO#, Part, or Line...'
              }
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
              <Radio.Button value="ALL">
                {language === 'zh-CN' ? `全部 (${totalOrders})` : `All (${totalOrders})`}
              </Radio.Button>
              <Radio.Button value="IN_PRODUCTION">
                {language === 'zh-CN'
                  ? `生产中 (${inProductionCount})`
                  : `In Production (${inProductionCount})`}
              </Radio.Button>
              <Radio.Button value="QC_TESTING">
                {language === 'zh-CN'
                  ? `质检中 (${qcTestingCount})`
                  : `QC Testing (${qcTestingCount})`}
              </Radio.Button>
              <Radio.Button value="COMPLETED">
                {language === 'zh-CN'
                  ? `已完工 (${completedCount})`
                  : `Completed (${completedCount})`}
              </Radio.Button>
            </Radio.Group>

            <Select
              size="small"
              value={lineFilter}
              onChange={setLineFilter}
              style={{ width: 160 }}
              options={lineOptions}
            />
          </Space>

          <Space size="small">
            <Button
              size="small"
              icon={<ShoppingOutlined />}
              onClick={() => {
                const planned = orders.filter((o) => o.status === 'PLANNED');
                if (planned.length === 0) {
                  message.info(
                    language === 'zh-CN'
                      ? '当前暂无待发料的计划中工单（状态为 PLANNED）'
                      : 'No planned work orders currently awaiting material issuance',
                  );
                  return;
                }
                setBatchIssueModalOpen(true);
              }}
            >
              {language === 'zh-CN' ? '批量领料' : 'Batch Material Issue'}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (filteredOrders.length === 0) {
                  message.warning(language === 'zh-CN' ? '无工单数据可导出' : 'No data to export');
                  return;
                }
                const headers = [
                  'OrderNo,ProductCode,ProductName,Workstation,PlannedQty,CompletedQty,ScrapQty,Status',
                ];
                const rows = filteredOrders.map(
                  (o) =>
                    `"${o.orderNo}","${o.productCode}","${language === 'zh-CN' ? o.productNameZh : o.productName}","${language === 'zh-CN' ? o.workstationZh : o.workstation}",${o.plannedQty},${o.completedQty},${o.scrapQty},"${o.status}"`,
                );
                const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute(
                  'download',
                  `work_orders_${new Date().toISOString().slice(0, 10)}.csv`,
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                message.success(
                  language === 'zh-CN' ? '工单数据已成功导出' : 'Work orders exported',
                );
              }}
            >
              {language === 'zh-CN' ? '导出 CSV' : 'Export CSV'}
            </Button>
            <PermissionGuard action="CREATE_WORK_ORDER">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
                style={{ backgroundColor: '#1677ff' }}
              >
                {language === 'zh-CN' ? '新建工单' : 'New Work Order'}
              </Button>
            </PermissionGuard>
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

      {/* Real Batch Material Issue Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingOutlined style={{ color: '#1677ff' }} />
            <span>
              {language === 'zh-CN' ? '待产工单批量发料出库' : 'Batch Material Issuance Dispatch'}
            </span>
          </div>
        }
        open={batchIssueModalOpen}
        onCancel={() => setBatchIssueModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setBatchIssueModalOpen(false)}
            disabled={batchIssuing}
          >
            {language === 'zh-CN' ? '取消' : 'Cancel'}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={batchIssuing}
            onClick={handleBatchIssueConfirm}
          >
            {language === 'zh-CN' ? '确认批量发料' : 'Confirm Issuance'}
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: '#4b5563', fontSize: 13 }}>
            {language === 'zh-CN'
              ? `系统检测到以下待产工单已具备领料条件，确认后将从仓库调拨物料并推进工单进入生产状态：`
              : `The following planned work orders are ready for material allocation. Confirming will issue inventory and start production:`}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 6,
              padding: 8,
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {orders
              .filter((o) => o.status === 'PLANNED')
              .map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {item.orderNo} -{' '}
                      {language === 'zh-CN' ? item.productNameZh : item.productName}
                    </div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      {language === 'zh-CN' ? item.workstationZh : item.workstation} •{' '}
                      {item.batchNo}
                    </div>
                  </div>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {item.plannedQty} {item.uom}
                  </Tag>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductionView;
