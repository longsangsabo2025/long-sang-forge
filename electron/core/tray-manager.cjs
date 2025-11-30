/**
 * 📱 System Tray Manager
 * 
 * Creates and manages the system tray icon and menu.
 */

const { Tray, Menu, app, nativeImage } = require('electron');
const path = require('path');
const { TRAY, PATHS, APP_INFO } = require('./config.cjs');
const { loggers } = require('./logger.cjs');
const { windowManager } = require('./window-manager.cjs');

const log = loggers.tray;

class TrayManager {
  constructor() {
    this.tray = null;
  }

  create() {
    if (this.tray) {
      log.warn('Tray already exists');
      return this.tray;
    }

    log.info('Creating system tray...');

    // Create tray icon
    let icon;
    try {
      icon = nativeImage.createFromPath(PATHS.trayIcon);
      if (icon.isEmpty()) {
        // Fallback to a simple icon
        icon = nativeImage.createEmpty();
      }
      // Resize for tray (16x16 on Windows, 22x22 on macOS)
      icon = icon.resize({ width: 16, height: 16 });
    } catch (error) {
      log.warn('Could not load tray icon:', error.message);
      icon = nativeImage.createEmpty();
    }

    this.tray = new Tray(icon);
    this.tray.setToolTip(TRAY.tooltip);

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: `${APP_INFO.name} v${APP_INFO.version}`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '📱 Show App',
        click: () => {
          windowManager.focusMainWindow();
        },
      },
      { type: 'separator' },
      {
        label: '🌐 Open Website',
        click: () => {
          require('electron').shell.openExternal(APP_INFO.website);
        },
      },
      { type: 'separator' },
      {
        label: '❌ Quit',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);

    // Double-click to show window
    this.tray.on('double-click', () => {
      windowManager.focusMainWindow();
    });

    log.success('System tray created');
    return this.tray;
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
      log.info('System tray destroyed');
    }
  }

  updateTooltip(text) {
    if (this.tray) {
      this.tray.setToolTip(text);
    }
  }
}

const trayManager = new TrayManager();

module.exports = { trayManager, TrayManager };
