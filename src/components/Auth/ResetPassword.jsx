import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Card, Space } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const { Title, Text } = Typography;

const ResetPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
  background-color: ${(props) =>
    props.theme === 'dark' ? '#1f1f1f' : '#f0f2f5'};
`;

const ResetPasswordCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  .ant-card-body {
    padding: 32px;
  }
`;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useAppContext();

  // Get token and userId from URL
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!userId || !secret) {
        setError('קישור איפוס סיסמה לא תקין או פג תוקף. אנא בקש קישור חדש.');
        return;
      }

      // In a real implementation, you would validate the token
      // This is just a simulation
      setValidToken(true);
    };

    validateToken();
  }, [userId, secret]);

  const handleSubmit = async (values) => {
    if (!validToken) {
      setError('קישור איפוס סיסמה לא תקין או פג תוקף. אנא בקש קישור חדש.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // This would normally call an Appwrite function to reset the password
      // For now, we'll just simulate it
      // In a real implementation, you would use:
      // await account.updateRecovery(userId, secret, values.password, values.password);

      // Simulating API call
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }, 1500);
    } catch (err) {
      setError('איפוס הסיסמה נכשל. אנא נסה שוב מאוחר יותר.');
      console.error('Reset password error:', err);
      setLoading(false);
    }
  };

  return (
    <ResetPasswordContainer theme={theme}>
      <ResetPasswordCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginTop: 16 }}>
              איפוס סיסמה
            </Title>
            <Text type="secondary" dir="rtl">
              הזן את הסיסמה החדשה שלך
            </Text>
          </div>

          {error && <Alert message={error} type="error" showIcon />}

          {success ? (
            <Alert
              message="הסיסמה אופסה בהצלחה"
              description="הסיסמה שלך שונתה בהצלחה. אתה מועבר לעמוד ההתחברות..."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          ) : (
            <Form
              name="reset-password"
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              disabled={!validToken}
            >
              <Form.Item
                name="password"
                label="סיסמה חדשה"
                rules={[
                  {
                    required: true,
                    message: 'אנא הזן סיסמה חדשה',
                  },
                  {
                    min: 8,
                    message: 'הסיסמה חייבת להכיל לפחות 8 תווים',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="הזן סיסמה חדשה"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="אימות סיסמה"
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: 'אנא אמת את הסיסמה שלך',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('הסיסמאות אינן תואמות'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="אמת את הסיסמה החדשה"
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
                  disabled={!validToken}
                >
                  איפוס סיסמה
                </Button>
              </Form.Item>
            </Form>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/login">חזרה לעמוד ההתחברות</Link>
          </div>
        </Space>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;
