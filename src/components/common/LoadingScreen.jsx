// src/components/common/LoadingScreen.jsx
import React from 'react';
import { Spin, Space, Typography } from 'antd';
import styled from 'styled-components';

const { Text } = Typography;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: ${(props) =>
    props.theme === 'dark' ? '#1f1f1f' : '#f0f2f5'};
`;

const LoadingScreen = ({ message = 'טוען...', theme = 'light' }) => {
  return (
    <LoadingContainer theme={theme}>
      <Space direction="vertical" size="large" align="center">
        <Spin size="large" />
        <Text style={{ fontSize: '16px' }}>{message}</Text>
      </Space>
    </LoadingContainer>
  );
};

export default LoadingScreen;
