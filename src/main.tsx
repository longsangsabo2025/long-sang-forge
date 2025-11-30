import './lib/error-reporter';
import './lib/sentry';  // Error tracking to longsang-admin
import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { AuthProvider } from './components/auth/AuthProvider';
import { initWebVitals } from './utils/web-vitals-tracker';

// Initialize Core Web Vitals tracking
initWebVitals();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
