import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Button, Space, Row, Col, Statistic, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TeamOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { CustomerRecord, CustomerStatus } from '../types';
import { CreateCustomerModal } from './CreateCustomerModal';

export const CustomersView: React.FC = () => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | 'ALL'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await masterDataService.getCustomers();
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    masterDataService.getCustomers().then((data) => {
      if (active) setCustomers(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const q = searchText.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.nameZh.includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalCreditPool = customers.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalActiveOrders = customers.reduce((sum, c) => sum + c.activeOrdersCount, 0);

  const columns: ColumnsType<CustomerRecord> = [
    {
      title: isZh ? '客户编码' : 'Account Code',
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
      title: isZh ? '客户企业名称' : 'Client Enterprise Name',
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {isZh ? r.nameZh : r.name}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {isZh ? r.name : r.nameZh} • <span style={{ color: '#4b5563' }}>{r.shippingAddress}</span>
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '行业' : 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 140,
      render: (industry: string) => <Tag color="geekblue">{industry}</Tag>,
    },
    {
      title: isZh ? '商务联系人' : 'Contact Person',
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
      title: isZh ? '授信额度' : 'Credit Limit',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 130,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: '#0f766e' }}>
          ${val.toLocaleString()}
        </span>
      ),
    },
    {
      title: isZh ? '结算账期' : 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 110,
    },
    {
      title: isZh ? '进行中订单' : 'Active Orders',
      dataIndex: 'activeOrdersCount',
      key: 'activeOrdersCount',
      width: 100,
      align: 'center',
      render: (val: number) => (
        <Tag color={val > 0 ? 'processing' : 'default'}>
          {val} {isZh ? '笔' : 'orders'}
        </Tag>
      ),
    },
    {
      title: isZh ? '状态' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CustomerStatus) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
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
          onClick={() => message.info(isZh ? '正在调取客户订单与发货记录...' : 'Loading sales history...')}
        >
          {isZh ? '台账' : 'Ledger'}
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
              title={<span style={{ fontSize: 12 }}>{isZh ? '总合作商业客户' : 'Total Client Accounts'}</span>}
              value={customers.length}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '总授信额度池' : 'Total Credit Pool'}</span>}
              value={totalCreditPool}
              prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
              formatter={(val) => `$${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '正在执行销售订单' : 'Active Sales Orders'}</span>}
              value={totalActiveOrders}
              prefix={<FileDoneOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '平均结算账期' : 'Mean Payment Terms'}</span>}
              value="Net 45"
              prefix={<CreditCardOutlined style={{ color: '#faad14' }} />}
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
                {isZh ? '客户状态:' : 'Status:'}
              </span>
              <Select
                size="small"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 160 }}
                options={[
                  { value: 'ALL', label: isZh ? '全部客户状态' : 'All Status' },
                  { value: 'ACTIVE', label: isZh ? '正常交易 (Active)' : 'Active' },
                  { value: 'CREDIT_HOLD', label: isZh ? '信用冻结 (Credit Hold)' : 'Credit Hold' },
                  { value: 'INACTIVE', label: isZh ? '已停用' : 'Inactive' },
                ]}
              />
            </div>

            <Input
              placeholder={isZh ? '搜索客户编码、名称、对接人、行业...' : 'Search account code, name, contact, industry...'}
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
              {isZh ? '+ 新建客户档案' : '+ Register Account'}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.success(isZh ? '正在导出客户名录清单...' : 'Exporting Customers CSV...')}
            >
              {isZh ? '导出清单' : 'Export CSV'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main Table */}
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
          dataSource={filteredCustomers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${isZh ? '共' : 'Total'} ${total} ${isZh ? '家客户' : 'accounts'}`,
          }}
        />
      </Card>

      <CreateCustomerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchCustomers}
      />
    </div>
  );
};

export default CustomersView;
