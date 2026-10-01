import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

export const DashboardView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: 24 }}>
      <h2>{t('menu.dashboard')}</h2>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Inventory Items" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Pending Purchase Orders" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Active Production Orders" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Open Sales Orders" value={0} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
