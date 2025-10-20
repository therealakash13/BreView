-- USERS TABLE
CREATE TABLE users (
    id                  SERIAL              PRIMARY KEY,
    name                VARCHAR(50)         UNIQUE                      NOT NULL,
    accent              TEXT
);

-- AUTHORS TABLE
CREATE TABLE authors (
    id                  SERIAL              PRIMARY KEY,
    name                VARCHAR(100)        NOT NULL,
    key                 TEXT,               
    top_work            TEXT,
    work_count          INTEGER
);

-- BOOKS TABLE
CREATE TABLE books (
    id                  SERIAL              PRIMARY KEY,
    user_id             INTEGER             REFERENCES users(id)        ON DELETE SET NULL,
    author_id           INTEGER             REFERENCES authors(id)      ON DELETE SET NULL,
    gb_id               TEXT,                    
    title               TEXT                NOT NULL,
    author_names        TEXT[],
    categories          TEXT[]                   
    pub_date            VARCHAR(10),
    description         TEXT,
    pg_count            INTEGER,
    book_type           VARCHAR(50),
    isbn_13             VARCHAR(13),
    m_rating            TEXT,
    thumbnail           TEXT,
    language            CHAR(3),
    g_link              TEXT                 UNIQUE                
);

-- USER REVIEWS
CREATE TABLE reviews (
    id                  SERIAL                PRIMARY KEY,
    user_id             INTEGER               REFERENCES users(id) ON DELETE CASCADE,
    book_id             INTEGER               REFERENCES books(id) ON DELETE CASCADE,
    rating              NUMERIC(2,1)          CHECK (rating BETWEEN 0 AND 5),
    review              TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id,book_id)
);

-- TODO Fix the tables and create db according to the Googles Books API