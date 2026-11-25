import { type ZodType, z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { responseHandler } from "../helpers/response-handler";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";

export const validateRequestSchema = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawData = schema.safeParse(req.body);

    if (!rawData.success) {
      return responseHandler(
        res,
        false,
        HTTP_STATUS_CODE.BAD_REQUEST,
        "Validation failed. Please check your input and try again.",
        { errors: z.flattenError(rawData.error) },
      );
    }

    req.body = rawData.data;

    next();
  };
};
