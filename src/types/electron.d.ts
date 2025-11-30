/**
 * 🖥️ Electron API Types
 * 
 * TypeScript declarations for the Electron API exposed via preload.
 */

interface ElectronAPI {
  // App
  getAppInfo: () => Promise<{
    name: string;
    id: string;
    version: string;
    description: string;
    author: string;
    website: string;
    github: string;
    electron: string;
    chrome: string;
    node: string;
  }>;
  quit: () => Promise<void>;
  restart: () => Promise<void>;
  
  // Window
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  openDevTools: () => Promise<void>;
  
  // Settings
  getSetting: (key: string) => Promise<unknown>;
  setSetting: (key: string, value: unknown) => Promise<boolean>;
  getAllSettings: () => Promise<Record<string, unknown>>;
  
  // Shell
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  openPath: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  
  // Dialog
  showMessage: (options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
  }) => Promise<{ response: number; checkboxChecked: boolean }>;
  showError: (title: string, content: string) => Promise<void>;
  
  // System
  getSystemInfo: () => Promise<{
    platform: string;
    arch: string;
    version: string;
    hostname: string;
    cpus: number;
    memory: {
      total: number;
      free: number;
    };
  }>;
  getSystemPaths: () => Promise<{
    home: string;
    temp: string;
    userData: string;
    logs: string;
    config: string;
  }>;
  
  // Platform check
  isElectron: boolean;
  platform: 'win32' | 'darwin' | 'linux';
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
