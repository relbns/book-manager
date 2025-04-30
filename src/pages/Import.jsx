// src/pages/Import.jsx - Updated to support new book attributes
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
  Radio,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  FileExcelOutlined,
  FileOutlined,
  ExclamationCircleOutlined,
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
    authors, // Added to reference authors when importing books
  } = useAppContext();

  // State
  const [importType, setImportType] = useState('books');
  const [importFormat, setImportFormat] = useState('csv');
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

    // Check file type based on selected import format
    if (importFormat === 'csv') {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        message.error('רק קבצי CSV נתמכים');
        return;
      }
    } else if (importFormat === 'json') {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        message.error('רק קבצי JSON נתמכים');
        return;
      }
    }

    setFile(file);
    setCurrentStep(1);

    try {
      setLoading(true);
      setError(null);

      let data;
      if (importFormat === 'json') {
        // Read and parse JSON file
        const reader = new FileReader();
        data = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const jsonData = JSON.parse(e.target.result);
              resolve(Array.isArray(jsonData) ? jsonData : [jsonData]);
            } catch (err) {
              reject(new Error('פורמט JSON לא תקין'));
            }
          };
          reader.onerror = () => reject(new Error('שגיאה בקריאת הקובץ'));
          reader.readAsText(file);
        });
      } else {
        // Parse CSV file
        const parsedCsvData = await csvService.importFromCSV(file, importType);
        data = parsedCsvData; // Assign to the 'let' variable
      }

      setFileData(data);
      message.success(`נטענו ${data.length} רשומות בהצלחה`);
    } catch (err) {
      setError(err.message);
      message.error(`שגיאה בטעינת הקובץ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Process book data before import
  const processBookData = (bookData) => {
    // Handle author by ID or name
    if (bookData.author && typeof bookData.author === 'string') {
      // Check if the author field contains an ID or a name
      const authorById = authors.find((a) => a.id === bookData.author);
      if (!authorById) {
        // Check if it's a name and try to find author by name
        const authorByName = authors.find(
          (a) => a.name.toLowerCase() === bookData.author.toLowerCase()
        );
        if (authorByName) {
          bookData.author = authorByName.id;
        }
      }
    }

    // Convert isLoaned from string to boolean if necessary
    if ('isLoaned' in bookData && typeof bookData.isLoaned === 'string') {
      const loanedValue = bookData.isLoaned.toLowerCase();
      bookData.isLoaned = ['כן', 'yes', 'true', '1'].includes(loanedValue);
    }

    // Convert numeric string fields to numbers
    if (
      'volumeInSeries' in bookData &&
      bookData.volumeInSeries &&
      typeof bookData.volumeInSeries === 'string'
    ) {
      bookData.volumeInSeries = parseInt(bookData.volumeInSeries) || null;
    }

    if (
      'totalVolumesInSeries' in bookData &&
      bookData.totalVolumesInSeries &&
      typeof bookData.totalVolumesInSeries === 'string'
    ) {
      bookData.totalVolumesInSeries =
        parseInt(bookData.totalVolumesInSeries) || null;
    }

    return bookData;
  };

  // Helper function for delay
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Handle import with batching
  const handleImport = async () => {
    if (!fileData.length) {
      message.error('אין נתונים לייבוא');
      return;
    }

    setLoading(true);
    setError(null);
    setImportResult(null); // Reset previous results

    const batchSize = 50; // Process 50 records per batch for UI feedback
    const delayBetweenItems = 600; // ~100 requests/minute (Rate limit is 120/min)
    let importedCount = 0;
    let errorCount = 0;
    const totalRecords = fileData.length;

    try {
      const modelCreator = modelCreators[importType];
      const addFunction = addFunctions[importType];

      if (!modelCreator || !addFunction) {
        throw new Error(`סוג היבוא ${importType} אינו נתמך`);
      }

      for (let i = 0; i < totalRecords; i += batchSize) {
        const batch = fileData.slice(i, i + batchSize);
        console.log(`Importing batch ${i / batchSize + 1} of ${Math.ceil(totalRecords / batchSize)}...`);
        message.info(`מעבד ${i + batch.length} מתוך ${totalRecords} רשומות...`); // Progress update

        for (const item of batch) {
          try {
            let processedItem = item;
            if (importType === 'books') {
              processedItem = processBookData(item); // Assuming processBookData is synchronous or fast
            }
            const model = modelCreator(processedItem);
            await addFunction(model);
            importedCount++;
            await sleep(delayBetweenItems); // Add delay after each item import
          } catch (itemError) {
            console.error(`Error importing item: ${itemError.message}`, item);
            setError(`שגיאה בייבוא רשומה: ${itemError.message}`); // Show last error
            errorCount++;
            // Optional: Decide whether to stop or continue on item error
            // if (errorCount > 10) throw new Error("Too many errors during import.");
          }
        }

        // Removed delay between batches, now delaying between items
      }

      // Update state after all batches are processed
      setImportResult({
        count: importedCount,
        total: totalRecords,
        errors: errorCount,
        type: importType,
      });

      setCurrentStep(2); // Move to the final step

      if (errorCount > 0) {
         message.warning(`הייבוא הושלם עם ${errorCount} שגיאות. יובאו ${importedCount} מתוך ${totalRecords} רשומות.`);
      } else {
         message.success(`יובאו ${importedCount} רשומות בהצלחה!`);
      }

    } catch (err) {
      // Catch errors from batch processing logic or fatal errors
      setError(err.message);
      message.error(`שגיאה קריטית בייבוא: ${err.message}`);
      // Keep user on step 1 or 2 depending on where the error occurred
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
        return 'ID,שם הספר,מחבר,סדרה,כרך בסדרה,חלק,סך כרכים בסדרה,סיווג,הערות,הושאל';
      case 'authors':
        return 'id,name,biography,birthYear,nationality';
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

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>פורמט ייבוא</Title>
              <Radio.Group
                value={importFormat}
                onChange={(e) => setImportFormat(e.target.value)}
              >
                <Radio.Button value="csv">CSV</Radio.Button>
                <Radio.Button value="json">JSON</Radio.Button>
              </Radio.Group>
            </div>

            <Alert
              message="מבנה הקובץ הנדרש"
              description={
                importFormat === 'csv' ? (
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
                ) : (
                  <>
                    <Text>יש לייבא קובץ JSON המכיל מערך של אובייקטים.</Text>
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
                      [{'\n'}
                      {
                        '  { "title": "שם הספר", "author": "123456", "series": "שם הסדרה", ... },\n'
                      }
                      {'  { "title": "ספר אחר", "author": "654321", ... }\n'}
                      {']'}
                    </div>
                  </>
                )
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {importType === 'books' && (
              <Alert
                message="שים לב לשדה 'מחבר' (author)"
                description={
                  <>
                    <Text>ניתן להשתמש במזהה (ID) של סופר או בשמו.</Text>
                    <Text>מומלץ לייצא את רשימת הסופרים תחילה לייחוס.</Text>
                  </>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              onChange={handleFileUpload}
              accept={importFormat === 'csv' ? '.csv' : '.json'}
            >
              <p className="ant-upload-drag-icon">
                {importFormat === 'csv' ? (
                  <FileExcelOutlined />
                ) : (
                  <FileOutlined />
                )}
              </p>
              <p className="ant-upload-text">
                גרור לכאן קובץ {importFormat.toUpperCase()} או לחץ לבחירת קובץ
              </p>
              <p className="ant-upload-hint">
                שים לב: יש לייבא קובץ {importFormat.toUpperCase()} בלבד, בפורמט
                המתאים
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
          {loading && ( // Show loading indicator during import
            <div style={{ textAlign: 'center', padding: 24 }}>
              <LoadingOutlined style={{ fontSize: 24 }} />
              <p>מייבא נתונים (זה עשוי לקחת זמן)...</p>
              {importResult && <p>יובאו {importResult.count} מתוך {importResult.total}</p>}
            </div>
          )}
          {!loading && importResult && (
            <div style={{ textAlign: 'center', padding: 24 }}>
              {importResult.errors === 0 ? (
                <>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={3}>הייבוא הושלם בהצלחה!</Title>
                  <Paragraph>
                    יובאו {importResult.count} רשומות מסוג {importResult.type}.
                  </Paragraph>
                </>
              ) : (
                <>
                  <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
                  <Title level={3}>הייבוא הושלם עם שגיאות</Title>
                  <Paragraph>
                    יובאו {importResult.count} מתוך {importResult.total} רשומות מסוג {importResult.type}.
                  </Paragraph>
                  <Paragraph type="danger">
                    נתקלו ב-{importResult.errors} שגיאות במהלך הייבוא. בדוק את יומני המסוף לפרטים.
                  </Paragraph>
                  {error && <Alert message="שגיאה אחרונה" description={error} type="error" showIcon />}
                </>
              )}
            </div>
          )}
           {!loading && error && !importResult && ( // Show critical error if import failed entirely
               <Alert
                  message="שגיאה קריטית בייבוא"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
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
