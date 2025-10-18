-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    personal_rating NUMERIC(2,1),
    personal_review TEXT,
    accent TEXT
);

-- AUTHORS TABLE
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    openlib_ids TEXT[],               -- e.g. ["OL23919A"]
    year_of_publish INTEGER
);

-- BOOKS TABLE
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
    book_key TEXT,                    -- Open Library key, e.g. "OL82563W"
    title VARCHAR(200) NOT NULL,
    cover_img TEXT,                   -- cover_i or URL
    edition_count INTEGER,
    number_of_pages INTEGER,
    online_rating NUMERIC(2,1),
    book_type VARCHAR(50),
    first_sentence TEXT,
    google_ids TEXT[],
    amazon_ids TEXT[],
    languages TEXT[]
);
