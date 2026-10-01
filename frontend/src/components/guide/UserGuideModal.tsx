import React from 'react';
import { Modal, Tabs, Table, Tag, Steps, Alert, Typography, Space, theme } from 'antd';
import {
  BookOutlined,
  KeyOutlined,
  DashboardOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';

const { Text, Paragraph, Title } = Typography;

export const UserGuideModal: React.FC = () => {
  const { i18n } = useTranslation();
  const { token } = theme.useToken();
  const { userGuideVisible, setUserGuideVisible } = useAppStore();
  const isZh = i18n.language === 'zh-CN';

  const hotkeysData = [
    { key: '1', shortcut: 'Alt + D', action: isZh ? '直达工厂综合仪表盘' : 'Navigate to Dashboard Console', module: isZh ? '监控总览' : 'Overview' },
    { key: '2', shortcut: 'Alt + P', action: isZh ? '直达生产工单与排产中心' : 'Navigate to Production Execution', module: isZh ? '生产排程' : 'Production' },
    { key: '3', shortcut: 'Alt + I', action: isZh ? '直达库存盘点与流转流水' : 'Navigate to Inventory & Stock Movements', module: isZh ? '仓库物流' : 'Inventory' },
    { key: '4', shortcut: 'Alt + B', action: isZh ? '直达采购订单与物料到货' : 'Navigate to Purchasing Orders', module: isZh ? '采购供应链' : 'Purchasing' },
    { key: '5', shortcut: 'Alt + S', action: isZh ? '直达销售发货与出库管理' : 'Navigate to Sales & Outbound Deliveries', module: isZh ? '销售发运' : 'Sales' },
    { key: '6', shortcut: 'Alt + M', action: isZh ? '直达物料档案与基础数据' : 'Navigate to Item Master Data', module: isZh ? '主数据' : 'Master Data' },
    { key: '7', shortcut: 'Alt + A', action: isZh ? '直达质量检验与系统审计' : 'Navigate to Quality & Audit Logs', module: isZh ? '质检验收' : 'Quality/Audit' },
    { key: '8', shortcut: 'Alt + K', action: isZh ? '一键开启车间大屏 TV Kiosk 轮播' : 'Launch Shop-Floor TV Kiosk Mode (55-75")', module: isZh ? '大屏看板' : 'TV Kiosk' },
    { key: '9', shortcut: 'Alt + H', action: isZh ? '打开电子班组交接记录单 (一键打印)' : 'Open Shift Handover Docket (1-Click Print)', module: isZh ? '班组交接' : 'Handover' },
    { key: '10', shortcut: 'Alt + T', action: isZh ? '直达系统管理与终端配置' : 'Navigate to Terminal Settings', module: isZh ? '系统设置' : 'Settings' },
    { key: '11', shortcut: 'Alt + X', action: isZh ? '快速折叠 / 展开侧边导航' : 'Toggle Sidebar Collapse/Expand', module: isZh ? '界面布局' : 'Layout' },
    { key: '12', shortcut: 'F1 / Shift + ?', action: isZh ? '随时打开本操作指南与帮助' : 'Open User Guide & SOP Modal', module: isZh ? '全局帮助' : 'Help' },
  ];

  const hotkeyColumns = [
    {
      title: isZh ? '工控快捷键' : 'Hotkey Combination',
      dataIndex: 'shortcut',
      key: 'shortcut',
      render: (text: string) => (
        <Tag color="geekblue" style={{ fontFamily: 'monospace', fontSize: 13, padding: '2px 8px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: isZh ? '执行功能' : 'Action Description',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: isZh ? '业务模块' : 'Target Module',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
  ];

  const kpiThresholds = [
    {
      key: '1',
      metric: isZh ? '今日计划达成率 (Plan Completion)' : 'Daily Plan Completion',
      green: '≥ 95.0%',
      yellow: '90.0% ~ 94.9%',
      red: '< 90.0%',
      action: isZh ? '低于90%触发班组巡线，排查停机瓶颈' : 'Trigger floor inspection if < 90%',
    },
    {
      key: '2',
      metric: isZh ? '临近截止工单 (Orders Near Deadline)' : 'Orders Near Deadline',
      green: isZh ? '0 单' : '0 orders',
      yellow: isZh ? '1 ~ 3 单 (距换班<4h)' : '1-3 orders (<4h to shift)',
      red: isZh ? '> 3 单严重延期' : '> 3 critical delays',
      action: isZh ? '优先调度备用机台，调整物料齐套优先级' : 'Re-route to secondary workstation',
    },
    {
      key: '3',
      metric: isZh ? '安全库存缺料警报 (Safety Stock Deficit)' : 'Safety Stock Shortages',
      green: isZh ? '库存高于安全水位' : 'Above Safety Min',
      yellow: isZh ? '低于安全水位 10% 以内' : 'Deficit within 10%',
      red: isZh ? '物料断供 / 临界缺料' : 'Critical Stockout',
      action: isZh ? '点击 Quick PO 直发采购急件，启动供应商应急送货' : 'Click Quick PO for expedited supply',
    },
  ];

  const kpiColumns = [
    {
      title: isZh ? '关键指标' : 'Metric Indicator',
      dataIndex: 'metric',
      key: 'metric',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: isZh ? '正常 (绿色)' : 'Healthy (Green)',
      dataIndex: 'green',
      key: 'green',
      render: (text: string) => <Tag color="success">{text}</Tag>,
    },
    {
      title: isZh ? '预警 (黄色)' : 'Warning (Yellow)',
      dataIndex: 'yellow',
      key: 'yellow',
      render: (text: string) => <Tag color="warning">{text}</Tag>,
    },
    {
      title: isZh ? '紧急 (红色)' : 'Critical (Red)',
      dataIndex: 'red',
      key: 'red',
      render: (text: string) => <Tag color="error">{text}</Tag>,
    },
    {
      title: isZh ? '车间应对措施' : 'Standard Response SOP',
      dataIndex: 'action',
      key: 'action',
    },
  ];

  const tabItems = [
    {
      key: 'flow',
      label: (
        <span>
          <BookOutlined style={{ marginRight: 6 }} />
          {isZh ? '车间业务流转 SOP' : 'Plant Floor Workflow SOP'}
        </span>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message={isZh ? 'WIFIM MES 工业制造闭环管理规范' : 'WIFIM MES Closed-Loop Manufacturing Execution'}
            description={
              isZh
                ? '从生产计划下发到成品出库，所有物料流与工序流需严格遵循工序交接扫描与批次条码追踪。'
                : 'All material and batch flows strictly adhere to barcode tracking and workstation handovers.'
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Steps
            direction="vertical"
            size="small"
            current={-1}
            items={[
              {
                title: isZh ? '1. 计划下达与工单排程 (Work Order Scheduling)' : '1. Work Order Scheduling & Dispatch',
                description: isZh
                  ? '调度员在 [生产工单] 模块中依据销售订单与BOM结构下达工单，系统自动核验关键物料齐套率并绑定生产机台。'
                  : 'Dispatch orders linked to sales demands and verified BOM components.',
                icon: <ToolOutlined style={{ color: token.colorPrimary }} />,
              },
              {
                title: isZh ? '2. 齐套物料领用与配送 (Material Kitting & Issue)' : '2. Material Kitting & Staging',
                description: isZh
                  ? '仓库管理员在 [库存管理] 模块中根据工单领料单拣配原材料，核对批次号并执行扣库，配送至线边仓缓存区。'
                  : 'Warehouse kits raw materials and stages parts at line-side buffer storage.',
                icon: <InboxOutlined style={{ color: '#faad14' }} />,
              },
              {
                title: isZh ? '3. 产线加工与现场报工 (Shop-Floor Production & Reporting)' : '3. Floor Execution & Machine Reporting',
                description: isZh
                  ? '机台操作工在工位机端认领工单，记录首件检验、加工良品数与报废数量，系统实时刷新 Hourly Throughput 产能趋势。'
                  : 'Operators claim orders, report良品 counts, and update hourly throughput telemetries.',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              },
              {
                title: isZh ? '4. 质量终检与入库质保 (FQC & Finished Goods Stock In)' : '4. Quality Sign-off & Warehouse Receipt',
                description: isZh
                  ? '质检工程师核验完工尺寸与性能指标，签发合格证，成品自动入库上架，系统同步写回全局审计日志。'
                  : 'Inspectors sign off quality certificates, stock in finished goods, and update audit trail.',
                icon: <SafetyCertificateOutlined style={{ color: token.colorPrimary }} />,
              },
              {
                title: isZh ? '5. 销售出库与物流装运 (Outbound Dispatch & Shipping)' : '5. Outbound Shipping & Delivery Tracking',
                description: isZh
                  ? '物流人员按待发货出库单打包装托，承运商取货并更新提货单据，完成闭环。'
                  : 'Logistics packages staging units, dispatches carriers, and closes the delivery cycle.',
                icon: <ShoppingCartOutlined style={{ color: '#13c2c2' }} />,
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'hotkeys',
      label: (
        <span>
          <KeyOutlined style={{ marginRight: 6 }} />
          {isZh ? '工控快捷键速查' : 'Industrial Hotkeys'}
        </span>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <Paragraph style={{ color: token.colorTextSecondary }}>
            {isZh
              ? '为了适应车间现场戴防静电手套或使用工控防尘键盘的操作场景，支持使用以下快捷键快速在各大控制台之间切换：'
              : 'Designed for rugged industrial keyboards and gloved operations on factory shop-floors:'}
          </Paragraph>
          <Table
            dataSource={hotkeysData}
            columns={hotkeyColumns}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      ),
    },
    {
      key: 'thresholds',
      label: (
        <span>
          <DashboardOutlined style={{ marginRight: 6 }} />
          {isZh ? 'KPI指标与阈值标准' : 'KPI Benchmarks & Alarms'}
        </span>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <Table
            dataSource={kpiThresholds}
            columns={kpiColumns}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      ),
    },
    {
      key: 'andon',
      label: (
        <span>
          <AlertOutlined style={{ marginRight: 6 }} />
          {isZh ? '安灯异常与停机响应' : 'Andon Emergency Protocols'}
        </span>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message={isZh ? '三级安灯响应机制 (3-Level Andon Response)' : 'Three-Level Andon Protocol'}
            description={
              isZh
                ? '当发生机床刀具破损、安全传感器触发或关键伺服停机时，车间蜂鸣音响报警将自动响起。'
                : 'Acoustic warning alarms sound when line-down halts or critical shortages occur.'
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ padding: 12, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4 }}>
              <Title level={5} style={{ margin: '0 0 6px 0', color: '#ff4d4f' }}>
                {isZh ? '第一级：产线紧急停机 (Red Alert - Line Down)' : 'Level 1: Critical Line Down (Red Alert)'}
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 13 }}>
                {isZh
                  ? '操作工立即拍下机台物理急停，并在系统 [生产排程] 中标记该工单为 [Exception/Halt]，系统蜂鸣报警启动，通知机修班组10分钟内到场。'
                  : 'Halt machine immediately, flag order as Exception, maintenance arrives within 10 minutes.'}
              </Paragraph>
            </div>

            <div style={{ padding: 12, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4 }}>
              <Title level={5} style={{ margin: '0 0 6px 0', color: '#faad14' }}>
                {isZh ? '第二级：线边物料短缺 (Yellow Alert - Material Deficit)' : 'Level 2: Material Shortage (Yellow Alert)'}
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 13 }}>
                {isZh
                  ? '当看板 [Safety Stock Alerts] 提示缺料时，领料员在看板点击 [Quick PO] 快速生成采购加急单，仓库开启绿色通道。'
                  : 'Click Quick PO on dashboard to generate emergency purchase order with priority lead time.'}
              </Paragraph>
            </div>

            <div style={{ padding: 12, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4 }}>
              <Title level={5} style={{ margin: '0 0 6px 0', color: token.colorPrimary }}>
                {isZh ? '第三级：换班交接复核 (Blue Alert - Shift Handover)' : 'Level 3: Shift Handover Audit (Blue Alert)'}
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 13 }}>
                {isZh
                  ? '每班次结束前30分钟，早中晚班组长在仪表盘核验今日计划达成率与WIP在制品数量，签署电子交接单。'
                  : 'Review shift completion rate, WIP quantity, and confirm electronic handover sheet.'}
              </Paragraph>
            </div>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={userGuideVisible}
      onCancel={() => setUserGuideVisible(false)}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
          <span>{isZh ? 'WIFIM 智能制造车间操作指南与作业规范 (MES SOP)' : 'WIFIM MES Factory User Guide & SOP'}</span>
        </div>
      }
      width={840}
      footer={null}
      destroyOnClose
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      <Tabs defaultActiveKey="flow" items={tabItems} />
    </Modal>
  );
};

export default UserGuideModal;
