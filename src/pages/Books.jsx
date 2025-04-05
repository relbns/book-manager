// src/pages/Books.jsx
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
  Drawer,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Style for RTL tables
const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: right;
  }

  .ant-table-cell {
    text-align: right;
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

    if (editingBook) {
      await updateBook(editingBook.id, formattedValues);
    } else {
      await addBook(formattedValues);
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (bookId) => {
    await deleteBook(bookId);
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
    },
    {
      title: 'הוצאה לאור',
      dataIndex: 'publisher',
      key: 'publisher',
      render: (publisherId) => getPublisherName(publisherId),
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
    },
    {
      title: 'שנת הוצאה',
      dataIndex: 'publicationYear',
      key: 'publicationYear',
      render: (year) => year || '-',
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
          <Tooltip title="מחיקה">
            <Popconfirm
              title="בטוח שאתה רוצה למחוק את הספר?"
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
          <Title level={2}>ספרים</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            הוספת ספר
          </Button>
        </div>

        <FilterContainer>
          <Input
            placeholder="חיפוש לפי שם, מחבר או מק״ט"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 200 }}
            placeholder="סינון לפי קטגוריה"
            value={filters.categories}
            onChange={(values) =>
              setFilters({ ...filters, categories: values })
            }
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 200 }}
            placeholder="סינון לפי מחבר"
            value={filters.authors}
            onChange={(values) => setFilters({ ...filters, authors: values })}
          >
            {authors.map((author) => (
              <Option key={author.id} value={author.id}>
                {author.name}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 200 }}
            placeholder="סינון לפי הוצאה לאור"
            value={filters.publishers}
            onChange={(values) =>
              setFilters({ ...filters, publishers: values })
            }
          >
            {publishers.map((publisher) => (
              <Option key={publisher.id} value={publisher.id}>
                {publisher.name}
              </Option>
            ))}
          </Select>
        </FilterContainer>

        <StyledTable
          dataSource={filteredBooks}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `סה"כ ${total} ספרים`,
          }}
          locale={{
            emptyText: 'לא נמצאו ספרים',
          }}
        />
      </StyledCard>

      {/* Book Form Modal */}
      <Modal
        title={editingBook ? 'עריכת ספר' : 'הוספת ספר חדש'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={createBookModel()}
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
                  <Button
                    type="link"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => (window.location.href = '/authors')}
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
                  <Button
                    type="link"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => (window.location.href = '/publishers')}
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
                  <Button
                    type="link"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => (window.location.href = '/categories')}
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
            <Input placeholder="הזן מסתב" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
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

          <div style={{ display: 'flex', gap: 16 }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button onClick={handleCancel}>ביטול</Button>
            <Button type="primary" htmlType="submit">
              {editingBook ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
