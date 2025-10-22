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
  // const user = await pool.query(`SELECT * FROM users`);
  // const users = user.rows;
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
  try {
    const bookId = req.params.id;

    if (bookId === "" || bookId === undefined || bookId === null)
      throw new Error("Book id not found.");

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`,
      {
        params: { key: process.env.API_KEY, projection: "lite" },
      }
    );

    if (!response) throw new Error("Book not found.");

    const bookData = response.data;
    // console.log(bookData);

    const book = {
      id: bookData.id,
      title: bookData.volumeInfo.title,
      authors: bookData.volumeInfo.authors,
      publishDate: bookData.volumeInfo.publishedDate,
      description: bookData.volumeInfo.description,
      bookCover:
        bookData.volumeInfo.imageLinks.extraLarge ||
        bookData.volumeInfo.imageLinks.large ||
        bookData.volumeInfo.imageLinks.medium ||
        bookData.volumeInfo.imageLinks.small ||
        bookData.volumeInfo.imageLinks.thumbnail ||
        bookData.volumeInfo.imageLinks.smallThumbnail,
    };

    console.log(book);

    await pool.query(
      `
    INSERT INTO books (
      book_id, image, title, author_name, publish_date, description
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    `,
      [
        book.id,
        book.bookCover,
        book.title,
        book.authors,
        book.publishDate,
        book.description,
      ]
    );

    res.redirect("/");
  } catch (err) {
    console.log(err.message || err.code);
  }
});

server.get("/review/:id", async (req, res) => {
  const bookId = Number(req.params.id);
  const book = await pool.query(`SELECT * FROM books WHERE id = ${bookId}`);
  res.render("review", { book: book.rows[0] });
});

server.post("/review/:id", async (req, res) => {
  try {
    const rating = req.body.rating;
    const review = req.body.review;
    const id = req.params.id;

    if (review === "" || !id)
      throw new Error("insufficient information provided.");

    await pool.query(
      `
      UPDATE books
      SET review = $1, rating = $2
      WHERE id = $3;
      `,
      [review, rating, id]
    );

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

server.get("/remove/:id", async (req, res) => {
  await pool.query(`DELETE FROM books WHERE id = $1`, [req.params.id]);
  res.redirect("/");
});

server.listen(port, (err) => {
  if (err) console.log("Error while starting server :", err);
  console.log(`Server is running at http://localhost:${port}`);
});
