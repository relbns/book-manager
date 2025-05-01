import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntApp } from 'antd'; // Import Ant Design App
import { StyleProvider, createCache } from '@ant-design/cssinjs';
import './index.css';
import App from './App.jsx'; // Your custom App component

// Create a global cache for Ant Design CSS-in-JS
const cache = createCache();

// Ensure the environment is properly set for Ant Design
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: { NODE_ENV: import.meta.env.MODE } };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyleProvider cache={cache} hashPriority="high">
      <AntApp> {/* Wrap with Ant Design App */}
        <App />
      </AntApp>
    </StyleProvider>
  </StrictMode>,
);
