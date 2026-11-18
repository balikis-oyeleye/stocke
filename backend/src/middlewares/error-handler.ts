import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(err);
  res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
};
