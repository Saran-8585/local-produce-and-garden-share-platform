const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'database.sqlite');

let inner;
let db;

function normalizeParams(args) {
  if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) && args[0] !== null) {
    return args[0];
  }
  return args;
}

class StatementWrapper {
  #inner;
  #sql;

  constructor(sqlJsDb, sql) {
    this.#inner = sqlJsDb;
    this.#sql = sql;
  }

  run(...args) {
    const params = normalizeParams(args);
    this.#inner.run(this.#sql, params === undefined ? undefined : params);
    const meta = this.#inner.exec('SELECT last_insert_rowid() as id, changes() as changes');
    saveDb();
    const [id, changes] = meta[0].values[0];
    return { lastInsertRowid: Number(id), changes: Number(changes) };
  }

  get(...args) {
    const params = normalizeParams(args);
    const stmt = this.#inner.prepare(this.#sql);
    stmt.bind(params);
    let row;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  all(...args) {
    const params = normalizeParams(args);
    const stmt = this.#inner.prepare(this.#sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
}

function saveDb() {
  try {
    const data = inner.export();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.error('Failed to save database:', err.message);
  }
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
}

async function connectDB() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    inner = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    inner = new SQL.Database();
  }

  db = {
    prepare(sql) { return new StatementWrapper(inner, sql); },
    exec(sql) {
      inner.exec(sql);
      saveDb();
    },
    pragma(str) {
      try { inner.exec(`PRAGMA ${str}`); } catch {}
    },
  };

  db.pragma('foreign_keys = ON');
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

  return db;
}

module.exports = { getDB, connectDB };
