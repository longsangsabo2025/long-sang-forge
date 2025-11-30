/**
 * 🔌 IPC Handler
 * 
 * Inter-Process Communication between main and renderer.
 */

const { ipcMain, shell, dialog, app } = require('electron');
const { APP_INFO, PATHS } = require('./config.cjs');
const { loggers } = require('./logger.cjs');
const { stores } = require('./store.cjs');
const { windowManager } = require('./window-manager.cjs');
const os = require('os');

const log = loggers.ipc;

// IPC Channel names
const CHANNELS = {
  // App
  APP_INFO: 'app:info',
  APP_QUIT: 'app:quit',
  APP_RESTART: 'app:restart',
  
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  WINDOW_OPEN_DEVTOOLS: 'window:open-devtools',
  
  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:get-all',
  
  // Shell
  SHELL_OPEN_EXTERNAL: 'shell:open-external',
  SHELL_OPEN_PATH: 'shell:open-path',
  
  // Dialog
  DIALOG_MESSAGE: 'dialog:message',
  DIALOG_ERROR: 'dialog:error',
  
  // System
  SYSTEM_INFO: 'system:info',
  SYSTEM_PATHS: 'system:paths',
};

function initIPC() {
  log.info('Initializing IPC handlers...');

  // App handlers
  ipcMain.handle(CHANNELS.APP_INFO, () => ({
    ...APP_INFO,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  }));

  ipcMain.handle(CHANNELS.APP_QUIT, () => {
    app.quit();
  });

  ipcMain.handle(CHANNELS.APP_RESTART, () => {
    app.relaunch();
    app.exit(0);
  });

  // Window handlers
  ipcMain.handle(CHANNELS.WINDOW_MINIMIZE, () => {
    const win = windowManager.getMainWindow();
    if (win) win.minimize();
  });

  ipcMain.handle(CHANNELS.WINDOW_MAXIMIZE, () => {
    const win = windowManager.getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle(CHANNELS.WINDOW_CLOSE, () => {
    const win = windowManager.getMainWindow();
    if (win) win.close();
  });

  ipcMain.handle(CHANNELS.WINDOW_TOGGLE_FULLSCREEN, () => {
    const win = windowManager.getMainWindow();
    if (win) win.setFullScreen(!win.isFullScreen());
  });

  ipcMain.handle(CHANNELS.WINDOW_OPEN_DEVTOOLS, () => {
    const win = windowManager.getMainWindow();
    if (win) win.webContents.openDevTools();
  });

  // Settings handlers
  ipcMain.handle(CHANNELS.SETTINGS_GET, (_, key) => {
    return stores.settings.get(key);
  });

  ipcMain.handle(CHANNELS.SETTINGS_SET, (_, { key, value }) => {
    stores.settings.set(key, value);
    return true;
  });

  ipcMain.handle(CHANNELS.SETTINGS_GET_ALL, () => {
    return stores.settings.getAll();
  });

  // Shell handlers
  ipcMain.handle(CHANNELS.SHELL_OPEN_EXTERNAL, async (_, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(CHANNELS.SHELL_OPEN_PATH, async (_, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Dialog handlers
  ipcMain.handle(CHANNELS.DIALOG_MESSAGE, async (_, options) => {
    return dialog.showMessageBox(windowManager.getMainWindow(), options);
  });

  ipcMain.handle(CHANNELS.DIALOG_ERROR, async (_, { title, content }) => {
    return dialog.showErrorBox(title, content);
  });

  // System handlers
  ipcMain.handle(CHANNELS.SYSTEM_INFO, () => ({
    platform: process.platform,
    arch: process.arch,
    version: os.release(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
    },
  }));

  ipcMain.handle(CHANNELS.SYSTEM_PATHS, () => ({
    home: os.homedir(),
    temp: os.tmpdir(),
    userData: PATHS.userData,
    logs: PATHS.logs,
    config: PATHS.config,
  }));

  log.success('IPC handlers initialized');
}

function cleanupIPC() {
  Object.values(CHANNELS).forEach(channel => {
    ipcMain.removeAllListeners(channel);
  });
  log.info('IPC handlers cleaned up');
}

module.exports = { initIPC, cleanupIPC, CHANNELS };
