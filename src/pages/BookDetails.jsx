import React from 'react';
import { Typography, Card } from 'antd';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const BookDetails = () => {
  const { id } = useParams();

  return (
    <Card>
      <Title level={2}>פרטי ספר</Title>
      <p>פרטי ספר מזהה: {id}</p>
    </Card>
  );
};

export default BookDetails;
