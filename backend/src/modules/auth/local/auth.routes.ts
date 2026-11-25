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
import { validateRequestSchema } from "../../../middlewares/validate-request-schema";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";

export const authRouter = express.Router();

authRouter.post("/login", validateRequestSchema(loginSchema), login);
authRouter.post("/register", validateRequestSchema(registerSchema), register);
authRouter.post(
  "/verify-email",
  validateRequestSchema(verifyEmailSchema),
  verifyEmail,
);
authRouter.post(
  "/forgot-password",
  validateRequestSchema(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  validateRequestSchema(resetPasswordSchema),
  resetPassword,
);
authRouter.post(
  "/change-password",
  protectedRoutes,
  validateRequestSchema(changePasswordSchema),
  changePassword,
);
