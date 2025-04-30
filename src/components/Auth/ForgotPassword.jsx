import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Card,
  Space,
  message,
} from 'antd';
import { MailOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const { Title, Text } = Typography;

const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
  background-color: ${(props) =>
    props.theme === 'dark' ? '#1f1f1f' : '#f0f2f5'};
`;

const ForgotPasswordCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  .ant-card-body {
    padding: 32px;
  }
`;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { theme } = useAppContext();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      // This would normally call an Appwrite function to reset the password
      // For now, we'll just simulate a call to the Appwrite SDK
      // In a real implementation, you would use:
      // await account.createRecovery(values.email, 'https://yourdomain.com/reset-password');

      // Simulating API call
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('שליחת הבקשה לאיפוס סיסמה נכשלה. אנא נסה שוב מאוחר יותר.');
      console.error('Forgot password error:', err);
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordContainer theme={theme}>
      <ForgotPasswordCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginTop: 16 }}>
              שחזור סיסמה
            </Title>
            <Text type="secondary" dir="rtl">
              הזן את כתובת האימייל שלך ואנו נשלח לך קישור לאיפוס הסיסמה
            </Text>
          </div>

          {error && <Alert message={error} type="error" showIcon />}

          {success ? (
            <Alert
              message="בקשה נשלחה בהצלחה"
              description="אנא בדוק את תיבת הדואר האלקטרוני שלך לקבלת הוראות לאיפוס הסיסמה."
              type="success"
              showIcon
              action={
                <Button size="small" type="primary">
                  <Link to="/login">חזרה לעמוד ההתחברות</Link>
                </Button>
              }
            />
          ) : (
            <Form
              name="forgot-password"
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

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  שלח קישור לאיפוס
                </Button>
              </Form.Item>
            </Form>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/login">
              <ArrowRightOutlined /> חזרה לעמוד ההתחברות
            </Link>
          </div>
        </Space>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
