import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import ejs from "ejs";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const server = express();
const port = process.env.PORT;

const pool = new pg.Pool({
  user: `${process.env.DB_USER}`,
  host: `${process.env.DB_HOST}`,
  database: `${process.env.DB_DATABASE}`,
  password: `${process.env.DB_PASSWORD}`,
  port: process.env.DB_PORT,
});

server.set("view engine", "ejs");
server.use(express.static("public"));
server.use(bodyParser.urlencoded({ extended: true }));

async function searchBook(str, page) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: `${str}`,
          key: process.env.API_KEY,
          langRestrict: "en",
          maxResults: 10,
          printType: "books",
          projection: "full",
          startIndex: page * 10,
        },
      }
    );
    return response.data.items;
  } catch (error) {
    console.error(error.message || error.code);
    return [];
  }
}

server.get("/", async (req, res) => {
  const user = await pool.query(`SELECT * FROM users`);
  const users = user.rows;
  const book = await pool.query(`SELECT * FROM books`);
  const books = book.rows;

  res.render("index", { title: "BreView", books: books });
});

server.get("/search", async (req, res) => {
  const query = req.query.q || "";
  const page = Number(req.query.page) || 0;
  const books = await searchBook(query, page);

  if (books.length === 0) {
    return res.render("search", { q: query, page: page, results: [] });
  }
  res.render("search", { q: query, page: page, results: books });
});

server.get("/books/add/:id", async (req, res) => {
  const bookId = req.params.id;
  console.log({ bookId });

  const response = await axios.get(
    `https://www.googleapis.com/books/v1/volumes/${bookId}`,
    {
      params: { key: process.env.API_KEY },
    }
  );
  const bookData = response.data;
  const book = bookData;

  await pool.query(
    `
  INSERT INTO books (
    gb_id, title, author_names, categories, pub_date, description, pg_count,
    book_type, isbn_13, m_rating, thumbnail, language, g_link
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
  ON CONFLICT (g_link) DO NOTHING
  `,
    [
      book.id,
      book.volumeInfo.title || "Untitled",
      book.volumeInfo.authors || [],
      book.volumeInfo.categories || [],
      book.volumeInfo.publishedDate || null,
      book.volumeInfo.description || null,
      book.volumeInfo.pageCount || null,
      book.volumeInfo.printType || null,
      book.volumeInfo.industryIdentifiers?.find((i) => i.type === "ISBN_13")
        ?.identifier || null,
      book.volumeInfo.averageRating || null,
      book.volumeInfo.imageLinks?.thumbnail || null,
      book.volumeInfo.language || "en",
      book.volumeInfo.infoLink || null,
      // Fix some values are off
    ]
  );

  res.redirect("/");
});

server.listen(port, (err) => {
  if (err) console.log("Error while starting server :", err);
  console.log(`Server is running at http://localhost:${port}`);
});
