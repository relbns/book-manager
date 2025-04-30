// src/pages/UserManagement.jsx
import React, { useState } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Tabs,
  message,
  Empty,
  Alert,
  Modal,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  UserAddOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import UserInvitation from '../components/Auth/UserInvitation';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: right;
  }

  .ant-table-cell {
    text-align: right;
  }
`;

const UserManagement = () => {
  const { isAdmin } = useAppContext();
  const [activeTab, setActiveTab] = useState('users');

  // This would normally come from Appwrite, but for demo we'll use static data
  const [users] = useState([
    {
      id: '1',
      name: 'אדמין משתמש',
      email: 'admin@example.com',
      isAdmin: true,
      status: 'active',
      lastLogin: '2023-05-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'צופה משתמש',
      email: 'viewer@example.com',
      isAdmin: false,
      status: 'active',
      lastLogin: '2023-05-12T14:45:00Z',
    },
    {
      id: '3',
      name: 'משתמש חדש',
      email: 'newuser@example.com',
      isAdmin: false,
      status: 'pending',
      lastLogin: null,
    },
  ]);

  // Mock function to update user role - in real app would use Appwrite
  const toggleUserRole = (userId, makeAdmin) => {
    message.success(`הרשאות המשתמש עודכנו ל${makeAdmin ? 'מנהל' : 'צופה'}`);
  };

  // Mock function to delete user - in real app would use Appwrite
  const deleteUser = (userId) => {
    message.success('המשתמש נמחק בהצלחה');
  };

  // Mock function to reset user password - in real app would use Appwrite
  const resetUserPassword = (userId) => {
    message.success('נשלחה הודעת איפוס סיסמה למשתמש');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Table columns
  const columns = [
    {
      title: 'שם',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'אימייל',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'הרשאות',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin) =>
        isAdmin ? <Tag color="blue">מנהל</Tag> : <Tag color="green">צופה</Tag>,
    },
    {
      title: 'סטטוס',
      dataIndex: 'status',
      key: 'status',
      render: (status) =>
        status === 'active' ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            פעיל
          </Tag>
        ) : (
          <Tag color="warning" icon={<CloseCircleOutlined />}>
            ממתין
          </Tag>
        ),
    },
    {
      title: 'כניסה אחרונה',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin) => formatDate(lastLogin),
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip
            title={record.isAdmin ? 'הורד להרשאות צופה' : 'העלה להרשאות מנהל'}
          >
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => toggleUserRole(record.id, !record.isAdmin)}
              disabled={!isAdmin}
            />
          </Tooltip>

          <Tooltip title="שלח איפוס סיסמה">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => resetUserPassword(record.id)}
              disabled={!isAdmin}
            />
          </Tooltip>

          <Tooltip title="מחק משתמש">
            <Popconfirm
              title="האם אתה בטוח שברצונך למחוק את המשתמש?"
              onConfirm={() => deleteUser(record.id)}
              okText="כן"
              cancelText="לא"
              placement="topRight"
              disabled={!isAdmin}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={!isAdmin}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div>
        <Title level={2}>ניהול משתמשים</Title>
        <Alert
          message="גישה מוגבלת"
          description="רק משתמשים עם הרשאות מנהל יכולים לגשת לעמוד זה"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>ניהול משתמשים</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={
            <span>
              <UserOutlined /> משתמשים
            </span>
          }
          key="users"
        >
          <StyledCard>
            <StyledTable
              dataSource={users}
              columns={columns}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: 'לא נמצאו משתמשים',
              }}
            />
          </StyledCard>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <UserAddOutlined /> הזמנת משתמשים
            </span>
          }
          key="invitations"
        >
          <UserInvitation />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default UserManagement;
