var mongoURL = "mongodb://localhost:27017/devops";
// connect to the database
const mongoose = require("mongoose");
mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("Connected to Mongo DB!");
  })
  .catch((error) => {
    console.log("Connection failed!", error);
    process.exit();
  });
