/**
 * 🔐 Preload Script
 * 
 * Secure bridge between main and renderer processes.
 */

const { contextBridge, ipcRenderer } = require('electron');

// IPC Channel names
const CHANNELS = {
  APP_INFO: 'app:info',
  APP_QUIT: 'app:quit',
  APP_RESTART: 'app:restart',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  WINDOW_OPEN_DEVTOOLS: 'window:open-devtools',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:get-all',
  SHELL_OPEN_EXTERNAL: 'shell:open-external',
  SHELL_OPEN_PATH: 'shell:open-path',
  DIALOG_MESSAGE: 'dialog:message',
  DIALOG_ERROR: 'dialog:error',
  SYSTEM_INFO: 'system:info',
  SYSTEM_PATHS: 'system:paths',
};

// Expose secure APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // App
  getAppInfo: () => ipcRenderer.invoke(CHANNELS.APP_INFO),
  quit: () => ipcRenderer.invoke(CHANNELS.APP_QUIT),
  restart: () => ipcRenderer.invoke(CHANNELS.APP_RESTART),
  
  // Window
  minimize: () => ipcRenderer.invoke(CHANNELS.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.invoke(CHANNELS.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.invoke(CHANNELS.WINDOW_CLOSE),
  toggleFullscreen: () => ipcRenderer.invoke(CHANNELS.WINDOW_TOGGLE_FULLSCREEN),
  openDevTools: () => ipcRenderer.invoke(CHANNELS.WINDOW_OPEN_DEVTOOLS),
  
  // Settings
  getSetting: (key) => ipcRenderer.invoke(CHANNELS.SETTINGS_GET, key),
  setSetting: (key, value) => ipcRenderer.invoke(CHANNELS.SETTINGS_SET, { key, value }),
  getAllSettings: () => ipcRenderer.invoke(CHANNELS.SETTINGS_GET_ALL),
  
  // Shell
  openExternal: (url) => ipcRenderer.invoke(CHANNELS.SHELL_OPEN_EXTERNAL, url),
  openPath: (filePath) => ipcRenderer.invoke(CHANNELS.SHELL_OPEN_PATH, filePath),
  
  // Dialog
  showMessage: (options) => ipcRenderer.invoke(CHANNELS.DIALOG_MESSAGE, options),
  showError: (title, content) => ipcRenderer.invoke(CHANNELS.DIALOG_ERROR, { title, content }),
  
  // System
  getSystemInfo: () => ipcRenderer.invoke(CHANNELS.SYSTEM_INFO),
  getSystemPaths: () => ipcRenderer.invoke(CHANNELS.SYSTEM_PATHS),
  
  // Platform check
  isElectron: true,
  platform: process.platform,
});

console.log('🔐 Preload script loaded');
