import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Core Design System & Styles
import './styles/design-tokens.css';
import './styles/typography.css';
import './styles/app-shell.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
