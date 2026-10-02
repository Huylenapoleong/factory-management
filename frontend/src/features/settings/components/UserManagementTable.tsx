import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserAddOutlined,
  KeyOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/stores/useAppStore';
import { userService, UserAccount, CreateUserPayload } from '@/services/userService';

export const UserManagementTable: React.FC = () => {
  const { language } = useAppStore();
  const { token } = theme.useToken();
  const isZh = language === 'zh-CN';

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [createForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    userService.getUsers().then((data) => {
      if (active) setUsers(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      const payload: CreateUserPayload = {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        roleNames: values.roles || ['VIEWER'],
      };
      await userService.createUser(payload);
      message.success(isZh ? '新用户账号已成功创建并分配权限' : 'User account created successfully');
      createForm.resetFields();
      setCreateModalVisible(false);
      void fetchUsers();
    } catch {
      // validation
    }
  };

  const handleToggleStatus = async (id: number) => {
    await userService.toggleStatus(id);
    message.success(isZh ? '用户账号状态已更新' : 'User status updated');
    void fetchUsers();
  };

  const handleResetPassword = async () => {
    if (!selectedUserId) return;
    try {
      const values = await resetForm.validateFields();
      await userService.resetPassword(selectedUserId, values.newPassword);
      message.success(isZh ? '用户访问密码已成功重置' : 'Password reset successfully');
      resetForm.resetFields();
      setResetModalVisible(false);
      setSelectedUserId(null);
    } catch {
      // validation
    }
  };

  const columns: ColumnsType<UserAccount> = [
    {
      title: isZh ? '用户名' : 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff' }}>
          @{val}
        </span>
      ),
    },
    {
      title: isZh ? '姓名 / 责任人' : 'Full Name / Operator',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      title: isZh ? '角色权限' : 'Assigned Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space size={4} wrap>
          {roles.map((r) => {
            const colorMap: Record<string, string> = {
              ADMIN: 'red',
              MANAGER: 'orange',
              PRODUCTION: 'blue',
              WAREHOUSE: 'green',
              PURCHASING: 'cyan',
              SALES: 'purple',
              VIEWER: 'default',
            };
            return <Tag color={colorMap[r] || 'blue'} key={r}>{r}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: isZh ? '联系电话' : 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (val?: string) => val || '--',
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
      title: isZh ? '操作' : 'Actions',
      key: 'actions',
      width: 170,
      render: (_, r) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => {
              setSelectedUserId(r.id);
              setResetModalVisible(true);
            }}
          >
            {isZh ? '重置密码' : 'Reset'}
          </Button>

          {r.username !== 'admin' && (
            <Popconfirm
              title={isZh ? '确认更改用户账号状态？' : 'Confirm toggle user status?'}
              onConfirm={() => handleToggleStatus(r.id)}
            >
              <Button
                type="link"
                size="small"
                danger={r.status === 'ACTIVE'}
                icon={r.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
              >
                {r.status === 'ACTIVE' ? (isZh ? '停用' : 'Deactivate') : (isZh ? '启用' : 'Activate')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: token.colorText }}>
            {isZh ? '系统操作员账号与访问权限列表' : 'Authorized Operator Accounts & Credentials'}
          </div>
          <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
            {isZh ? '统一控制车间终端操作员登录、岗位角色与安全权限' : 'Centralized RBAC management for workshop operators and credentials'}
          </div>
        </div>

        <Button
          type="primary"
          size="small"
          icon={<UserAddOutlined />}
          onClick={() => setCreateModalVisible(true)}
          style={{ backgroundColor: '#1677ff' }}
        >
          {isZh ? '新增系统用户' : 'New User'}
        </Button>
      </div>

      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 5 }}
        style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 4 }}
      />

      {/* Create User Modal */}
      <Modal
        title={isZh ? '新增系统用户与工控权限' : 'Create Operator Account & Assign Roles'}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={handleCreateUser}
        centered
        destroyOnHidden
        forceRender
        okText={isZh ? '确认创建' : 'Create'}
        cancelText={isZh ? '取消' : 'Cancel'}
      >
        <Form form={createForm} layout="vertical" size="small">
          <Form.Item
            name="username"
            label={isZh ? '登录工号 / 用户名' : 'Username / Staff ID'}
            rules={[{ required: true, message: isZh ? '请输入工号' : 'Required' }]}
          >
            <Input placeholder="e.g. operator_li" />
          </Form.Item>
          <Form.Item
            name="password"
            label={isZh ? '初始密码' : 'Initial Password'}
            rules={[{ required: true, min: 6, message: isZh ? '密码最少6位' : 'Min 6 chars' }]}
          >
            <Input.Password placeholder="******" />
          </Form.Item>
          <Form.Item
            name="fullName"
            label={isZh ? '真实姓名' : 'Full Name'}
            rules={[{ required: true, message: isZh ? '请输入真实姓名' : 'Required' }]}
          >
            <Input placeholder="e.g. Li Jun (李军)" />
          </Form.Item>
          <Form.Item name="email" label={isZh ? '工作邮箱' : 'Work Email'}>
            <Input placeholder="li.jun@factory.com" />
          </Form.Item>
          <Form.Item name="phone" label={isZh ? '联系电话' : 'Contact Phone'}>
            <Input placeholder="+86-138..." />
          </Form.Item>
          <Form.Item
            name="roles"
            label={isZh ? '分配角色权限' : 'Assign System Roles'}
            rules={[{ required: true, message: isZh ? '请选择至少一个角色' : 'Required' }]}
          >
            <Select
              mode="multiple"
              placeholder={isZh ? '选择角色' : 'Select roles'}
              options={[
                { value: 'ADMIN', label: 'ADMIN (系统管理)' },
                { value: 'MANAGER', label: 'MANAGER (厂长总监)' },
                { value: 'PRODUCTION', label: 'PRODUCTION (车间操作)' },
                { value: 'WAREHOUSE', label: 'WAREHOUSE (仓储物流)' },
                { value: 'PURCHASING', label: 'PURCHASING (采购质检)' },
                { value: 'SALES', label: 'SALES (销售发货)' },
                { value: 'VIEWER', label: 'VIEWER (审计只读)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title={isZh ? '重置用户密码' : 'Reset User Password'}
        open={resetModalVisible}
        onCancel={() => {
          setResetModalVisible(false);
          setSelectedUserId(null);
        }}
        onOk={handleResetPassword}
        centered
        destroyOnHidden
        forceRender
        okText={isZh ? '确认重置' : 'Reset'}
        cancelText={isZh ? '取消' : 'Cancel'}
      >
        <Form form={resetForm} layout="vertical" size="small">
          <Form.Item
            name="newPassword"
            label={isZh ? '新安全访问密码' : 'New Password'}
            rules={[{ required: true, min: 6, message: isZh ? '密码最少6位' : 'Min 6 chars' }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
