const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
require("./database/mongodb");
const {
  createPost,
  getPostsExceptCurrentUser,
  getAllPosts,
} = require("./controllers/feeds");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TELEMETRY //////////////////////////////////////////
const configureOpenTelemetry = require("./tracing");
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("node-2-heavy"); // add service name here

app.use((req, res, next) => {
  const tracer = tracerProvider.getTracer("express-tracer");
  const span = tracer.startSpan("node-2-root-span");

  // Add custom attributes or log additional information if needed
  span.setAttribute("team name", "SUST Define Coders");

  // Pass the span to the request object for use in the route handler
  context.with(trace.setSpan(context.active(), span), () => {
    next();
  });
});
// TELEMETRY //////////////////////////////////////////

const PORT = process.env.PORT || 7080;

app.get("/get-posts/:id", getPostsExceptCurrentUser);

app.post("/create-post", createPost);

app.get("/get-all-posts-mysql/:id", getAllPosts);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Gracefully shut down the OpenTelemetry SDK and the server
const gracefulShutdown = () => {
  server.close(() => {
    console.log("Server stopped");
    sdk
      .shutdown()
      .then(() => console.log("Tracing terminated"))
      .catch((error) => console.error("Error shutting down tracing", error))
      .finally(() => process.exit(0));
  });
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);