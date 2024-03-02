const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { default: axios } = require("axios");
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7070;

const validateUser = async (id) => {
  return new Promise((resolve, reject) => {
    console.log("User id is: ", id);
    console.log("Validating user");
    setTimeout(() => {
      console.log("User is validated");
      resolve();
    }, 2000);
  });
};

app.get("/get-posts/:id", async (req, res) => {
  await validateUser(req.params.id);
  console.log("Fetching posts");
  const response = await axios.get(
    "http://127.0.0.1:7080/get-posts/" + req.params.id
  );
  res.send(response.data);
});

app.post("/create-post", async (req, res) => {
  // res.send("Creating post");

  console.log(req.body);
  const response = await axios.post(
    "http://127.0.0.1:7080/create-post",
    req.body
  );
  res.send(response.data);
});

app.get("/get-all-posts-mysql/:id", async (req, res) => {
  console.log("Fetching posts from mysql");
  const response = await axios.get(
    "http://localhost:7080/get-all-posts-mysql/" + req.params.id
  );
  res.send(response.data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
