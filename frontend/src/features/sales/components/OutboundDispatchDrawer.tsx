import React from 'react';
import { Card, Tag, Button, Space, message, Typography } from 'antd';
import {
  SendOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { OutboundDeliverySummary } from '../types';

const { Text } = Typography;

interface OutboundDispatchDrawerProps {
  deliveries: OutboundDeliverySummary[];
  onPostDispatch: (id: number) => void;
}

export const OutboundDispatchDrawer: React.FC<OutboundDispatchDrawerProps> = ({
  deliveries,
  onPostDispatch,
}) => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. Active Outbound Dispatch Card */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: '1px solid #e5e7eb',
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CarOutlined style={{ color: '#1677ff', fontSize: 15 }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
              {isZh ? '现场发货与承运调度' : 'Active Outbound Dispatch'}
            </span>
          </div>
          <Tag color="cyan" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
            Bay 07 Staged
          </Tag>
        </div>

        {/* Deliveries list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {deliveries.map((del) => {
            const isDispatched = del.status === 'DISPATCHED';

            return (
              <div
                key={del.id}
                style={{
                  border: `1px solid ${isDispatched ? '#e5e7eb' : '#bfdbfe'}`,
                  backgroundColor: isDispatched ? '#f9fafb' : '#eff6ff',
                  borderRadius: 4,
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                      {isZh ? '出库发货单 (DO):' : 'DELIVERY NOTE:'}
                    </span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1677ff', fontSize: 12 }}>
                      {del.deliveryNo}
                    </div>
                  </div>

                  {isDispatched ? (
                    <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                      {isZh ? `已发运 (${del.dispatchedAt})` : `Dispatched (${del.dispatchedAt})`}
                    </Tag>
                  ) : (
                    <Tag color="processing" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                      {isZh ? '待发货出库' : 'READY TO SHIP'}
                    </Tag>
                  )}
                </div>

                <div style={{ fontSize: 11, color: '#4b5563', lineHeight: '18px', marginBottom: 6 }}>
                  <div>
                    <Text type="secondary">{isZh ? '收货客户: ' : 'Customer: '}</Text>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>
                      {isZh ? del.customerNameZh : del.customerNameEn}
                    </span>
                  </div>
                  <div>
                    <Text type="secondary">{isZh ? '关联销售单: ' : 'SO Ref: '}</Text>
                    <span style={{ fontFamily: 'monospace' }}>{del.salesOrderNo}</span>
                  </div>
                  <div>
                    <Text type="secondary">{isZh ? '承运车牌: ' : 'Truck Plate: '}</Text>
                    <strong style={{ color: '#1f2937' }}>{del.truckPlate}</strong>
                    <span style={{ marginLeft: 6, color: '#6b7280' }}>({del.driverContact})</span>
                  </div>
                  <div>
                    <Text type="secondary">{isZh ? '物流单号: ' : 'Carrier Tracking: '}</Text>
                    <span style={{ fontFamily: 'monospace' }}>{del.carrierTrackingNo}</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                    padding: '6px 8px',
                    fontSize: 11,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>
                    {del.itemOverview}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginTop: 2 }}>
                    <span>
                      {del.palletsCount} {isZh ? '托盘' : 'Pallets'} · <strong className="tnum">{del.grossWeightKg.toLocaleString()} kg</strong>
                    </span>
                    <span className="tnum">{del.volumeCbm} CBM</span>
                  </div>
                </div>

                {!isDispatched && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SendOutlined />}
                      style={{ flex: 1, backgroundColor: '#1677ff', fontSize: 11 }}
                      onClick={() => onPostDispatch(del.id)}
                    >
                      {isZh ? '确认发货出库 (扣库存)' : 'Post Outbound Dispatch'}
                    </Button>
                    <Button
                      size="small"
                      icon={<PrinterOutlined />}
                      style={{ fontSize: 11 }}
                      onClick={() => message.success(isZh ? '正在打印随车送货单与托盘条码...' : 'Printing Manifest & Barcode...')}
                    >
                      {isZh ? '打印单据' : 'Print'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Today's Outbound Loading Dock Schedule */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Space size="small">
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: '#1f2937' }}>
              {isZh ? '今日装车码头泊位看板' : "Today's Outbound Loading Dock"}
            </span>
          </Space>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Bays 05 - 08</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              padding: '6px 8px',
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Tag color="green" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>Bay 05</Tag>
              <span style={{ marginLeft: 6, color: '#374151', fontWeight: 500 }}>
                {isZh ? '比亚迪汽车专线' : 'BYD Auto Express'}
              </span>
            </div>
            <span className="tnum" style={{ color: '#15803d', fontWeight: 600 }}>13:00 (Departed)</span>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              padding: '6px 8px',
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Tag color="cyan" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>Bay 07</Tag>
              <span style={{ marginLeft: 6, color: '#374151', fontWeight: 500 }}>
                {isZh ? '特斯拉 Megapack 重运' : 'Tesla Megapack Freight'}
              </span>
            </div>
            <span className="tnum" style={{ color: '#1677ff', fontWeight: 600 }}>14:30 (Staging 92%)</span>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              padding: '6px 8px',
              fontSize: 11,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Tag color="orange" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>Bay 08</Tag>
              <span style={{ marginLeft: 6, color: '#374151', fontWeight: 500 }}>
                {isZh ? '西门子能源国际海运' : 'Siemens Energy International'}
              </span>
            </div>
            <span className="tnum" style={{ color: '#d97706', fontWeight: 600 }}>16:15 (Awaiting Gate)</span>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, borderTop: '1px dashed #e5e7eb', paddingTop: 6 }}>
          {isZh ? '出库质检放行记录 · IATF-16949 / ISO-9001 溯源' : 'IATF-16949 / ISO-9001 Outbound Release'}
        </div>
      </Card>
    </div>
  );
};
