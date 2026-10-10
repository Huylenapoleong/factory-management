import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Popover, Badge, Button, Tabs, Tag, Typography, Space, Empty, Spin, theme } from 'antd';
import {
  BellOutlined,
  AlertOutlined,
  ToolOutlined,
  ReloadOutlined,
  CheckOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '@/services/dashboardService';
import { MaterialShortageItem, WorkOrderProgressItem } from '@/features/dashboard/types';

const { Text } = Typography;

export const NotificationCenterPopover: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const isZh = i18n.language === 'zh-CN';

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shortages, setShortages] = useState<MaterialShortageItem[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderProgressItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const [shortagesRes, ordersRes] = await Promise.all([
        dashboardService.getMaterialShortages(),
        dashboardService.getPriorityWorkOrders(),
      ]);
      setShortages(shortagesRes);
      setWorkOrders(ordersRes);
    } catch {
      setShortages([]);
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const [shortagesRes, ordersRes] = await Promise.all([
          dashboardService.getMaterialShortages(),
          dashboardService.getPriorityWorkOrders(),
        ]);
        if (active) {
          setShortages(shortagesRes);
          setWorkOrders(ordersRes);
        }
      } catch {
        if (active) {
          setShortages([]);
          setWorkOrders([]);
        }
      }
    };

    void loadInitial();
    const timer = setInterval(() => {
      void loadInitial();
    }, 60000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Unread calculation
  const unreadShortages = useMemo(
    () => shortages.filter((s) => !readIds.has(`shortage-${s.id}`)),
    [shortages, readIds],
  );

  const unreadWorkOrders = useMemo(
    () => workOrders.filter((w) => !readIds.has(`order-${w.id}`)),
    [workOrders, readIds],
  );

  const totalUnreadCount = unreadShortages.length + unreadWorkOrders.length;

  const handleMarkAllRead = () => {
    const nextRead = new Set(readIds);
    shortages.forEach((s) => nextRead.add(`shortage-${s.id}`));
    workOrders.forEach((w) => nextRead.add(`order-${w.id}`));
    setReadIds(nextRead);
  };

  const handleNavigate = (path: string, alertId?: string) => {
    if (alertId) {
      setReadIds((prev) => new Set(prev).add(alertId));
    }
    setOpen(false);
    navigate(path);
  };

  const renderShortageRow = (s: MaterialShortageItem) => {
    const isRead = readIds.has(`shortage-${s.id}`);
    return (
      <div
        key={`shortage-${s.id}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '8px 4px',
          opacity: isRead ? 0.6 : 1,
          cursor: 'pointer',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
        onClick={() => handleNavigate('/inventory', `shortage-${s.id}`)}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            backgroundColor: '#fff1f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cf1322',
            flexShrink: 0,
          }}
        >
          <AlertOutlined />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{s.materialCode}</span>
            <Tag color="error" style={{ margin: 0, fontSize: 10 }}>
              -{s.deficitQty} {s.uom}
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
            <div>{isZh ? s.materialNameZh : s.materialName}</div>
            <div style={{ fontSize: 10, color: token.colorError }}>
              {isZh
                ? `当前库存: ${s.currentStock} / 最小安全阈值: ${s.minStock}`
                : `Stock: ${s.currentStock} / Safety Min: ${s.minStock}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkOrderRow = (w: WorkOrderProgressItem) => {
    const isRead = readIds.has(`order-${w.id}`);
    return (
      <div
        key={`order-${w.id}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '8px 4px',
          opacity: isRead ? 0.6 : 1,
          cursor: 'pointer',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
        onClick={() => handleNavigate('/production', `order-${w.id}`)}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            backgroundColor: '#e6f4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1677ff',
            flexShrink: 0,
          }}
        >
          <ToolOutlined />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{w.woNo}</span>
            <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
              {w.progressPercent}%
            </Tag>
          </div>
          <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
            <div>{isZh ? w.productNameZh : w.productName}</div>
            <div style={{ fontSize: 10 }}>
              {isZh ? w.workstationZh : w.workstation} · {w.completedQty}/{w.plannedQty} {w.uom}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const popoverContent = (
    <div style={{ width: 360, maxWidth: '90vw' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 10,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: 8,
        }}
      >
        <Space size={6}>
          <BellOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          <Text strong style={{ fontSize: 13 }}>
            {isZh ? '工控告警与实时通报' : 'Plant Telemetry Alerts'}
          </Text>
          {totalUnreadCount > 0 ? (
            <Tag color="error" style={{ margin: 0, padding: '0 6px', fontSize: 11 }}>
              {totalUnreadCount} {isZh ? '待处理' : 'Pending'}
            </Tag>
          ) : (
            <Tag color="success" style={{ margin: 0, padding: '0 6px', fontSize: 11 }}>
              {isZh ? '运行平稳' : 'Nominal'}
            </Tag>
          )}
        </Space>

        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => void fetchAlerts()}
            title={isZh ? '刷新' : 'Refresh'}
          />
          {totalUnreadCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllRead}
              style={{ fontSize: 11 }}
            >
              {isZh ? '全部已读' : 'Mark Read'}
            </Button>
          )}
        </Space>
      </div>

      {loading && shortages.length === 0 && workOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <Spin size="small" />
        </div>
      ) : (
        <Tabs
          size="small"
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: `${isZh ? '全部' : 'All'} (${totalUnreadCount})`,
              children: (
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {shortages.length === 0 && workOrders.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        isZh ? '全线物料与设备指标正常' : 'All plant telemetry parameters optimal'
                      }
                      style={{ margin: '24px 0' }}
                    />
                  ) : (
                    <div>
                      {shortages.map(renderShortageRow)}
                      {workOrders.map(renderWorkOrderRow)}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'shortages',
              label: `${isZh ? '缺料' : 'Shortages'} (${unreadShortages.length})`,
              children: (
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {shortages.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={isZh ? '无低库存或缺料预警' : 'No low stock deficits'}
                      style={{ margin: '24px 0' }}
                    />
                  ) : (
                    <div>{shortages.map(renderShortageRow)}</div>
                  )}
                </div>
              ),
            },
            {
              key: 'production',
              label: `${isZh ? '工单' : 'Orders'} (${unreadWorkOrders.length})`,
              children: (
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {workOrders.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={isZh ? '暂无生产排程预警' : 'No order delay alerts'}
                      style={{ margin: '24px 0' }}
                    />
                  ) : (
                    <div>{workOrders.map(renderWorkOrderRow)}</div>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Footer Navigation Action */}
      <div
        style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          paddingTop: 8,
          marginTop: 4,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          type="link"
          size="small"
          onClick={() => handleNavigate('/inventory')}
          style={{ fontSize: 11, padding: 0 }}
        >
          {isZh ? '查看库存台账' : 'View Stock Ledger'} <ArrowRightOutlined />
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => handleNavigate('/production')}
          style={{ fontSize: 11, padding: 0 }}
        >
          {isZh ? '查看排产进度' : 'View Work Orders'} <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      styles={{ container: { padding: 12 } }}
    >
      <Badge count={totalUnreadCount} size="small" offset={[-2, 4]} overflowCount={99}>
        <Button
          type="text"
          shape="circle"
          size="small"
          icon={<BellOutlined style={{ fontSize: 15 }} />}
          title={
            totalUnreadCount > 0
              ? `${totalUnreadCount} ${isZh ? '项工业告警' : 'Active Plant Alerts'}`
              : isZh
                ? '工控通报 (正常)'
                : 'Plant Alerts (Normal)'
          }
        />
      </Badge>
    </Popover>
  );
};

export default NotificationCenterPopover;
