const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'local_produce.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      neighbourhood TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avg_rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      total_listings INTEGER DEFAULT 0,
      total_exchanges INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
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
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      status TEXT DEFAULT 'Available' CHECK(status IN ('Available','Unavailable')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exchange_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      requester_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      message TEXT DEFAULT '',
      offered_listing_id INTEGER,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending','Accepted','Declined','Completed','Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (offered_listing_id) REFERENCES listings(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exchange_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      reviewee_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (exchange_id) REFERENCES exchange_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(exchange_id, reviewer_id, reviewee_id)
    );
  `);
}

module.exports = { db, initializeDatabase };
