import express from "express";
import {
  forgotPassword,
  login,
  register,
  verifyEmail,
} from "./auth.controller";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
