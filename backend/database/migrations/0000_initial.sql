-- Migration: Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL
); 