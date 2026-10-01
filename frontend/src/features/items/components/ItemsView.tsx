import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Button, Space, Row, Col, Statistic, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { masterDataService } from '@/services/masterDataService';
import { ItemRecord, ItemType } from '../types';
import { CreateItemModal } from './CreateItemModal';

export const ItemsView: React.FC = () => {
  const { language } = useAppStore();
  const isZh = language === 'zh-CN';

  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);

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
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
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
  const finishedCount = items.filter((i) => i.type === 'FINISHED_GOODS').length;

  const columns: ColumnsType<ItemRecord> = [
    {
      title: isZh ? '物料编码' : 'Item / SKU Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff' }}>
          {val}
        </span>
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
            {isZh ? r.nameEn : r.nameZh} • <span style={{ color: '#4b5563' }}>{r.specification}</span>
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
        const colorMap: Record<ItemType, string> = {
          RAW_MATERIAL: 'blue',
          WIP: 'orange',
          FINISHED_GOODS: 'green',
          SPARE_PART: 'purple',
        };
        const labelMap: Record<ItemType, string> = {
          RAW_MATERIAL: isZh ? '原材料' : 'Raw Mat',
          WIP: isZh ? '在制品' : 'WIP',
          FINISHED_GOODS: isZh ? '产成品' : 'Finished',
          SPARE_PART: isZh ? '备件' : 'Spare Part',
        };
        return <Tag color={colorMap[type]}>{labelMap[type]}</Tag>;
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
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
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
          onClick={() => message.info(isZh ? '正在调取物料BOM与图纸...' : 'Opening CAD drawing...')}
        >
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
              title={<span style={{ fontSize: 12 }}>{isZh ? '总物料/产品定义' : 'Total Registered SKUs'}</span>}
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
              title={<span style={{ fontSize: 12 }}>{isZh ? '安全库存监控中' : 'Monitored Safety Lines'}</span>}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
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
                  { value: 'RAW_MATERIAL', label: isZh ? '原材料 (Raw Materials)' : 'Raw Materials' },
                  { value: 'WIP', label: isZh ? '在制品/半成品 (WIP)' : 'Work-in-Progress' },
                  { value: 'FINISHED_GOODS', label: isZh ? '产成品 (Finished Goods)' : 'Finished Goods' },
                  { value: 'SPARE_PART', label: isZh ? '备品备件 (Spare Parts)' : 'Spare Parts' },
                ]}
              />
            </div>

            <Input
              placeholder={isZh ? '搜索物料编号、品名、规格...' : 'Search SKU, name, specification...'}
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 260 }}
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
              {isZh ? '新增物料定义' : 'New Item SKU'}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => message.success(isZh ? '正在导出物料主数据清单...' : 'Exporting Items Catalog CSV...')}
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
            showTotal: (total) => `${isZh ? '共' : 'Total'} ${total} ${isZh ? '条物料记录' : 'items'}`,
          }}
        />
      </Card>

      <CreateItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchItems}
      />
    </div>
  );
};

export default ItemsView;
