/**
 * 🖥️ Long Sang Portfolio Desktop - Main Entry
 * 
 * Electron desktop application for Long Sang Portfolio.
 * 
 * @author LongSang Team
 * @version 1.0.0
 */

const { app, globalShortcut } = require('electron');

// Core modules
const { isDev, APP_INFO, SHORTCUTS, TRAY, PORTS } = require('./core/config.cjs');
const { loggers } = require('./core/logger.cjs');
const { initIPC, cleanupIPC } = require('./core/ipc-handler.cjs');
const { windowManager } = require('./core/window-manager.cjs');
const { trayManager } = require('./core/tray-manager.cjs');
const { createMenu } = require('./core/menu.cjs');

const log = loggers.main;

// ============================================================
// APP LIFECYCLE
// ============================================================

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log.warn('Another instance is running, quitting...');
  app.quit();
} else {
  app.on('second-instance', () => {
    windowManager.focusMainWindow();
  });
}

// App ready
app.whenReady().then(async () => {
  log.info('='.repeat(50));
  log.info(`🚀 Starting ${APP_INFO.name} v${APP_INFO.version}`);
  log.info(`Environment: ${isDev ? 'development' : 'production'}`);
  log.info('='.repeat(50));

  try {
    // 1. Show splash screen
    log.info('Showing splash screen...');
    windowManager.createSplashWindow();

    // 2. Initialize IPC handlers
    initIPC();

    // 3. Create application menu
    createMenu();

    // 4. Create main window
    const mainWindow = windowManager.createMainWindow(PORTS.vite);

    // 5. Close splash when main window is ready
    mainWindow.once('ready-to-show', () => {
      windowManager.closeSplash();
      log.success('Application ready!');
    });

    // 6. Create system tray
    if (TRAY.enabled) {
      trayManager.create();
    }

    // 7. Register global shortcuts
    registerGlobalShortcuts();

    log.success(`${APP_INFO.name} started successfully`);

  } catch (error) {
    log.error('Failed to start application:', error);
    app.quit();
  }
});

// macOS: Re-create window when dock icon is clicked
app.on('activate', () => {
  if (!windowManager.getMainWindow()) {
    windowManager.createMainWindow(PORTS.vite);
  }
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup before quit
app.on('will-quit', () => {
  log.info('Application shutting down...');
  
  // Unregister shortcuts
  globalShortcut.unregisterAll();
  
  // Cleanup IPC
  cleanupIPC();
  
  // Destroy tray
  trayManager.destroy();
  
  log.info('Cleanup complete');
});

// ============================================================
// GLOBAL SHORTCUTS
// ============================================================

function registerGlobalShortcuts() {
  // Toggle DevTools
  globalShortcut.register(SHORTCUTS.toggleDevTools, () => {
    const win = windowManager.getMainWindow();
    if (win) {
      win.webContents.toggleDevTools();
    }
  });

  // Reload
  globalShortcut.register(SHORTCUTS.reload, () => {
    const win = windowManager.getMainWindow();
    if (win) {
      win.webContents.reload();
    }
  });

  log.info('Global shortcuts registered');
}

// ============================================================
// ERROR HANDLING
// ============================================================

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
