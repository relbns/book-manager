// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card, Space } from 'antd';
import { GithubOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import gistService from '../../services/gistService';

const { Title, Text, Link } = Typography;

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

const Login = ({ onLoginSuccess, theme }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const { token } = values;

      // Verify token
      const isValid = await gistService.verifyToken(token);

      if (isValid) {
        // Save token (encrypted)
        gistService.saveToken(token);

        // Find or create app gist
        const gistId = await gistService.findOrCreateAppGist();

        // Save gistId in session storage
        sessionStorage.setItem('bookManagerGistId', gistId);

        // Call the onLoginSuccess callback
        onLoginSuccess();

        // Navigate to home page
        navigate('/');
      } else {
        setError('Invalid GitHub token. Please check and try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please check your token and try again.');
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
            <GithubOutlined style={{ fontSize: 42 }} />
            <Title level={2} style={{ marginTop: 16 }}>
              מנהל הספרים
            </Title>
            <Text type="secondary" dir="rtl">
              ניהול ספרייה אישית עם GitHub Gist
            </Text>
          </div>

          {error && <Alert message={error} type="error" showIcon />}

          <Form name="login" onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="token"
              rules={[
                {
                  required: true,
                  message: 'נא להזין את הטוקן האישי שלך מ-GitHub',
                },
              ]}
              label={<span dir="rtl">GitHub Personal Access Token</span>}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="הזן את הטוקן האישי"
                size="large"
                dir="ltr"
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

          <Text type="secondary" dir="rtl">
            <Link
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              צור טוקן אישי ב-GitHub
            </Link>{' '}
            - דרושות הרשאות gist:read ו-gist:write
          </Text>
        </Space>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
