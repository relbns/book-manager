// src/components/common/ResponsiveFilterContainer.jsx
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;

    & > * {
      width: 100%;
    }
  }
`;

const ResponsiveFilterContainer = ({ children, className = '' }) => {
  return (
    <Container className={`filter-container ${className}`}>
      {children}
    </Container>
  );
};

export default ResponsiveFilterContainer;
