CREATE TABLE IF NOT EXISTS preparations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reagent_id INTEGER REFERENCES reagents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    protocol TEXT,
    concentration TEXT,
    volume REAL,
    unit TEXT DEFAULT 'mL',
    prepared_by INTEGER REFERENCES users(id),
    date_prepared TEXT DEFAULT (datetime('now')),
    expiration_date TEXT,
    parent_reagents TEXT DEFAULT '[]',
    notes TEXT
);
