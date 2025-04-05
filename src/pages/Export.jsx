import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Select,
  Button,
  Alert,
  Table,
  Space,
  Checkbox,
  Input,
  DatePicker,
  Form,
  message,
} from 'antd';
import {
  ExportOutlined,
  DownloadOutlined,
  FilterOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import csvService from '../services/csvService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const ExportContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: right;
  }

  .ant-table-cell {
    text-align: right;
  }
`;

const Export = () => {
  // Context
  const { books, loans, categories, authors, publishers } = useAppContext();

  // State
  const [exportType, setExportType] = useState('books');
  const [exportData, setExportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [form] = Form.useForm();
  const [showFilters, setShowFilters] = useState(false);

  // Load data based on selected type
  useEffect(() => {
    let data = [];
    let fields = [];

    switch (exportType) {
      case 'books':
        data = [...books];
        fields = [
          'id',
          'title',
          'author',
          'publisher',
          'isbn',
          'publicationYear',
          'language',
          'categories',
        ];
        break;
      case 'authors':
        data = [...authors];
        fields = ['id', 'name', 'biography', 'birthYear', 'nationality'];
        break;
      case 'categories':
        data = [...categories];
        fields = ['id', 'name', 'description', 'color', 'parent'];
        break;
      case 'publishers':
        data = [...publishers];
        fields = ['id', 'name', 'location', 'website'];
        break;
      case 'loans':
        data = [...loans];
        fields = [
          'id',
          'bookId',
          'borrowerName',
          'borrowerContact',
          'loanDate',
          'dueDate',
          'returnDate',
          'status',
        ];
        break;
      default:
        data = [];
        fields = [];
    }

    setExportData(data);
    setFilteredData(data);
    setSelectedFields(fields);
    form.resetFields();
  }, [exportType, books, authors, categories, publishers, loans]);

  // Handle export
  const handleExport = () => {
    if (!filteredData.length) {
      message.error('אין נתונים לייצוא');
      return;
    }

    try {
      // Apply field selection if not all fields are selected
      let dataToExport = filteredData;

      if (
        selectedFields.length > 0 &&
        selectedFields.length < Object.keys(filteredData[0] || {}).length
      ) {
        dataToExport = filteredData.map((item) => {
          const newItem = {};
          selectedFields.forEach((field) => {
            newItem[field] = item[field];
          });
          return newItem;
        });
      }

      // Format filename with date
      const date = dayjs().format('YYYY-MM-DD');
      const fileName = `${exportType}_${date}.csv`;

      // Export to CSV
      csvService.exportToCSV(dataToExport, fileName);

      message.success(`יוצאו ${dataToExport.length} רשומות בהצלחה`);
    } catch (err) {
      message.error(`שגיאה בייצוא: ${err.message}`);
    }
  };

  // Apply filters
  const handleApplyFilters = (values) => {
    let result = [...exportData];

    // Apply text search if provided
    if (values.searchText) {
      const searchText = values.searchText.toLowerCase();

      result = result.filter((item) => {
        // Search in all string fields
        return Object.entries(item).some(([key, value]) => {
          return (
            typeof value === 'string' &&
            value.toLowerCase().includes(searchText)
          );
        });
      });
    }

    // Apply date range filter for loans
    if (
      exportType === 'loans' &&
      values.dateRange &&
      values.dateRange.length === 2
    ) {
      const startDate = values.dateRange[0].startOf('day');
      const endDate = values.dateRange[1].endOf('day');

      result = result.filter((loan) => {
        const loanDate = dayjs(loan.loanDate);
        return loanDate.isAfter(startDate) && loanDate.isBefore(endDate);
      });
    }

    // Apply status filter for loans
    if (exportType === 'loans' && values.status && values.status.length > 0) {
      result = result.filter((loan) => values.status.includes(loan.status));
    }

    // Apply category filter for books
    if (
      exportType === 'books' &&
      values.categories &&
      values.categories.length > 0
    ) {
      result = result.filter((book) => {
        if (!book.categories) return false;
        return book.categories.some((catId) =>
          values.categories.includes(catId)
        );
      });
    }

    setFilteredData(result);
    message.info(`נמצאו ${result.length} רשומות`);
  };

  // Reset filters
  const handleResetFilters = () => {
    form.resetFields();
    setFilteredData(exportData);
  };

  // Handle field selection
  const handleFieldsChange = (checkedValues) => {
    setSelectedFields(checkedValues);
  };

  // Get all available fields for current export type
  const getAvailableFields = () => {
    if (!exportData.length) return [];

    return Object.keys(exportData[0]).map((field) => ({
      label: field,
      value: field,
    }));
  };

  // Get columns for preview table
  const getPreviewColumns = () => {
    if (!filteredData.length) return [];

    const allFields = Object.keys(filteredData[0]);
    const fieldsToShow =
      selectedFields.length > 0
        ? selectedFields.filter((f) => allFields.includes(f))
        : allFields;

    return fieldsToShow.map((key) => ({
      title: key,
      dataIndex: key,
      key,
      render: (text) => {
        if (text === null || text === undefined) return '-';
        if (Array.isArray(text)) return text.join(', ');
        if (typeof text === 'object') return JSON.stringify(text);
        return String(text);
      },
    }));
  };

  // Get filter form based on export type
  const renderFilterForm = () => {
    switch (exportType) {
      case 'books':
        return (
          <>
            <Form.Item name="searchText" label="חיפוש טקסט">
              <Input placeholder="חיפוש לפי שם, מחבר או מק״ט" />
            </Form.Item>
            <Form.Item name="categories" label="קטגוריות">
              <Select mode="multiple" placeholder="בחר קטגוריות" allowClear>
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );
      case 'loans':
        return (
          <>
            <Form.Item name="searchText" label="חיפוש טקסט">
              <Input placeholder="חיפוש לפי שם השואל" />
            </Form.Item>
            <Form.Item name="dateRange" label="טווח תאריכים">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="סטטוס השאלה">
              <Select mode="multiple" placeholder="בחר סטטוס" allowClear>
                <Option value="active">פעיל</Option>
                <Option value="returned">הוחזר</Option>
                <Option value="overdue">באיחור</Option>
              </Select>
            </Form.Item>
          </>
        );
      default:
        return (
          <Form.Item name="searchText" label="חיפוש טקסט">
            <Input placeholder="חיפוש בכל השדות" />
          </Form.Item>
        );
    }
  };

  return (
    <ExportContainer>
      <StyledCard>
        <Title level={2}>ייצוא נתונים</Title>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            value={exportType}
            onChange={setExportType}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Option value="books">ספרים</Option>
            <Option value="authors">סופרים</Option>
            <Option value="categories">קטגוריות</Option>
            <Option value="publishers">הוצאות לאור</Option>
            <Option value="loans">השאלות</Option>
          </Select>

          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FilterOutlined style={{ marginLeft: 8 }} />
                <span>סינון נתונים</span>
              </div>
            }
            type="inner"
            extra={
              <Button type="link" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? 'הסתר' : 'הצג'}
              </Button>
            }
            style={{ marginBottom: 16 }}
          >
            {showFilters && (
              <Form form={form} layout="vertical" onFinish={handleApplyFilters}>
                {renderFilterForm()}

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      החל סינון
                    </Button>
                    <Button onClick={handleResetFilters}>איפוס</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {!showFilters && (
              <Text type="secondary">
                לחץ על 'הצג' כדי להגדיר סינונים לנתונים לפני הייצוא
              </Text>
            )}
          </Card>

          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FileTextOutlined style={{ marginLeft: 8 }} />
                <span>שדות לייצוא</span>
              </div>
            }
            type="inner"
            style={{ marginBottom: 16 }}
          >
            <Checkbox.Group
              options={getAvailableFields()}
              value={selectedFields}
              onChange={handleFieldsChange}
            />

            {selectedFields.length === 0 && (
              <Alert
                message="אנא בחר לפחות שדה אחד לייצוא"
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginTop: 16 }}
              />
            )}
          </Card>

          <div style={{ marginBottom: 16 }}>
            <Paragraph>{filteredData.length} רשומות נמצאו לייצוא</Paragraph>
          </div>

          {filteredData.length > 0 && (
            <>
              <StyledTable
                dataSource={filteredData.slice(0, 5)}
                columns={getPreviewColumns()}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
                rowKey="id"
              />

              {filteredData.length > 5 && (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <Text type="secondary">
                    מוצגות 5 רשומות ראשונות מתוך {filteredData.length}
                  </Text>
                </div>
              )}
            </>
          )}

          <div
            style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}
          >
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={
                filteredData.length === 0 || selectedFields.length === 0
              }
              size="large"
            >
              ייצא ל-CSV
            </Button>
          </div>

          {filteredData.length === 0 && (
            <Alert
              message="אין נתונים לייצוא"
              description="אנא נסה לשנות את הסינון או לבחור סוג נתונים אחר."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Space>
      </StyledCard>
    </ExportContainer>
  );
};

export default Export;
