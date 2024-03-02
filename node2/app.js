const express = require("express");
const app = express();
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();
require("./database/mongodb");
const {
  createPost,
  getPostsExceptCurrentUser,
  getAllPosts,
} = require("./controllers/feeds");
const { pool } = require("./database/mysql");

// Read the SQL file
const sqlFilePath = "./db.sql"; // Update the path to your SQL file
const sqlQueries = fs.readFileSync(sqlFilePath, "utf8");
const statements = sqlQueries.split(";");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// pool.query(sqlQueries, (err, result) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Database schema has been created");
//   }
// });
statements.forEach((statement) => {
  if (statement) {
    pool.query(statement, (err, result) => {
      if (err) {
        console.log(err);
      }
    });
  }
});
console.log("Database schema has been created");

const PORT = process.env.PORT || 7080;

app.get("/get-posts/:id", getPostsExceptCurrentUser);

app.post("/create-post", createPost);

app.get("/get-all-posts-mysql/:id", getAllPosts);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
