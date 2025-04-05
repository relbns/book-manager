// src/pages/Loans.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Tooltip,
  Popconfirm,
  Badge,
  Alert,
  Tabs,
  Statistic,
  Row,
  Col,
  Empty,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ImportOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Style for RTL tables
const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: right;
  }

  .ant-table-cell {
    text-align: right;
  }

  .overdue-row {
    background-color: #fff1f0;
  }
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

const ActionsColumn = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Loans = () => {
  const { loans, books, addLoan, updateLoan, deleteLoan, createLoanModel } =
    useAppContext();

  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState([]);
  const [showingOverdue, setShowingOverdue] = useState(false);

  // Parse URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (tab) {
      setActiveTab(tab);
      handleTabChange(tab);
    }
  }, [location]);

  // Apply filtering based on search text and status filter
  useEffect(() => {
    let filtered = [...loans];

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((loan) => statusFilter.includes(loan.status));
    }

    // Apply search text
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter((loan) => {
        const book = books.find((b) => b.id === loan.bookId);
        const bookTitle = book ? book.title.toLowerCase() : '';

        return (
          bookTitle.includes(lowerSearchText) ||
          loan.borrowerName.toLowerCase().includes(lowerSearchText) ||
          (loan.borrowerContact &&
            loan.borrowerContact.toLowerCase().includes(lowerSearchText))
        );
      });
    }

    // Sort by loan date (newest first)
    filtered = filtered.sort(
      (a, b) => new Date(b.loanDate) - new Date(a.loanDate)
    );

    // Set filtered and potentially overdue loans
    setFilteredLoans(filtered);

    // Set showing overdue flag
    if (activeTab === 'overdue') {
      setShowingOverdue(true);
    } else {
      setShowingOverdue(false);
    }
  }, [loans, books, searchText, statusFilter, activeTab]);

  // Change tab
  const handleTabChange = (key) => {
    setActiveTab(key);

    // Update the URL to reflect the current tab
    if (key !== 'all') {
      navigate(`/loans?tab=${key}`, { replace: true });
    } else {
      navigate('/loans', { replace: true });
    }

    switch (key) {
      case 'active':
        setStatusFilter(['active']);
        break;
      case 'overdue':
        setStatusFilter(['active']);
        // Overdue filtering is handled in the table
        break;
      case 'returned':
        setStatusFilter(['returned']);
        break;
      default:
        setStatusFilter([]);
    }
  };

  // Get book title
  const getBookTitle = (bookId) => {
    const book = books.find((b) => b.id === bookId);
    return book ? book.title : 'לא ידוע';
  };

  // Check if loan is overdue
  const isLoanOverdue = (loan) => {
    return loan.status === 'active' && dayjs(loan.dueDate).isBefore(dayjs());
  };

  // Calculate days until return or days overdue
  const calculateDaysRemaining = (loan) => {
    if (loan.status !== 'active') return null;

    const dueDate = dayjs(loan.dueDate);
    const today = dayjs();
    return dueDate.diff(today, 'day');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Modal handlers
  const showModal = (loan = null) => {
    setEditingLoan(loan);

    if (loan) {
      form.setFieldsValue({
        ...loan,
        loanDate: dayjs(loan.loanDate),
        dueDate: dayjs(loan.dueDate),
        returnDate: loan.returnDate ? dayjs(loan.returnDate) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        loanDate: dayjs(),
        dueDate: dayjs().add(14, 'day'),
        status: 'active',
      });
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    // Format dates
    const formattedValues = {
      ...values,
      loanDate: values.loanDate.toISOString(),
      dueDate: values.dueDate.toISOString(),
      returnDate: values.returnDate ? values.returnDate.toISOString() : null,
      status: values.returnDate ? 'returned' : 'active',
    };

    try {
      if (editingLoan) {
        await updateLoan(editingLoan.id, formattedValues);
        message.success('ההשאלה עודכנה בהצלחה');
      } else {
        await addLoan(formattedValues);
        message.success('ההשאלה נוספה בהצלחה');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving loan:', error);
      message.error('אירעה שגיאה בשמירת ההשאלה');
    }
  };

  const handleDelete = async (loanId) => {
    try {
      await deleteLoan(loanId);
      message.success('ההשאלה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting loan:', error);
      message.error('אירעה שגיאה במחיקת ההשאלה');
    }
  };

  const handleReturnBook = async (loan) => {
    try {
      await updateLoan(loan.id, {
        ...loan,
        returnDate: new Date().toISOString(),
        status: 'returned',
      });
      message.success('הספר סומן כמוחזר בהצלחה');
    } catch (error) {
      console.error('Error returning book:', error);
      message.error('אירעה שגיאה בעת סימון הספר כמוחזר');
    }
  };

  // Calculate statistics
  const totalLoans = loans.length;
  const activeLoans = loans.filter((loan) => loan.status === 'active').length;
  const returnedLoans = loans.filter(
    (loan) => loan.status === 'returned'
  ).length;
  const overdueLoans = loans.filter((loan) => isLoanOverdue(loan)).length;

  // Table columns
  const columns = [
    {
      title: 'ספר',
      dataIndex: 'bookId',
      key: 'bookId',
      render: (bookId) => (
        <Link to={`/books/${bookId}`}>
          <Space>
            <BookOutlined />
            <Text strong>{getBookTitle(bookId)}</Text>
          </Space>
        </Link>
      ),
    },
    {
      title: 'שואל',
      dataIndex: 'borrowerName',
      key: 'borrowerName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.borrowerContact}
          </Text>
        </Space>
      ),
    },
    {
      title: 'תאריך השאלה',
      dataIndex: 'loanDate',
      key: 'loanDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'תאריך החזרה',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => (
        <Space direction="vertical" size={0}>
          <Text>{formatDate(date)}</Text>
          {record.status === 'active' && (
            <Text
              type={isLoanOverdue(record) ? 'danger' : 'secondary'}
              style={{ fontSize: '12px' }}
            >
              {(() => {
                const days = calculateDaysRemaining(record);
                if (days === null) return '';
                return days < 0
                  ? `באיחור של ${Math.abs(days)} ימים`
                  : `נותרו ${days} ימים`;
              })()}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'סטטוס',
      key: 'status',
      render: (_, record) => {
        if (record.status === 'returned') {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              הוחזר{' '}
              {record.returnDate ? `ב-${formatDate(record.returnDate)}` : ''}
            </Tag>
          );
        }

        if (isLoanOverdue(record)) {
          return (
            <Tag color="error" icon={<ClockCircleOutlined />}>
              באיחור
            </Tag>
          );
        }

        return (
          <Tag color="processing" icon={<CalendarOutlined />}>
            פעיל
          </Tag>
        );
      },
    },
    {
      title: 'פעולות',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <ActionsColumn>
          <Tooltip title="עריכה">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => showModal(record)}
            />
          </Tooltip>

          {record.status === 'active' && (
            <Tooltip title="החזרת ספר">
              <Popconfirm
                title="האם להחזיר את הספר?"
                onConfirm={() => handleReturnBook(record)}
                okText="כן"
                cancelText="לא"
                placement="topRight"
              >
                <Button icon={<ImportOutlined />} type="text" />
              </Popconfirm>
            </Tooltip>
          )}

          <Tooltip title="מחיקה">
            <Popconfirm
              title="בטוח שאתה רוצה למחוק את ההשאלה?"
              onConfirm={() => handleDelete(record.id)}
              okText="כן"
              cancelText="לא"
              placement="topRight"
            >
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
          </Tooltip>
        </ActionsColumn>
      ),
    },
  ];

  // Notification component for overdue books
  const OverdueNotification = () => {
    if (overdueLoans === 0) return null;

    return (
      <Alert
        message={`יש ${overdueLoans} ספרים באיחור החזרה`}
        description="ספרים שעבר התאריך להחזרתם מודגשים באדום."
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 16 }}
        action={
          activeTab !== 'overdue' ? (
            <Button size="small" onClick={() => handleTabChange('overdue')}>
              הצג רק ספרים באיחור
            </Button>
          ) : null
        }
      />
    );
  };

  return (
    <div>
      <StyledCard>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title level={2}>השאלות</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            הוספת השאלה
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="סה״כ השאלות"
                value={totalLoans}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="השאלות פעילות"
                value={activeLoans}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="ספרים שהוחזרו"
                value={returnedLoans}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="באיחור"
                value={overdueLoans}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Overdue notification */}
        <OverdueNotification />

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="כל ההשאלות" key="all" />
          <TabPane
            tab={
              <Badge count={activeLoans} showZero>
                <span>השאלות פעילות</span>
              </Badge>
            }
            key="active"
          />
          <TabPane
            tab={
              <Badge count={overdueLoans} showZero color="red">
                <span>באיחור</span>
              </Badge>
            }
            key="overdue"
          />
          <TabPane tab="הוחזרו" key="returned" />
        </Tabs>

        <FilterContainer>
          <Input
            placeholder="חיפוש לפי שם ספר או שם שואל"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </FilterContainer>

        {activeTab === 'overdue' && overdueLoans === 0 && (
          <Empty
            description="אין ספרים באיחור!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}

        {filteredLoans.length === 0 && activeTab !== 'overdue' && (
          <Empty description="לא נמצאו השאלות" />
        )}

        {(filteredLoans.length > 0 ||
          (activeTab === 'overdue' && overdueLoans > 0)) && (
          <StyledTable
            dataSource={
              activeTab === 'overdue'
                ? filteredLoans.filter((loan) => isLoanOverdue(loan))
                : filteredLoans
            }
            columns={columns}
            rowKey="id"
            rowClassName={(record) =>
              isLoanOverdue(record) ? 'overdue-row' : ''
            }
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `סה"כ ${total} השאלות`,
            }}
            locale={{
              emptyText: 'לא נמצאו השאלות',
            }}
          />
        )}
      </StyledCard>

      {/* Loan Form Modal */}
      <Modal
        title={editingLoan ? 'עריכת השאלה' : 'הוספת השאלה חדשה'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={createLoanModel()}
        >
          <Form.Item
            name="bookId"
            label="ספר"
            rules={[{ required: true, message: 'נא לבחור ספר' }]}
          >
            <Select
              showSearch
              placeholder="בחר ספר"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {books.map((book) => (
                <Option key={book.id} value={book.id}>
                  {book.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="borrowerName"
            label="שם השואל"
            rules={[{ required: true, message: 'נא להזין את שם השואל' }]}
          >
            <Input placeholder="הזן את שם השואל" />
          </Form.Item>

          <Form.Item
            name="borrowerContact"
            label="פרטי קשר"
            rules={[{ required: true, message: 'נא להזין פרטי קשר' }]}
          >
            <Input placeholder="טלפון / אימייל" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="loanDate"
              label="תאריך השאלה"
              rules={[{ required: true, message: 'נא לבחור תאריך השאלה' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="תאריך החזרה צפוי"
              rules={[{ required: true, message: 'נא לבחור תאריך החזרה צפוי' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="returnDate" label="תאריך החזרה בפועל">
            <DatePicker
              style={{ width: '100%' }}
              placeholder={
                editingLoan?.status === 'returned'
                  ? 'בחר תאריך'
                  : 'השאר ריק אם לא הוחזר'
              }
            />
          </Form.Item>

          <Form.Item name="notes" label="הערות">
            <TextArea placeholder="הערות נוספות" rows={3} />
          </Form.Item>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button onClick={handleCancel}>ביטול</Button>
            <Button type="primary" htmlType="submit">
              {editingLoan ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Loans;
