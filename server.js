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

async function searchBook(str) {
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
        },
      }
    );
    console.log(response.data);
    // Todo: Paginate using startIndex and maxResults
    return response.data.items;
  } catch (error) {
    console.error(error);
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
  res.render("search", { results: [], q: "" });
});

server.post("/search", async (req, res) => {
  const searchString = req.body.q;
  const bookRes = await searchBook(searchString);

  res.render("search", { results: bookRes, q: searchString });
});

server.listen(port, (err) => {
  if (err) console.log("Error while starting server :", err);
  console.log(`Server is running at http://localhost:${port}`);
});
