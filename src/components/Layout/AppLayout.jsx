// src/components/Layout/AppLayout.jsx
import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Button,
  Spin,
  theme as antTheme,
} from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  ReadOutlined,
  BarsOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  ImportOutlined,
  ExportOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../../context/AppContext';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  right: 0;
  z-index: 1;
`;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  margin-right: ${(props) => (props.collapsed ? '80px' : '200px')};
  transition: margin-right 0.2s;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: ${(props) => props.bgcolor};
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const LogoTitle = styled(Title)`
  margin: 0 !important;
  color: ${(props) => props.color} !important;
`;

const StyledContent = styled(Content)`
  margin: 24px 16px;
  padding: 24px;
  background-color: ${(props) => props.bgcolor};
  border-radius: 6px;
`;

const IconContainer = styled.div`
  display: flex;
  gap: 16px;
`;

// Menu items
const getMenuItems = () => [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: <Link to="/">דף הבית</Link>,
  },
  {
    key: '/books',
    icon: <BookOutlined />,
    label: <Link to="/books">ספרים</Link>,
  },
  {
    key: '/loans',
    icon: <TeamOutlined />,
    label: <Link to="/loans">השאלות</Link>,
  },
  {
    key: '/authors',
    icon: <ReadOutlined />,
    label: <Link to="/authors">סופרים</Link>,
  },
  {
    key: '/categories',
    icon: <BarsOutlined />,
    label: <Link to="/categories">קטגוריות</Link>,
  },
  {
    key: '/publishers',
    icon: <BookOutlined />,
    label: <Link to="/publishers">הוצאות לאור</Link>,
  },
  {
    key: 'data',
    icon: <ImportOutlined />,
    label: 'ייבוא/ייצוא',
    children: [
      {
        key: '/import',
        icon: <ImportOutlined />,
        label: <Link to="/import">ייבוא מקובץ CSV</Link>,
      },
      {
        key: '/export',
        icon: <ExportOutlined />,
        label: <Link to="/export">ייצוא לקובץ CSV</Link>,
      },
    ],
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: <Link to="/settings">הגדרות</Link>,
  },
];

const AppLayout = ({ children }) => {
  const { theme, toggleTheme, handleLogout, loading } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { token } = antTheme.useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout>
      <StyledSider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        theme={theme}
        width={200}
        breakpoint="lg"
        trigger={null}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <LogoTitle level={5} color={token.colorTextLightSolid}>
            {collapsed ? 'מ״ס' : 'מנהל הספרים'}
          </LogoTitle>
        </div>
        <Menu
          theme={theme}
          mode="inline"
          defaultSelectedKeys={['/']}
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
        />
      </StyledSider>
      <StyledLayout collapsed={collapsed}>
        <StyledHeader bgcolor={token.colorBgContainer}>
          <Button
            type="text"
            icon={collapsed ? <BookOutlined /> : <BookOutlined />}
            onClick={toggleCollapsed}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <IconContainer>
            <Button
              type="text"
              icon={theme === 'dark' ? <BulbOutlined /> : <BulbFilled />}
              onClick={toggleTheme}
              style={{ fontSize: '18px' }}
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ fontSize: '18px' }}
            />
          </IconContainer>
        </StyledHeader>
        <StyledContent bgcolor={token.colorBgContainer}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            children
          )}
        </StyledContent>
      </StyledLayout>
    </Layout>
  );
};

export default AppLayout;
