import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Import Core Design System & Styles
import './styles/design-tokens.css';
import './styles/typography.css';
import './styles/app-shell.css';

// Automatically register PWA Service Worker for standalone execution & offline cache
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
