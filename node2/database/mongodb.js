//var mongoURL = "mongodb://127.0.0.1:27017/devops";
// connect to the database
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

var mongoURL = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/`;

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
