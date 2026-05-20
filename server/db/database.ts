import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'game.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS game_saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    save_name TEXT NOT NULL,
    story_id TEXT NOT NULL,
    story_title TEXT NOT NULL,
    player_attributes TEXT NOT NULL,
    messages TEXT NOT NULL,
    current_npc TEXT,
    phase TEXT DEFAULT 'phase_1',
    emotion TEXT DEFAULT 'neutral',
    choices TEXT DEFAULT '[]',
    message_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_saves_user ON game_saves(user_id);
  CREATE INDEX IF NOT EXISTS idx_saves_story ON game_saves(user_id, story_id);
`)

export default db

// ===== User operations =====

export function createUser(username: string, passwordHash: string) {
  const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
  return stmt.run(username, passwordHash)
}

export function getUserByUsername(username: string) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
}

export function getUserById(id: number) {
  return db.prepare('SELECT id, username, created_at, last_login FROM users WHERE id = ?').get(id) as any
}

export function updateLastLogin(userId: number) {
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(userId)
}

// ===== Save operations =====

export function createSave(userId: number, data: {
  saveName: string
  storyId: string
  storyTitle: string
  playerAttributes: string
  messages: string
  currentNPC: string | null
  phase: string
  emotion: string
  choices: string
  messageCount: number
}) {
  const stmt = db.prepare(`
    INSERT INTO game_saves (user_id, save_name, story_id, story_title, player_attributes, messages, current_npc, phase, emotion, choices, message_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    userId, data.saveName, data.storyId, data.storyTitle,
    data.playerAttributes, data.messages, data.currentNPC,
    data.phase, data.emotion, data.choices, data.messageCount
  )
}

export function updateSave(saveId: number, userId: number, data: {
  saveName?: string
  playerAttributes?: string
  messages?: string
  currentNPC?: string | null
  phase?: string
  emotion?: string
  choices?: string
  messageCount?: number
}) {
  const fields: string[] = []
  const values: any[] = []

  if (data.saveName !== undefined) { fields.push('save_name = ?'); values.push(data.saveName) }
  if (data.playerAttributes !== undefined) { fields.push('player_attributes = ?'); values.push(data.playerAttributes) }
  if (data.messages !== undefined) { fields.push('messages = ?'); values.push(data.messages) }
  if (data.currentNPC !== undefined) { fields.push('current_npc = ?'); values.push(data.currentNPC) }
  if (data.phase !== undefined) { fields.push('phase = ?'); values.push(data.phase) }
  if (data.emotion !== undefined) { fields.push('emotion = ?'); values.push(data.emotion) }
  if (data.choices !== undefined) { fields.push('choices = ?'); values.push(data.choices) }
  if (data.messageCount !== undefined) { fields.push('message_count = ?'); values.push(data.messageCount) }

  fields.push("updated_at = datetime('now')")
  values.push(saveId, userId)

  const stmt = db.prepare(`UPDATE game_saves SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
  return stmt.run(...values)
}

export function getSavesByUser(userId: number) {
  return db.prepare(`
    SELECT id, save_name, story_id, story_title, message_count, phase, created_at, updated_at
    FROM game_saves
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `).all(userId)
}

export function getSavesByUserAndStory(userId: number, storyId: string) {
  return db.prepare(`
    SELECT id, save_name, story_id, story_title, message_count, phase, created_at, updated_at
    FROM game_saves
    WHERE user_id = ? AND story_id = ?
    ORDER BY updated_at DESC
  `).all(userId, storyId)
}

export function getSaveById(saveId: number, userId: number) {
  return db.prepare(`
    SELECT * FROM game_saves WHERE id = ? AND user_id = ?
  `).get(saveId, userId) as any
}

export function deleteSave(saveId: number, userId: number) {
  return db.prepare('DELETE FROM game_saves WHERE id = ? AND user_id = ?').run(saveId, userId)
}
