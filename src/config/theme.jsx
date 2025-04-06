// src/config/theme.jsx
import { createCache, StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider, theme as antTheme } from 'antd';
import React, { useEffect } from 'react';
import { StyleSheetManager } from 'styled-components';
import rtlPlugin from 'stylis-plugin-rtl';

// Hebrew locale
import heIL from 'antd/locale/he_IL';

// Constants
export const prefixCls = 'book-manager';

// Create a theme config for light and dark modes
export const themeConfig = {
  light: {
    algorithm: antTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
    components: {
      Table: {
        colorBgContainer: '#ffffff',
      },
      Card: {
        colorBgContainer: '#ffffff',
      },
      Layout: {
        bodyBg: '#f0f2f5',
        headerBg: '#ffffff',
        siderBg: '#001529',
      },
    },
  },
  dark: {
    algorithm: antTheme.darkAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
    components: {
      Table: {
        colorBgContainer: '#141414',
      },
      Card: {
        colorBgContainer: '#1f1f1f',
      },
      Layout: {
        bodyBg: '#000000',
        headerBg: '#141414',
        siderBg: '#001529',
      },
    },
  },
};

// Ant Design configuration wrapper with RTL support
export const ThemeProvider = ({ children, theme = 'light' }) => {
  const cache = createCache();

  // Set body theme attribute for global CSS
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    return () => {
      document.body.removeAttribute('data-theme');
    };
  }, [theme]);

  return (
    <StyleSheetManager stylisPlugins={[rtlPlugin]}>
      <ConfigProvider
        direction="rtl"
        locale={heIL}
        theme={themeConfig[theme]}
        prefixCls={prefixCls}
        // Added responsive configurations
        componentSize="middle"
        space={{ size: 'small' }}
        form={{ validateMessages: heIL.Form.defaultValidateMessages }}
      >
        <StyleProvider cache={cache}>{children}</StyleProvider>
      </ConfigProvider>
    </StyleSheetManager>
  );
};

export default ThemeProvider;
