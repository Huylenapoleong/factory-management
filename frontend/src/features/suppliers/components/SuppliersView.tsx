import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
} from 'antd';
import { message } from '@/utils/antdApp';
import type { ColumnsType } from 'antd/es/table';
import {
  ShopOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { SupplierRecord, SupplierStatus } from '../types';
import { CreateSupplierModal } from './CreateSupplierModal';

export const SuppliersView: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SupplierStatus | 'ALL'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null);

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
  const suppliersWithOtd = suppliers.filter((s) => s.onTimeDeliveryRate != null);
  const meanOtd =
    suppliersWithOtd.length > 0
      ? Number(
          (
            suppliersWithOtd.reduce((acc, s) => acc + (s.onTimeDeliveryRate || 0), 0) /
            suppliersWithOtd.length
          ).toFixed(1),
        )
      : 0;

  const suppliersWithQc = suppliers.filter((s) => s.qualityPassRate != null);
  const meanIqc =
    suppliersWithQc.length > 0
      ? Number(
          (
            suppliersWithQc.reduce((acc, s) => acc + (s.qualityPassRate || 0), 0) /
            suppliersWithQc.length
          ).toFixed(1),
        )
      : 0;

  const columns: ColumnsType<SupplierRecord> = [
    {
      title: isZh ? '供应商编码' : 'Vendor Code',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff' }}>{val}</span>
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
      render: (grade?: string | null) => {
        if (!grade) return <span style={{ color: '#9ca3af' }}>—</span>;
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
      render: (val?: number | null) =>
        val != null ? (
          <span style={{ fontWeight: 600, color: val >= 95 ? '#15803d' : '#b45309' }}>
            {val.toFixed(1)}%
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>—</span>
        ),
    },
    {
      title: isZh ? '来料合格率' : 'IQC Pass',
      dataIndex: 'qualityPassRate',
      key: 'qualityPassRate',
      width: 110,
      align: 'right',
      render: (val?: number | null) =>
        val != null ? (
          <span style={{ fontWeight: 600, color: val >= 99 ? '#15803d' : '#b45309' }}>
            {val.toFixed(1)}%
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>—</span>
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
      render: (val?: number | null) =>
        val != null && val > 0 ? `${val}d` : <span style={{ color: '#9ca3af' }}>—</span>,
    },
    {
      title: isZh ? '状态' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'warning'}>{status}</Tag>
      ),
    },
    {
      title: isZh ? '操作' : 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => setSelectedSupplier(record)}>
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
              title={
                <span style={{ fontSize: 12 }}>
                  {isZh ? '在册合格供应商' : 'Total Qualified Vendors'}
                </span>
              }
              value={suppliers.length}
              prefix={<ShopOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 12 }}>
                  {isZh ? 'A级战略供应商' : 'Strategic Tier-1 (Grade A)'}
                </span>
              }
              value={strategicGradeACount}
              prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 12 }}>
                  {isZh ? '综合准时交货率' : 'Mean On-Time Delivery'}
                </span>
              }
              value={meanOtd}
              precision={1}
              suffix="%"
              prefix={<FieldTimeOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 12 }}>
                  {isZh ? '来料抽检平均良率' : 'Mean IQC Pass Rate'}
                </span>
              }
              value={meanIqc}
              precision={1}
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
                  { value: 'ACTIVE', label: isZh ? '正常供货' : 'Active' },
                  { value: 'UNDER_REVIEW', label: isZh ? '考察评审中' : 'Under Review' },
                  { value: 'SUSPENDED', label: isZh ? '暂停交易' : 'Suspended' },
                ]}
              />
            </div>

            <Input
              placeholder={
                isZh ? '搜索厂商编码、企业名称、对接人...' : 'Search vendor code, name, contact...'
              }
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
              {isZh ? '新建供应商档案' : 'Register Vendor'}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (filteredSuppliers.length === 0) {
                  message.warning(isZh ? '无供应商数据可导出' : 'No data to export');
                  return;
                }
                const headers = [
                  'Code,Name,NameZh,ContactPerson,Phone,RatingGrade,OnTimeDeliveryRate,QualityPassRate,PaymentTerms,LeadTimeDays,Status',
                ];
                const rows = filteredSuppliers.map(
                  (s) =>
                    `"${s.code}","${s.name}","${s.nameZh}","${s.contactPerson}","${s.phone}","${s.ratingGrade || ''}",${s.onTimeDeliveryRate ?? ''},${s.qualityPassRate ?? ''},"${s.paymentTerms}",${s.leadTimeDays ?? ''},"${s.status}"`,
                );
                const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute(
                  'download',
                  `suppliers_${new Date().toISOString().slice(0, 10)}.csv`,
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                message.success(isZh ? '供应商主数据已成功导出' : 'Suppliers exported');
              }}
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
            showTotal: (total) =>
              `${isZh ? '共' : 'Total'} ${total} ${isZh ? '家供应商' : 'vendors'}`,
          }}
        />
      </Card>

      <CreateSupplierModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchSuppliers}
      />

      {/* Real Supplier Profile Drawer */}
      <Drawer
        title={
          selectedSupplier ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShopOutlined style={{ color: '#1677ff' }} />
              <span>{isZh ? '供应商详细档案' : 'Supplier Dossier & Profile'}</span>
              <Tag color="blue">{selectedSupplier.code}</Tag>
            </div>
          ) : (
            ''
          )
        }
        size={560}
        open={Boolean(selectedSupplier)}
        onClose={() => setSelectedSupplier(null)}
      >
        {selectedSupplier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions
              bordered
              size="small"
              column={1}
              items={[
                {
                  key: 'code',
                  label: isZh ? '供应商编码' : 'Vendor Code',
                  children: <strong>{selectedSupplier.code}</strong>,
                },
                {
                  key: 'nameZh',
                  label: isZh ? '中文名称' : 'Vendor Name (ZH)',
                  children: selectedSupplier.nameZh,
                },
                {
                  key: 'name',
                  label: isZh ? '法定英文名称' : 'Legal Name (EN)',
                  children: selectedSupplier.name,
                },
                {
                  key: 'ratingGrade',
                  label: isZh ? '供应商资质等级' : 'Rating Grade',
                  children: (
                    <Tag
                      color={
                        selectedSupplier.ratingGrade === 'A'
                          ? 'success'
                          : selectedSupplier.ratingGrade === 'B'
                            ? 'blue'
                            : 'warning'
                      }
                    >
                      Grade {selectedSupplier.ratingGrade || 'N/A'}
                    </Tag>
                  ),
                },
                {
                  key: 'status',
                  label: isZh ? '合作状态' : 'Status',
                  children: (
                    <Tag color={selectedSupplier.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {selectedSupplier.status}
                    </Tag>
                  ),
                },
                {
                  key: 'contactPerson',
                  label: isZh ? '主要对接人' : 'Contact Person',
                  children: selectedSupplier.contactPerson,
                },
                {
                  key: 'phone',
                  label: isZh ? '联系电话' : 'Phone',
                  children: selectedSupplier.phone,
                },
                {
                  key: 'email',
                  label: isZh ? '电子邮箱' : 'Email',
                  children: selectedSupplier.email,
                },
                {
                  key: 'address',
                  label: isZh ? '经营注册地址' : 'Address',
                  children: selectedSupplier.address,
                },
                {
                  key: 'taxNumber',
                  label: isZh ? '统一税号 / 信用代码' : 'Tax Number',
                  children: selectedSupplier.taxNumber,
                },
                {
                  key: 'paymentTerms',
                  label: isZh ? '结算账期' : 'Payment Terms',
                  children: selectedSupplier.paymentTerms,
                },
                {
                  key: 'leadTime',
                  label: isZh ? '标准交付周期' : 'Lead Time',
                  children: selectedSupplier.leadTimeDays
                    ? `${selectedSupplier.leadTimeDays} days`
                    : '—',
                },
                {
                  key: 'otd',
                  label: isZh ? '历史准时交货率 (OTD)' : 'OTD Rate',
                  children:
                    selectedSupplier.onTimeDeliveryRate != null
                      ? `${selectedSupplier.onTimeDeliveryRate.toFixed(1)}%`
                      : '—',
                },
                {
                  key: 'iqc',
                  label: isZh ? '来料检验合格率 (IQC)' : 'Quality Pass Rate',
                  children:
                    selectedSupplier.qualityPassRate != null
                      ? `${selectedSupplier.qualityPassRate.toFixed(1)}%`
                      : '—',
                },
                ...(selectedSupplier.updatedAt
                  ? [
                      {
                        key: 'updatedAt',
                        label: isZh ? '最近审计更新' : 'Last Audited',
                        children: selectedSupplier.updatedAt,
                      },
                    ]
                  : []),
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button onClick={() => setSelectedSupplier(null)}>{isZh ? '关闭' : 'Close'}</Button>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  setSelectedSupplier(null);
                  navigate('/purchasing');
                }}
              >
                {isZh ? '发起采购协同' : 'Initiate Purchase Order'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SuppliersView;
