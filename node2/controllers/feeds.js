const mongoose = require("mongoose");
const Users = require("../models/Users");
const Redis = require("redis");
const { trace, context, propagation } = require("@opentelemetry/api");

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

module.exports = { createPost, getPostsExceptCurrentUser };
