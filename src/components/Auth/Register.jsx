import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Card, Space } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const { Title, Text } = Typography;

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
  background-color: ${(props) =>
    props.theme === 'dark' ? '#1f1f1f' : '#f0f2f5'};
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  .ant-card-body {
    padding: 32px;
  }
`;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [isInvited, setIsInvited] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { handleRegister, theme } = useAppContext();

  // Check for invitation parameters in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    const invited = params.get('invited') === 'true';

    if (email && invited) {
      setInvitedEmail(email);
      setIsInvited(true);
      form.setFieldsValue({ email });
    }
  }, [location, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const { email, password, name } = values;
      await handleRegister(email, password, name);
      navigate('/');
    } catch (err) {
      let errorMessage = 'הרשמה נכשלה. אנא נסה שוב מאוחר יותר.';

      // Handle specific error cases
      if (err.message.includes('already exists')) {
        errorMessage = 'כתובת האימייל הזו כבר רשומה במערכת.';
      } else if (err.message.includes('invalid email')) {
        errorMessage = 'כתובת האימייל אינה תקינה.';
      } else if (err.message.includes('weak password')) {
        errorMessage = 'הסיסמה חלשה מדי. אנא השתמש בסיסמה חזקה יותר.';
      }

      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer theme={theme}>
      <RegisterCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <UserOutlined style={{ fontSize: 42 }} />
            <Title level={2} style={{ marginTop: 16 }}>
              הרשמה למערכת
            </Title>
            <Text type="secondary" dir="rtl">
              צור חשבון חדש במערכת ניהול הספרייה
            </Text>
          </div>

          {!isInvited && (
            <Alert
              message="נדרשת הזמנה"
              description="לתשומת לבך, רק משתמשים מוזמנים יכולים להירשם למערכת. אם קיבלת הזמנה, אנא לחץ על הקישור שנשלח אליך באימייל."
              type="info"
              showIcon
            />
          )}

          {error && <Alert message={error} type="error" showIcon />}

          <Form
            name="register"
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="שם מלא"
              rules={[
                {
                  required: true,
                  message: 'אנא הזן את שמך המלא',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="הזן את שמך המלא"
                size="large"
              />
            </Form.Item>

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
                disabled={isInvited}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="סיסמה"
              rules={[
                {
                  required: true,
                  message: 'אנא הזן סיסמה',
                },
                {
                  min: 8,
                  message: 'הסיסמה חייבת להכיל לפחות 8 תווים',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="הזן סיסמה"
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
                placeholder="אמת את הסיסמה שלך"
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
                disabled={!isInvited}
              >
                הרשמה
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>כבר יש לך חשבון?</Text> <Link to="/login">התחבר</Link>
          </div>
        </Space>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
