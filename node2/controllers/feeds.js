const mongoose = require("mongoose");
const Users = require("../models/Users");
const Redis = require("redis");
const { trace, context, propagation } = require("@opentelemetry/api");
const pool = require("../database/mysql");


const redisClient = Redis.createClient({ 
  host: 'redis-server', // This should match the service name in docker-compose.yaml
  port: 6379,
});



redisClient.connect();
redisClient.on('error', err => console.log('Redis Client Error', err))
redisClient.on('end', () => {
   console.log('Redis connection ended');
})

const createPost = async (req, res) => {

  /// TELEMTRY
  const ctx = propagation.extract(context.active(), req.headers); 
  const tracer = trace.getTracer("express-tracer");
  console.log("Incoming request headers:", req.headers);
  console.log(
    "Extracted span from context:",
    trace.getSpan(ctx)?.spanContext()
  ); // Retrieve span from extracted context

  const span = tracer.startSpan(
    "node-2-get-posts",
    {
      attributes: { "http.method": "GET", "http.url": req.url },
    },
    ctx
  );  

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

  span.end();
};

const getPostsExceptCurrentUser = async (req, res) => {

  /// TELEMTRY
  const ctx = propagation.extract(context.active(), req.headers); 
  const tracer = trace.getTracer("express-tracer");
  console.log("Incoming request headers:", req.headers);
  console.log(
    "Extracted span from context:",
    trace.getSpan(ctx)?.spanContext()
  ); // Retrieve span from extracted context

  const span = tracer.startSpan(
    "node-2-get-posts",
    {
      attributes: { "http.method": "GET", "http.url": req.url },
    },
    ctx
  );  

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
  span.end();
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
