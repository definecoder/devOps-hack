const express = require("express");
const app = express();
const dotenv = require("dotenv");
require("./database/mongodb");
const {
  getPosts,
  createPost,
  getPostsExceptCurrentUser,
} = require("./controllers/feeds");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7080;

app.get("/get-posts/:id", getPostsExceptCurrentUser);

app.post("/create-post", createPost);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
