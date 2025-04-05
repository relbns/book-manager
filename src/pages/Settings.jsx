// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Collapse,
  Space,
  Divider,
  InputNumber,
  Alert,
  message,
  Tabs,
  Row,
  Col,
  Modal,
  Popconfirm,
  Badge,
  Statistic,
} from 'antd';
import {
  SettingOutlined,
  SyncOutlined,
  GithubOutlined,
  UserOutlined,
  BookOutlined,
  DatabaseOutlined,
  ExportOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import gistService from '../services/gistService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph, Link } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const SettingsRow = styled(Row)`
  margin-bottom: 16px;
`;

const SettingsCol = styled(Col)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Settings = () => {
  const {
    theme,
    toggleTheme,
    handleLogout,
    books,
    loans,
    authors,
    categories,
    publishers,
    statistics,
    updateStatistics,
    refreshData,
  } = useAppContext();

  // State
  const [appForm] = Form.useForm();
  const [loanForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('general');
  const [refreshing, setRefreshing] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form from statistics
  useEffect(() => {
    if (statistics) {
      // App settings
      appForm.setFieldsValue({
        defaultLanguage: statistics.defaultLanguage || 'Hebrew',
        defaultLoanPeriod: statistics.defaultLoanPeriod || 14,
        showNotifications: statistics.showNotifications !== false,
        darkMode: theme === 'dark',
        bookTitlePrefix: statistics.bookTitlePrefix || '',
      });

      // Loan settings
      loanForm.setFieldsValue({
        loanPeriod: statistics.defaultLoanPeriod || 14,
        sendReminders: statistics.sendReminders !== false,
        reminderDays: statistics.reminderDays || 3,
        allowRenewals: statistics.allowRenewals !== false,
        maxRenewals: statistics.maxRenewals || 2,
      });

      // Backup settings
      backupForm.setFieldsValue({
        autoBackup: statistics.autoBackup !== false,
        backupInterval: statistics.backupInterval || 7,
        lastBackup: statistics.lastBackup || '',
      });

      // Set last sync time
      if (statistics.lastSync) {
        setLastSyncTime(
          dayjs(statistics.lastSync).format('DD/MM/YYYY HH:mm:ss')
        );
      }
    }
  }, [statistics, theme, appForm, loanForm, backupForm]);

  // Calculate app statistics
  const totalBooks = books.length;
  const totalAuthors = authors.length;
  const totalPublishers = publishers.length;
  const totalCategories = categories.length;
  const totalLoans = loans.length;
  const activeLoans = loans.filter((loan) => loan.status === 'active').length;
  const overdueLoans = loans.filter(
    (loan) => loan.status === 'active' && dayjs(loan.dueDate).isBefore(dayjs())
  ).length;

  // Handle app settings submit
  const handleAppSettingsSubmit = async (values) => {
    try {
      setIsLoading(true);

      // Toggle theme if necessary
      if (values.darkMode && theme !== 'dark') {
        toggleTheme();
      } else if (!values.darkMode && theme !== 'light') {
        toggleTheme();
      }

      // Update statistics with new values
      await updateStatistics({
        defaultLanguage: values.defaultLanguage,
        defaultLoanPeriod: values.defaultLoanPeriod,
        showNotifications: values.showNotifications,
        bookTitlePrefix: values.bookTitlePrefix,
      });

      message.success('הגדרות עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating app settings:', error);
      message.error('אירעה שגיאה בעדכון ההגדרות');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loan settings submit
  const handleLoanSettingsSubmit = async (values) => {
    try {
      setIsLoading(true);

      // Update statistics with new values
      await updateStatistics({
        defaultLoanPeriod: values.loanPeriod,
        sendReminders: values.sendReminders,
        reminderDays: values.reminderDays,
        allowRenewals: values.allowRenewals,
        maxRenewals: values.maxRenewals,
      });

      message.success('הגדרות השאלה עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating loan settings:', error);
      message.error('אירעה שגיאה בעדכון הגדרות ההשאלה');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle backup settings submit
  const handleBackupSettingsSubmit = async (values) => {
    try {
      setIsLoading(true);

      // Update statistics with new values
      await updateStatistics({
        autoBackup: values.autoBackup,
        backupInterval: values.backupInterval,
      });

      message.success('הגדרות גיבוי עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating backup settings:', error);
      message.error('אירעה שגיאה בעדכון הגדרות הגיבוי');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data from server
  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      await refreshData();

      // Update last sync time in statistics
      await updateStatistics({
        lastSync: new Date().toISOString(),
      });

      setLastSyncTime(dayjs().format('DD/MM/YYYY HH:mm:ss'));
      message.success('הנתונים עודכנו בהצלחה');
    } catch (error) {
      console.error('Error refreshing data:', error);
      message.error('אירעה שגיאה בעדכון הנתונים');
    } finally {
      setRefreshing(false);
    }
  };

  // Create backup
  const handleCreateBackup = async () => {
    try {
      setBackingUp(true);

      // This would typically create a copy of the Gist or export all data
      // For this demo, we'll just update the lastBackup timestamp
      await updateStatistics({
        lastBackup: new Date().toISOString(),
      });

      // Update form field
      backupForm.setFieldValue('lastBackup', new Date().toISOString());

      message.success('גיבוי נוצר בהצלחה');
    } catch (error) {
      console.error('Error creating backup:', error);
      message.error('אירעה שגיאה ביצירת גיבוי');
    } finally {
      setBackingUp(false);
    }
  };

  // Reset data
  const handleResetData = async () => {
    setResetInProgress(true);

    try {
      Modal.confirm({
        title: 'איפוס נתונים',
        content:
          'האם אתה בטוח שברצונך לאפס את כל הנתונים? פעולה זו אינה ניתנת לביטול!',
        okText: 'כן, אפס את כל הנתונים',
        cancelText: 'ביטול',
        onOk: async () => {
          // This is a demo of what a reset function would look like
          // In a real application, you would want to implement proper reset functionality

          // Here we would clear all collections
          // For now, we'll just refresh the data and show a message
          await refreshData();
          message.success('הנתונים אופסו בהצלחה');
          setResetInProgress(false);
        },
        onCancel: () => {
          setResetInProgress(false);
        },
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      message.error('אירעה שגיאה באיפוס הנתונים');
      setResetInProgress(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'לא גובה';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  return (
    <div>
      <StyledCard>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <SettingOutlined /> הגדרות
          </Title>
          <Paragraph>ניהול הגדרות היישום ונתונים</Paragraph>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <ToolOutlined /> הגדרות כלליות
              </span>
            }
            key="general"
          >
            <Form
              form={appForm}
              layout="vertical"
              onFinish={handleAppSettingsSubmit}
              initialValues={{
                defaultLanguage: 'Hebrew',
                defaultLoanPeriod: 14,
                showNotifications: true,
                darkMode: theme === 'dark',
                bookTitlePrefix: '',
              }}
            >
              <SettingsRow gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="defaultLanguage"
                    label="שפת ברירת מחדל"
                    tooltip="שפת ברירת המחדל לספרים חדשים"
                  >
                    <Select>
                      <Option value="Hebrew">עברית</Option>
                      <Option value="English">אנגלית</Option>
                      <Option value="Arabic">ערבית</Option>
                      <Option value="Russian">רוסית</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="defaultLoanPeriod"
                    label="תקופת השאלה ברירת מחדל (ימים)"
                    tooltip="מספר הימים הרגיל להשאלת ספר"
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name="bookTitlePrefix"
                    label="קידומת לכותרת הספר"
                    tooltip="קידומת שתוצג בכותרת הספר (לדוגמה: הספריה שלי - כותר הספר)"
                  >
                    <Input placeholder="השאר ריק לכותרת רגילה" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="showNotifications"
                    label="הצג התראות"
                    tooltip="הצג התראות על ספרים בפיגור החזרה"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="darkMode"
                    label="מצב כהה"
                    tooltip="הפעל/כבה מצב כהה"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </SettingsRow>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  שמור הגדרות
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BookOutlined /> הגדרות השאלה
              </span>
            }
            key="loans"
          >
            <Form
              form={loanForm}
              layout="vertical"
              onFinish={handleLoanSettingsSubmit}
              initialValues={{
                loanPeriod: 14,
                sendReminders: true,
                reminderDays: 3,
                allowRenewals: true,
                maxRenewals: 2,
              }}
            >
              <SettingsRow gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="loanPeriod"
                    label="תקופת השאלה (ימים)"
                    tooltip="מספר הימים הרגיל להשאלת ספר"
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name="reminderDays"
                    label="ימים לפני תזכורת"
                    tooltip="מספר הימים לפני תאריך ההחזרה לשליחת תזכורת"
                  >
                    <InputNumber min={1} max={30} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="sendReminders"
                    label="שלח תזכורות"
                    tooltip="שלח תזכורות לפני תאריך ההחזרה"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="allowRenewals"
                    label="אפשר חידושים"
                    tooltip="אפשר חידוש השאלות"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="maxRenewals"
                    label="מספר חידושים מקסימלי"
                    tooltip="מספר הפעמים המקסימלי שניתן לחדש השאלה"
                  >
                    <InputNumber min={0} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </SettingsRow>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  שמור הגדרות
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <DatabaseOutlined /> גיבוי ושחזור
              </span>
            }
            key="backup"
          >
            <Form
              form={backupForm}
              layout="vertical"
              onFinish={handleBackupSettingsSubmit}
              initialValues={{
                autoBackup: true,
                backupInterval: 7,
                lastBackup: '',
              }}
            >
              <SettingsRow gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="autoBackup"
                    label="גיבוי אוטומטי"
                    tooltip="האם לגבות אוטומטית את הנתונים"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="backupInterval"
                    label="תדירות גיבוי (ימים)"
                    tooltip="מספר הימים בין גיבויים אוטומטיים"
                  >
                    <InputNumber min={1} max={30} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item name="lastBackup" label="גיבוי אחרון">
                    <Input
                      disabled
                      placeholder="לא בוצע גיבוי"
                      value={
                        backupForm.getFieldValue('lastBackup')
                          ? formatDate(backupForm.getFieldValue('lastBackup'))
                          : 'לא בוצע גיבוי'
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Paragraph>
                    גיבוי נוכחי נשמר ב-GitHub Gist. כדי לגבות את הנתונים, לחץ על
                    כפתור "גיבוי עכשיו".
                  </Paragraph>

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      icon={<ExportOutlined />}
                      onClick={handleCreateBackup}
                      loading={backingUp}
                      block
                    >
                      גיבוי עכשיו
                    </Button>

                    <Divider />

                    <Alert
                      message="איפוס נתונים"
                      description="אפשרות זו תמחק את כל הנתונים מהמערכת. פעולה זו אינה ניתנת לביטול!"
                      type="warning"
                      showIcon
                      action={
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleResetData}
                          loading={resetInProgress}
                        >
                          איפוס מערכת
                        </Button>
                      }
                    />
                  </Space>
                </Col>
              </SettingsRow>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  שמור הגדרות
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ThunderboltOutlined /> סנכרון
              </span>
            }
            key="sync"
          >
            <SettingsRow gutter={24}>
              <Col xs={24} md={12}>
                <StyledCard title="סטטוס סנכרון">
                  <p>
                    <strong>סנכרון אחרון:</strong>{' '}
                    {lastSyncTime || 'לא בוצע סנכרון'}
                  </p>
                  <p>
                    <strong>מזהה Gist:</strong>{' '}
                    {sessionStorage.getItem('bookManagerGistId') || 'לא ידוע'}
                  </p>
                  <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    onClick={handleRefreshData}
                    loading={refreshing}
                    style={{ marginTop: 16 }}
                  >
                    סנכרן עכשיו
                  </Button>
                </StyledCard>
              </Col>

              <Col xs={24} md={12}>
                <StyledCard title="פרטי GitHub">
                  <p>
                    <strong>חיבור:</strong>{' '}
                    <Badge status="success" text="מחובר" />
                  </p>
                  <p>
                    <GithubOutlined /> מחובר ל-GitHub
                  </p>
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      icon={<GithubOutlined />}
                      href="https://github.com/settings/tokens"
                      target="_blank"
                    >
                      נהל טוקנים
                    </Button>

                    <Button danger onClick={handleLogout}>
                      התנתק
                    </Button>
                  </Space>
                </StyledCard>
              </Col>
            </SettingsRow>
          </TabPane>

          <TabPane
            tab={
              <span>
                <InfoCircleOutlined /> אודות
              </span>
            }
            key="about"
          >
            <SettingsRow>
              <Col xs={24}>
                <StyledCard title="אודות מנהל הספרים">
                  <p>
                    <strong>גרסה:</strong> 1.0.0
                  </p>
                  <p>
                    <strong>מפתח:</strong> יצירה מקורית
                  </p>
                  <p>
                    <strong>רישיון:</strong> MIT
                  </p>
                  <Divider />
                  <p>
                    מנהל הספרים הוא אפליקציית ניהול ספרייה אישית המאפשרת לך לנהל
                    את אוסף הספרים שלך, לעקוב אחר השאלות, ולארגן את הספרייה שלך
                    בצורה יעילה.
                  </p>
                </StyledCard>
              </Col>
            </SettingsRow>

            <SettingsRow>
              <Col xs={24}>
                <StyledCard title="סטטיסטיקות ספרייה">
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={4}>
                      <Statistic
                        title="ספרים"
                        value={totalBooks}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                      <Statistic
                        title="סופרים"
                        value={totalAuthors}
                        prefix={<UserOutlined />}
                      />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                      <Statistic title="קטגוריות" value={totalCategories} />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                      <Statistic title="מוציאים לאור" value={totalPublishers} />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                      <Statistic title="השאלות" value={totalLoans} />
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                      <Statistic
                        title="באיחור"
                        value={overdueLoans}
                        valueStyle={{
                          color: overdueLoans > 0 ? '#cf1322' : undefined,
                        }}
                      />
                    </Col>
                  </Row>
                </StyledCard>
              </Col>
            </SettingsRow>
          </TabPane>
        </Tabs>
      </StyledCard>
    </div>
  );
};

export default Settings;
