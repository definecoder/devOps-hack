const mysql = require("mysql2");

const pool = mysql
  .createPool({
    host: process.env.DB_MYSQL_HOST,
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
    database: process.env.DB_MYSQL_DATABASE,
  })
  .promise();

module.exports = pool;
