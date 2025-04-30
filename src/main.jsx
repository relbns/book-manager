import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntApp } from 'antd'; // Import Ant Design App
import './index.css';
import App from './App.jsx'; // Your custom App component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntApp> {/* Wrap with Ant Design App */}
      <App />
    </AntApp>
  </StrictMode>,
);
