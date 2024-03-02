const mongoose = require("mongoose");
const Users = require("../models/Users");
const Redis = require("redis");
const pool = require("../database/mysql");

const redisClient = Redis.createClient();

redisClient.connect();

const createPost = async (req, res) => {
  const { id, content } = req.body;
  try {
    const user = await Users.findOne({ id: id });
    if (user) {
      user.posts.push({ content });
      await user.save();
      res.status(201).json(user);
    } else {
      const newUser = new Users({
        id,
        posts: [{ content }],
      });
      await newUser.save();
      res.status(201).json(newUser);
    }

    await redisClient.FLUSHALL();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostsExceptCurrentUser = async (req, res) => {
  const posts = await redisClient.get(req.params.id);

  if (posts) {
    console.log("from redis");
    return res.status(200).json(JSON.parse(posts));
  }

  const { id } = req.params;
  try {
    const users = await Users.find({ id: { $ne: id } });
    redisClient.set(
      req.params.id,
      JSON.stringify(users),
      function (err, reply) {
        console.log(reply);
      }
    );
    console.log("from mongodb");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  const { id } = req.params;
  try {
    let sql = `SELECT * FROM posts WHERE userId != ${id}`;
    const response = await pool.query(sql);

    res.status(200).json(response[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getPostsExceptCurrentUser, getAllPosts };
