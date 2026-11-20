import env from "../configs/env.js";
import { responseHandler } from "../helpers/response-handler.js";
import { HTTP_STATUS_CODE } from "../utils/http-status-code.js";
import { verifyToken } from "../utils/token.js";
import type { Request, Response, NextFunction } from "express";

export const protectedRoutes = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bearer = req.header("Authorization");

  if (!bearer?.startsWith("Bearer ")) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Access denied. No token provided.",
    );
  }

  const token = bearer.slice(7).trim();

  if (!token) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Access denied. No token provided.",
    );
  }

  try {
    const decoded = verifyToken(token, env.JWT_ACCESS_TOKEN_SECRET);

    // Make authenticated user information available
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Invalid or expired authorization token",
    );
  }
};
