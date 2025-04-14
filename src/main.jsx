import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { BillsProvider } from './contexts/BillsContext';
import { CurrentBillProvider } from './contexts/CurrentBillContext';
import App from './App.jsx';
import './i18n'; // Import i18n configuration
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <BillsProvider>
          <CurrentBillProvider>
            <App />
          </CurrentBillProvider>
        </BillsProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
