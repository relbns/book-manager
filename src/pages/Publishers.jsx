// src/pages/Publishers.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Card,
  Space,
  Modal,
  Form,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import ResponsiveFilterContainer from '../components/common/ResponsiveFilterContainer';

const { Title, Text, Link } = Typography;
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

const Publishers = () => {
  const {
    publishers,
    addPublisher,
    updatePublisher,
    deletePublisher,
    books,
    createPublisherModel,
  } = useAppContext();

  // State
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [filteredPublishers, setFilteredPublishers] = useState([]);
  const [locations, setLocations] = useState([]);

  // Filter publishers based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPublishers(publishers);
      return;
    }

    const lowerSearchText = searchText.toLowerCase();
    const filtered = publishers.filter(
      (publisher) =>
        publisher.name.toLowerCase().includes(lowerSearchText) ||
        (publisher.location &&
          publisher.location.toLowerCase().includes(lowerSearchText))
    );

    setFilteredPublishers(filtered);
  }, [publishers, searchText]);

  // Extract unique locations for filtering
  useEffect(() => {
    const uniqueLocations = [
      ...new Set(publishers.map((pub) => pub.location).filter(Boolean)),
    ];
    setLocations(uniqueLocations);
  }, [publishers]);

  // Get book count for a publisher
  const getPublisherBookCount = (publisherId) => {
    return books.filter((book) => book.publisher === publisherId).length;
  };

  // Modal handlers
  const showModal = (publisher = null) => {
    setEditingPublisher(publisher);

    if (publisher) {
      form.setFieldsValue({
        ...publisher,
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
    if (editingPublisher) {
      await updatePublisher(editingPublisher.id, values);
    } else {
      await addPublisher(values);
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (publisherId) => {
    // Check if publisher has books
    const publisherBooks = books.filter(
      (book) => book.publisher === publisherId
    ).length;

    if (publisherBooks > 0) {
      Modal.confirm({
        title: 'לא ניתן למחוק הוצאה לאור זו',
        content: `הוצאה לאור זו משויכת ל-${publisherBooks} ספרים. אנא הסר או שנה את השיוך בספרים אלו לפני מחיקת ההוצאה לאור.`,
        okText: 'הבנתי',
        cancelText: null,
        cancelButtonProps: { style: { display: 'none' } },
      });
      return;
    }

    await deletePublisher(publisherId);
  };

  // Validate URL
  const validateUrl = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }

    try {
      new URL(value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('נא להזין כתובת אתר תקינה'));
    }
  };

  // Table columns
  const columns = [
    {
      title: 'שם ההוצאה',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'מיקום',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || '-',
    },
    {
      title: 'אתר',
      dataIndex: 'website',
      key: 'website',
      render: (website) => {
        if (!website) return '-';
        return (
          <Link href={website} target="_blank" rel="noopener noreferrer">
            <GlobalOutlined /> אתר ההוצאה
          </Link>
        );
      },
    },
    {
      title: 'ספרים',
      key: 'bookCount',
      render: (_, record) => {
        const count = getPublisherBookCount(record.id);
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
              title="בטוח שאתה רוצה למחוק את ההוצאה לאור?"
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
          <Title level={2}>הוצאות לאור</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            הוספת הוצאה לאור
          </Button>
        </div>

        <ResponsiveFilterContainer>
          <Input
            placeholder="חיפוש לפי שם או מיקום"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />

          {locations.length > 0 && (
            <Select
              allowClear
              style={{ minWidth: 200 }}
              placeholder="סינון לפי מיקום"
              onChange={(value) => setSearchText(value || '')}
            >
              {locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          )}
        </ResponsiveFilterContainer>

        <StyledTable
          dataSource={filteredPublishers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `סה"כ ${total} הוצאות לאור`,
          }}
          locale={{
            emptyText: 'לא נמצאו הוצאות לאור',
          }}
        />
      </StyledCard>

      {/* Publisher Form Modal */}
      <Modal
        title={editingPublisher ? 'עריכת הוצאה לאור' : 'הוספת הוצאה לאור חדשה'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={createPublisherModel()}
        >
          <Form.Item
            name="name"
            label="שם ההוצאה לאור"
            rules={[{ required: true, message: 'נא להזין את שם ההוצאה לאור' }]}
          >
            <Input placeholder="הזן את שם ההוצאה לאור" />
          </Form.Item>

          <Form.Item name="location" label="מיקום">
            <Input placeholder="הזן את מיקום ההוצאה לאור" />
          </Form.Item>

          <Form.Item
            name="website"
            label="אתר אינטרנט"
            rules={[{ validator: validateUrl }]}
          >
            <Input placeholder="הזן את כתובת האתר" />
          </Form.Item>

          <Form.Item name="notes" label="הערות">
            <TextArea placeholder="הערות נוספות" rows={3} />
          </Form.Item>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button onClick={handleCancel}>ביטול</Button>
            <Button type="primary" htmlType="submit">
              {editingPublisher ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Publishers;
