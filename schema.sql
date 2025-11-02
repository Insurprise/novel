-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS bookmarks; -- NEW
DROP TABLE IF EXISTS reading_progress;
DROP TABLE IF EXISTS webdav_config;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WebDAV configuration table (only one row, for the admin)
CREATE TABLE webdav_config (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Enforce only one row
    url TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL -- Note: In a real-world app, use wrangler secrets for this
);

-- Reading progress table
CREATE TABLE reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_identifier TEXT NOT NULL, -- e.g., the file path on WebDAV
    cfi TEXT NOT NULL, -- EPUB CFI string for location
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, book_identifier)
);

-- NEW: Bookmarks table
CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_identifier TEXT NOT NULL, -- e.g., the file path on WebDAV
    cfi TEXT NOT NULL, -- The exact CFI of the bookmark
    label TEXT, -- A user-defined label, e.g., "Chapter 5" or "Favorite part"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, book_identifier, cfi) -- A user can't bookmark the same spot twice
);