import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import faviconUrl from './assets/favicon.svg?url';

{
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
