import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Button, Space, Row, Col, Statistic, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ShopOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { SupplierRecord, SupplierStatus } from '../types';
import { CreateSupplierModal } from './CreateSupplierModal';

export const SuppliersView: React.FC = () => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SupplierStatus | 'ALL'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchSuppliers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await masterDataService.getSuppliers();
      setSuppliers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    masterDataService.getSuppliers().then((data) => {
      if (active) setSuppliers(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    const q = searchText.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.nameZh.includes(q) ||
      s.contactPerson.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const strategicGradeACount = suppliers.filter((s) => s.ratingGrade === 'A').length;

  const columns: ColumnsType<SupplierRecord> = [
    {
      title: isZh ? '供应商编码' : 'Vendor Code',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff' }}>
          {val}
        </span>
      ),
    },
    {
      title: isZh ? '供应商企业名称' : 'Vendor Enterprise Name',
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {isZh ? r.nameZh : r.name}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {isZh ? r.name : r.nameZh} • <span style={{ color: '#4b5563' }}>{r.address}</span>
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '商务对接' : 'Contact Person',
      key: 'contact',
      width: 160,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ fontWeight: 500 }}>{r.contactPerson}</div>
          <div style={{ color: '#6b7280', fontSize: 11 }}>{r.phone}</div>
        </div>
      ),
    },
    {
      title: isZh ? '资质评级' : 'Rating',
      dataIndex: 'ratingGrade',
      key: 'ratingGrade',
      width: 90,
      align: 'center',
      render: (grade: string) => {
        const color = grade === 'A' ? 'green' : grade === 'B' ? 'blue' : 'orange';
        return <Tag color={color}>Grade {grade}</Tag>;
      },
    },
    {
      title: isZh ? '准时交付率' : 'OTD Rate',
      dataIndex: 'onTimeDeliveryRate',
      key: 'onTimeDeliveryRate',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: val >= 95 ? '#15803d' : '#b45309' }}>
          {val.toFixed(1)}%
        </span>
      ),
    },
    {
      title: isZh ? '来料合格率' : 'IQC Pass',
      dataIndex: 'qualityPassRate',
      key: 'qualityPassRate',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: val >= 99 ? '#15803d' : '#b45309' }}>
          {val.toFixed(1)}%
        </span>
      ),
    },
    {
      title: isZh ? '账期' : 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 110,
    },
    {
      title: isZh ? '交货期' : 'Lead Time',
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      width: 90,
      align: 'center',
      render: (val: number) => `${val}d`,
    },
    {
      title: isZh ? '状态' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: isZh ? '操作' : 'Action',
      key: 'action',
      width: 80,
      render: () => (
        <Button
          type="link"
          size="small"
          onClick={() => message.info(isZh ? '正在调取供应商审计与往来采购流水...' : 'Loading vendor history...')}
        >
          {isZh ? '档案' : 'Profile'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* KPI Metrics Strip */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '在册合格供应商' : 'Total Qualified Vendors'}</span>}
              value={suppliers.length}
              prefix={<ShopOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? 'A级战略供应商' : 'Strategic Tier-1 (Grade A)'}</span>}
              value={strategicGradeACount}
              prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '综合准时交货率' : 'Mean On-Time Delivery'}</span>}
              value={96.6}
              suffix="%"
              prefix={<FieldTimeOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '来料抽检平均良率' : 'Mean IQC Pass Rate'}</span>}
              value={99.4}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Control Filter Bar */}
      <Card
        size="small"
        style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}
        styles={{ body: { padding: '10px 14px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Space wrap size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                {isZh ? '状态筛选:' : 'Status:'}
              </span>
              <Select
                size="small"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 160 }}
                options={[
                  { value: 'ALL', label: isZh ? '全部供应商' : 'All Vendors' },
                  { value: 'ACTIVE', label: isZh ? '正常供货 (Active)' : 'Active' },
                  { value: 'UNDER_REVIEW', label: isZh ? '考察评审中' : 'Under Review' },
                  { value: 'SUSPENDED', label: isZh ? '暂停交易' : 'Suspended' },
                ]}
              />
            </div>

            <Input
              placeholder={isZh ? '搜索厂商编码、企业名称、对接人...' : 'Search vendor code, name, contact...'}
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
          </Space>

          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ backgroundColor: '#1677ff' }}
            >
              {isZh ? '+ 新建供应商档案' : '+ Register Vendor'}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.success(isZh ? '正在导出供应商主数据...' : 'Exporting Vendors CSV...')}
            >
              {isZh ? '导出台账' : 'Export CSV'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card
        size="small"
        style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={filteredSuppliers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${isZh ? '共' : 'Total'} ${total} ${isZh ? '家供应商' : 'vendors'}`,
          }}
        />
      </Card>

      <CreateSupplierModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchSuppliers}
      />
    </div>
  );
};

export default SuppliersView;
