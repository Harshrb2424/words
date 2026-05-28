-- D1 Database Schema for Quote Archive

CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_text TEXT UNIQUE NOT NULL,
    author TEXT NOT NULL,
    source TEXT NOT NULL,
    language TEXT NOT NULL,
    ai_context TEXT NOT NULL,
    tags TEXT NOT NULL, -- JSON array of strings
    related_quote_ids TEXT NOT NULL, -- JSON array of integers (IDs of similar quotes)
    color TEXT -- Nullable hex color based on theme
);
