const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
require("./database/mongodb");
const {
  createPost,
  getPostsExceptCurrentUser,
  getAllPosts,
} = require("./controllers/feeds");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7080;

app.get("/get-posts/:id", getPostsExceptCurrentUser);

app.post("/create-post", createPost);

app.get("/get-all-posts-mysql/:id", getAllPosts);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
