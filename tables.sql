-- USERS TABLE
-- CREATE TABLE users (
--     id                  SERIAL              PRIMARY KEY,
--     name                VARCHAR(50)         UNIQUE                      NOT NULL,
--     accent              TEXT
-- );

-- BOOKS TABLE
CREATE TABLE books (
    id              SERIAL PRIMARY KEY,
    image           TEXT,
    title           TEXT NOT NULL,
    author_name     VARCHAR(45)[],
    publish_date    TEXT,
    description     TEXT,
    rating          CHAR(10),
    review          TEXT
);

-- TODO Fix the tables and create db according to the Googles Books API