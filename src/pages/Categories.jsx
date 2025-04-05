// src/pages/Categories.jsx
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
  ColorPicker,
  TreeSelect,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';

const { Title, Text } = Typography;
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

const ColorTag = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-left: 8px;
  background-color: ${(props) => props.color};
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const Categories = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    books,
    createCategoryModel,
  } = useAppContext();

  // State
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Filter categories based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const lowerSearchText = searchText.toLowerCase();
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerSearchText) ||
        (category.description &&
          category.description.toLowerCase().includes(lowerSearchText))
    );

    setFilteredCategories(filtered);
  }, [categories, searchText]);

  // Get book count for a category
  const getCategoryBookCount = (categoryId) => {
    return books.filter(
      (book) => book.categories && book.categories.includes(categoryId)
    ).length;
  };

  // Get parent category name
  const getParentCategoryName = (parentId) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : null;
  };

  // Convert categories to TreeSelect data
  const getCategoryTreeData = () => {
    // Root categories (no parent)
    const rootCategories = categories.filter((c) => !c.parent);

    // Function to create tree nodes
    const createTreeNode = (category) => {
      const node = {
        title: category.name,
        value: category.id,
        key: category.id,
      };

      // Add children if this category is a parent to others
      const children = categories.filter((c) => c.parent === category.id);
      if (children.length > 0) {
        node.children = children.map(createTreeNode);
      }

      return node;
    };

    return rootCategories.map(createTreeNode);
  };

  // Modal handlers
  const showModal = (category = null) => {
    setEditingCategory(category);

    if (category) {
      form.setFieldsValue({
        ...category,
        color: category.color || '#1890ff',
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
    // Prevent creating circular parent relationships
    if (editingCategory && values.parent === editingCategory.id) {
      Modal.error({
        title: 'שגיאה',
        content: 'קטגוריה לא יכולה להיות הורה של עצמה',
      });
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, values);
    } else {
      await addCategory(values);
    }

    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (categoryId) => {
    // Check if category has books
    const categoryBooks = books.filter(
      (book) => book.categories && book.categories.includes(categoryId)
    ).length;

    // Check if category has child categories
    const childCategories = categories.filter(
      (cat) => cat.parent === categoryId
    ).length;

    if (categoryBooks > 0 || childCategories > 0) {
      Modal.confirm({
        title: 'לא ניתן למחוק קטגוריה זו',
        content: `קטגוריה זו משויכת ל-${categoryBooks} ספרים ו-${childCategories} קטגוריות משנה. אנא הסר שיוכים אלו לפני מחיקת הקטגוריה.`,
        okText: 'הבנתי',
        cancelText: null,
        cancelButtonProps: { style: { display: 'none' } },
      });
      return;
    }

    await deleteCategory(categoryId);
  };

  // Table columns
  const columns = [
    {
      title: 'שם הקטגוריה',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ColorTag color={record.color} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'תיאור',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
      ellipsis: true,
    },
    {
      title: 'קטגוריית הורה',
      key: 'parent',
      render: (_, record) => {
        const parentName = getParentCategoryName(record.parent);
        return parentName || '-';
      },
    },
    {
      title: 'ספרים',
      key: 'bookCount',
      render: (_, record) => {
        const count = getCategoryBookCount(record.id);
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
              title="בטוח שאתה רוצה למחוק את הקטגוריה?"
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
          <Title level={2}>קטגוריות</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            הוספת קטגוריה
          </Button>
        </div>

        <FilterContainer>
          <Input
            placeholder="חיפוש לפי שם או תיאור"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </FilterContainer>

        <StyledTable
          dataSource={filteredCategories}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `סה"כ ${total} קטגוריות`,
          }}
          locale={{
            emptyText: 'לא נמצאו קטגוריות',
          }}
        />
      </StyledCard>

      {/* Category Form Modal */}
      <Modal
        title={editingCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה חדשה'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={createCategoryModel()}
        >
          <Form.Item
            name="name"
            label="שם הקטגוריה"
            rules={[{ required: true, message: 'נא להזין את שם הקטגוריה' }]}
          >
            <Input placeholder="הזן את שם הקטגוריה" />
          </Form.Item>

          <Form.Item name="description" label="תיאור">
            <TextArea placeholder="הזן תיאור קצר" rows={3} />
          </Form.Item>

          <Form.Item name="color" label="צבע">
            <ColorPicker />
          </Form.Item>

          <Form.Item name="parent" label="קטגוריית הורה">
            <TreeSelect
              treeData={getCategoryTreeData()}
              placeholder="בחר קטגוריית הורה (אופציונלי)"
              allowClear
              treeDefaultExpandAll
              showSearch
              filterTreeNode={(input, option) =>
                option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={
                editingCategory &&
                categories.some((c) => c.parent === editingCategory.id)
              }
            />
          </Form.Item>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button onClick={handleCancel}>ביטול</Button>
            <Button type="primary" htmlType="submit">
              {editingCategory ? 'עדכון' : 'הוספה'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
