import express from "express";
import helmet from "helmet";
import cors from "cors";
import env from "./configs/env";
import connectDB from "./configs/db";
import { setupRoutes } from "./modules/startup";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";

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

app.get("/api/v1/health", (_req, res) => {
  res.send("API working fine");
});

// Routes Configuration
setupRoutes(app);

// Handle 404 Not Found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  }
};

void startServer();
