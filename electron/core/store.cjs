/**
 * 💾 Simple Store
 * 
 * JSON file-based persistent storage.
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('./config.cjs');

// Ensure config directory exists
if (!fs.existsSync(PATHS.config)) {
  fs.mkdirSync(PATHS.config, { recursive: true });
}

class Store {
  constructor(name, defaults = {}) {
    this.name = name;
    this.path = path.join(PATHS.config, `${name}.json`);
    this.defaults = defaults;
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.path)) {
        const content = fs.readFileSync(this.path, 'utf-8');
        return { ...this.defaults, ...JSON.parse(content) };
      }
    } catch (error) {
      console.error(`Error loading store ${this.name}:`, error);
    }
    return { ...this.defaults };
  }

  _save() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error(`Error saving store ${this.name}:`, error);
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
    return this;
  }

  getAll() {
    return { ...this.data };
  }

  merge(obj) {
    this.data = { ...this.data, ...obj };
    this._save();
    return this;
  }

  delete(key) {
    delete this.data[key];
    this._save();
    return this;
  }

  clear() {
    this.data = { ...this.defaults };
    this._save();
    return this;
  }
}

// Pre-configured stores
const stores = {
  settings: new Store('settings', {
    theme: 'dark',
    language: 'vi',
    autoStart: false,
    minimizeToTray: true,
  }),
  windowState: new Store('window-state', {
    width: 1400,
    height: 900,
    isMaximized: false,
  }),
};

module.exports = { Store, stores };
