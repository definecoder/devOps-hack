const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

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
  res.send("Getting posts");
  // ekhane node 2 er server e request pathabo
});

app.post("/create-post", (req, res) => {
  res.send("Creating post");
  // ekhane node 2 er server e request pathabo
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
