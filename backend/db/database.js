const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'database.sqlite');

let db;

function getDB() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      neighbourhood TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avg_rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      total_listings INTEGER DEFAULT 0,
      total_exchanges INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      produce_name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Vegetables','Fruits','Herbs','Seeds & Saplings','Flowers','Other')),
      description TEXT DEFAULT '',
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      exchange_type TEXT NOT NULL CHECK(exchange_type IN ('Free','Swap','Both')),
      swap_for TEXT DEFAULT '',
      harvest_date TEXT NOT NULL,
      available_until TEXT NOT NULL,
      location_name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'Available' CHECK(status IN ('Available','Unavailable')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exchange_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT DEFAULT '',
      offered_listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Accepted','Declined','Completed','Cancelled')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exchange_id INTEGER NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(exchange_id, reviewer_id, reviewee_id)
    );

    CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
    CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
    CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
    CREATE INDEX IF NOT EXISTS idx_exchange_requests_listing ON exchange_requests(listing_id);
    CREATE INDEX IF NOT EXISTS idx_exchange_requests_requester ON exchange_requests(requester_id);
    CREATE INDEX IF NOT EXISTS idx_exchange_requests_owner ON exchange_requests(owner_id);
    CREATE INDEX IF NOT EXISTS idx_exchange_requests_status ON exchange_requests(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
  `);
}

async function connectDB() {
  getDB();
  console.log('SQLite connected successfully');
  return db;
}

module.exports = { getDB, connectDB };
