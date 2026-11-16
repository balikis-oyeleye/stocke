import express from "express";
import helmet from "helmet";
import cors from "cors";
import env from "./configs/env";

const app = express();

// Disable the "x-powered-by" header to enhance security by not revealing the server technology used.
app.disable("x-powered-by");

// For parsing incoming requests with JSON payloads
app.use(express.json());

// Use Helmet middleware to set various HTTP headers for security e.g Content-Security-Policy and Strict-Transport-Security
app.use(helmet());

// Use CORS middleware to enable Cross-Origin Resource Sharing, allowing the server to handle requests from different origins.
app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
