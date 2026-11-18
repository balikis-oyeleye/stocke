import { Express } from "express";
import { authRouter } from "./auth/token-based/auth.routes";

export const setupRoutes = (app: Express) => {
  app.use("/api/auth", authRouter);
};
