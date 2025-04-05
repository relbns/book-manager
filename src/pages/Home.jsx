// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Tag,
  Button,
  Divider,
  Empty,
  Progress,
  Alert,
} from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  ReadOutlined,
  AlertOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const StyledCard = styled(Card)`
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const StatCard = styled(StyledCard)`
  text-align: center;
  .ant-statistic-title {
    font-size: 16px;
  }
`;

const QuickActionButton = styled(Button)`
  height: auto;
  padding: 16px;
  text-align: center;
  border-radius: 6px;

  span {
    display: block;
    margin-top: 8px;
  }
`;

const Home = () => {
  const { books, loans, authors, categories, publishers } = useAppContext();
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState({
    bookCount: 0,
    loanedBooks: 0,
    overdueBooks: 0,
    topCategories: [],
    recentLoans: [],
  });

  // Calculate statistics
  useEffect(() => {
    // Book count
    const bookCount = books.length;

    // Loaned books
    const activeLoans = loans.filter((loan) => loan.status === 'active');
    const loanedBooks = activeLoans.length;

    // Overdue books
    const currentDate = dayjs();
    const overdueBooks = loans.filter((loan) => {
      return (
        loan.status === 'active' &&
        loan.dueDate &&
        dayjs(loan.dueDate).isBefore(currentDate)
      );
    }).length;

    // Top categories
    const categoryCount = {};
    books.forEach((book) => {
      if (book.categories && book.categories.length) {
        book.categories.forEach((catId) => {
          categoryCount[catId] = (categoryCount[catId] || 0) + 1;
        });
      }
    });

    const topCategories = Object.entries(categoryCount)
      .map(([id, count]) => {
        const category = categories.find((cat) => cat.id === id);
        return {
          id,
          name: category ? category.name : 'Unknown',
          color: category ? category.color : '#1890ff',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent loans
    const recentLoans = [...loans]
      .filter((loan) => loan.status === 'active')
      .sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate))
      .slice(0, 5)
      .map((loan) => {
        const book = books.find((b) => b.id === loan.bookId);
        return {
          ...loan,
          bookTitle: book ? book.title : 'Unknown Book',
          daysLeft: loan.dueDate
            ? dayjs(loan.dueDate).diff(currentDate, 'day')
            : null,
        };
      });

    setStatistics({
      bookCount,
      loanedBooks,
      overdueBooks,
      topCategories,
      recentLoans,
    });
  }, [books, loans, categories]);

  // Navigate to specific page
  const navigateTo = (path) => {
    navigate(path);
  };

  // Render loan status
  const renderLoanStatus = (daysLeft) => {
    if (daysLeft === null) return <Tag>לא צוין</Tag>;

    if (daysLeft < 0) {
      return <Tag color="red">באיחור של {Math.abs(daysLeft)} ימים</Tag>;
    } else if (daysLeft <= 3) {
      return <Tag color="orange">נותרו {daysLeft} ימים</Tag>;
    } else {
      return <Tag color="green">נותרו {daysLeft} ימים</Tag>;
    }
  };

  return (
    <div>
      <Title level={2}>דף הבית</Title>

      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard>
            <Statistic
              title="סה״כ ספרים"
              value={statistics.bookCount}
              prefix={<BookOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard>
            <Statistic
              title="ספרים מושאלים"
              value={statistics.loanedBooks}
              prefix={<TeamOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard>
            <Statistic
              title="סופרים"
              value={authors.length}
              prefix={<ReadOutlined />}
            />
          </StatCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard>
            <Statistic
              title="ספרים באיחור"
              value={statistics.overdueBooks}
              prefix={<AlertOutlined />}
              valueStyle={{
                color: statistics.overdueBooks > 0 ? '#cf1322' : undefined,
              }}
            />
          </StatCard>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Recent Loans */}
        <Col xs={24} md={12}>
          <StyledCard
            title={
              <div>
                <TeamOutlined /> השאלות אחרונות
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigateTo('/loans')}>
                כל ההשאלות
              </Button>
            }
          >
            {statistics.recentLoans.length > 0 ? (
              <List
                dataSource={statistics.recentLoans}
                renderItem={(item) => (
                  <List.Item actions={[renderLoanStatus(item.daysLeft)]}>
                    <List.Item.Meta
                      title={
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigateTo(`/books/${item.bookId}`)}
                        >
                          {item.bookTitle}
                        </span>
                      }
                      description={
                        <Text>
                          הושאל ל: {item.borrowerName} |
                          {item.loanDate &&
                            ` תאריך השאלה: ${dayjs(item.loanDate).format(
                              'DD/MM/YYYY'
                            )}`}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="אין השאלות פעילות" />
            )}
          </StyledCard>
        </Col>

        {/* Top Categories */}
        <Col xs={24} md={12}>
          <StyledCard
            title={
              <div>
                <BookOutlined /> קטגוריות מובילות
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigateTo('/categories')}>
                כל הקטגוריות
              </Button>
            }
          >
            {statistics.topCategories.length > 0 ? (
              <List
                dataSource={statistics.topCategories}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <Tag color={item.color}>{item.name}</Tag>
                          </div>
                          <div>{item.count} ספרים</div>
                        </div>
                      }
                      description={
                        <Progress
                          percent={Math.round(
                            (item.count / statistics.bookCount) * 100
                          )}
                          strokeColor={item.color}
                          size="small"
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="אין קטגוריות" />
            )}
          </StyledCard>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>פעולות מהירות</Title>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <QuickActionButton
              type="primary"
              size="large"
              block
              onClick={() => navigateTo('/books')}
            >
              <BookOutlined style={{ fontSize: 24 }} />
              <span>ניהול ספרים</span>
            </QuickActionButton>
          </Col>
          <Col xs={24} sm={8}>
            <QuickActionButton
              type="primary"
              size="large"
              block
              onClick={() => navigateTo('/loans')}
            >
              <TeamOutlined style={{ fontSize: 24 }} />
              <span>ניהול השאלות</span>
            </QuickActionButton>
          </Col>
          <Col xs={24} sm={8}>
            <QuickActionButton
              type="primary"
              size="large"
              block
              onClick={() => navigateTo('/authors')}
            >
              <ReadOutlined style={{ fontSize: 24 }} />
              <span>ניהול סופרים</span>
            </QuickActionButton>
          </Col>
        </Row>
      </Card>

      {/* Overdue Alert */}
      {statistics.overdueBooks > 0 && (
        <Alert
          message={`יש ${statistics.overdueBooks} ספרים באיחור החזרה`}
          description="ראה את רשימת ההשאלות לפרטים נוספים."
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => navigateTo('/loans?tab=overdue')}
            >
              צפה בהשאלות
            </Button>
          }
          style={{ marginTop: 24 }}
        />
      )}
    </div>
  );
};

export default Home;
