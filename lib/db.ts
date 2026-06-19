import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'life-rpg.db')

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS character (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL DEFAULT 'Hero',
    class TEXT NOT NULL DEFAULT 'Novice',
    level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    avatar TEXT DEFAULT '⚔️',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY DEFAULT 1,
    strength INTEGER NOT NULL DEFAULT 0,
    strength_xp INTEGER NOT NULL DEFAULT 0,
    strength_last_activity TEXT,
    endurance INTEGER NOT NULL DEFAULT 0,
    endurance_xp INTEGER NOT NULL DEFAULT 0,
    endurance_last_activity TEXT,
    discipline INTEGER NOT NULL DEFAULT 0,
    discipline_xp INTEGER NOT NULL DEFAULT 0,
    discipline_last_activity TEXT,
    knowledge INTEGER NOT NULL DEFAULT 0,
    knowledge_xp INTEGER NOT NULL DEFAULT 0,
    knowledge_last_activity TEXT,
    finance INTEGER NOT NULL DEFAULT 0,
    finance_xp INTEGER NOT NULL DEFAULT 0,
    finance_last_activity TEXT,
    social INTEGER NOT NULL DEFAULT 0,
    social_xp INTEGER NOT NULL DEFAULT 0,
    social_last_activity TEXT,
    creativity INTEGER NOT NULL DEFAULT 0,
    creativity_xp INTEGER NOT NULL DEFAULT 0,
    creativity_last_activity TEXT
  );

  CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    skill TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'active',
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quest_id INTEGER REFERENCES quests(id),
    description TEXT NOT NULL,
    skill TEXT NOT NULL,
    ai_xp INTEGER,
    ai_reasoning TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry TEXT NOT NULL,
    skill TEXT,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    level_up TEXT,
    type TEXT NOT NULL DEFAULT 'task',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS benchmarks_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill TEXT NOT NULL,
    benchmark_key TEXT NOT NULL,
    value REAL NOT NULL,
    level_granted INTEGER NOT NULL,
    verified_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Seed default character and skills if not present
const char = db.prepare('SELECT id FROM character WHERE id = 1').get()
if (!char) {
  db.prepare(`INSERT INTO character (id, name, class, level, total_xp) VALUES (1, 'Hero', 'Novice', 1, 0)`).run()
  db.prepare(`INSERT INTO skills (id) VALUES (1)`).run()
}

export default db
