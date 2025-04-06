// src/pages/Authors.jsx
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
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';
import ResponsiveFilterContainer from '../components/common/ResponsiveFilterContainer';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

const Authors = () => {
  const {
    authors,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    books,
    createAuthorModel,
  } = useAppContext();

  // State
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [nationalities, setNationalities] = useState([]);

  // Filter authors based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredAuthors(authors);
      return;
    }

    const lowerSearchText = searchText.toLowerCase();
    const filtered = authors.filter(
      (author) =>
        author.name.toLowerCase().includes(lowerSearchText) ||
        (author.nationality &&
          author.nationality.toLowerCase().includes(lowerSearchText))
    );

    setFilteredAuthors(filtered);
  }, [authors, searchText]);

  // Extract unique nationalities for filtering
  useEffect(() => {
    const uniqueNationalities = [
      ...new Set(authors.map((author) => author.nationality).filter(Boolean)),
    ];
    setNationalities(uniqueNationalities);
  }, [authors]);

  // Get book count for an author
  const getAuthorBookCount = (authorId) => {
    return books.filter((book) => book.author === authorId).length;
  };

  // Modal handlers
  const showModal = (author = null) => {
    setEditingAuthor(author);

    if (author) {
      form.setFieldsValue({
        ...author,
        birthYear: author.birthYear ? dayjs(author.birthYear.toString()) : null,
        deathYear: author.deathYear ? dayjs(author.deathYear.toString()) : null,
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
      birthYear: values.birthYear ? values.birthYear.year() : null,
      deathYear: values.deathYear ? values.deathYear.year() : null,
    };

    if (editingAuthor) {
      await updateAuthor(editingAuthor.id, formattedValues);
    } else {
      await addAuthor(formattedValues);
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (authorId) => {
    // Check if author has books
    const authorBooks = books.filter((book) => book.author === authorId).length;

    if (authorBooks > 0) {
      Modal.confirm({
        title: 'לא ניתן למחוק מחבר זה',
        content: `מחבר זה משויך ל-${authorBooks} ספרים. אנא הסר או שנה את השיוך בספרים אלו לפני מחיקת המחבר.`,
        okText: 'הבנתי',
        cancelText: null,
        cancelButtonProps: { style: { display: 'none' } },
      });
      return;
    }

    await deleteAuthor(authorId);
  };

  // Table columns
  const columns = [
    {
      title: 'שם המחבר',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'אזרחות',
      dataIndex: 'nationality',
      key: 'nationality',
      render: (nationality) => nationality || '-',
    },
    {
      title: 'שנים',
      key: 'years',
      render: (_, record) => {
        const birthYear = record.birthYear || '?';
        const deathYear = record.deathYear || (record.birthYear ? 'חי' : '?');
        return `${birthYear} - ${deathYear}`;
      },
    },
    {
      title: 'ספרים',
      key: 'bookCount',
      render: (_, record) => {
        const count = getAuthorBookCount(record.id);
        return count > 0 ? (
          <Tag color="blue">{count}</Tag>
        ) : (
          <Tag color="default">0</Tag>
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
          <Tooltip title="מחיקה">
            <Popconfirm
              title="בטוח שאתה רוצה למחוק את המחבר?"
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
          <Title level={2}>סופרים</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            הוספת סופר
          </Button>
        </div>

        <ResponsiveFilterContainer>
          <Input
            placeholder="חיפוש לפי שם או אזרחות"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />

          {nationalities.length > 0 && (
            <Select
              allowClear
              style={{ minWidth: 200 }}
              placeholder="סינון לפי אזרחות"
              onChange={(value) => setSearchText(value || '')}
            >
              {nationalities.map((nationality) => (
                <Option key={nationality} value={nationality}>
                  {nationality}
                </Option>
              ))}
            </Select>
          )}
        </ResponsiveFilterContainer>

        <StyledTable
          dataSource={filteredAuthors}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `סה"כ ${total} סופרים`,
          }}
          locale={{
            emptyText: 'לא נמצאו סופרים',
          }}
        />
      </StyledCard>

      {/* Author Form Modal */}
      <Modal
        title={editingAuthor ? 'עריכת סופר' : 'הוספת סופר חדש'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={createAuthorModel()}
        >
          <Form.Item
            name="name"
            label="שם הסופר"
            rules={[{ required: true, message: 'נא להזין את שם הסופר' }]}
          >
            <Input placeholder="הזן את שם הסופר" />
          </Form.Item>

          <Form.Item name="nationality" label="אזרחות">
            <Input placeholder="הזן את האזרחות של הסופר" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="birthYear" label="שנת לידה" style={{ flex: 1 }}>
              <DatePicker picker="year" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="deathYear" label="שנת פטירה" style={{ flex: 1 }}>
              <DatePicker picker="year" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="biography" label="ביוגרפיה">
            <TextArea placeholder="הזן ביוגרפיה" rows={4} />
          </Form.Item>

          <Form.Item name="notes" label="הערות">
            <TextArea placeholder="הערות נוספות" rows={3} />
          </Form.Item>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button onClick={handleCancel}>ביטול</Button>
            <Button type="primary" htmlType="submit">
              {editingAuthor ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Authors;
