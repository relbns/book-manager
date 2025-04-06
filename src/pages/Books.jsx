import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Card,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Divider,
  message,
  List,
  Avatar,
  Tabs,
  Collapse,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  InfoCircleOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import BarcodeScanner from '../components/common/BarcodeScanner';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// Style for RTL tables
const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: right;
  }

  .ant-table-cell {
    text-align: right;
  }

  @media (max-width: 768px) {
    .ant-table-cell {
      padding: 8px 4px;
      white-space: nowrap;
    }
  }
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    .ant-card-body {
      padding: 12px;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;

    & > * {
      width: 100% !important;
    }
  }
`;

const ActionsColumn = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ISBNFieldContainer = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;

    & > button {
      margin-top: 8px;
    }
  }
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    h2 {
      margin-bottom: 0 !important;
    }
  }
`;

const ListItemMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItemActions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const FilterCollapse = styled(Collapse)`
  margin-bottom: 16px;

  .ant-collapse-content-box {
    padding-top: 16px !important;
  }
`;

const Books = () => {
  const {
    books,
    addBook,
    updateBook,
    deleteBook,
    authors,
    categories,
    publishers,
    createBookModel,
  } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    authors: [],
    publishers: [],
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('table');

  // Check for screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for edit parameter in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const editId = queryParams.get('edit');

    if (editId) {
      const bookToEdit = books.find((book) => book.id === editId);
      if (bookToEdit) {
        showModal(bookToEdit);
        // Remove the query parameter
        navigate('/books', { replace: true });
      }
    }
  }, [location, books, navigate]);

  // Apply filters and search
  useEffect(() => {
    let result = [...books];

    // Apply search
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerSearchText) ||
          getAuthorName(book.author).toLowerCase().includes(lowerSearchText) ||
          book.isbn?.toLowerCase().includes(lowerSearchText) ||
          getPublisherName(book.publisher)
            .toLowerCase()
            .includes(lowerSearchText)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((book) =>
        book.categories?.some((catId) => filters.categories.includes(catId))
      );
    }

    // Apply author filter
    if (filters.authors.length > 0) {
      result = result.filter((book) => filters.authors.includes(book.author));
    }

    // Apply publisher filter
    if (filters.publishers.length > 0) {
      result = result.filter((book) =>
        filters.publishers.includes(book.publisher)
      );
    }

    // Sort by title by default
    result = result.sort((a, b) => a.title.localeCompare(b.title));

    setFilteredBooks(result);
  }, [books, searchText, filters]);

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

  // Modal handlers
  const showModal = (book = null) => {
    setEditingBook(book);

    if (book) {
      form.setFieldsValue({
        ...book,
        publicationYear: book.publicationYear
          ? dayjs(book.publicationYear.toString())
          : null,
        acquisitionDate: book.acquisitionDate
          ? dayjs(book.acquisitionDate)
          : null,
      });
    } else {
      form.resetFields();
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
      publicationYear: values.publicationYear
        ? values.publicationYear.year()
        : null,
      acquisitionDate: values.acquisitionDate
        ? values.acquisitionDate.toISOString()
        : null,
    };

    try {
      if (editingBook) {
        await updateBook(editingBook.id, formattedValues);
        message.success('הספר עודכן בהצלחה');
      } else {
        await addBook(formattedValues);
        message.success('הספר נוסף בהצלחה');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving book:', error);
      message.error('אירעה שגיאה בשמירת הספר');
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await deleteBook(bookId);
      message.success('הספר נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting book:', error);
      message.error('אירעה שגיאה במחיקת הספר');
    }
  };

  // Handle barcode scan results
  const handleBarcodeScan = (scanData) => {
    console.log('Barcode scan result:', scanData);

    // Update the ISBN field
    form.setFieldValue('isbn', scanData.isbn);

    // If we have more data from online, fill in other fields
    if (scanData.title) {
      form.setFieldValue('title', scanData.title);
    }

    if (scanData.pageCount) {
      form.setFieldValue('pageCount', scanData.pageCount);
    }

    if (scanData.publishDate) {
      // Try to extract year from publish date
      const yearMatch = scanData.publishDate.match(/\d{4}/);
      if (yearMatch) {
        form.setFieldValue('publicationYear', dayjs(yearMatch[0]));
      }
    }

    // If we have author information, try to find or create the author
    if (scanData.authors) {
      // This is a simplified approach - in a real app, you might want to
      // show a dialog asking the user to select an existing author or create a new one
      const existingAuthor = authors.find(
        (author) => author.name.toLowerCase() === scanData.authors.toLowerCase()
      );

      if (existingAuthor) {
        form.setFieldValue('author', existingAuthor.id);
      } else {
        // Here you could show a dialog to create a new author
        message.info(
          `מחבר "${scanData.authors}" לא נמצא במערכת. ניתן להוסיף אותו דרך מסך הסופרים.`
        );
      }
    }

    // Same for publisher
    if (scanData.publisher) {
      const existingPublisher = publishers.find(
        (publisher) =>
          publisher.name.toLowerCase() === scanData.publisher.toLowerCase()
      );

      if (existingPublisher) {
        form.setFieldValue('publisher', existingPublisher.id);
      } else {
        message.info(
          `הוצאה לאור "${scanData.publisher}" לא נמצאה במערכת. ניתן להוסיף אותה דרך מסך ההוצאות לאור.`
        );
      }
    }

    // Display success message
    message.success('מידע מברקוד נוסף לטופס');
  };

  // Table columns
  const columns = [
    {
      title: 'שם הספר',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/books/${record.id}`}>
          <Text strong>{text}</Text>
        </Link>
      ),
    },
    {
      title: 'מחבר',
      dataIndex: 'author',
      key: 'author',
      render: (authorId) => getAuthorName(authorId),
      responsive: ['md'],
    },
    {
      title: 'הוצאה לאור',
      dataIndex: 'publisher',
      key: 'publisher',
      render: (publisherId) => getPublisherName(publisherId),
      responsive: ['lg'],
    },
    {
      title: 'קטגוריות',
      dataIndex: 'categories',
      key: 'categories',
      render: (categoryIds) => {
        const cats = getCategoryNames(categoryIds);
        return (
          <Space size={[0, 4]} wrap>
            {cats.length > 0 ? (
              cats.map((cat, index) => (
                <Tag color={cat.color} key={index}>
                  {cat.name}
                </Tag>
              ))
            ) : (
              <Text type="secondary">-</Text>
            )}
          </Space>
        );
      },
      responsive: ['xl'],
    },
    {
      title: 'שנת הוצאה',
      dataIndex: 'publicationYear',
      key: 'publicationYear',
      render: (year) => year || '-',
      responsive: ['md'],
    },
    {
      title: 'פעולות',
      key: 'actions',
      width: isMobile ? 80 : 120,
      render: (_, record) => (
        <ActionsColumn>
          <Tooltip title="עריכה">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => showModal(record)}
              size={isMobile ? 'small' : 'middle'}
            />
          </Tooltip>
          <Tooltip title="מחיקה">
            <Popconfirm
              title="בטוח שאתה רוצה למחוק את הספר?"
              onConfirm={() => handleDelete(record.id)}
              okText="כן"
              cancelText="לא"
              placement="topRight"
            >
              <Button
                icon={<DeleteOutlined />}
                type="text"
                danger
                size={isMobile ? 'small' : 'middle'}
              />
            </Popconfirm>
          </Tooltip>
        </ActionsColumn>
      ),
    },
  ];

  // Mobile list rendering for books
  const renderMobileList = () => {
    return (
      <List
        itemLayout="vertical"
        dataSource={filteredBooks}
        renderItem={(book) => (
          <List.Item
            key={book.id}
            actions={[
              <Button
                key="view"
                type="link"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                פרטים
              </Button>,
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={() => showModal(book)}
              >
                עריכה
              </Button>,
              <Popconfirm
                key="delete"
                title="בטוח שאתה רוצה למחוק את הספר?"
                onConfirm={() => handleDelete(book.id)}
                okText="כן"
                cancelText="לא"
                placement="topRight"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  מחיקה
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<BookOutlined />} />}
              title={
                <Link to={`/books/${book.id}`}>
                  <Text strong>{book.title}</Text>
                </Link>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text>מחבר: {getAuthorName(book.author)}</Text>
                  {book.publisher && (
                    <Text>הוצאה: {getPublisherName(book.publisher)}</Text>
                  )}
                  {book.publicationYear && (
                    <Text>שנה: {book.publicationYear}</Text>
                  )}
                  {book.categories && book.categories.length > 0 && (
                    <Space size={[0, 4]} wrap>
                      {getCategoryNames(book.categories).map((cat, index) => (
                        <Tag color={cat.color} key={index}>
                          {cat.name}
                        </Tag>
                      ))}
                    </Space>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div>
      <StyledCard>
        <TitleContainer>
          <Title level={2}>ספרים</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size={isMobile ? 'middle' : 'large'}
            block={isMobile}
          >
            הוספת ספר
          </Button>
        </TitleContainer>
        <FilterCollapse
          items={[
            {
              key: '1',
              header: (
                <Space>
                  <FilterOutlined />
                  <span>סינון ספרים</span>
                </Space>
              ),
              children: (
                <FilterContainer>
                  <Input
                    placeholder="חיפוש לפי שם, מחבר או מק״ט"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: isMobile ? '100%' : 300 }}
                    allowClear
                  />
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="סינון לפי קטגוריה"
                    value={filters.categories}
                    onChange={(values) =>
                      setFilters({ ...filters, categories: values })
                    }
                    options={categories.map((category) => ({
                      key: category.id,
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="סינון לפי מחבר"
                    value={filters.authors}
                    onChange={(values) =>
                      setFilters({ ...filters, authors: values })
                    }
                    options={authors.map((author) => ({
                      key: author.id,
                      value: author.id,
                      label: author.name,
                    }))}
                  />
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="סינון לפי הוצאה לאור"
                    value={filters.publishers}
                    onChange={(values) =>
                      setFilters({ ...filters, publishers: values })
                    }
                    options={publishers.map((publisher) => ({
                      key: publisher.id,
                      value: publisher.id,
                      label: publisher.name,
                    }))}
                  />
                </FilterContainer>
              ),
            },
          ]}
        />
        {isMobile && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            size="small"
            style={{ marginBottom: 16 }}
            items={[
              {
                key: 'list',
                label: (
                  <Space>
                    <MenuOutlined />
                    <span>רשימה</span>
                  </Space>
                ),
              },
              {
                key: 'table',
                label: (
                  <Space>
                    <InfoCircleOutlined />
                    <span>טבלה</span>
                  </Space>
                ),
              },
            ]}
          />
        )}
        {filteredBooks.length === 0 ? (
          <Empty description="לא נמצאו ספרים" />
        ) : isMobile && activeTab === 'list' ? (
          renderMobileList()
        ) : (
          <StyledTable
            dataSource={filteredBooks}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: isMobile ? 5 : 10,
              showSizeChanger: !isMobile,
              size: isMobile ? 'small' : 'default',
              showTotal: (total) => `סה"כ ${total} ספרים`,
            }}
            size={isMobile ? 'small' : 'middle'}
            scroll={isMobile ? { x: true } : undefined}
            locale={{
              emptyText: 'לא נמצאו ספרים',
            }}
          />
        )}
      </StyledCard>

      {/* Book Form Modal */}
      <Modal
        title={editingBook ? 'עריכת ספר' : 'הוספת ספר חדש'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={isMobile ? '95%' : 700}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={createBookModel()}
          size={isMobile ? 'middle' : 'large'}
        >
          <Form.Item
            name="title"
            label="שם הספר"
            rules={[{ required: true, message: 'נא להזין את שם הספר' }]}
          >
            <Input placeholder="הזן את שם הספר" />
          </Form.Item>

          <Form.Item
            name="author"
            label="מחבר"
            rules={[{ required: true, message: 'נא לבחור מחבר' }]}
          >
            <Select
              placeholder="בחר מחבר"
              showSearch
              optionFilterProp="children"
              allowClear
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button
                    type="link"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/authors')}
                  >
                    הוסף מחבר חדש
                  </Button>
                </>
              )}
            >
              {authors.map((author) => (
                <Option key={author.id} value={author.id}>
                  {author.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="publisher" label="הוצאה לאור">
            <Select
              placeholder="בחר הוצאה לאור"
              showSearch
              optionFilterProp="children"
              allowClear
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button
                    type="link"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/publishers')}
                  >
                    הוסף הוצאה לאור חדשה
                  </Button>
                </>
              )}
            >
              {publishers.map((publisher) => (
                <Option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="categories" label="קטגוריות">
            <Select
              mode="multiple"
              placeholder="בחר קטגוריות"
              showSearch
              optionFilterProp="children"
              allowClear
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button
                    type="link"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/categories')}
                  >
                    הוסף קטגוריה חדשה
                  </Button>
                </>
              )}
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isbn" label="מסתב (ISBN)">
            <ISBNFieldContainer>
              <Input placeholder="הזן מסתב" style={{ flex: 1 }} />
              <BarcodeScanner
                onScan={handleBarcodeScan}
                buttonText="סרוק"
                block={isMobile}
              />
            </ISBNFieldContainer>
          </Form.Item>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Form.Item
              name="publicationYear"
              label="שנת הוצאה"
              style={{ flex: 1 }}
            >
              <DatePicker picker="year" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="language" label="שפה" style={{ flex: 1 }}>
              <Select placeholder="בחר שפה" defaultValue="Hebrew">
                <Option value="Hebrew">עברית</Option>
                <Option value="English">אנגלית</Option>
                <Option value="Arabic">ערבית</Option>
                <Option value="Russian">רוסית</Option>
                <Option value="French">צרפתית</Option>
                <Option value="German">גרמנית</Option>
                <Option value="Spanish">ספרדית</Option>
                <Option value="Other">אחר</Option>
              </Select>
            </Form.Item>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Form.Item name="pageCount" label="מספר עמודים" style={{ flex: 1 }}>
              <InputNumber
                placeholder="הזן מספר עמודים"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item name="rating" label="דירוג" style={{ flex: 1 }}>
              <InputNumber
                placeholder="דירוג 1-5"
                min={1}
                max={5}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label="תיאור הספר">
            <TextArea placeholder="הזן תיאור" rows={4} />
          </Form.Item>

          <Form.Item name="location" label="מיקום הספר">
            <Input placeholder="מיקום הספר בספרייה (מדף, ארון, חדר וכו')" />
          </Form.Item>

          <Form.Item name="acquisitionDate" label="תאריך רכישה">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="acquisitionMethod" label="שיטת רכישה">
            <Select placeholder="בחר שיטת רכישה">
              <Option value="purchase">קנייה</Option>
              <Option value="gift">מתנה</Option>
              <Option value="donation">תרומה</Option>
              <Option value="other">אחר</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="הערות">
            <TextArea placeholder="הערות נוספות" rows={3} />
          </Form.Item>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Button onClick={handleCancel} block={isMobile}>
              ביטול
            </Button>
            <Button type="primary" htmlType="submit" block={isMobile}>
              {editingBook ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
