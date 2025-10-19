import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import ejs from "ejs";
import bodyParser from "body-parser";
import axios from "axios";

dotenv.config();

const server = express();
const port = process.env.PORT;
const api = axios.create({
  baseURL: "https://openlibrary.org/search.json",
  params: {
    q: "harry potter",
    fields:
      "edition_key,edition_count,first_publish_year,key,language,number_of_pages_median,ratings_count,ratings_average,title,type,first_sentence,author_key,author_name,id_amazon,id_google,isbn",
    lang: "en",
    limit: 5,
  },
});

server.set("view engine", "ejs");
server.use(express.static("public"));
server.use(bodyParser.urlencoded({ extended: true }));

async function fetchBooks() {
  const response = await api.get();
  // console.log({ response: response.data.docs });
  return response.data.docs;
}

server.get("/", async (req, res) => {
  // await fetchBooks();
  res.render("index", { title: "BreView" });
});

server.get("/search", async(req,res)=>{
  const booksArray = await fetchBooks();

  res.render('search',{books: booksArray})
})

server.listen(port, (err) => {
  if (err) console.log("Error while starting server :", err);
  console.log(`Server is running at http://localhost:${port}`);
});
