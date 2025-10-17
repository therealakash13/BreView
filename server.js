import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import ejs from "ejs";
import bodyParser from "body-parser";

dotenv.config();

const server = express();
const port = process.env.PORT;

server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static("public"));
server.set("view engine", "ejs");
server.set("view options", { layout: "layout.ejs" });

server.get("/", (req, res) => {
  res.render("index.ejs", { title: "BreView" });
});

server.listen(port, (err) => {
  if (err) {
    console.log("Error while starting server :", err);
  }
  console.log(`Server is running at http://localhost:${port}`);
});
