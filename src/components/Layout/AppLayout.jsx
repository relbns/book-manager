// src/components/Layout/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Button,
  Spin,
  Drawer,
  theme as antTheme,
  Space,
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
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../../context/AppContext';

const { Header, Content } = Layout;
const { Title } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: ${(props) => props.$bgcolor};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  height: 64px;
`;

const LogoTitle = styled(Title)`
  margin: 0 !important;
  color: ${(props) => props.$color} !important;
  font-size: 18px !important;

  @media (max-width: 480px) {
    font-size: 16px !important;
    margin-left: 8px !important;
  }
`;

const StyledContent = styled(Content)`
  margin-top: 64px;
  padding: 16px;
  background-color: ${(props) => props.$bgcolor};

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
`;

const IconContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const MobileMenuButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

// Get menu items
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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();
  const { token } = antTheme.useToken();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerVisible(false);
  }, [location.pathname]);

  return (
    <StyledLayout>
      <StyledHeader $bgcolor={token.colorBgContainer}>
        <Space>
          <MobileMenuButton
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            aria-label="תפריט"
          />
          <LogoTitle level={5} $color={token.colorText}>
            מנהל הספרים
          </LogoTitle>
        </Space>

        <IconContainer>
          <Button
            type="text"
            icon={theme === 'dark' ? <BulbOutlined /> : <BulbFilled />}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
          />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            aria-label="התנתק"
          />
        </IconContainer>
      </StyledHeader>

      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        placement="right"
        width={isMobile ? '75%' : 280}
        styles={{
          body: { padding: 0, overflow: 'auto' },
          content: { background: theme === 'dark' ? '#001529' : '#fff' },
        }}
        title={null}
        closable={false}
        style={{ header: { display: 'none' } }} 
      >
        <DrawerHeader
          style={{
            background: theme === 'dark' ? '#001529' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          }}
        >
          <Title
            level={5}
            style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#000' }}
          >
            מנהל הספרים
          </Title>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setDrawerVisible(false)}
            style={{ color: theme === 'dark' ? '#fff' : '#000' }}
          />
        </DrawerHeader>

        <Menu
          theme={theme}
          mode="inline"
          defaultSelectedKeys={['/']}
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          style={{ borderRight: 0 }}
        />
      </Drawer>

      <StyledContent $bgcolor={token.colorBgContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          children
        )}
      </StyledContent>
    </StyledLayout>
  );
};

export default AppLayout;
