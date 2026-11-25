import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyEmail,
} from "./auth.controller";
import { protectedRoutes } from "../../../middlewares/auth";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/change-password", protectedRoutes, changePassword);
