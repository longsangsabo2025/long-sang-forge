/**
 * 🔧 Desktop App Configuration
 * 
 * Centralized configuration for Long Sang Portfolio desktop application.
 */

const path = require('path');
const os = require('os');

// Determine environment
const isDev = process.env.NODE_ENV !== 'production';

// App Info
const APP_INFO = {
  name: 'Long Sang Portfolio',
  id: 'com.longsang.portfolio',
  version: '1.0.0',
  description: 'Portfolio Platform - AI Marketplace, Academy & Investment Portal',
  author: 'LongSang Team',
  website: 'https://longsang.org',
  github: 'https://github.com/longsang/long-sang-forge',
};

// Paths
const PATHS = {
  // App directories
  root: path.join(__dirname, '../..'),
  electron: path.join(__dirname, '..'),
  dist: path.join(__dirname, '../../dist'),
  
  // Data directories
  userData: isDev 
    ? path.join(__dirname, '../../.electron-data')
    : path.join(os.homedir(), '.longsang-portfolio'),
  logs: isDev 
    ? path.join(__dirname, '../../.electron-data/logs')
    : path.join(os.homedir(), '.longsang-portfolio/logs'),
  config: isDev 
    ? path.join(__dirname, '../../.electron-data/config')
    : path.join(os.homedir(), '.longsang-portfolio/config'),
    
  // Assets
  icon: path.join(__dirname, '../icon.png'),
  trayIcon: path.join(__dirname, '../icon.png'),
};

// Ports
const PORTS = {
  vite: 8080,
  api: 3001,
};

// Services Configuration
const SERVICES = {
  vite: {
    enabled: isDev,
    autoStart: isDev,
    port: PORTS.vite,
    startupTimeout: 15000,
  },
  api: {
    enabled: true,
    port: PORTS.api,
    startupTimeout: 10000,
  },
};

// Window Configuration
const WINDOW = {
  main: {
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    center: true,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  },
  splash: {
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
  },
};

// WebPreferences for all windows
const WEB_PREFERENCES = {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
  enableRemoteModule: false,
};

// System Tray Configuration
const TRAY = {
  enabled: true,
  tooltip: APP_INFO.name,
  contextMenu: [
    { label: 'Show App', action: 'show' },
    { type: 'separator' },
    { label: 'Quit', action: 'quit' },
  ],
};

// Keyboard Shortcuts
const SHORTCUTS = {
  toggleDevTools: 'F12',
  reload: 'CmdOrCtrl+R',
  forceReload: 'CmdOrCtrl+Shift+R',
  quit: 'CmdOrCtrl+Q',
};

module.exports = {
  isDev,
  APP_INFO,
  PATHS,
  PORTS,
  SERVICES,
  WINDOW,
  WEB_PREFERENCES,
  TRAY,
  SHORTCUTS,
};
