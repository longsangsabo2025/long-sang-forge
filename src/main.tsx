import './lib/error-reporter';
import './lib/sentry';  // Error tracking to longsang-admin
import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { AuthProvider } from './components/auth/AuthProvider';
import { initWebVitals } from './utils/web-vitals-tracker';
import { initGA } from './lib/google-analytics';

// Initialize Core Web Vitals tracking
initWebVitals();

// Initialize Google Analytics 4
if (import.meta.env.PROD) {
  initGA();
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
