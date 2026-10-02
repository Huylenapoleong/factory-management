import React, { useState } from 'react';
import { Card, Timeline, Tag, Radio, Button } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  SwapOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { StockMovementItem, StockMovementType } from '../types';

interface StockMovementsTimelineCardProps {
  movements: StockMovementItem[];
}

export const StockMovementsTimelineCard: React.FC<StockMovementsTimelineCardProps> = ({
  movements,
}) => {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredMovements = movements.filter((mov) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'INBOUND') return mov.type === 'PO_INBOUND';
    if (filterType === 'OUTBOUND') return mov.type === 'SO_OUTBOUND' || mov.type === 'PRODUCTION_ISSUE';
    if (filterType === 'RETURN') return mov.type === 'QC_RETURN';
    return true;
  });

  const getMovementDot = (type: StockMovementType) => {
    switch (type) {
      case 'PO_INBOUND':
        return <ArrowDownOutlined style={{ color: '#52c41a' }} />;
      case 'PRODUCTION_ISSUE':
        return <ArrowUpOutlined style={{ color: '#1677ff' }} />;
      case 'SO_OUTBOUND':
        return <SwapOutlined style={{ color: '#722ed1' }} />;
      case 'QC_RETURN':
        return <RollbackOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getMovementBadge = (type: StockMovementType, qty: number, uom: string) => {
    const isPositive = qty > 0;
    const color = isPositive ? 'success' : type === 'SO_OUTBOUND' ? 'purple' : 'processing';

    return (
      <Tag color={color} style={{ fontSize: 11, borderRadius: 2, margin: 0, padding: '0 6px' }} className="tnum">
        {isPositive ? `+${qty}` : qty} {uom}
      </Tag>
    );
  };

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            {t('dashboard.recentStockMovements')}
          </span>
          <Radio.Group
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="ALL">{t('dashboard.allMovements')}</Radio.Button>
            <Radio.Button value="INBOUND">{t('dashboard.inbound')}</Radio.Button>
            <Radio.Button value="OUTBOUND">{t('dashboard.outbound')}</Radio.Button>
          </Radio.Group>
        </div>
      }
      style={{
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        marginTop: 12,
      }}
      styles={{ body: { padding: '14px 14px 8px 14px' } }}
    >
      <Timeline
        style={{ marginTop: 6 }}
        items={filteredMovements.map((mov) => ({
          icon: getMovementDot(mov.type),
          content: (
            <div style={{ paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span className="tnum" style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                  {mov.timestamp} &nbsp;|&nbsp; <span style={{ color: '#1677ff' }}>{mov.referenceDoc}</span>
                </span>
                {getMovementBadge(mov.type, mov.quantity, mov.uom)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                {language === 'zh-CN' ? mov.itemNameZh : mov.itemName}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span>{language === 'zh-CN' ? mov.warehouseZh : mov.warehouse}</span>
                <span style={{ color: '#9ca3af' }}>{mov.operator}</span>
              </div>
            </div>
          ),
        }))}
      />

      <div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
        <Button type="link" size="small" style={{ fontSize: 11, color: '#1677ff' }}>
          {t('dashboard.viewAllLogistics')} →
        </Button>
      </div>
    </Card>
  );
};

export default StockMovementsTimelineCard;
