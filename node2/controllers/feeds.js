const mongoose = require("mongoose");
const Users = require("../models/Users");
const Redis = require("redis");
const { trace, context, propagation } = require("@opentelemetry/api");
const pool = require("../database/mysql");


const redisClient = Redis.createClient();

redisClient.connect();

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
    "node-2-create-posts",
    {
      attributes: { "http.method": "POST", "http.url": req.url },
    },
    ctx
  );  
  
  const { id, content } = req.body;
  try {
    const userSpan = tracer.startSpan("find-user-from-mongo", { 
      parent: span,
    });
    const user = await Users.findOne({ id: id });
    userSpan.end();

    const setMongoSpan = tracer.startSpan("set-post-to-mongo", {
      parent: span,
    });
    if (user) {
      user.posts.push({ content });
      await user.save();      
      setMongoSpan.end();
      res.status(201).json(user);      
    } else {
      const newUserSpan = tracer.startSpan("create-new-user-in-mongo", {
        parent: span,
      });
      const newUser = new Users({
        id,
        posts: [{ content }],
      });
      await newUser.save();
      newUserSpan.end();
      res.status(201).json(newUser);
    }

    const redisSpan = tracer.startSpan("reset-redis-cache", {
      parent: span,
    });
    await redisClient.FLUSHALL();
    redisSpan.end();
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
    "node-2-get-posts-from-mongo",
    {
      attributes: { "http.method": "GET", "http.url": req.url },
    },
    ctx
  );  

  const redisSpan = tracer.startSpan("check-from-redis-cache", {
    parent: span,
  });
  
  const posts = await redisClient.get(req.params.id);

  if (posts) {
    console.log("from redis");
    return res.status(200).json(JSON.parse(posts));
  }

  redisSpan.end();

  const mongoSpan = tracer.startSpan("get-from-mongo", {
    parent: span,
  });

  const { id } = req.params;
  try {
    const findUserSpan = tracer.startSpan("find-user-from-mongo", {
      parent: mongoSpan,
    });
    const users = await Users.find({ id: { $ne: id } });
    findUserSpan.end();
    const redisSpan = tracer.startSpan("set-to-redis-cache", {
      parent: span,
    });
    redisClient.set(
      req.params.id,
      JSON.stringify(users),
      function (err, reply) {
        console.log(reply);
      }
    );
    redisSpan.end();
    console.log("from mongodb");
    res.status(200).json(users);
    mongoSpan.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }  
  span.end();
};  

const getAllPosts = async (req, res) => {

  const ctx = propagation.extract(context.active(), req.headers); 
  const tracer = trace.getTracer("express-tracer");
  console.log("Incoming request headers:", req.headers);
  console.log(
    "Extracted span from context:",
    trace.getSpan(ctx)?.spanContext()
  ); // Retrieve span from extracted context

  const span = tracer.startSpan(
    "mysql-get-posts",
    {
      attributes: { "http.method": "GET", "http.url": req.url },
    },
    ctx
  );

  const { id } = req.params;
  try {
    let sql = `SELECT * FROM posts WHERE userId != ${id}`;
    
    const mysqlSpan = tracer.startSpan("mysql-fetchposts-query", {
      parent: span,
    });
    const response = await pool.query(sql);
    mysqlSpan.end();

    span.end();
    res.status(200).json(response[0]);
  } catch (error) {
    span.end();
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getPostsExceptCurrentUser, getAllPosts };
