// src/middlewares/not-found.middleware.ts

import { Request, Response } from "express";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";
import { responseHandler } from "../helpers/response-handler";

export const notFoundHandler = (req: Request, res: Response) => {
  return responseHandler(
    res,
    false,
    HTTP_STATUS_CODE.NOT_FOUND,
    `Cannot ${req.method} ${req.originalUrl}. Route not found.`,
  );
};
