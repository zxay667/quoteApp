// Database module using better-sqlite3
// Initializes tables and exposes simple helper functions.

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite3');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
  )
`).run();

module.exports = {
  allQuotes() {
    const rows = db.prepare(`
      SELECT q.id, q.text, COALESCE(q.author, '') AS author, q.created_at,
             (SELECT COUNT(*) FROM comments c WHERE c.quote_id = q.id) AS comment_count
      FROM quotes q
      ORDER BY q.created_at DESC
    `).all();
    return rows;
  },
  getQuote(id) {
    return db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  },
  addQuote(text, author) {
    const info = db.prepare('INSERT INTO quotes (text, author) VALUES (?, ?)').run(text, author || null);
    return info.lastInsertRowid;
  },
  commentsForQuote(id) {
    return db.prepare('SELECT * FROM comments WHERE quote_id = ? ORDER BY created_at DESC').all(id);
  },
  addComment(quoteId, text, author) {
    const info = db.prepare('INSERT INTO comments (quote_id, text, author) VALUES (?, ?, ?)').run(quoteId, text, author || null);
    return info.lastInsertRowid;
  }
};
