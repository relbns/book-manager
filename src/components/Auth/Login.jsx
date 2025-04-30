import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Card,
  Space,
  Divider,
} from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
  background-color: ${(props) =>
    props.theme === 'dark' ? '#1f1f1f' : '#f0f2f5'};
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  .ant-card-body {
    padding: 32px;
  }
`;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { handleLogin, theme } = useAppContext();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const { email, password } = values;
      await handleLogin(email, password);
      navigate('/');
    } catch (err) {
      setError('התחברות נכשלה. אנא בדוק את האימייל והסיסמה שלך ונסה שוב.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer theme={theme}>
      <LoginCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <UserOutlined style={{ fontSize: 42 }} />
            <Title level={2} style={{ marginTop: 16 }}>
              מנהל הספרים
            </Title>
            <Text type="secondary" dir="rtl">
              התחבר למערכת ניהול הספרייה שלך
            </Text>
          </div>

          {error && <Alert message={error} type="error" showIcon />}

          <Form
            name="login"
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="אימייל"
              rules={[
                {
                  required: true,
                  message: 'אנא הזן את כתובת האימייל שלך',
                },
                {
                  type: 'email',
                  message: 'אנא הזן כתובת אימייל תקינה',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="הזן את האימייל שלך"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="סיסמה"
              rules={[
                {
                  required: true,
                  message: 'אנא הזן את הסיסמה שלך',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="הזן את הסיסמה שלך"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                התחברות
              </Button>
            </Form.Item>
          </Form>

          <Divider>או</Divider>

          <Button block onClick={() => navigate('/register')}>
            הרשמה למערכת
          </Button>

          <Text
            type="secondary"
            style={{ textAlign: 'center', display: 'block', marginTop: 16 }}
          >
            <Link to="/forgot-password">שכחת את הסיסמה?</Link>
          </Text>
        </Space>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
