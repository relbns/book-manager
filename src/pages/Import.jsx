// src/pages/Import.jsx
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Upload,
  Button,
  Select,
  Steps,
  message,
  Alert,
  Table,
  Divider,
  Space,
  Empty,
} from 'antd';
import {
  InboxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../context/AppContext';
import csvService from '../services/csvService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const ImportContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Import = () => {
  // Context
  const {
    addBook,
    addAuthor,
    addCategory,
    addPublisher,
    addLoan,
    createBookModel,
    createAuthorModel,
    createCategoryModel,
    createPublisherModel,
    createLoanModel,
  } = useAppContext();

  // State
  const [importType, setImportType] = useState('books');
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Collection models map
  const modelCreators = {
    books: createBookModel,
    authors: createAuthorModel,
    categories: createCategoryModel,
    publishers: createPublisherModel,
    loans: createLoanModel,
  };

  // Collection add functions map
  const addFunctions = {
    books: addBook,
    authors: addAuthor,
    categories: addCategory,
    publishers: addPublisher,
    loans: addLoan,
  };

  // Handle file upload
  const handleFileUpload = async (info) => {
    const { file } = info;

    // Only accept .csv files
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      message.error('רק קבצי CSV נתמכים');
      return;
    }

    setFile(file);
    setCurrentStep(1);

    try {
      setLoading(true);
      setError(null);

      // Parse CSV file
      const data = await csvService.importFromCSV(file, importType);
      setFileData(data);

      message.success(`נטענו ${data.length} רשומות בהצלחה`);
    } catch (err) {
      setError(err.message);
      message.error(`שגיאה בטעינת הקובץ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!fileData.length) {
      message.error('אין נתונים לייבוא');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const modelCreator = modelCreators[importType];
      const addFunction = addFunctions[importType];

      if (!modelCreator || !addFunction) {
        throw new Error(`סוג היבוא ${importType} אינו נתמך`);
      }

      // Create models and add to collections
      const results = [];

      for (const item of fileData) {
        const model = modelCreator(item);
        await addFunction(model);
        results.push(model);
      }

      setImportResult({
        count: results.length,
        type: importType,
      });

      setCurrentStep(2);
      message.success(`יובאו ${results.length} רשומות בהצלחה`);
    } catch (err) {
      setError(err.message);
      message.error(`שגיאה בייבוא: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset import
  const resetImport = () => {
    setFile(null);
    setFileData([]);
    setError(null);
    setImportResult(null);
    setCurrentStep(0);
  };

  // Get sample headers for selected import type
  const getSampleHeaders = () => {
    switch (importType) {
      case 'books':
        return 'title,author,publisher,isbn,publicationYear,language,categories';
      case 'authors':
        return 'name,biography,birthYear,nationality';
      case 'categories':
        return 'name,description,color';
      case 'publishers':
        return 'name,location,website';
      case 'loans':
        return 'bookId,borrowerName,borrowerContact,loanDate,dueDate';
      default:
        return '';
    }
  };

  // Get columns for preview table
  const getPreviewColumns = () => {
    if (!fileData.length) return [];

    return Object.keys(fileData[0]).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      render: (text) => {
        if (text === null || text === undefined) return '-';
        if (typeof text === 'object') return JSON.stringify(text);
        return String(text);
      },
    }));
  };

  // Steps
  const steps = [
    {
      title: 'בחירת קובץ',
      content: (
        <>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              value={importType}
              onChange={setImportType}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <Option value="books">ספרים</Option>
              <Option value="authors">סופרים</Option>
              <Option value="categories">קטגוריות</Option>
              <Option value="publishers">הוצאות לאור</Option>
              <Option value="loans">השאלות</Option>
            </Select>

            <Alert
              message="מבנה הקובץ הנדרש"
              description={
                <>
                  <Text>יש לייבא קובץ CSV עם כותרות עמודות. לדוגמה:</Text>
                  <div
                    style={{
                      background: '#f5f5f5',
                      padding: 8,
                      borderRadius: 4,
                      marginTop: 8,
                      direction: 'ltr',
                      fontFamily: 'monospace',
                    }}
                  >
                    {getSampleHeaders()}
                  </div>
                </>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              onChange={handleFileUpload}
              accept=".csv"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                גרור לכאן קובץ CSV או לחץ לבחירת קובץ
              </p>
              <p className="ant-upload-hint">
                שים לב: יש לייבא קובץ CSV בלבד, עם כותרות עמודות תואמות
              </p>
            </Dragger>
          </Space>
        </>
      ),
    },
    {
      title: 'אימות נתונים',
      content: (
        <>
          {error && (
            <Alert
              message="שגיאה בטעינת הקובץ"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {file && (
            <div style={{ marginBottom: 16 }}>
              <Text>
                <FileTextOutlined /> {file.name} (
                {(file.size / 1024).toFixed(2)} KB)
              </Text>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <LoadingOutlined style={{ fontSize: 24 }} />
              <p>טוען נתונים...</p>
            </div>
          ) : fileData.length > 0 ? (
            <>
              <Paragraph>
                נמצאו {fileData.length} רשומות. אנא בדוק את הנתונים לפני הייבוא.
              </Paragraph>

              <Table
                dataSource={fileData.slice(0, 5)}
                columns={getPreviewColumns()}
                pagination={false}
                size="small"
                scroll={{ x: 'max-content' }}
                rowKey={(record, index) => index}
              />

              {fileData.length > 5 && (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <Text type="secondary">
                    מוצגות 5 רשומות ראשונות מתוך {fileData.length}
                  </Text>
                </div>
              )}
            </>
          ) : (
            <Empty description="אין נתונים לתצוגה" />
          )}
        </>
      ),
    },
    {
      title: 'ייבוא',
      content: (
        <>
          {importResult && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <Title level={3}>הייבוא הושלם בהצלחה!</Title>
              <Paragraph>
                יובאו {importResult.count} רשומות מסוג {importResult.type}.
              </Paragraph>
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <ImportContainer>
      <StyledCard>
        <Title level={2}>ייבוא נתונים</Title>

        <Steps
          current={currentStep}
          items={steps.map((item) => ({ title: item.title }))}
          style={{ marginBottom: 24 }}
        />

        <div className="steps-content">{steps[currentStep].content}</div>

        <Divider />

        <div
          className="steps-action"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {currentStep > 0 && currentStep < 2 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              חזרה
            </Button>
          )}

          {currentStep === 0 && (
            <Button
              disabled={!file}
              type="primary"
              onClick={() => setCurrentStep(1)}
            >
              המשך
            </Button>
          )}

          {currentStep === 1 && (
            <Button
              type="primary"
              onClick={handleImport}
              loading={loading}
              disabled={!fileData.length || error}
            >
              ייבא נתונים
            </Button>
          )}

          {currentStep === 2 && (
            <Button type="primary" onClick={resetImport}>
              ייבוא נוסף
            </Button>
          )}
        </div>
      </StyledCard>
    </ImportContainer>
  );
};

export default Import;
