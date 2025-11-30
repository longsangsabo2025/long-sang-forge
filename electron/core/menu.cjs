/**
 * 📋 Application Menu
 * 
 * Creates the native application menu.
 */

const { Menu, app, shell } = require('electron');
const { isDev, APP_INFO } = require('./config.cjs');
const { windowManager } = require('./window-manager.cjs');

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' },
        ]),
      ],
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' },
        ] : [
          { role: 'close' },
        ]),
      ],
    },

    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: '🌐 Visit Website',
          click: async () => {
            await shell.openExternal(APP_INFO.website);
          },
        },
        {
          label: '📚 Documentation',
          click: async () => {
            await shell.openExternal(`${APP_INFO.github}#readme`);
          },
        },
        { type: 'separator' },
        {
          label: '🐛 Report Bug',
          click: async () => {
            await shell.openExternal(`${APP_INFO.github}/issues`);
          },
        },
        { type: 'separator' },
        {
          label: `About ${APP_INFO.name}`,
          click: () => {
            const win = windowManager.getMainWindow();
            if (win) {
              const { dialog } = require('electron');
              dialog.showMessageBox(win, {
                type: 'info',
                title: `About ${APP_INFO.name}`,
                message: APP_INFO.name,
                detail: `Version: ${APP_INFO.version}\n\n${APP_INFO.description}\n\nAuthor: ${APP_INFO.author}`,
              });
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return menu;
}

module.exports = { createMenu };
