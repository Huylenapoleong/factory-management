import React, { useState, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  Tag,
  Button,
  Tabs,
  Row,
  Col,
  Steps,
  Alert,
  Typography,
  Space,
  Table,
  theme,
  Empty,
} from 'antd';
import {
  BookOutlined,
  SearchOutlined,
  UserOutlined,
  KeyOutlined,
  DashboardOutlined,
  AlertOutlined,
  ToolOutlined,
  InboxOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  ShopOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  PartitionOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  FilterOutlined,
  AimOutlined,
  GlobalOutlined,
  CrownOutlined,
  ControlOutlined,
  EyeOutlined,
  RiseOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useRbac } from '@/hooks/useRbac';
import { EnterpriseRole } from '@/utils/rbac';
import { FEATURE_GUIDE_MODULES } from '../guideData';

const { Title, Text, Paragraph } = Typography;

interface UserGuideViewProps {
  embedded?: boolean;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ embedded = false }) => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const isZh = language === 'zh-CN';
  const { primaryRole, roles, user } = useRbac();

  // Role filter: 'MY_ROLE' | 'ALL' | specific EnterpriseRole
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('MY_ROLE');
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Determine active effective role(s) to filter by
  const effectiveRoles = useMemo<EnterpriseRole[]>(() => {
    if (selectedRoleFilter === 'ALL') {
      return ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'];
    }
    if (selectedRoleFilter === 'MY_ROLE') {
      if (primaryRole && primaryRole !== 'UNKNOWN') {
        return [primaryRole];
      }
      return ['VIEWER'];
    }
    return [selectedRoleFilter as EnterpriseRole];
  }, [selectedRoleFilter, primaryRole]);

  // Filter modules based on role and search query
  const filteredModules = useMemo(() => {
    return FEATURE_GUIDE_MODULES.filter((mod) => {
      // 1. Role matching: Does the module allow any of the effective roles?
      const matchesRole =
        selectedRoleFilter === 'ALL' || mod.allowedRoles.some((r) => effectiveRoles.includes(r));

      if (!matchesRole) return false;

      // 2. Category matching
      if (activeCategory !== 'ALL' && mod.category !== activeCategory) {
        return false;
      }

      // 3. Search text matching
      if (!searchText.trim()) return true;
      const q = searchText.toLowerCase().trim();
      const matchTitle =
        mod.titleZh.toLowerCase().includes(q) || mod.titleEn.toLowerCase().includes(q);
      const matchSummary =
        mod.summaryZh.toLowerCase().includes(q) || mod.summaryEn.toLowerCase().includes(q);
      const matchHotkey = mod.hotkey?.toLowerCase().includes(q);
      const matchFeatures =
        mod.keyFeaturesZh.some((f) => f.toLowerCase().includes(q)) ||
        mod.keyFeaturesEn.some((f) => f.toLowerCase().includes(q));

      return matchTitle || matchSummary || matchHotkey || matchFeatures;
    });
  }, [effectiveRoles, selectedRoleFilter, activeCategory, searchText]);

  // Icon mapping
  const renderIcon = (name: string) => {
    const iconStyle = { fontSize: 20, color: token.colorPrimary };
    switch (name) {
      case 'DashboardOutlined':
        return <DashboardOutlined style={iconStyle} />;
      case 'ToolOutlined':
        return <ToolOutlined style={iconStyle} />;
      case 'PartitionOutlined':
        return <PartitionOutlined style={iconStyle} />;
      case 'InboxOutlined':
        return <InboxOutlined style={iconStyle} />;
      case 'ShoppingOutlined':
        return <ShoppingOutlined style={iconStyle} />;
      case 'ShoppingCartOutlined':
        return <ShoppingCartOutlined style={iconStyle} />;
      case 'AppstoreOutlined':
        return <AppstoreOutlined style={iconStyle} />;
      case 'ShopOutlined':
        return <ShopOutlined style={iconStyle} />;
      case 'SettingOutlined':
        return <SettingOutlined style={iconStyle} />;
      case 'SafetyCertificateOutlined':
        return <SafetyCertificateOutlined style={iconStyle} />;
      case 'AuditOutlined':
        return <AuditOutlined style={iconStyle} />;
      default:
        return <BookOutlined style={iconStyle} />;
    }
  };

  // Hotkeys reference data
  const hotkeysData = [
    {
      key: '1',
      shortcut: 'Alt + D',
      actionZh: '直达中央监控总览仪表盘',
      actionEn: 'Navigate to Central Operations Dashboard',
      moduleZh: '监控总览',
      moduleEn: 'Overview',
      roles: ['ALL'],
    },
    {
      key: '2',
      shortcut: 'Alt + P',
      actionZh: '直达车间工单排产与执行中心',
      actionEn: 'Navigate to Production Execution & Orders',
      moduleZh: '生产排产',
      moduleEn: 'Production',
      roles: ['ADMIN', 'MANAGER', 'PRODUCTION'],
    },
    {
      key: '3',
      shortcut: 'Alt + I',
      actionZh: '直达仓储调拨、盘点与在库台账',
      actionEn: 'Navigate to Warehouse Inventory & Logistics',
      moduleZh: '仓储物流',
      moduleEn: 'Inventory',
      roles: ['ADMIN', 'MANAGER', 'WAREHOUSE', 'PURCHASING', 'SALES'],
    },
    {
      key: '4',
      shortcut: 'Alt + B',
      actionZh: '直达采购订单、来料质检与收货',
      actionEn: 'Navigate to Purchasing Orders & Inbound QC',
      moduleZh: '采购供应链',
      moduleEn: 'Purchasing',
      roles: ['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE'],
    },
    {
      key: '5',
      shortcut: 'Alt + S',
      actionZh: '直达销售订单管理与发货出库',
      actionEn: 'Navigate to Sales & Outbound Deliveries',
      moduleZh: '销售发运',
      moduleEn: 'Sales',
      roles: ['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE'],
    },
    {
      key: '6',
      shortcut: 'Alt + M',
      actionZh: '直达工程物料主数据与规格档案',
      actionEn: 'Navigate to Item Master Data & BOM',
      moduleZh: '物料档案',
      moduleEn: 'Master Data',
      roles: ['ALL'],
    },
    {
      key: '7',
      shortcut: 'Alt + A',
      actionZh: '直达合规审计追踪与不可篡改日志',
      actionEn: 'Navigate to Compliance Audit Trail',
      moduleZh: '审计合规',
      moduleEn: 'Audit',
      roles: ['ADMIN', 'VIEWER'],
    },
    {
      key: '8',
      shortcut: 'Alt + T',
      actionZh: '直达工厂参数配置与协议连通性',
      actionEn: 'Navigate to Plant Settings & Protocols',
      moduleZh: '系统设置',
      moduleEn: 'Settings',
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      key: '9',
      shortcut: 'Alt + K',
      actionZh: '一键进入车间大屏 TV Kiosk 轮播 HUD',
      actionEn: 'Toggle Shop-Floor TV Kiosk Fullscreen HUD',
      moduleZh: '大屏看板',
      moduleEn: 'TV Kiosk',
      roles: ['ALL'],
    },
    {
      key: '10',
      shortcut: 'Alt + H',
      actionZh: '打开电子班组交接记录单（一键打印）',
      actionEn: 'Open Shift Handover Docket (1-Click Print)',
      moduleZh: '班组交接',
      moduleEn: 'Handover',
      roles: ['ADMIN', 'MANAGER', 'PRODUCTION'],
    },
    {
      key: '11',
      shortcut: 'Alt + X',
      actionZh: '快速折叠 / 展开侧边导航栏',
      actionEn: 'Toggle Sidebar Collapse/Expand',
      moduleZh: '界面布局',
      moduleEn: 'Layout',
      roles: ['ALL'],
    },
    {
      key: '12',
      shortcut: 'F1 / Shift + ?',
      actionZh: '随时调阅本全局操作指南与 SOP 手册',
      actionEn: 'Open User Guide & SOP Manual',
      moduleZh: '全局帮助',
      moduleEn: 'Help',
      roles: ['ALL'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: embedded ? 12 : 16 }}>
      {/* 1. Header Banner & Dynamic Role Identification */}
      <Card
        size="small"
        style={{
          borderRadius: 8,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
              <Title level={4} style={{ margin: 0 }}>
                {isZh
                  ? 'WIFIM 智能制造管理系统 · 全功能业务操作手册与作业规范 (SOP)'
                  : 'WIFIM MES Enterprise · Comprehensive User Guide & SOP Manual'}
              </Title>
            </div>
            <Paragraph
              style={{
                margin: '6px 0 0 0',
                color: token.colorTextSecondary,
                fontSize: 13,
              }}
            >
              {isZh
                ? '涵盖车间排产、BOM工程、仓储物流、采购质检、销售履约及系统管控。系统已根据您当前账号角色自动启用自适应权限过滤。'
                : 'Role-adaptive guide covering shop-floor MES, engineering BOMs, WMS inventory, procurement QC, and plant governance.'}
            </Paragraph>
          </div>

          {/* Current Logged-in Identity Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <UserOutlined style={{ color: token.colorPrimary }} />
            <div>
              <div style={{ fontSize: 11, color: token.colorTextTertiary }}>
                {isZh ? '当前登录操作员' : 'Current Operator'}:{' '}
                <strong>{user?.fullName || user?.username || 'Guest'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {isZh ? '核定角色' : 'Role(s)'}:
                </span>
                {roles && roles.length > 0 ? (
                  roles.map((r) => (
                    <Tag key={r} color="blue" style={{ margin: 0, fontWeight: 600 }}>
                      {r}
                    </Tag>
                  ))
                ) : (
                  <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                    {primaryRole}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Controls Bar: Role Selector, Search Input, Category Pills */}
      <Card
        size="small"
        style={{
          borderRadius: 8,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* Left: Role Filter Selector */}
          <Space size="middle" wrap>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FilterOutlined style={{ color: token.colorPrimary }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {isZh ? '视图过滤模式' : 'Guide Perspective'}:
              </span>
            </div>

            <Select
              value={selectedRoleFilter}
              onChange={setSelectedRoleFilter}
              style={{ width: 330 }}
              size="middle"
              options={[
                {
                  value: 'MY_ROLE',
                  label: (
                    <Space size={6}>
                      <AimOutlined style={{ color: token.colorPrimary }} />
                      <span>
                        {isZh
                          ? `专属指南（仅显示 ${primaryRole} 权责）`
                          : `Tailored Guide (${primaryRole} Access)`}
                      </span>
                    </Space>
                  ),
                },
                {
                  value: 'ALL',
                  label: (
                    <Space size={6}>
                      <GlobalOutlined style={{ color: '#13c2c2' }} />
                      <span>
                        {isZh
                          ? '全景总览（查看全厂所有 11 个模块）'
                          : 'Complete Plant Overview (All 11 Modules)'}
                      </span>
                    </Space>
                  ),
                },
                {
                  value: 'ADMIN',
                  label: (
                    <Space size={6}>
                      <CrownOutlined style={{ color: '#faad14' }} />
                      <span>ADMIN ({isZh ? '系统管理与厂长' : 'System Administrator'})</span>
                    </Space>
                  ),
                },
                {
                  value: 'MANAGER',
                  label: (
                    <Space size={6}>
                      <ControlOutlined style={{ color: '#722ed1' }} />
                      <span>MANAGER ({isZh ? '运营总监 / 生产主管' : 'Operations Manager'})</span>
                    </Space>
                  ),
                },
                {
                  value: 'PRODUCTION',
                  label: (
                    <Space size={6}>
                      <ToolOutlined style={{ color: '#1677ff' }} />
                      <span>
                        PRODUCTION ({isZh ? '车间调度 / 操机工' : 'Shop Floor & Machine'})
                      </span>
                    </Space>
                  ),
                },
                {
                  value: 'WAREHOUSE',
                  label: (
                    <Space size={6}>
                      <InboxOutlined style={{ color: '#d48806' }} />
                      <span>
                        WAREHOUSE ({isZh ? '仓管 / 物流配送员' : 'Warehouse & Logistics'})
                      </span>
                    </Space>
                  ),
                },
                {
                  value: 'PURCHASING',
                  label: (
                    <Space size={6}>
                      <ShoppingCartOutlined style={{ color: '#52c41a' }} />
                      <span>
                        PURCHASING ({isZh ? '采购员 / 供应商管理' : 'Procurement Specialist'})
                      </span>
                    </Space>
                  ),
                },
                {
                  value: 'SALES',
                  label: (
                    <Space size={6}>
                      <RiseOutlined style={{ color: '#eb2f96' }} />
                      <span>SALES ({isZh ? '销售代表 / 客户经理' : 'Sales & Deliveries'})</span>
                    </Space>
                  ),
                },
                {
                  value: 'VIEWER',
                  label: (
                    <Space size={6}>
                      <EyeOutlined style={{ color: '#8c8c8c' }} />
                      <span>VIEWER ({isZh ? '审计人员 / 访客只读' : 'Auditor & Observer'})</span>
                    </Space>
                  ),
                },
              ]}
            />

            {/* Category pills */}
            <Select
              value={activeCategory}
              onChange={setActiveCategory}
              style={{ width: 160 }}
              size="middle"
              options={[
                { value: 'ALL', label: isZh ? '全部分类' : 'All Categories' },
                { value: 'CORE', label: isZh ? '核心看板与主数据' : 'Core & Master Data' },
                { value: 'OPERATIONS', label: isZh ? '生产排产与BOM' : 'Manufacturing & BOM' },
                { value: 'SUPPLY_CHAIN', label: isZh ? '仓储、采购与销售' : 'Supply Chain & WMS' },
                { value: 'GOVERNANCE', label: isZh ? '系统配置与审计' : 'Governance & Audit' },
              ]}
            />
          </Space>

          {/* Right: Real-time search */}
          <Input
            placeholder={
              isZh
                ? '搜索功能、快捷键、操作规程或流程关键词...'
                : 'Search feature, hotkey, or workflow SOP...'
            }
            prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 320 }}
          />
        </div>
      </Card>

      {/* 3. Main Multi-Tab Knowledge Center */}
      <Tabs
        defaultActiveKey="manual"
        items={[
          {
            key: 'manual',
            icon: <BookOutlined />,
            label: isZh
              ? `分模块详细操作指导 (${filteredModules.length})`
              : `Module-by-Module SOP Manual (${filteredModules.length})`,
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                {filteredModules.length === 0 ? (
                  <Empty
                    description={
                      isZh
                        ? '未找到匹配所选角色或搜索条件的业务功能模块'
                        : 'No modules match the selected role or search keyword'
                    }
                  />
                ) : (
                  filteredModules.map((mod) => {
                    const hasAccess =
                      primaryRole === 'ADMIN' ||
                      mod.allowedRoles.includes(primaryRole as EnterpriseRole);

                    return (
                      <Card
                        key={mod.id}
                        size="small"
                        style={{
                          borderRadius: 8,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Card Header */}
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 8,
                              borderBottom: `1px solid ${token.colorBorderSecondary}`,
                              paddingBottom: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {renderIcon(mod.iconName)}
                              <div>
                                <span
                                  style={{ fontWeight: 700, fontSize: 15, color: token.colorText }}
                                >
                                  {isZh ? mod.titleZh : mod.titleEn}
                                </span>
                                <Tag color="processing" style={{ marginLeft: 8, fontSize: 11 }}>
                                  {isZh ? mod.badgeZh : mod.badgeEn}
                                </Tag>
                                {mod.hotkey && (
                                  <Tag
                                    color="geekblue"
                                    style={{
                                      fontFamily: 'monospace',
                                      fontWeight: 600,
                                      fontSize: 11,
                                    }}
                                  >
                                    {mod.hotkey}
                                  </Tag>
                                )}
                              </div>
                            </div>

                            <Space size="small">
                              <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
                                {isZh ? '权责角色' : 'Authorized Roles'}:
                              </span>
                              {mod.allowedRoles.map((role) => (
                                <Tag
                                  key={role}
                                  color={role === primaryRole ? 'success' : 'default'}
                                  style={{
                                    margin: 0,
                                    fontSize: 11,
                                    fontWeight: role === primaryRole ? 700 : 400,
                                  }}
                                >
                                  {role}
                                </Tag>
                              ))}

                              {hasAccess ? (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<ArrowRightOutlined />}
                                  onClick={() => navigate(mod.route)}
                                  style={{ marginLeft: 8 }}
                                >
                                  {isZh ? '进入该功能' : 'Open Module'}
                                </Button>
                              ) : (
                                <Tag color="warning" style={{ marginLeft: 8 }}>
                                  {isZh ? '当前角色仅浏览' : 'View Only'}
                                </Tag>
                              )}
                            </Space>
                          </div>

                          {/* Summary */}
                          <Paragraph
                            style={{ margin: 0, fontSize: 13, color: token.colorTextSecondary }}
                          >
                            {isZh ? mod.summaryZh : mod.summaryEn}
                          </Paragraph>

                          {/* Split: Key Capabilities & Step-by-Step SOP */}
                          <Row gutter={[16, 16]}>
                            {/* Left: Key features */}
                            <Col xs={24} md={10}>
                              <div
                                style={{
                                  backgroundColor: token.colorBgLayout,
                                  padding: 12,
                                  borderRadius: 6,
                                  height: '100%',
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    marginBottom: 8,
                                    color: token.colorText,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                  }}
                                >
                                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                                  <span>{isZh ? '核心特性与实操能力' : 'Key Capabilities'}</span>
                                </div>
                                <ul
                                  style={{
                                    margin: 0,
                                    paddingLeft: 18,
                                    fontSize: 12,
                                    lineHeight: 1.7,
                                  }}
                                >
                                  {(isZh ? mod.keyFeaturesZh : mod.keyFeaturesEn).map(
                                    (feat, idx) => (
                                      <li key={idx} style={{ color: token.colorTextSecondary }}>
                                        {feat}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </Col>

                            {/* Right: Step-by-step SOP */}
                            <Col xs={24} md={14}>
                              <div
                                style={{
                                  border: `1px solid ${token.colorBorderSecondary}`,
                                  padding: 12,
                                  borderRadius: 6,
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    marginBottom: 8,
                                    color: token.colorText,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                  }}
                                >
                                  <ToolOutlined style={{ color: token.colorPrimary }} />
                                  <span>
                                    {isZh
                                      ? '标准作业步骤 (Standard Operating Procedure)'
                                      : 'Step-by-Step SOP'}
                                  </span>
                                </div>

                                <Steps
                                  orientation="vertical"
                                  size="small"
                                  current={-1}
                                  items={mod.steps.map((st) => ({
                                    title: (
                                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                                        {isZh ? st.titleZh : st.titleEn}
                                      </span>
                                    ),
                                    content: (
                                      <span
                                        style={{ fontSize: 12, color: token.colorTextSecondary }}
                                      >
                                        {isZh ? st.detailZh : st.detailEn}
                                      </span>
                                    ),
                                  }))}
                                />
                              </div>
                            </Col>
                          </Row>

                          {/* Pro Tips Footer */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              backgroundColor: '#f6ffed',
                              border: '1px solid #b7eb8f',
                              borderRadius: 4,
                              padding: '6px 10px',
                              fontSize: 12,
                              color: '#389e0d',
                            }}
                          >
                            <BulbOutlined />
                            <span>
                              <strong>{isZh ? '工控实操提示: ' : 'Industrial Pro-Tip: '}</strong>
                              {(isZh ? mod.proTipsZh : mod.proTipsEn).join(' • ')}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            ),
          },
          {
            key: 'flow',
            icon: <ToolOutlined />,
            label: isZh ? '全厂跨部门业务协同闭环' : 'Plant Closed-Loop Workflow',
            children: (
              <div style={{ padding: '12px 0' }}>
                <Alert
                  title={
                    isZh
                      ? 'WIFIM MES 工业制造端到端数据流与物流协同闭环'
                      : 'WIFIM MES End-to-End Information & Material Flow'
                  }
                  description={
                    isZh
                      ? '从销售订单确立、BOM需求分解、工单下达到物料收发、加工报工与出运，各岗位严格遵循权责分离与条码追溯。'
                      : 'Strict operational segregation of duties from sales order entry, engineering BOM explosion, work order dispatch, to dispatch logistics.'
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Steps
                  orientation="vertical"
                  size="small"
                  current={-1}
                  items={[
                    {
                      title: isZh
                        ? '1. 商业合同订立（SALES 角色负责）'
                        : '1. Commercial Contract Intake (SALES)',
                      content: isZh
                        ? '销售代表在【销售管理】录入销售订单（SO），核查客户授信额度后点击【转正式单】，自动触发全厂排产与采购需求。'
                        : 'Sales enters customer order, checks credit, and confirms contract to trigger manufacturing pipeline.',
                      icon: <ShoppingCartOutlined style={{ color: token.colorPrimary }} />,
                    },
                    {
                      title: isZh
                        ? '2. 工程BOM分解与缺料决策（PRODUCTION / MANAGER 负责）'
                        : '2. Engineering BOM MRP Calculation (PRODUCTION/MANAGER)',
                      content: isZh
                        ? '调度员在【BOM工作台】选定产品型号，运行齐套分析。若存在物料短缺，自制件展开下级子BOM，外购件发起采购申请。'
                        : 'Planners run kitting analysis on BOM tree to calculate gross demands and resolve component deficits.',
                      icon: <PartitionOutlined style={{ color: '#13c2c2' }} />,
                    },
                    {
                      title: isZh
                        ? '3. 供应链外购协同与来料检验（PURCHASING / WAREHOUSE 负责）'
                        : '3. Procurement Execution & IQC Receiving (PURCHASING/WAREHOUSE)',
                      content: isZh
                        ? '采购员向合格供应商下达 PO；物资到厂后仓管办理收货入库（GRN），质检员在 IQC 抽屉录入合格指标并上架入账。'
                        : 'Purchasing releases orders to vendors. Warehouse issues GRN receipts, and inspectors sign off IQC passes.',
                      icon: <ShoppingOutlined style={{ color: '#52c41a' }} />,
                    },
                    {
                      title: isZh
                        ? '4. 生产发料、工步报工与质检（PRODUCTION 负责）'
                        : '4. Material Kitting & Telemetry Reporting (PRODUCTION)',
                      content: isZh
                        ? '车间在【生产工单】执行【批量领料】，机台操作工认领工步，实时汇报完工良品数与报废数，系统刷新产能 OEE。'
                        : 'Shop floor executes batch material issues, claims routing operations, and records scrap yields.',
                      icon: <ToolOutlined style={{ color: '#fa8c16' }} />,
                    },
                    {
                      title: isZh
                        ? '5. 产成品仓储与出库物流装运（WAREHOUSE / SALES 负责）'
                        : '5. Finished Goods Staging & Outbound Dispatch (WAREHOUSE/SALES)',
                      content: isZh
                        ? '合格产成品进入成品总仓（WH-03），物流人员生成待发货出库单（DO），批量打印送货单并装车发运交付客户。'
                        : 'Goods enter FG stores, logistics generates DO shipments, batch-prints delivery notes, and closes fulfillment.',
                      icon: <InboxOutlined style={{ color: '#722ed1' }} />,
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            key: 'hotkeys',
            icon: <KeyOutlined />,
            label: isZh ? '工控防尘键盘快捷键速查' : 'Industrial Hotkeys Matrix',
            children: (
              <div style={{ padding: '8px 0' }}>
                <Paragraph style={{ color: token.colorTextSecondary }}>
                  {isZh
                    ? '为了适应车间现场佩戴防静电手套或使用工控防尘键盘的操作环境，系统支持以下全局物理快捷键：'
                    : 'Designed for shop-floor touch screens, gloved operations, and rugged industrial keyboards:'}
                </Paragraph>
                <Table
                  dataSource={hotkeysData}
                  pagination={false}
                  size="small"
                  bordered
                  columns={[
                    {
                      title: isZh ? '物理快捷键' : 'Hotkey Combination',
                      dataIndex: 'shortcut',
                      key: 'shortcut',
                      width: 140,
                      render: (text) => (
                        <Tag
                          color="geekblue"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 13,
                            fontWeight: 700,
                            padding: '2px 8px',
                          }}
                        >
                          {text}
                        </Tag>
                      ),
                    },
                    {
                      title: isZh ? '执行功能' : 'Action Description',
                      key: 'action',
                      render: (_, r) => <Text strong>{isZh ? r.actionZh : r.actionEn}</Text>,
                    },
                    {
                      title: isZh ? '目标模块' : 'Target Module',
                      key: 'module',
                      width: 130,
                      render: (_, r) => <Tag color="blue">{isZh ? r.moduleZh : r.moduleEn}</Tag>,
                    },
                    {
                      title: isZh ? '适用角色' : 'Role Scope',
                      dataIndex: 'roles',
                      key: 'roles',
                      width: 160,
                      render: (r: string[]) =>
                        r.includes('ALL') ? (
                          <Tag color="cyan">{isZh ? '全员通用' : 'All Roles'}</Tag>
                        ) : (
                          r.map((x) => (
                            <Tag key={x} color="default" style={{ fontSize: 10 }}>
                              {x}
                            </Tag>
                          ))
                        ),
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            key: 'andon',
            icon: <AlertOutlined />,
            label: isZh ? '三级安灯异常响应机制' : 'Three-Level Andon Protocol',
            children: (
              <div style={{ padding: '8px 0' }}>
                <Alert
                  title={
                    isZh
                      ? '车间三级安灯（Andon）声光警报与停机处置'
                      : 'Three-Level Andon Alarm & Emergency Response'
                  }
                  description={
                    isZh
                      ? '当检测到伺服电机过载、安全光栅触发或严重缺料时，车间蜂鸣音响报警将自动响起，各岗位按以下流程响应。'
                      : 'Acoustic warning alarms sound when line-down halts or critical shortages occur. Follow standard response.'
                  }
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                  <Card size="small" style={{ borderLeft: '4px solid #ff4d4f' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <AlertOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                      <Title level={5} style={{ margin: 0, color: '#ff4d4f' }}>
                        {isZh
                          ? '第一级：产线紧急停机（Line Down / Red Alert）'
                          : 'Level 1: Critical Line Down (Red Alert)'}
                      </Title>
                    </div>
                    <Paragraph style={{ margin: 0, fontSize: 13, color: token.colorTextSecondary }}>
                      {isZh
                        ? '操作工立即拍下物理急停开关，在【生产执行】中标记工单为异常暂停。系统蜂鸣器鸣响，机修工程师与班组长须在 10 分钟内到场签到排查。'
                        : 'Trigger physical emergency stop, flag order as Exception. Maintenance engineers must arrive within 10 minutes.'}
                    </Paragraph>
                  </Card>

                  <Card size="small" style={{ borderLeft: '4px solid #faad14' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
                      <Title level={5} style={{ margin: 0, color: '#faad14' }}>
                        {isZh
                          ? '第二级：线边物料短缺（Material Shortage / Yellow Alert）'
                          : 'Level 2: Line-side Material Shortage (Yellow Alert)'}
                      </Title>
                    </div>
                    <Paragraph style={{ margin: 0, fontSize: 13, color: token.colorTextSecondary }}>
                      {isZh
                        ? '当看板【安全库存预警】闪烁黄灯时，物料员在看板点击【Quick PO】快速生成采购加急单，仓库开启免检绿色通道优先发料。'
                        : 'When shortage alarms flash, click Quick PO to spawn emergency purchase orders. Warehouse opens priority kitting通道.'}
                    </Paragraph>
                  </Card>

                  <Card size="small" style={{ borderLeft: '4px solid #1677ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                      <Title level={5} style={{ margin: 0, color: '#1677ff' }}>
                        {isZh
                          ? '第三级：交接班核查（Shift Handover / Blue Alert）'
                          : 'Level 3: Shift Handover & Quality Audit (Blue Alert)'}
                      </Title>
                    </div>
                    <Paragraph style={{ margin: 0, fontSize: 13, color: token.colorTextSecondary }}>
                      {isZh
                        ? '换班前 30 分钟，交接双方组长在仪表盘核验今日达成率与线边在制品，按 Alt + H 打开电子班组交接记录单，双人电子签名。'
                        : '30 mins before shift ends, team leaders review completion rates and press Alt + H to co-sign the electronic handover docket.'}
                    </Paragraph>
                  </Card>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default UserGuideView;
