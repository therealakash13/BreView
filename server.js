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

async function searchBook(str,page) {
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

server.get('/search',async(req,res)=>{
  const query = req.query.q || '';
  const page = Number(req.query.page) || 0;
  const books = await searchBook(query,page);

  if (books.length === 0) {
    return res.render('search',{q:query,page:page, results:[]})
  }
  res.render('search', {q:query,page:page, results:books });
})

server.listen(port, (err) => {
  if (err) console.log("Error while starting server :", err);
  console.log(`Server is running at http://localhost:${port}`);
});
