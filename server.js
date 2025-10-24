import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import ejs from "ejs";
import bodyParser from "body-parser";
import axios from "axios";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

dotenv.config();

const server = express();
const pgSession = connectPgSimple(session);
const port = process.env.PORT;

const pool = new pg.Pool({
  user: `${process.env.DB_USER}`,
  host: `${process.env.DB_HOST}`,
  database: `${process.env.DB_DATABASE}`,
  password: `${process.env.DB_PASSWORD}`,
  port: process.env.DB_PORT,
});

server.use(
  session({
    store: new pgSession({ pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

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

function ensureAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/auth/login");
  next();
}

server.get("/", ensureAuth, async (req, res) => {
  const userId = req.session.userId;
  const book = await pool.query(`SELECT * FROM books WHERE user_id = $1`, [
    userId,
  ]);
  const books = book.rows;
  res.render("index", {
    title: "BreView",
    books: books,
    userId: req.session.userId,
  });
});

server.get("/search", ensureAuth, async (req, res) => {
  const query = req.query.q || "";
  const page = Number(req.query.page) || 0;
  const books = await searchBook(query, page);

  if (books.length === 0) {
    return res.render("search", {
      q: query,
      page: page,
      results: [],
      userId: req.session.userId,
    });
  }

  res.render("search", {
    q: query,
    page: page,
    results: books,
    userId: req.session.userId,
  });
});

server.get("/books/add/:id", ensureAuth, async (req, res) => {
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
      description: bookData.volumeInfo.description.replace(/<[^>]+>/g, ""), // Data incoming is in pure html so have to remove all the tags
      bookCover:
        bookData.volumeInfo.imageLinks.extraLarge ||
        bookData.volumeInfo.imageLinks.large ||
        bookData.volumeInfo.imageLinks.medium ||
        bookData.volumeInfo.imageLinks.small ||
        bookData.volumeInfo.imageLinks.thumbnail ||
        bookData.volumeInfo.imageLinks.smallThumbnail,
    };

    await pool.query(
      `
    INSERT INTO books (
      book_id, image, title, author_name, publish_date, description, user_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
      [
        book.id,
        book.bookCover,
        book.title,
        book.authors,
        book.publishDate,
        book.description,
        req.session.userId,
      ]
    );

    res.redirect("/");
  } catch (err) {
    console.log(err.message || err.code);
  }
});

server.get("/review/:id", ensureAuth, async (req, res) => {
  const bookId = Number(req.params.id);
  const book = await pool.query(`SELECT * FROM books WHERE id = ${bookId}`);
  res.render("review", { book: book.rows[0], userId: req.session.userId });
});

server.post("/review/:id", ensureAuth, async (req, res) => {
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

server.get("/remove/:id", ensureAuth, async (req, res) => {
  await pool.query(`DELETE FROM books WHERE id = $1`, [req.params.id]);
  res.redirect("/");
});

server.get("/about", (req, res) => {
  res.render("about", { userId: req.session.userId });
});

server.get("/auth/login", (req, res) => {
  res.render("login", { userId: req.session.userId });
});

server.get("/auth/register", (req, res) => {
  res.render("register");
});

server.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    if (req.body.password !== req.body.confirmPassword) {
      throw new Error("Passwords don't match. Retry...");
    }

    const salt = 12;
    const hash = await bcrypt.hash(password + process.env.PEPPER, salt);

    await pool.query(`INSERT INTO users (username,password) VALUES($1,$2)`, [
      username,
      hash,
    ]);
    return res.redirect("/auth/login");
  } catch (error) {
    console.log(error.message || error.code);
    return res.redirect("/auth/register");
  }
});

server.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const foundUser = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (foundUser.rowCount === 0)
      throw new Error("No user exists with this username. Register...");
    else if (foundUser.rowCount === 1) {
      const user = foundUser.rows[0];
      const match = await bcrypt.compare(
        password + process.env.PEPPER,
        user.password
      );

      if (match) {
        req.session.username = user.username;
        req.session.userId = user.id;
        console.log(`Welcome ${user.username}`);
        return res.redirect("/");
      } else if (match === false) throw new Error("Incorrect password...");
    } else if (foundUser.rowCount > 1) {
      throw new Error("Data redundancy in Database. Can't login...");
    }
  } catch (error) {
    console.log(error.message || error.code);
    return res.redirect("/auth/login");
  }
});

server.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

server.listen(port, (err) => {
  if (err) console.log("Error while starting server :", err);
  console.log(`Server is running at http://localhost:${port}`);
});
