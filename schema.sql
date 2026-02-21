DROP TABLE IF EXISTS usage_log;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS preparations;
DROP TABLE IF EXISTS reagents;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6c757d'
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'member',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE reagents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cas_number TEXT,
    catalog_number TEXT,
    lot_number TEXT,
    vendor TEXT,
    category_id INTEGER REFERENCES categories(id),
    storage_location TEXT,
    storage_temp TEXT,
    current_stock REAL DEFAULT 0,
    unit TEXT DEFAULT 'units',
    minimum_threshold REAL DEFAULT 1,
    price_per_unit REAL,
    expiration_date TEXT,
    notes TEXT,
    qr_code TEXT,
    date_added TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reagent_id INTEGER NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    quantity_used REAL NOT NULL,
    date TEXT DEFAULT (datetime('now')),
    notes TEXT
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reagent_id INTEGER REFERENCES reagents(id) ON DELETE SET NULL,
    vendor TEXT,
    catalog_number TEXT,
    quantity REAL,
    price REAL,
    po_number TEXT,
    date_ordered TEXT,
    date_received TEXT,
    ordered_by INTEGER REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    notes TEXT
);
