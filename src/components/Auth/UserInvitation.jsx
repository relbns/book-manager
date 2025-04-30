import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Card,
  Space,
  Switch,
  message,
} from 'antd';
import { MailOutlined, UserAddOutlined, CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../../context/AppContext';

const { Title, Text, Paragraph } = Typography;

const InvitationContainer = styled.div`
  padding: 24px;
`;

const InvitationCard = styled(Card)`
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const UserInvitation = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');

  const { inviteUser, isAdmin } = useAppContext();

  const handleSubmit = async (values) => {
    if (!isAdmin) {
      setError('רק מנהלי מערכת יכולים לשלוח הזמנות');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { email, isAdmin: makeAdmin } = values;
      const inviteUrl = await inviteUser(email, makeAdmin);

      setInvitationUrl(inviteUrl);
      setSuccess(true);
      form.resetFields();
    } catch (err) {
      setError('שליחת ההזמנה נכשלה. אנא נסה שוב מאוחר יותר.');
      console.error('Invitation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(invitationUrl)
      .then(() => {
        message.success('הקישור הועתק ללוח');
      })
      .catch((err) => {
        message.error('שגיאה בהעתקת הקישור');
        console.error('Copy error:', err);
      });
  };

  return (
    <InvitationContainer>
      <Title level={3}>
        <UserAddOutlined /> הזמנת משתמשים למערכת
      </Title>

      <InvitationCard>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {error && <Alert message={error} type="error" showIcon />}

          {success && (
            <Alert
              message="ההזמנה נוצרה בהצלחה"
              description={
                <>
                  <Paragraph>
                    קישור ההזמנה נוצר בהצלחה. העתק אותו ושלח אותו למשתמש שברצונך
                    להזמין.
                  </Paragraph>
                  <Input.TextArea
                    value={invitationUrl}
                    autoSize={{ minRows: 2, maxRows: 3 }}
                    readOnly
                    addonAfter={
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={copyToClipboard}
                      />
                    }
                  />
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginTop: 8 }}
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                  >
                    העתק קישור
                  </Button>
                </>
              }
              type="success"
              showIcon
            />
          )}

          <Form
            name="user-invitation"
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="אימייל המשתמש"
              rules={[
                {
                  required: true,
                  message: 'אנא הזן את כתובת האימייל של המשתמש',
                },
                {
                  type: 'email',
                  message: 'אנא הזן כתובת אימייל תקינה',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="הזן את האימייל של המשתמש"
              />
            </Form.Item>

            <Form.Item
              name="isAdmin"
              label="הרשאות מנהל"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item help="משתמשים עם הרשאות מנהל יוכלו לערוך את כל הנתונים ולהזמין משתמשים נוספים">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!isAdmin}
              >
                שלח הזמנה
              </Button>
            </Form.Item>
          </Form>

          {!isAdmin && (
            <Alert
              message="אין לך הרשאות מספיקות"
              description="רק מנהלי מערכת יכולים להזמין משתמשים חדשים"
              type="warning"
              showIcon
            />
          )}
        </Space>
      </InvitationCard>
    </InvitationContainer>
  );
};

export default UserInvitation;
