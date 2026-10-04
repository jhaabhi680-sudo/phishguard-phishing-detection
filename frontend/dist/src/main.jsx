import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render( /*#__PURE__*/React.createElement(React.StrictMode, null, /*#__PURE__*/React.createElement(App, null)));
}