import React from 'react';
import { Card, Tag, Button, Space, Typography, theme, Empty } from 'antd';
import { message } from '@/utils/antdApp';
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
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';
  const stagedCount = deliveries.filter((d) => d.status === 'STAGED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 1. Active Outbound Dispatch Card */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: token.colorBgContainer,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CarOutlined style={{ color: '#1677ff', fontSize: 15 }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: token.colorText }}>
              {isZh ? '现场发货与承运调度' : 'Active Outbound Dispatch'}
            </span>
          </div>
          <Tag color="cyan" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
            {stagedCount} {isZh ? '批待发运' : 'STAGED'}
          </Tag>
        </div>

        {/* Deliveries list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {deliveries.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={isZh ? '暂无出库发运单' : 'No outbound delivery notes'}
            />
          ) : (
            deliveries.map((del) => {
              const isDispatched = del.status === 'DISPATCHED';

              return (
                <div
                  key={del.id}
                  style={{
                    border: `1px solid ${isDispatched ? token.colorBorderSecondary : token.colorPrimaryBorder}`,
                    backgroundColor: token.colorFillAlter,
                    borderRadius: 4,
                    padding: '10px 12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
                        {isZh ? '出库发货单:' : 'DELIVERY NOTE:'}
                      </span>
                      <div
                        style={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: '#1677ff',
                          fontSize: 12,
                        }}
                      >
                        {del.deliveryNo}
                      </div>
                    </div>

                    {isDispatched ? (
                      <Tag
                        color="success"
                        icon={<CheckCircleOutlined />}
                        style={{ margin: 0, borderRadius: 2, fontSize: 10 }}
                      >
                        {isZh ? `已发运 (${del.dispatchedAt})` : `Dispatched (${del.dispatchedAt})`}
                      </Tag>
                    ) : (
                      <Tag color="processing" style={{ margin: 0, borderRadius: 2, fontSize: 10 }}>
                        {isZh ? '待发货出库' : 'READY TO SHIP'}
                      </Tag>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: token.colorTextSecondary,
                      lineHeight: '18px',
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <Text type="secondary">{isZh ? '收货客户: ' : 'Customer: '}</Text>
                      <span style={{ fontWeight: 600, color: token.colorText }}>
                        {isZh ? del.customerNameZh : del.customerNameEn}
                      </span>
                    </div>
                    <div>
                      <Text type="secondary">{isZh ? '关联销售单: ' : 'SO Ref: '}</Text>
                      <span style={{ fontFamily: 'monospace', color: token.colorText }}>
                        {del.salesOrderNo}
                      </span>
                    </div>
                    <div>
                      <Text type="secondary">{isZh ? '承运车牌: ' : 'Truck Plate: '}</Text>
                      <strong style={{ color: token.colorText }}>{del.truckPlate}</strong>
                      <span style={{ marginLeft: 6, color: token.colorTextSecondary }}>
                        ({del.driverContact})
                      </span>
                    </div>
                    <div>
                      <Text type="secondary">{isZh ? '物流单号: ' : 'Carrier Tracking: '}</Text>
                      <span style={{ fontFamily: 'monospace', color: token.colorText }}>
                        {del.carrierTrackingNo}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: 3,
                      padding: '6px 8px',
                      fontSize: 11,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: token.colorText }}>
                      {del.itemOverview}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: token.colorTextSecondary,
                        marginTop: 2,
                      }}
                    >
                      <span>
                        {del.palletsCount > 0
                          ? `${del.palletsCount} ${isZh ? '托盘' : 'Pallets'}`
                          : isZh
                            ? '标准托盘发运'
                            : 'Standard Pallet Unit'}
                        {del.grossWeightKg > 0 && (
                          <>
                            {' '}
                            ·{' '}
                            <strong className="tnum" style={{ color: token.colorText }}>
                              {del.grossWeightKg.toLocaleString()} kg
                            </strong>
                          </>
                        )}
                      </span>
                      {del.volumeCbm > 0 ? (
                        <span className="tnum">{del.volumeCbm} CBM</span>
                      ) : (
                        <span style={{ fontSize: 10 }}>{isZh ? '待核重' : 'Pending Weigh'}</span>
                      )}
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
                        {isZh ? '确认发货出库' : 'Post Outbound Dispatch'}
                      </Button>
                      <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        style={{ fontSize: 11 }}
                        onClick={() => {
                          window.print();
                          message.success(
                            isZh
                              ? '正在打印随车送货单与托盘条码...'
                              : 'Printing Manifest & Barcode...',
                          );
                        }}
                      >
                        {isZh ? '打印单据' : 'Print'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* 2. Today's Outbound Loading Dock Schedule */}
      <Card
        size="small"
        style={{
          borderRadius: 4,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: token.colorBgContainer,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Space size="small">
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: token.colorText }}>
              {isZh ? '今日装车码头泊位看板' : "Today's Outbound Loading Dock"}
            </span>
          </Space>
          <span style={{ fontSize: 11, color: token.colorTextSecondary }}>Bays 05 - 08</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {deliveries.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '12px 0',
                color: token.colorTextSecondary,
                fontSize: 12,
              }}
            >
              {isZh ? '今日暂无发运排期' : 'No dock dispatches scheduled'}
            </div>
          ) : (
            deliveries.slice(0, 3).map((d) => (
              <div
                key={d.id}
                style={{
                  backgroundColor: token.colorFillAlter,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 3,
                  padding: '6px 8px',
                  fontSize: 11,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Tag
                    color={d.status === 'DISPATCHED' ? 'green' : 'cyan'}
                    style={{ margin: 0, borderRadius: 2, fontSize: 10 }}
                  >
                    {d.shippingBay || 'Shipping Dock'}
                  </Tag>
                  <span style={{ marginLeft: 6, color: token.colorText, fontWeight: 500 }}>
                    {isZh ? d.customerNameZh : d.customerNameEn}
                  </span>
                </div>
                <span
                  className="tnum"
                  style={{
                    color: d.status === 'DISPATCHED' ? '#15803d' : '#1677ff',
                    fontWeight: 600,
                  }}
                >
                  {d.deliveryNo}
                </span>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            fontSize: 11,
            color: token.colorTextSecondary,
            marginTop: 10,
            borderTop: `1px dashed ${token.colorBorderSecondary}`,
            paddingTop: 6,
          }}
        >
          {isZh
            ? '出库质检放行记录 · IATF-16949 / ISO-9001 溯源'
            : 'IATF-16949 / ISO-9001 Outbound Release'}
        </div>
      </Card>
    </div>
  );
};
