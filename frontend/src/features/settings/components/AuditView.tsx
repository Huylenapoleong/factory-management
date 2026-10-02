import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, Select, Row, Col, Statistic, Button, message, Space, theme } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  AuditOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { auditService } from '@/services/auditService';
import { AuditLogItem } from '../types';

export const AuditView: React.FC = () => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        const data = await auditService.getAuditLogs();
        if (isMounted) setLogs(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedEntity !== 'ALL' && log.entityType !== selectedEntity) return false;
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      return (
        log.username.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.detailsEn.toLowerCase().includes(q) ||
        log.detailsZh.includes(q) ||
        log.ipAddress.includes(q)
      );
    }
    return true;
  });

  const columns: TableColumnsType<AuditLogItem> = [
    {
      title: isZh ? '时间戳' : 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (ts: string) => (
        <span className="tnum" style={{ fontFamily: 'monospace', fontSize: 12, color: '#374151' }}>
          {ts}
        </span>
      ),
    },
    {
      title: isZh ? '操作人与岗位' : 'Operator & Role',
      key: 'operatorInfo',
      width: 190,
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 600, color: '#1677ff' }}>{record.username}</span>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {isZh ? record.userRoleZh : record.userRoleEn}
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '动作类型' : 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (act: string) => {
        switch (act) {
          case 'SHIP':
            return <Tag color="geekblue" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '发货' : 'SHIP'}</Tag>;
          case 'CONFIRM':
            return <Tag color="blue" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '确认' : 'CONFIRM'}</Tag>;
          case 'POST':
            return <Tag color="green" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '过账' : 'POST'}</Tag>;
          case 'LOGIN':
            return <Tag color="cyan" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '登录' : 'LOGIN'}</Tag>;
          case 'UPDATE':
            return <Tag color="orange" style={{ margin: 0, borderRadius: 2 }}>{isZh ? '变更' : 'UPDATE'}</Tag>;
          default:
            return <Tag style={{ margin: 0 }}>{act}</Tag>;
        }
      },
    },
    {
      title: isZh ? '目标凭单/实体' : 'Target Entity',
      key: 'entity',
      width: 150,
      render: (_, record) => (
        <div>
          <span className="tnum" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1f2937' }}>
            {record.entityId}
          </span>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{record.entityType}</div>
        </div>
      ),
    },
    {
      title: isZh ? '操作事件审计记录' : 'Audit Event Details',
      key: 'details',
      render: (_, record) => (
        <span style={{ fontSize: 12, color: '#374151' }}>
          {isZh ? record.detailsZh : record.detailsEn}
        </span>
      ),
    },
    {
      title: isZh ? '终端 IP / MAC' : 'Terminal IP / MAC',
      key: 'ip',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="tnum" style={{ fontFamily: 'monospace', fontSize: 11, color: '#4b5563' }}>
            {record.ipAddress}
          </div>
          {record.macAddress && (
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#9ca3af' }}>
              {record.macAddress}
            </div>
          )}
        </div>
      ),
    },
    {
      title: isZh ? '校验结果' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag
          color={status === 'SUCCESS' ? 'success' : 'warning'}
          icon={status === 'SUCCESS' ? <CheckCircleOutlined /> : <AlertOutlined />}
          style={{ margin: 0, borderRadius: 2, fontSize: 11 }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1920, margin: '0 auto' }}>
      {/* 1. KPI Ribbon */}
      <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: token.colorTextSecondary }}>{isZh ? '今日审计事件总数' : 'TOTAL AUDIT EVENTS'}</span>}
              value={1492}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#1677ff' } }}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #86efac', backgroundColor: token.colorFillAlter }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#15803d' }}>{isZh ? '合规溯源达成度' : 'COMPLIANCE INTEGRITY'}</span>}
              value={100}
              suffix="%"
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#15803d' } }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #fed7aa', backgroundColor: token.colorFillAlter }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: '#d97706' }}>{isZh ? '质量异常评审 (NCR)' : 'FLAGGED NCRs'}</span>}
              value={1}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: '#d97706' } }}
              prefix={<AlertOutlined />}
              suffix={<span style={{ fontSize: 11, color: '#b45309', marginLeft: 4 }}>Pending Review</span>}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} lg={6}>
          <Card size="small" style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: token.colorTextSecondary }}>{isZh ? '在线车间工控机 / PDA' : 'ONLINE TERMINALS'}</span>}
              value={24}
              styles={{ content: { fontSize: 20, fontWeight: 700, color: token.colorText } }}
              suffix={<span style={{ fontSize: 11, color: '#10b981', marginLeft: 6 }}>TLS 1.3 Active</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Filter Bar */}
      <Card
        size="small"
        style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer, marginBottom: 12 }}
        styles={{ body: { padding: '10px 14px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Space wrap size="small">
            <Select
              size="small"
              value={selectedEntity}
              onChange={setSelectedEntity}
              style={{ width: 180 }}
              options={[
                { value: 'ALL', label: isZh ? '全部业务实体 (All Entities)' : 'All Entities' },
                { value: 'PRODUCTION_ORDER', label: isZh ? '车间生产工单' : 'Production Orders' },
                { value: 'STOCK_MOVEMENT', label: isZh ? '仓储物料出入库' : 'Stock Movements' },
                { value: 'PURCHASE_ORDER', label: isZh ? '采购订单' : 'Purchase Orders' },
                { value: 'SALES_ORDER', label: isZh ? '销售发货出库' : 'Sales & Deliveries' },
                { value: 'SYSTEM_AUTH', label: isZh ? '系统鉴权认证' : 'System Authentication' },
              ]}
            />

            <Select
              size="small"
              value={selectedAction}
              onChange={setSelectedAction}
              style={{ width: 140 }}
              options={[
                { value: 'ALL', label: isZh ? '全部动作 (All Actions)' : 'All Actions' },
                { value: 'CONFIRM', label: 'CONFIRM / 确认' },
                { value: 'POST', label: 'POST / 过账' },
                { value: 'SHIP', label: 'SHIP / 发货' },
                { value: 'UPDATE', label: 'UPDATE / 变更' },
                { value: 'LOGIN', label: 'LOGIN / 登录' },
              ]}
            />

            <Input
              placeholder={isZh ? '搜索用户名、单据号、事件描述、IP...' : 'Search user, doc#, details, IP...'}
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              size="small"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 260 }}
            />
          </Space>

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => message.success(isZh ? '正在导出不可篡改审计台账 (SHA-256 Validated)...' : 'Exporting Signed Audit Ledger...')}
          >
            {isZh ? '导出合规审计报表' : 'Export Audit CSV'}
          </Button>
        </div>
      </Card>

      {/* 3. Table */}
      <Card
        size="small"
        style={{ borderRadius: 4, border: `1px solid ${token.colorBorderSecondary}`, backgroundColor: token.colorBgContainer }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={filteredLogs}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (isZh ? `共 ${total} 条不可篡改审计记录` : `Total ${total} audit records`),
            size: 'small',
            style: { paddingRight: 14, marginBottom: 10 },
          }}
          scroll={{ x: 1050 }}
        />
      </Card>
    </div>
  );
};

export default AuditView;
