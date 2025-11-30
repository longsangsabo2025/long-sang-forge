/**
 * 📝 Simple Logger
 * 
 * Console-based logger for desktop application.
 */

const isDev = process.env.NODE_ENV !== 'production';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function createLogger(name) {
  const prefix = `[${name}]`;
  
  return {
    info: (...args) => {
      console.log(`${colors.cyan}${prefix}${colors.reset}`, ...args);
    },
    warn: (...args) => {
      console.log(`${colors.yellow}${prefix} ⚠️${colors.reset}`, ...args);
    },
    error: (...args) => {
      console.log(`${colors.red}${prefix} ❌${colors.reset}`, ...args);
    },
    success: (...args) => {
      console.log(`${colors.green}${prefix} ✅${colors.reset}`, ...args);
    },
    debug: (...args) => {
      if (isDev) {
        console.log(`${colors.gray}${prefix}${colors.reset}`, ...args);
      }
    },
  };
}

const logger = createLogger('App');

const loggers = {
  main: createLogger('Main'),
  window: createLogger('Window'),
  service: createLogger('Service'),
  ipc: createLogger('IPC'),
  tray: createLogger('Tray'),
};

module.exports = { logger, loggers, createLogger };
