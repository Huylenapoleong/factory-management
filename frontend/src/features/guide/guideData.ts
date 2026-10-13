import { FeatureGuideModule } from './types';

export const FEATURE_GUIDE_MODULES: FeatureGuideModule[] = [
  {
    id: 'dashboard',
    titleZh: '工厂中央监控总览与实时看板',
    titleEn: 'Factory Central Operations Dashboard',
    badgeZh: '全局监控',
    badgeEn: 'Executive Telemetry',
    iconName: 'DashboardOutlined',
    route: '/dashboard',
    hotkey: 'Alt + D',
    category: 'CORE',
    allowedRoles: ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'],
    summaryZh:
      '提供全厂实时运营脉搏，整合关键 KPI 指标条、每小时产能吞吐趋势、高优先级工单排队、缺料即时报警及全厂物流出入库流水。',
    summaryEn:
      'Provides plant-wide live operational telemetry, KPI metrics strip, hourly production throughput trends, priority work orders dispatch, and real-time material shortage alarms.',
    keyFeaturesZh: [
      'KPI 指标条：今日计划达成率、在库物资估值、OTD 准时交货率、安全库存告警',
      '每小时产能吞吐（Hourly Throughput）：ECharts 动态柱线图实时比对计划与实际出产',
      '紧急工单队列：支持直接点击“Details”或“Dispatch”直接穿透跳转车间排产',
      '缺料智能预警：支持一键“Quick PO”秒级生成采购加急申请，避免停工待料',
      '车间 TV Kiosk 模式：按 Alt + K 即可进入 55~75 寸无边框高对比度车间大屏轮播',
    ],
    keyFeaturesEn: [
      'Industrial KPI strip: Daily plan attainment, stock valuation, OTD delivery rate, and shortage alarms',
      'Hourly Throughput telemetry: Real-time visual comparison of planned vs. actual output rates',
      'Priority Work Orders: Direct deep-link navigation into shop-floor dispatch stations',
      'Material Shortage Card: 1-Click "Quick PO" generator preventing production halts',
      'Shop Floor TV Kiosk HUD: Press Alt + K for 55-75" ruggedized display mode',
    ],
    steps: [
      {
        step: 1,
        titleZh: '审阅顶部 KPI 指标与实时班次',
        titleEn: 'Inspect KPI Strip & Active Shift',
        detailZh: '核查当前班次（早班/中班/晚班）达成率，若达成率低于 90% 需触发车间巡检。',
        detailEn:
          'Monitor shift output rate. If plan completion drops below 90%, initiate floor inspection.',
      },
      {
        step: 2,
        titleZh: '排查临界缺料项并触发 Quick PO',
        titleEn: 'Resolve Shortages with Quick PO',
        detailZh:
          '在【安全库存预警】卡片中核查负差额物资，点击【加急采购】确认弹窗，系统将自动调用采购服务建单。',
        detailEn:
          'Identify deficit materials and click Quick PO to automatically dispatch emergency purchase orders.',
      },
      {
        step: 3,
        titleZh: '调度优先工单与物流动态',
        titleEn: 'Dispatch Priority Orders',
        detailZh:
          '在右侧【优先生产工单】中点击 Dispatch 跳转生产分系统，或查看出入库流水确认物资就绪。',
        detailEn:
          'Click Dispatch to navigate directly into production line scheduling or review logistics timeline.',
      },
    ],
    proTipsZh: [
      '按 F1 或 Shift + ? 可随时呼出本操作手册。',
      '支持右上角配置 10s、30s、60s 自动轮询刷新，适应工业看板无人值守需求。',
    ],
    proTipsEn: [
      'Press F1 or Shift + ? anytime to open this guide.',
      'Configure auto-refresh (10s/30s/60s) for unmanned kiosk displays.',
    ],
  },
  {
    id: 'production',
    titleZh: '车间生产工单排产与工步报工',
    titleEn: 'Shop Floor Work Orders & Telemetry Reporting',
    badgeZh: '制造执行',
    badgeEn: 'MES Execution',
    iconName: 'ToolOutlined',
    route: '/production',
    hotkey: 'Alt + P',
    category: 'OPERATIONS',
    allowedRoles: ['ADMIN', 'MANAGER', 'PRODUCTION'],
    summaryZh:
      '车间现场制造执行中心（MES），涵盖生产工单下发、齐套物料批量发料、工步进度报工、良品与报废数登记、以及节拍节律 OEE 指标分析。',
    summaryEn:
      'Shop-floor manufacturing execution system covering work order dispatching, batch material kitting, operation telemetry reporting, scrap tracking, and Takt Time OEE analysis.',
    keyFeaturesZh: [
      '工单总台账：支持按工段/产线、工单状态（PLANNED, IN_PRODUCTION, COMPLETED）精确筛选',
      '批量领料（Batch Material Issue）：一键为所有待产工单执行物料扣库与出库流转',
      '工位报工 Drawer：操作工认领当前工步，录入完工良品数、报废数及工装设备状态',
      'BOM 实时查验：在工单行内直接调阅该产品对应工程物料清单与齐套配比',
      'Takt Time / OEE 卡片：实时测算产线平衡率与设备综合利用率',
    ],
    keyFeaturesEn: [
      'Work Orders Ledger: Filter by workstation lines, production batches, and operational statuses',
      'Batch Material Issue: 1-Click bulk inventory deduction & staging for ready orders',
      'Operation Telemetry Drawer: Real-time operator reporting of good counts, scrap units, and tools',
      'BOM Spec Viewer: Inspect component kitting ratios directly within each work order',
      'Takt Time & OEE Card: Live machine availability, performance rate, and quality yield analytics',
    ],
    steps: [
      {
        step: 1,
        titleZh: '新建或审核下发工单',
        titleEn: 'Create & Release Work Orders',
        detailZh: '点击【新建工单】，选择目标产成品 SKU、计划生产数量、排定起止时间与机台工位。',
        detailEn:
          'Click Create Order, select finished SKU, planned quantity, target workstation, and schedule.',
      },
      {
        step: 2,
        titleZh: '执行批量领料或单单发料',
        titleEn: 'Execute Material Issuance',
        detailZh:
          '点击【批量领料】呼出确认对话框，系统验证线边物料库存后自动划拨并更新工单至待开工。',
        detailEn:
          'Click Batch Material Issue to verify raw stock and transition planned orders into production.',
      },
      {
        step: 3,
        titleZh: '现场工步报工与质检交接',
        titleEn: 'Submit Operation Reports',
        detailZh:
          '点击工单进入右侧报工抽屉，录入本工序合格产出与报废数，提交后系统自动推进到下一工序。',
        detailEn:
          'Open tracking drawer, enter completed and scrap quantities, and advance to next routing step.',
      },
    ],
    proTipsZh: [
      '所有工步报工均记录操作工工号与时间戳，支持追溯批次质量根因。',
      '生产完工入库将自动在仓库生成检验单据。',
    ],
    proTipsEn: [
      'All step submissions capture operator badge and timestamp for traceability.',
      'Order completion automatically triggers inbound finished goods receipts.',
    ],
  },
  {
    id: 'bom',
    titleZh: '工程 BOM 工作台与缺料齐套推演',
    titleEn: 'Engineering BOM Workbench & Material Kitting',
    badgeZh: '工程定额',
    badgeEn: 'Engineering BOM',
    iconName: 'PartitionOutlined',
    route: '/production/bom',
    category: 'OPERATIONS',
    allowedRoles: ['ADMIN', 'MANAGER', 'PRODUCTION'],
    summaryZh:
      '多层级工程物料清单（Multi-level BOM）定额管理、缺料排查、自制/外购决策、以及产品 CAD 图纸与外观照片存档。',
    summaryEn:
      'Multi-level bill of materials workbench, shortage MRP analysis, make-or-buy planning, and CAD drawing/photo archival.',
    keyFeaturesZh: [
      '多层级树状结构树：直观展开总成（Finished Goods）与下级子装配件（Subassemblies）',
      '物料齐套需求分析表：实时核算各组件毛需求、现有库存、净缺额及建议下单日',
      '智能行动卡片（Todo Cards）：一键应用“最大可投产数量”，或针对外购件直发采购',
      '成本构成透视（Cost Structure）：直观分解直接原材料成本占比',
      '图纸与实物照片上传：支持上传 5MB 以内 PNG/JPG 工程图纸，即时预览',
    ],
    keyFeaturesEn: [
      'Multi-level Product Structure Tree: Visualize parent assemblies and child subcomponents',
      'BOM Requirements Table: Live calculation of gross demands, stock balances, and shortages',
      'Actionable Decision Cards: Quick application of buildable limits and purchase triggers',
      'Cost Structure Card: Direct material expenditure breakdown and currency valuation',
      'Technical Photo & Drawing Panel: Upload PNG/JPEG engineering schematics up to 5MB',
    ],
    steps: [
      {
        step: 1,
        titleZh: '选择目标产品型号并输入计划数量',
        titleEn: 'Select SKU & Planned Quantity',
        detailZh: '在顶部选择待分析产成品（如 FS-880 或 GB-300），输入预计批次投产数量。',
        detailEn:
          'Select finished SKU from dropdown and input the desired batch production volume.',
      },
      {
        step: 2,
        titleZh: '排查缺料行并决策自制/外购',
        titleEn: 'Analyze Component Shortages',
        detailZh:
          '红色警示行代表当前库存不足，外购件可点击【下单采购】，自制半成品可展开子 BOM 投产。',
        detailEn:
          'Red rows indicate shortages. Click Order for buy items or inspect sub-BOMs for make parts.',
      },
      {
        step: 3,
        titleZh: '应用最大可投产数量（Build First）',
        titleEn: 'Apply Max Buildable Volume',
        detailZh:
          '若物料未齐套但需紧急开工，可在操作卡片点击【应用】，系统自动将计划量压缩至当前库存允许的最大套数。',
        detailEn:
          'Use "Build First" card to automatically adjust batch size to match in-stock limits.',
      },
    ],
    proTipsZh: [
      '支持在右侧面板直接上传高清产品图纸，车间工位机可即时调阅。',
      '损耗率（Scrap Rate %）已计入需求推演公式，确保排产数量准确。',
    ],
    proTipsEn: [
      'Technical drawings uploaded here are instantly accessible across workstation terminals.',
      'Scrap rates are factored into gross demand calculations automatically.',
    ],
  },
  {
    id: 'inventory',
    titleZh: '仓储物流中心、调拨盘点与条码标签',
    titleEn: 'Warehouse Logistics, Transfers & Barcode Labeling',
    badgeZh: '仓储物流',
    badgeEn: 'WMS Logistics',
    iconName: 'InboxOutlined',
    route: '/inventory',
    hotkey: 'Alt + I',
    category: 'SUPPLY_CHAIN',
    allowedRoles: ['ADMIN', 'MANAGER', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'],
    summaryZh:
      '多仓库多库位（Bin Locations）实时库存台账、批次号（Lot No）追踪、库间调拨、盘点调整、以及工业斑马热敏条码标签打印。',
    summaryEn:
      'Multi-warehouse bin ledger, batch lot traceability, inter-warehouse transfers, stocktake reconciliation, and thermal barcode label printing.',
    keyFeaturesZh: [
      '多仓实时台账：覆盖原材料仓（WH-01）、半成品仓（WH-02）、成品仓（WH-03）及备件仓',
      '库间快速调拨（Stock Transfer）：支持从主库调入车间线边缓存仓，支持批量调拨',
      '库存盘点损益调整（Stock Adjustment）：盘点差异支持原因核销与审计留痕',
      '工业条码标签打印（Print Barcode）：弹出标准 100x60mm 标签预览，包含物料码、批次号、库位及 AntD 动态二维码',
      '实时批次审计流水（Audit Feed）：实时记录每一笔入库、领料、调拨操作的领料人与凭证号',
    ],
    keyFeaturesEn: [
      'Real-time Multi-Warehouse Ledger: Raw material, WIP, finished goods, and consumable stores',
      'Inter-Warehouse Transfers: Bin-to-bin and warehouse-to-line transfers with batch support',
      'Stocktake Reconciliation: Adjust discrepancies with mandatory reason audit logs',
      'Industrial Barcode Printing: Preview and print 100x60mm thermal labels with AntD QR codes',
      'Realtime Lot Audit Feed: Continuous ledger recording operators, transaction types, and lots',
    ],
    steps: [
      {
        step: 1,
        titleZh: '筛选目标仓库与物料批次',
        titleEn: 'Filter Warehouse & Material Lots',
        detailZh: '使用顶部仓储下拉框或搜索框定位 SKU，查看物理在库数、预留数及可用库存。',
        detailEn:
          'Use top warehouse selector to inspect on-hand, allocated, and available balances.',
      },
      {
        step: 2,
        titleZh: '办理调拨或库存平衡',
        titleEn: 'Execute Stock Transfer or Adjustment',
        detailZh: '选中物资点击【调拨】选择目标仓库与库位；盘点有差异时点击【盘点调整】录入损益。',
        detailEn:
          'Select items and click Transfer or Adjust to reconcile physical stock with system balances.',
      },
      {
        step: 3,
        titleZh: '批量打印物料条码标签',
        titleEn: 'Batch Print Barcode Labels',
        detailZh:
          '勾选多笔库存行，点击【打印条码标签】呼出预览对话框，确认无误后点击发送至斑马打印机。',
        detailEn:
          'Select rows, click Print Barcode to preview 100x60mm labels, and trigger thermal printer.',
      },
    ],
    proTipsZh: [
      '在顶部工具栏可随时切换【当前活动仓库】，全局数据将自动联动过滤。',
      '安全库存不足的物资在台账中以醒目黄色/红色标示。',
    ],
    proTipsEn: [
      'Switch Active Warehouse in top toolbar anytime to filter all warehouse views.',
      'Items below safety thresholds are flagged with warning tags automatically.',
    ],
  },
  {
    id: 'purchasing',
    titleZh: '采购供应链协同、来料质检与收货入库',
    titleEn: 'Purchasing Supply Chain, Inbound QC & Receipts',
    badgeZh: '采购供应链',
    badgeEn: 'Procurement & QC',
    iconName: 'ShoppingOutlined',
    route: '/purchasing',
    hotkey: 'Alt + B',
    category: 'SUPPLY_CHAIN',
    allowedRoles: ['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE'],
    summaryZh:
      '采购订单（PO）生命周期闭环，涵盖采购需求下达、合同确认、到货入库验收（GRN）、来料质量检验（IQC）与批量凭单打印。',
    summaryEn:
      'Purchase order lifecycle management, contract confirmation, goods receipt notes (GRN), inbound quality inspection (IQC), and batch document printing.',
    keyFeaturesZh: [
      '采购单执行台账：按采购单号、ERP凭证、供应商、加急标识（URGENT）与交期预警筛选',
      '采购合同行项详情（Lines Modal）：清晰查阅采购行明细，支持直接确认或办理收货',
      '入库收货（Goods Receipt）：录入实收数量、承运单号、卸货月台（Bay 01-03）',
      '来料质量检验抽屉（Active IQC Drawer）：检验员录入抽检合格数与让步接收/退货记录',
      '批量打印采购凭单：支持勾选多笔采购单，一次性生成入库采购单据并发送打印',
    ],
    keyFeaturesEn: [
      'PO Execution Ledger: Track PO numbers, ERP refs, vendors, urgent tags, and delivery SLA warnings',
      'PO Specification Modal: Inspect item lines with direct Confirm or Receive action triggers',
      'Goods Receipt (GRN): Record received quantity, carrier tracking, and receiving bay numbers',
      'Inbound QC Drawer: Inspectors log pass/defect quantities, inspection notes, and disposition',
      'Batch PO Voucher Printing: Multi-select orders to preview and print official purchase slips',
    ],
    steps: [
      {
        step: 1,
        titleZh: '创建采购订单并确认生效',
        titleEn: 'Create & Confirm Purchase Orders',
        detailZh:
          '点击【新建采购订单】，选择在册合格供应商、交货日期及物料行，保存后点击【转正/确认合同】。',
        detailEn:
          'Click Create PO, select qualified vendor, delivery target, item lines, and confirm order.',
      },
      {
        step: 2,
        titleZh: '物资到厂办理入库收货（GRN）',
        titleEn: 'Receive Goods & Generate GRN',
        detailZh: '当供货车辆抵达，在采购单列表点击【办理收货】，核对送货单并录入卸货库区。',
        detailEn:
          'When delivery arrives, click Receive to verify shipment slip and record receiving dock.',
      },
      {
        step: 3,
        titleZh: 'IQC 来料质检与上架入账',
        titleEn: 'IQC Inspection & Inventory Posting',
        detailZh: '质检人员在 IQC 抽屉中完成抽检，合格物资自动入账至仓库库存，不合格品进入隔离区。',
        detailEn:
          'Perform IQC sign-off. Approved materials post to stock; rejected parts enter quarantine.',
      },
    ],
    proTipsZh: [
      '临近交付预警（SLA WARN）单据会自动飘红，建议优先致电供应商催货。',
      '已收货（RECEIVED）订单无法重复收货，防止仓库重入账。',
    ],
    proTipsEn: [
      'Orders marked SLA WARN highlight in red for proactive vendor expedited follow-ups.',
      'RECEIVED orders are locked against double-entry into warehouse inventory.',
    ],
  },
  {
    id: 'sales',
    titleZh: '销售订单履约、发运计划与送货签收',
    titleEn: 'Sales Orders, Outbound Staging & Dispatch',
    badgeZh: '销售履约',
    badgeEn: 'Sales & Fulfillment',
    iconName: 'ShoppingCartOutlined',
    route: '/sales',
    hotkey: 'Alt + S',
    category: 'SUPPLY_CHAIN',
    allowedRoles: ['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE'],
    summaryZh:
      '客户商业销售订单（SO）管理、合同转正、交付达成进度追踪、出库发货（DO）调度、以及批量打印送货签收单。',
    summaryEn:
      'Customer sales order lifecycle, quotation conversion, fulfillment progress tracking, outbound delivery dispatch (DO), and batch shipping note printing.',
    keyFeaturesZh: [
      '销售总台账：实时掌握各合同金额、交付进度条（Fulfillment %）、逾期预警',
      '销售订单明细弹窗（Lines Modal）：查看客户、区域、付款条件，并支持一键发起出库',
      '报价转正式订单：对 QUOTATION 状态单据一键转正，自动触发排产需求',
      '发货出库装运（Outbound Dispatch）：录入车牌号、司机电话、托盘数、总毛重及海关封条',
      '批量打印送货单：支持多选订单预览并发送打印，生成标准工业出库签收单据',
    ],
    keyFeaturesEn: [
      'Sales Master Ledger: Monitor contract amounts, fulfillment progress bars, and SLA overdues',
      'Sales Order Lines Modal: Review customer region, commercial terms, and initiate dispatch',
      'Quotation Conversion: Convert QUOTATION orders to CONFIRMED with 1 click',
      'Outbound Dispatch: Record truck license plates, driver contacts, pallets, and customs seals',
      'Batch Delivery Note Printing: Multi-select orders to preview and print logistics dispatch slips',
    ],
    steps: [
      {
        step: 1,
        titleZh: '录入销售订单与交付排期',
        titleEn: 'Register Sales Orders & Commit Dates',
        detailZh: '点击【新建销售订单】，选择签约客户、承诺交期、订购产成品 SKU 与单价。',
        detailEn:
          'Click Create Sales Order, select client account, committed shipping date, and SKU lines.',
      },
      {
        step: 2,
        titleZh: '核定信用状态并确认合同',
        titleEn: 'Verify Credit & Confirm Contract',
        detailZh: '核查客户信用额度后点击【转正式单】，系统将订单状态推进至 CONFIRMED 并准备出货。',
        detailEn:
          'Verify customer credit standing and confirm order to initiate fulfillment workflow.',
      },
      {
        step: 3,
        titleZh: '安排发货出库并打印送货单',
        titleEn: 'Dispatch Delivery & Print Notes',
        detailZh:
          '产成品就绪后点击【发货出库】，录入物流运输车号并点击【批量打印送货单】交付承运商。',
        detailEn:
          'Click Dispatch when finished goods are staged, enter freight data, and print delivery notes.',
      },
    ],
    proTipsZh: [
      '订单达成进度条达到 100% 且发货完毕后，订单自动进入 SHIPPED 归档。',
      '客户若处于 CREDIT_HOLD 状态，建议先联系财务确认账期。',
    ],
    proTipsEn: [
      'Orders reach 100% fulfillment and archive as SHIPPED once all delivery notes are posted.',
      'Accounts on CREDIT_HOLD require finance clearance prior to order confirmation.',
    ],
  },
  {
    id: 'master-data',
    titleZh: '物料主数据目录与工程规格档案',
    titleEn: 'Item Master Data Catalog & SKU Dossiers',
    badgeZh: '物料档案',
    badgeEn: 'Master Data',
    iconName: 'AppstoreOutlined',
    route: '/items',
    hotkey: 'Alt + M',
    category: 'CORE',
    allowedRoles: ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'],
    summaryZh:
      '全厂基础物料主数据定义（SKU），覆盖物料属性分类（原材料、半成品、成品、耗材、备件）、安全库存、最高容量及 BOM 跳转。',
    summaryEn:
      'Plant-wide master SKU catalog covering item types (Raw, WIP, FG, Consumables, Spares), safety stock thresholds, standard costs, and BOM workbench shortcuts.',
    keyFeaturesZh: [
      '全厂物料目录：支持中英文双语名称、型号规格、物料类目检索与过滤',
      '物料详情档案抽屉（SKU Dossier）：完整展示计划标准成本、安全库存下限与最高限额',
      '直通 BOM 工作台：详情抽屉内附带【物料定额工作台】按钮，一键穿透进入结构树',
      '导出 CSV 台账：支持一键将全厂物料主数据导出为标准 CSV 格式',
      '新建物料主数据：支持录入物料属性分类、计量单位、币种与供货周期',
    ],
    keyFeaturesEn: [
      'SKU Directory: Bilingual names, technical specs, categories, and item classifications',
      'Item Dossier Drawer: Comprehensive display of standard costs, safety min, and max limits',
      'Direct BOM Shortcut: 1-Click navigation directly into BOM Workbench from SKU drawer',
      'CSV Ledger Export: Export full master data catalog into formatted CSV spreadsheet',
      'Register New Item: Define item classifications, UoM units, standard cost, and lead times',
    ],
    steps: [
      {
        step: 1,
        titleZh: '检索物料或按属性分类筛选',
        titleEn: 'Search & Filter SKUs',
        detailZh: '在顶部搜索栏输入编码（如 FS-880, RM-STEEL-304）或按【原材料/产成品】切换分类。',
        detailEn:
          'Filter by item classification or type SKU code in search box to locate specifications.',
      },
      {
        step: 2,
        titleZh: '打开详情档案查看工程参数',
        titleEn: 'Inspect Master Data Dossier',
        detailZh:
          '点击操作列【详情】，右侧抽屉展现完整技术规格、计划标准成本、安全水位及更新时间。',
        detailEn:
          'Click Detail to open side drawer showing specs, standard cost, and inventory limits.',
      },
      {
        step: 3,
        titleZh: '穿透进入 BOM 定额或更新数据',
        titleEn: 'Navigate to BOM Workbench',
        detailZh: '对于产成品或半成品，在详情抽屉底部点击【物料定额工作台】可直接分析下级子装配。',
        detailEn:
          'For FG and WIP items, click "BOM Workbench" button at bottom of drawer for engineering tree.',
      },
    ],
    proTipsZh: [
      '物料编码为系统全局唯一标识，请遵循工厂统一编码命名规则。',
      '安全库存设置将直接驱动仪表盘的缺料预警逻辑。',
    ],
    proTipsEn: [
      'Item codes are unique identifiers adhering to enterprise naming conventions.',
      'Safety stock minimum thresholds directly drive dashboard shortage warning alarms.',
    ],
  },
  {
    id: 'partners',
    titleZh: '供应商准入评级与客户商业信用台账',
    titleEn: 'Suppliers Evaluation & Customer Credit Portals',
    badgeZh: '客商档案',
    badgeEn: 'Partners Directory',
    iconName: 'ShopOutlined',
    route: '/suppliers',
    category: 'SUPPLY_CHAIN',
    allowedRoles: ['ADMIN', 'MANAGER', 'PURCHASING', 'SALES', 'WAREHOUSE'],
    summaryZh:
      '战略供应商准入资质与交付表现（OTD %、IQC %）、商业客户信用额度（Credit Limit）、结算账期及一键发起采购/销售单据。',
    summaryEn:
      'Vendor qualification rankings (Grade A/B/C), delivery performance (OTD, IQC), customer credit lines, and direct PO/SO order shortcuts.',
    keyFeaturesZh: [
      '供应商档案抽屉：展示统一定价账期、资质等级（Grade A/B/C）、准时交付率（OTD）与 IQC 合格率',
      '一键发起采购协同：在供应商档案内点击【发起采购协同】直接连通采购系统',
      '客户商业台账抽屉：核验授信额度（Credit Pool）、结算账期条件、开票及收货交付地址',
      '一键新建销售订单：在客户台账内点击【新建销售订单】直接连通销售开单',
      '导出客商名录：支持全量导出供应商与客户数据至 CSV 文件',
    ],
    keyFeaturesEn: [
      'Supplier Dossier Drawer: Rating grades (A/B/C), OTD rate, IQC acceptance, and payment terms',
      'Initiate Purchase Order: Direct link from vendor profile to purchasing creation',
      'Customer Ledger Drawer: Credit limits, active contracts count, billing & shipping addresses',
      'Initiate Sales Order: Direct link from customer ledger to sales order creation',
      'Export Directories: 1-Click CSV export of vendor and customer directories',
    ],
    steps: [
      {
        step: 1,
        titleZh: '查验供应商等级与交付绩效',
        titleEn: 'Audit Supplier Ranking & Performance',
        detailZh:
          '进入【供应商管理】，点击【档案】核查准时交货率（OTD）与质检合格率是否满足 A 级要求。',
        detailEn:
          'Navigate to Suppliers, click Profile to verify OTD and IQC rates for Tier-1 qualification.',
      },
      {
        step: 2,
        titleZh: '核定客户授信额度与履约订单',
        titleEn: 'Check Customer Credit & Orders',
        detailZh: '进入【客户管理】，点击【台账】核验客户当前授信额度及正在履约中的订单笔数。',
        detailEn:
          'Navigate to Customers, click Ledger to inspect approved credit limit and active contracts.',
      },
      {
        step: 3,
        titleZh: '发起采购或销售业务协同',
        titleEn: 'Trigger Commercial Actions',
        detailZh:
          '在档案抽屉底部直接点击【发起采购协同】或【新建销售订单】，实现零延迟跨模块联动。',
        detailEn:
          'Click Initiate Purchase/Sales Order at the bottom of the drawer for seamless cross-module workflows.',
      },
    ],
    proTipsZh: [
      'A级供应商享有免检绿色通道，C级供应商建议启动现场验厂或暂停发单。',
      '客户授信额度超支时，销售开单将提示信贷预警。',
    ],
    proTipsEn: [
      'Grade A suppliers enjoy fast-track staging; Grade C vendors trigger audit reviews.',
      'Customer credit ceiling overruns flag immediate financial alerts during order intake.',
    ],
  },
  {
    id: 'settings',
    titleZh: '终端参数、工业协议连通性与班次设定',
    titleEn: 'Terminal Settings, Protocols & Factory Shifts',
    badgeZh: '工厂配置',
    badgeEn: 'Plant Config',
    iconName: 'SettingOutlined',
    route: '/settings',
    hotkey: 'Alt + T',
    category: 'GOVERNANCE',
    allowedRoles: ['ADMIN', 'MANAGER'],
    summaryZh:
      '工业 SCADA OPC-UA 协议连通性验证、SAP S/4HANA OData 端点握手测试、三班倒班次时间窗口、以及企业角色矩阵与白标品牌参数。',
    summaryEn:
      'Industrial SCADA OPC-UA endpoint validation, SAP S/4HANA OData handshake verification, 3-shift scheduling windows, and enterprise RBAC matrix inspection.',
    keyFeaturesZh: [
      'OPC-UA 服务端验证：输入 opc.tcp:// 地址，点击【验证 OPC-UA 配置】测试工业数据通道',
      'SAP S/4HANA 网关测试：输入 HTTP/HTTPS OData 端点，点击【验证 SAP 网关配置】检测元数据',
      '三班倒工时排班：配置早班（08:00-16:00）、中班（16:00-24:00）、晚班（00:00-08:00）',
      '角色与权限矩阵（RBAC）：查看全厂 7 大核心角色权限范围与访问边界',
      '界面显示密度与主题：支持在紧凑模式（Compact）、标准模式与大字模式之间切换',
    ],
    keyFeaturesEn: [
      'OPC-UA Endpoint Verification: Test opc.tcp:// server URLs for real-time SCADA connectivity',
      'SAP S/4HANA Gateway Testing: Verify OData/REST endpoints with active response diagnostics',
      'Three-Shift Factory Schedules: Define Morning, Afternoon, and Night operational windows',
      'Role & Permission Matrix: Review authorization scopes across all 7 enterprise roles',
      'Display Density & Dark Theme: Switch between Compact, Standard, and Large industrial modes',
    ],
    steps: [
      {
        step: 1,
        titleZh: '配置并测试工业物联网协议',
        titleEn: 'Configure & Test IoT Protocols',
        detailZh:
          '在【集成端点】标签页输入 OPC-UA 与 SAP 网关地址，点击验证按钮，系统将执行协议格式核验与通信握手。',
        detailEn:
          'Input OPC-UA and SAP Gateway URLs under Integrations tab, and click Verify for live connectivity diagnostics.',
      },
      {
        step: 2,
        titleZh: '调整车间班次时间定义',
        titleEn: 'Adjust Shift Windows',
        detailZh:
          '在【运营参数】标签页微调各班次起止时间，确保仪表盘的班次达成率统计与交接单准确对应。',
        detailEn:
          'Tune start and end hours for production shifts to ensure exact synchronization with handover sheets.',
      },
      {
        step: 3,
        titleZh: '保存参数与生效全局',
        titleEn: 'Save & Broadcast Parameters',
        detailZh: '点击顶部【保存工厂全局配置】，所有在线工位机与终端将即时同步更新参数。',
        detailEn:
          'Click Save Plant Configurations to broadcast updated settings across all connected terminals.',
      },
    ],
    proTipsZh: [
      'OPC-UA 验证成功后，传感器与地磅称重数据将以毫秒级写入审计记录。',
      '夜班时间跨越午夜 00:00，系统已内置跨日历日自动折算逻辑。',
    ],
    proTipsEn: [
      'Once OPC-UA is verified, sensor and weighbridge telemetries stream into the audit feed.',
      'Night shift spans past midnight with automated cross-calendar date alignment.',
    ],
  },
  {
    id: 'users',
    titleZh: '企业用户账户治理与 RBAC 权限授权',
    titleEn: 'User Account Governance & RBAC Provisioning',
    badgeZh: '账户治理',
    badgeEn: 'User Governance',
    iconName: 'SafetyCertificateOutlined',
    route: '/settings',
    category: 'GOVERNANCE',
    allowedRoles: ['ADMIN'],
    summaryZh:
      '厂级用户账号全生命周期管理，涵盖新员工开户、角色权限分配（7大角色）、密码重置、账户停用与安全合规管控。',
    summaryEn:
      'Lifecycle user governance covering account provisioning, role assignments across 7 enterprise roles, password resets, and security suspensions.',
    keyFeaturesZh: [
      '用户账户列表：展现工号、全名、绑定的 7 大系统角色、登录邮箱与账号状态',
      '开通新员工账号：录入用户名、姓名、初始密码，并选择分配的一个或多个业务角色',
      '一键重置密码：遇到工人遗忘密码时，管理员可直接指派新密码并即时生效',
      '账号停用与恢复：对离职或异常工号一键停用（DISABLED），阻断登录并销毁会话',
    ],
    keyFeaturesEn: [
      'Account Ledger: Overview of usernames, full names, 7 enterprise roles, and status',
      'Provision User: Create operator accounts with initial passwords and role bindings',
      'Reset Password: Administrators can directly assign new credentials with instant effect',
      'Account Suspension: Deactivate accounts immediately upon personnel departure or breach',
    ],
    steps: [
      {
        step: 1,
        titleZh: '进入用户治理工作台',
        titleEn: 'Access User Governance',
        detailZh: '管理员登录后进入【系统设置】下的【用户账号与权限管理】选项卡。',
        detailEn: 'Logged-in administrators navigate to Settings -> User Accounts tab.',
      },
      {
        step: 2,
        titleZh: '创建工号并精准赋权',
        titleEn: 'Create Account & Assign Roles',
        detailZh:
          '点击【新建用户】，根据岗位职责仅勾选所需角色（如 PRODUCTION 或 WAREHOUSE），恪守最小权限原则。',
        detailEn:
          'Click Create User, select exact required roles adhering to the principle of least privilege.',
      },
      {
        step: 3,
        titleZh: '密码维护与离职注销',
        titleEn: 'Credential Maintenance & Offboarding',
        detailZh: '在操作列使用【重置密码】为操作员更新凭据，或点击【停用】锁定账号。',
        detailEn:
          'Use Reset Password to update operator credentials, or toggle Disable to lock inactive accounts.',
      },
    ],
    proTipsZh: [
      '严禁将 ADMIN 权限随意分配给非 IT 运维人员。',
      '密码采用 BCrypt 强哈希加密算法存储，确保工控安全。',
    ],
    proTipsEn: [
      'Never grant ADMIN roles to non-IT personnel to maintain audit compliance.',
      'All passwords are salted and hashed with BCrypt for industrial cybersecurity.',
    ],
  },
  {
    id: 'audit',
    titleZh: '合规审计追踪与不可篡改操作日志',
    titleEn: 'Compliance Audit Trail & Immutable Activity Logs',
    badgeZh: '审计合规',
    badgeEn: 'Audit Trail',
    iconName: 'AuditOutlined',
    route: '/audit',
    hotkey: 'Alt + A',
    category: 'GOVERNANCE',
    allowedRoles: ['ADMIN', 'VIEWER'],
    summaryZh:
      '全厂不可篡改审计日志（Audit Trail），记录每一次用户登录、工单下达、采购审批、质量放行、库存盘点与出库发货事件，符合 ISO 9001:2026 与 FDA 21 CFR Part 11 合规标准。',
    summaryEn:
      'Immutable factory audit trail capturing user logins, order releases, PO approvals, QC releases, inventory adjustments, and dispatch events complying with ISO 9001:2026 standards.',
    keyFeaturesZh: [
      '完整操作审计：记录操作人、业务动作（USER_LOGIN, PO_APPROVE, WORK_ORDER_RELEASE, QC_INSPECTION_PASS 等）',
      '精确追踪：记录操作来源客户端 IP 地址与毫秒级精确时间戳',
      '受影响实体追溯：直接记录受影响的业务实体类型与唯一业务单号',
      '只读不可篡改：日志仅供查询，数据库层禁止任何 UPDATE 或 DELETE 操作',
    ],
    keyFeaturesEn: [
      'Comprehensive Activity Audit: Operator, action type (LOGIN, PO_APPROVE, WO_RELEASE, QC_PASS, etc.)',
      'Precision Tracking: Client IP address and millisecond-accurate timestamps',
      'Entity Traceability: Direct linkage to business entity types and primary document numbers',
      'Immutable Security: Read-only access; database forbids UPDATE or DELETE operations',
    ],
    steps: [
      {
        step: 1,
        titleZh: '按操作类型或操作人检索',
        titleEn: 'Filter Logs by Action or Operator',
        detailZh:
          '输入用户名（如 admin, clerk_liu）或选择业务动作类型（如 DELIVERY_DISPATCH）进行定向审计。',
        detailEn: 'Filter by operator username or action type to audit specific business events.',
      },
      {
        step: 2,
        titleZh: '核查 IP 来源与时间窗口',
        titleEn: 'Verify IP Origin & Time Window',
        detailZh: '比对操作记录发生时的客户端网络 IP 地址，排查非工位机异常访问行为。',
        detailEn:
          'Correlate action timestamps with client IP addresses to identify unauthorized terminal activities.',
      },
      {
        step: 3,
        titleZh: '追溯关联业务凭据',
        titleEn: 'Trace Associated Document IDs',
        detailZh:
          '核对实体 ID（如 PO-202610-08812, DO-20261025-01），在对应业务模块复核单据状态闭环。',
        detailEn:
          'Reference entity document IDs and inspect corresponding order modules for full lifecycle closure.',
      },
    ],
    proTipsZh: [
      '审计日志长期归档保存，作为年审与质量追溯的法定依据。',
      'VIEWER 角色可用于外审人员只读查阅，无需担心篡改业务数据。',
    ],
    proTipsEn: [
      'Audit logs are retained permanently for ISO annual reviews and root-cause investigations.',
      'The VIEWER role allows external auditors read-only access without data modification risk.',
    ],
  },
];

export default FEATURE_GUIDE_MODULES;
