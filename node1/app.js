const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { default: axios } = require("axios");
dotenv.config();

require("./instrumentation");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 7070;

// TELEMETRY //////////////////////////////////////////
const configureOpenTelemetry = require("./tracing");
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("node-1-light"); // add service name here

// app.use(countAllRequests());

app.use((req, res, next) => {
  const tracer = tracerProvider.getTracer("express-tracer");
  const span = tracer.startSpan("node-1-root-span");

  // Add custom attributes or log additional information if needed
  span.setAttribute("team name", "SUST Define Coders");

  // Pass the span to the request object for use in the route handler
  context.with(trace.setSpan(context.active(), span), () => {
    next();
  });
});
// TELEMETRY //////////////////////////////////////////

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
  const parentSpan = trace.getSpan(context.active());
  await validateUser(req.params.id);
  console.log("Fetching posts");

  try {
    const respose_data = await context.with(
      trace.setSpan(context.active(), parentSpan),
      async () => {
        const carrier = {};
        propagation.inject(context.active(), carrier);

        // replace axios call here
        const response = await axios.get(
          "http://127.0.0.1:7080/get-posts/" + req.params.id,
          {
            headers: carrier,
          }
        );
        return response;
      }
    );

    console.log("Validation response:", respose_data.data); // Log or use the response as needed

    res.send(respose_data.data);
  } catch (error) {
    if (parentSpan) {
      parentSpan.recordException(error);
    }
    res.status(500).send(error.message);
  } finally {
    if (parentSpan) {
      parentSpan.end();
    }
  }
});

app.post("/create-post", async (req, res) => {
  // res.send("Creating post");
  const parentSpan = trace.getSpan(context.active());
  console.log(req.body);
  try {
    const respose_data = await context.with(
      trace.setSpan(context.active(), parentSpan),
      async () => {
        const carrier = {};
        propagation.inject(context.active(), carrier);

        // replace axios call here
        return axios.post("http://127.0.0.1:7080/create-post", req.body, {
          headers: carrier,
        });
      }
    );

    console.log("Validation response:", respose_data.data); // Log or use the response as needed

    // add what you want as response
    res.send(respose_data.data);
  } catch (error) {
    if (parentSpan) {
      parentSpan.recordException(error);
    }
    res.status(500).send(error.message);
  } finally {
    if (parentSpan) {
      parentSpan.end();
    }
  }
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
