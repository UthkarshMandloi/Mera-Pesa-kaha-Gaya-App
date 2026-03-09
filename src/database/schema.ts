// src/database/schema.ts
import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('merapaisa.db');

export const initializeDatabase = () => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');

    db.execSync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        is_custom INTEGER DEFAULT 0
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        tag_id INTEGER,
        note TEXT,
        date TEXT NOT NULL,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE SET NULL
      );
    `);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const seedInitialData = () => {
  try {
    db.execSync(`DELETE FROM tags WHERE name = 'Parent Allowance';`);

    db.execSync(`
      INSERT OR IGNORE INTO tags (id, name, is_custom) VALUES 
      (1, 'Food', 0),
      (2, 'Travel', 0),
      (3, 'Stationery', 0),
      (4, 'Other Earnings', 0),
      (5, 'Investment', 0);
    `);

    db.execSync(`
      INSERT OR IGNORE INTO settings (key, value) VALUES ('app_password', '');
    `);
    console.log('Initial data seeded!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};