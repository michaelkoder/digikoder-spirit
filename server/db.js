const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'data', 'digikoder.db');

// ensure data dir exists
const fs = require('fs');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// Run init.sql if database is empty (no tables)
const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='contents';").get();
if (!row) {
  const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  db.exec(initSql);
  console.log('Initialized SQLite DB at', DB_PATH);
}

module.exports = db;
