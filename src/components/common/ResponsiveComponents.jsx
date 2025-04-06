// src/components/common/ResponsiveComponents.jsx
import React from 'react';
import styled from 'styled-components';
import { Row, Col, Space, Button } from 'antd';

// A responsive filter container that stacks on mobile
export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    
    & > * {
      width: 100% !important;
    }
  }
`;

// Responsive grid row that improves layout on mobile
export const ResponsiveRow = styled(Row)`
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

// Responsive button group that handles stacking on mobile
export const ButtonGroup = ({ children, stack = false, className = '' }) => {
  return (
    <Space 
      direction={stack || window.innerWidth <= 768 ? 'vertical' : 'horizontal'} 
      style={{ width: stack || window.innerWidth <= 768 ? '100%' : 'auto' }}
      className={className}
    >
      {children}
    </Space>
  );
};

// Mobile action buttons that stack responsively
export const ActionButtons = ({ buttons = [], className = '' }) => {
  const isMobile = window.innerWidth <= 768;
  
  return (
    <Space 
      direction={isMobile ? 'vertical' : 'horizontal'} 
      style={{ width: isMobile ? '100%' : 'auto' }}
      className={className}
    >
      {buttons.map((button, index) => (
        <Button 
          key={index}
          type={button.type || 'default'}
          icon={button.icon}
          onClick={button.onClick}
          danger={button.danger}
          style={isMobile ? { width: '100%' } : {}}
        >
          {button.text}
        </Button>
      ))}
    </Space>
  );
};

// Book detail layout that's responsive
export const BookDetailContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Responsive card container
export const CardContainer = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

// Responsive page container with proper padding
export const PageContainer = styled.div`
  padding: 0;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

// Mobile-friendly page title with responsive spacing
export const PageTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    & > *:last-child {
      align-self: stretch;
      
      & button {
        width: 100%;
      }
    }
  }
`;

export default {
  FilterContainer,
  ResponsiveRow,
  ButtonGroup,
  ActionButtons,
  BookDetailContainer,
  CardContainer,
  PageContainer,
  PageTitle
};