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
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileSyncOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { masterDataService } from '@/services/masterDataService';
import { ItemRecord, ItemType } from '../types';
import { CreateItemModal } from './CreateItemModal';

export const ItemsView: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemRecord | null>(null);

  const fetchItems = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await masterDataService.getItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    masterDataService.getItems().then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesType =
      selectedType === 'ALL' ||
      item.type === selectedType ||
      (selectedType === 'FINISHED_GOODS' && item.type === 'FINISHED_GOOD') ||
      (selectedType === 'WIP' && item.type === 'SEMI_FINISHED') ||
      (selectedType === 'SPARE_PART' && item.type === 'CONSUMABLE');
    const q = searchText.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.itemCode.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.nameZh.includes(q) ||
      item.specification.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const rawCount = items.filter((i) => i.type === 'RAW_MATERIAL').length;
  const finishedCount = items.filter(
    (i) => i.type === 'FINISHED_GOODS' || i.type === 'FINISHED_GOOD',
  ).length;

  const getTypeTag = (type: ItemType) => {
    const colorMap: Record<ItemType, string> = {
      RAW_MATERIAL: 'blue',
      WIP: 'orange',
      SEMI_FINISHED: 'orange',
      FINISHED_GOODS: 'green',
      FINISHED_GOOD: 'green',
      CONSUMABLE: 'purple',
      SPARE_PART: 'purple',
    };
    const labelMap: Record<ItemType, string> = {
      RAW_MATERIAL: isZh ? '原材料' : 'Raw Mat',
      WIP: isZh ? '在制品' : 'WIP',
      SEMI_FINISHED: isZh ? '半成品' : 'Semi-Finished',
      FINISHED_GOODS: isZh ? '产成品' : 'Finished',
      FINISHED_GOOD: isZh ? '产成品' : 'Finished',
      CONSUMABLE: isZh ? '耗材/备件' : 'Consumable',
      SPARE_PART: isZh ? '备件' : 'Spare Part',
    };
    return {
      color: colorMap[type] || 'default',
      label: labelMap[type] || type,
    };
  };

  const columns: ColumnsType<ItemRecord> = [
    {
      title: isZh ? '物料编码' : 'Item / SKU Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff' }}>{val}</span>
      ),
    },
    {
      title: isZh ? '品名规格' : 'Item Name & Specification',
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {isZh ? r.nameZh : r.nameEn}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            {isZh ? r.nameEn : r.nameZh} •{' '}
            <span style={{ color: '#4b5563' }}>{r.specification}</span>
          </div>
        </div>
      ),
    },
    {
      title: isZh ? '物料分类' : 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 130,
      render: (_, r) => (
        <span style={{ fontSize: 12, color: '#374151' }}>
          {isZh ? r.categoryNameZh : r.categoryName}
        </span>
      ),
    },
    {
      title: isZh ? '属性' : 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: ItemType) => {
        const { color, label } = getTypeTag(type);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: isZh ? '单位' : 'UOM',
      dataIndex: 'uomCode',
      key: 'uomCode',
      width: 70,
      align: 'center',
    },
    {
      title: isZh ? '安全库存' : 'Safety Min',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
      align: 'right',
      render: (val: number, r) => `${val.toLocaleString()} ${r.uomCode}`,
    },
    {
      title: isZh ? '最高限额' : 'Max Cap',
      dataIndex: 'maxStock',
      key: 'maxStock',
      width: 100,
      align: 'right',
      render: (val: number, r) => `${val.toLocaleString()} ${r.uomCode}`,
    },
    {
      title: isZh ? '标准成本' : 'Std Cost',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 110,
      align: 'right',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: isZh ? '供货期' : 'Lead Time',
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
      width: 90,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: isZh ? '操作' : 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => setSelectedItem(record)}>
          {isZh ? '详情' : 'Detail'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top Industrial KPI Strip */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 12 }}>
                  {isZh ? '总物料/产品定义' : 'Total Registered SKUs'}
                </span>
              }
              value={items.length}
              prefix={<AppstoreOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '基础原材料' : 'Raw Materials'}</span>}
              value={rawCount}
              prefix={<FileSyncOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>{isZh ? '总装产成品' : 'Finished Goods'}</span>}
              value={finishedCount}
              prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
            <Statistic
              title={
                <span style={{ fontSize: 12 }}>
                  {isZh ? '安全库存监控中' : 'Monitored Safety Lines'}
                </span>
              }
              value={items.length}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
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
                {isZh ? '物料属性:' : 'Classification:'}
              </span>
              <Select
                size="small"
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 170 }}
                options={[
                  { value: 'ALL', label: isZh ? '全部物料属性' : 'All Classifications' },
                  {
                    value: 'RAW_MATERIAL',
                    label: isZh ? '原材料' : 'Raw Materials',
                  },
                  { value: 'WIP', label: isZh ? '在制品/半成品' : 'Work-in-Progress' },
                  {
                    value: 'FINISHED_GOODS',
                    label: isZh ? '产成品' : 'Finished Goods',
                  },
                  { value: 'SPARE_PART', label: isZh ? '备品备件' : 'Spare Parts' },
                ]}
              />
            </div>

            <Input
              placeholder={
                isZh ? '搜索物料编号、品名、规格...' : 'Search SKU, name, specification...'
              }
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
          </Space>

          <Space size="small">
            <PermissionGuard action="CREATE_ITEM">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                style={{ backgroundColor: '#1677ff' }}
              >
                {isZh ? '新增物料定义' : 'New Item SKU'}
              </Button>
            </PermissionGuard>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (filteredItems.length === 0) {
                  message.warning(isZh ? '无物料数据可导出' : 'No data to export');
                  return;
                }
                const headers = [
                  'ItemCode,NameEn,NameZh,Specification,Category,Type,UOM,SafetyStock,MaxStock,StandardCost,LeadTimeDays,Status',
                ];
                const rows = filteredItems.map(
                  (i) =>
                    `"${i.itemCode}","${i.nameEn}","${i.nameZh}","${i.specification}","${isZh ? i.categoryNameZh : i.categoryName}","${i.type}","${i.uomCode}",${i.safetyStock},${i.maxStock},${i.standardCost},${i.leadTimeDays},"${i.status}"`,
                );
                const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute(
                  'download',
                  `items_catalog_${new Date().toISOString().slice(0, 10)}.csv`,
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                message.success(isZh ? '物料主数据已成功导出' : 'Items catalog exported');
              }}
            >
              {isZh ? '导出清单' : 'Export CSV'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main High-Density Items Table */}
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
          dataSource={filteredItems}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) =>
              `${isZh ? '共' : 'Total'} ${total} ${isZh ? '条物料记录' : 'items'}`,
          }}
        />
      </Card>

      <CreateItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchItems}
      />

      {/* Real Item Details Drawer */}
      <Drawer
        title={
          selectedItem ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AppstoreOutlined style={{ color: '#1677ff' }} />
              <span>{isZh ? '物料主数据明细' : 'Master Data SKU Details'}</span>
              <Tag color="blue">{selectedItem.itemCode}</Tag>
            </div>
          ) : (
            ''
          )
        }
        size={560}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions
              bordered
              size="small"
              column={1}
              items={[
                {
                  key: 'itemCode',
                  label: isZh ? '物料编码' : 'Item Code',
                  children: <strong>{selectedItem.itemCode}</strong>,
                },
                {
                  key: 'nameZh',
                  label: isZh ? '物料中文名称' : 'Chinese Name',
                  children: selectedItem.nameZh,
                },
                {
                  key: 'nameEn',
                  label: isZh ? '物料英文名称' : 'English Name',
                  children: selectedItem.nameEn,
                },
                {
                  key: 'type',
                  label: isZh ? '物料属性分类' : 'Item Classification',
                  children: (
                    <Tag color={getTypeTag(selectedItem.type).color}>
                      {getTypeTag(selectedItem.type).label}
                    </Tag>
                  ),
                },
                {
                  key: 'category',
                  label: isZh ? '所属类目' : 'Category',
                  children: isZh ? selectedItem.categoryNameZh : selectedItem.categoryName,
                },
                {
                  key: 'uom',
                  label: isZh ? '计量单位' : 'UoM',
                  children: selectedItem.uomCode,
                },
                {
                  key: 'spec',
                  label: isZh ? '规格型号与标准' : 'Specification',
                  children: selectedItem.specification || '—',
                },
                {
                  key: 'cost',
                  label: isZh ? '计划标准成本' : 'Standard Cost',
                  children: `${selectedItem.standardCost.toFixed(2)} ${selectedItem.currency}`,
                },
                {
                  key: 'safety',
                  label: isZh ? '安全库存下限' : 'Safety Stock Min',
                  children: `${selectedItem.safetyStock} ${selectedItem.uomCode}`,
                },
                {
                  key: 'max',
                  label: isZh ? '最高库容限额' : 'Max Capacity',
                  children: `${selectedItem.maxStock} ${selectedItem.uomCode}`,
                },
                {
                  key: 'status',
                  label: isZh ? '状态' : 'Status',
                  children: (
                    <Tag color={selectedItem.status === 'ACTIVE' ? 'success' : 'default'}>
                      {selectedItem.status}
                    </Tag>
                  ),
                },
                ...(selectedItem.updatedAt
                  ? [
                      {
                        key: 'updatedAt',
                        label: isZh ? '更新时间' : 'Updated At',
                        children: selectedItem.updatedAt,
                      },
                    ]
                  : []),
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button onClick={() => setSelectedItem(null)}>{isZh ? '关闭' : 'Close'}</Button>
              <Button
                type="primary"
                icon={<PartitionOutlined />}
                onClick={() => {
                  setSelectedItem(null);
                  navigate('/production/bom');
                }}
              >
                {isZh ? '物料定额工作台' : 'BOM Workbench'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ItemsView;
