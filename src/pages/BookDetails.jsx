// src/pages/BookDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Descriptions,
  Button,
  Space,
  Divider,
  Tag,
  Rate,
  Alert,
  Tabs,
  List,
  Avatar,
  Badge,
  Modal,
  Form,
  Input,
  DatePicker,
  Popconfirm,
  Empty,
  Breadcrumb,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  UserOutlined,
  HomeOutlined,
  HistoryOutlined,
  ReadOutlined,
  ExportOutlined,
  ImportOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const PlaceholderCover = styled.div`
  background-color: #f0f2f5;
  border: 1px dashed #d9d9d9;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    books,
    updateBook,
    deleteBook,
    authors,
    publishers,
    categories,
    loans,
    addLoan,
    updateLoan,
    createLoanModel,
  } = useAppContext();

  // State
  const [book, setBook] = useState(null);
  const [isLoanModalVisible, setIsLoanModalVisible] = useState(false);
  const [loanForm] = Form.useForm();
  const [bookLoans, setBookLoans] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load book data
  useEffect(() => {
    const foundBook = books.find((b) => b.id === id);

    if (foundBook) {
      setBook(foundBook);

      // Get book loans
      const relatedLoans = loans.filter((loan) => loan.bookId === id);
      setBookLoans(relatedLoans);

      // Get active loans
      const active = relatedLoans.filter((loan) => loan.status === 'active');
      setActiveLoans(active);
    }

    setIsLoading(false);
  }, [id, books, loans]);

  // Helper functions
  const getAuthorName = (authorId) => {
    const author = authors.find((a) => a.id === authorId);
    return author ? author.name : 'לא ידוע';
  };

  const getPublisherName = (publisherId) => {
    const publisher = publishers.find((p) => p.id === publisherId);
    return publisher ? publisher.name : 'לא ידוע';
  };

  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || !categoryIds.length) return [];

    return categoryIds
      .map((id) => {
        const category = categories.find((c) => c.id === id);
        return category
          ? {
              name: category.name,
              color: category.color,
            }
          : null;
      })
      .filter(Boolean);
  };

  const handleEdit = () => {
    navigate(`/books?edit=${id}`);
  };

  const handleDelete = async () => {
    if (activeLoans.length > 0) {
      Modal.error({
        title: 'לא ניתן למחוק ספר',
        content:
          'לא ניתן למחוק ספר שיש לו השאלות פעילות. אנא החזר את כל ההשאלות ונסה שוב.',
      });
      return;
    }

    await deleteBook(id);
    navigate('/books');
  };

  // Loan handlers
  const showLoanModal = () => {
    loanForm.resetFields();
    loanForm.setFieldsValue({
      bookId: id,
      loanDate: dayjs(),
      dueDate: dayjs().add(14, 'day'),
    });
    setIsLoanModalVisible(true);
  };

  const handleLoanCancel = () => {
    setIsLoanModalVisible(false);
    loanForm.resetFields();
  };

  const handleLoanSubmit = async (values) => {
    // Format dates
    const formattedValues = {
      ...values,
      loanDate: values.loanDate.toISOString(),
      dueDate: values.dueDate.toISOString(),
      returnDate: null,
      status: 'active',
    };

    await addLoan(formattedValues);
    setIsLoanModalVisible(false);
    loanForm.resetFields();
  };

  const handleReturnBook = async (loanId) => {
    await updateLoan(loanId, {
      returnDate: new Date().toISOString(),
      status: 'returned',
    });
  };

  // If book not found
  if (!isLoading && !book) {
    return (
      <Card>
        <Alert
          message="ספר לא נמצא"
          description="הספר המבוקש לא נמצא במערכת"
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/books')}>
              חזרה לרשימת הספרים
            </Button>
          }
        />
      </Card>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  return (
    <div>
      {book && (
        <>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item>
              <Link to="/">
                <HomeOutlined /> דף הבית
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/books">
                <BookOutlined /> ספרים
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
          </Breadcrumb>

          <StyledCard>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24,
              }}
            >
              <Title level={2}>{book.title}</Title>
              <Space>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  onClick={showLoanModal}
                  disabled={activeLoans.length > 0}
                >
                  השאל ספר
                </Button>
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  עריכה
                </Button>
                <Popconfirm
                  title="האם אתה בטוח שברצונך למחוק ספר זה?"
                  onConfirm={handleDelete}
                  okText="כן"
                  cancelText="לא"
                >
                  <Button icon={<DeleteOutlined />} danger>
                    מחיקה
                  </Button>
                </Popconfirm>
              </Space>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '0 0 250px' }}>
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    style={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <PlaceholderCover>
                    <BookOutlined style={{ fontSize: 64, opacity: 0.5 }} />
                  </PlaceholderCover>
                )}

                <div>
                  {book.rating && (
                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                      <Rate disabled defaultValue={book.rating} />
                    </div>
                  )}

                  {activeLoans.length > 0 ? (
                    <Alert
                      message="הספר מושאל"
                      description={`הספר מושאל ל${activeLoans[0].borrowerName}`}
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Alert
                      message="הספר זמין"
                      description="הספר אינו מושאל כרגע"
                      type="success"
                      showIcon
                    />
                  )}
                </div>
              </div>

              <div style={{ flex: '1 1 400px' }}>
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="מחבר">
                    <Link to={`/authors?filter=${book.author}`}>
                      <UserOutlined /> {getAuthorName(book.author)}
                    </Link>
                  </Descriptions.Item>

                  {book.publisher && (
                    <Descriptions.Item label="הוצאה לאור">
                      <Link to={`/publishers?filter=${book.publisher}`}>
                        {getPublisherName(book.publisher)}
                      </Link>
                    </Descriptions.Item>
                  )}

                  {book.isbn && (
                    <Descriptions.Item label="מסת״ב">
                      {book.isbn}
                    </Descriptions.Item>
                  )}

                  {book.publicationYear && (
                    <Descriptions.Item label="שנת הוצאה">
                      {book.publicationYear}
                    </Descriptions.Item>
                  )}

                  {book.language && (
                    <Descriptions.Item label="שפה">
                      {book.language}
                    </Descriptions.Item>
                  )}

                  {book.pageCount && (
                    <Descriptions.Item label="מספר עמודים">
                      {book.pageCount}
                    </Descriptions.Item>
                  )}

                  {book.location && (
                    <Descriptions.Item label="מיקום בספרייה">
                      {book.location}
                    </Descriptions.Item>
                  )}

                  {book.acquisitionDate && (
                    <Descriptions.Item label="תאריך רכישה">
                      {formatDate(book.acquisitionDate)}
                    </Descriptions.Item>
                  )}

                  {book.acquisitionMethod && (
                    <Descriptions.Item label="שיטת רכישה">
                      {book.acquisitionMethod}
                    </Descriptions.Item>
                  )}

                  {book.categories && book.categories.length > 0 && (
                    <Descriptions.Item label="קטגוריות">
                      <Space wrap>
                        {getCategoryNames(book.categories).map((cat, index) => (
                          <Tag color={cat.color} key={index}>
                            {cat.name}
                          </Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {book.description && (
                  <div style={{ marginTop: 24 }}>
                    <Title level={4}>תקציר</Title>
                    <Paragraph>{book.description}</Paragraph>
                  </div>
                )}
              </div>
            </div>
          </StyledCard>

          <StyledCard>
            <Tabs defaultActiveKey="loans">
              <TabPane
                tab={
                  <span>
                    <HistoryOutlined /> היסטוריית השאלות
                  </span>
                }
                key="loans"
              >
                {bookLoans.length > 0 ? (
                  <List
                    dataSource={bookLoans.sort(
                      (a, b) => new Date(b.loanDate) - new Date(a.loanDate)
                    )}
                    renderItem={(loan) => (
                      <List.Item
                        actions={[
                          loan.status === 'active' && (
                            <Popconfirm
                              title="האם להחזיר את הספר?"
                              onConfirm={() => handleReturnBook(loan.id)}
                              okText="כן"
                              cancelText="לא"
                              key="return-action"
                            >
                              <Button type="primary" size="small">
                                <ImportOutlined /> החזר ספר
                              </Button>
                            </Popconfirm>
                          ),
                        ].filter(Boolean)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge
                              status={
                                loan.status === 'active'
                                  ? dayjs(loan.dueDate).isBefore(dayjs())
                                    ? 'error'
                                    : 'processing'
                                  : 'default'
                              }
                            >
                              <Avatar icon={<UserOutlined />} />
                            </Badge>
                          }
                          title={loan.borrowerName}
                          description={
                            <>
                              <Text>
                                <CalendarOutlined /> הושאל ב:{' '}
                                {formatDate(loan.loanDate)}
                              </Text>
                              <br />
                              <Text>
                                <CalendarOutlined /> תאריך יעד להחזרה:{' '}
                                {formatDate(loan.dueDate)}
                              </Text>
                              {loan.returnDate && (
                                <>
                                  <br />
                                  <Text>
                                    <CalendarOutlined /> הוחזר ב:{' '}
                                    {formatDate(loan.returnDate)}
                                  </Text>
                                </>
                              )}
                            </>
                          }
                        />
                        <div>
                          <Tag
                            color={loan.status === 'active' ? 'blue' : 'green'}
                          >
                            {loan.status === 'active' ? 'פעיל' : 'הוחזר'}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="אין היסטוריית השאלות לספר זה" />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ReadOutlined /> הערות
                  </span>
                }
                key="notes"
              >
                {book.notes ? (
                  <Paragraph>{book.notes}</Paragraph>
                ) : (
                  <Empty description="אין הערות לספר זה" />
                )}
              </TabPane>
            </Tabs>
          </StyledCard>

          {/* Loan Form Modal */}
          <Modal
            title="השאלת ספר"
            open={isLoanModalVisible}
            onCancel={handleLoanCancel}
            footer={null}
            destroyOnClose
          >
            <Form
              form={loanForm}
              layout="vertical"
              onFinish={handleLoanSubmit}
              initialValues={createLoanModel()}
            >
              <Form.Item name="bookId" hidden>
                <Input />
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

              <Form.Item
                name="loanDate"
                label="תאריך השאלה"
                rules={[{ required: true, message: 'נא לבחור תאריך השאלה' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="תאריך החזרה"
                rules={[{ required: true, message: 'נא לבחור תאריך החזרה' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="notes" label="הערות">
                <TextArea placeholder="הערות נוספות" rows={3} />
              </Form.Item>

              {/* Footer */}
              <div
                style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}
              >
                <Button onClick={handleLoanCancel}>ביטול</Button>
                <Button type="primary" htmlType="submit">
                  השאל
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default BookDetails;
