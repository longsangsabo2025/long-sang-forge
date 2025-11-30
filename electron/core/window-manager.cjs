/**
 * 🪟 Window Manager
 * 
 * Manages application windows with state persistence.
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { WINDOW, WEB_PREFERENCES, PATHS, isDev, PORTS } = require('./config.cjs');
const { loggers } = require('./logger.cjs');
const { stores } = require('./store.cjs');

const log = loggers.window;

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.mainWindow = null;
    this.splashWindow = null;
  }

  createMainWindow(vitePort = PORTS.vite) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
      return this.mainWindow;
    }

    // Get saved window state
    const savedState = stores.windowState.getAll();
    
    // Validate bounds are on screen
    const bounds = this._validateBounds(savedState);

    log.info('Creating main window', bounds);

    this.mainWindow = new BrowserWindow({
      ...WINDOW.main,
      ...bounds,
      title: 'Long Sang Portfolio',
      icon: PATHS.icon,
      webPreferences: {
        ...WEB_PREFERENCES,
        preload: path.join(__dirname, '../preload.cjs'),
      },
      show: false,
    });

    // Load URL
    const url = isDev 
      ? `http://localhost:${vitePort}`
      : `file://${PATHS.dist}/index.html`;
    
    log.info(`Loading URL: ${url}`);
    this.mainWindow.loadURL(url);

    // Content Security Policy
    this.mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            isDev
              ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:* https:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* ws://localhost:* https:;"
              : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https:;"
          ]
        }
      });
    });

    // Show when ready
    this.mainWindow.once('ready-to-show', () => {
      if (savedState.isMaximized) {
        this.mainWindow.maximize();
      }
      this.mainWindow.show();
      
      if (isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Track window state
    this._trackWindowState();

    // Handle close
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this.windows.delete('main');
    });

    this.windows.set('main', this.mainWindow);
    return this.mainWindow;
  }

  createSplashWindow() {
    this.splashWindow = new BrowserWindow({
      ...WINDOW.splash,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load splash HTML
    const splashHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            color: white;
            overflow: hidden;
            border-radius: 10px;
          }
          .container {
            text-align: center;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .subtitle {
            font-size: 14px;
            color: #888;
          }
          .loader {
            margin-top: 30px;
            width: 40px;
            height: 40px;
            border: 3px solid #333;
            border-top-color: #00d4ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🚀</div>
          <div class="title">Long Sang Portfolio</div>
          <div class="subtitle">Loading...</div>
          <div class="loader"></div>
        </div>
      </body>
      </html>
    `;

    this.splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
    this.splashWindow.show();
    
    return this.splashWindow;
  }

  closeSplash() {
    if (this.splashWindow && !this.splashWindow.isDestroyed()) {
      this.splashWindow.close();
      this.splashWindow = null;
    }
  }

  _validateBounds(state) {
    const displays = screen.getAllDisplays();
    let isOnScreen = false;

    if (state.x !== undefined && state.y !== undefined) {
      for (const display of displays) {
        const { x, y, width, height } = display.bounds;
        if (state.x >= x && state.x < x + width && state.y >= y && state.y < y + height) {
          isOnScreen = true;
          break;
        }
      }
    }

    if (isOnScreen) {
      return {
        x: state.x,
        y: state.y,
        width: state.width || WINDOW.main.width,
        height: state.height || WINDOW.main.height,
      };
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const width = state.width || WINDOW.main.width;
    const height = state.height || WINDOW.main.height;

    return {
      width,
      height,
      x: Math.floor((screenWidth - width) / 2),
      y: Math.floor((screenHeight - height) / 2),
    };
  }

  _trackWindowState() {
    if (!this.mainWindow) return;

    const saveState = () => {
      if (this.mainWindow.isDestroyed()) return;
      
      const bounds = this.mainWindow.getBounds();
      stores.windowState.merge({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: this.mainWindow.isMaximized(),
      });
    };

    this.mainWindow.on('resize', saveState);
    this.mainWindow.on('move', saveState);
    this.mainWindow.on('maximize', saveState);
    this.mainWindow.on('unmaximize', saveState);
  }

  focusMainWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }

  getMainWindow() {
    return this.mainWindow;
  }
}

const windowManager = new WindowManager();

module.exports = { windowManager, WindowManager };
