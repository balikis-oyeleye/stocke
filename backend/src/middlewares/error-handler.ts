import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";
import mongoose from "mongoose";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    return res.status(HTTP_STATUS_CODE.CONFLICT).json({
      success: false,
      message: "A record with this value already exists.",
    });
  }

  console.error(err);

  return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
};
