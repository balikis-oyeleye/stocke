import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";
import mongoose from "mongoose";
import { responseHandler } from "../helpers/response-handler";
import { AppError } from "../utils/error";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.CONFLICT,
      "A record with this value already exists.",
    );
  }

  if (err instanceof AppError) {
    return responseHandler(res, false, err.statusCode, err.message);
  }

  return responseHandler(
    res,
    false,
    HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    "Internal Server Error",
  );
};
