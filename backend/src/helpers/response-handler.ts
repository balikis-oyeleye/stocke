import { Response } from "express";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";

interface ResponsePayload {
  data?: unknown;
  errors?: unknown;
}

export const responseHandler = (
  res: Response,
  success: boolean,
  code: HTTP_STATUS_CODE,
  message: string,
  { data, errors }: ResponsePayload = {},
) => {
  return res.status(code).json({
    success,
    message,
    ...(data !== undefined && { data }),
    ...(errors !== undefined && { errors }),
  });
};
