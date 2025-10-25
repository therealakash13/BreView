-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  book_id TEXT NOT NULL,
  image TEXT,
  title TEXT NOT NULL,
  author_name VARCHAR(45)[],
  publish_date TEXT,
  description TEXT,
  rating NUMERIC(2,1),
  review TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- SESSION TABLE (for express-session / connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);