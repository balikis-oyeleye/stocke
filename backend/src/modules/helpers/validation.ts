import { Response } from "express";
import { z } from "zod";
import { responseHandler } from "./response-handler";
import { HTTP_STATUS_CODE } from "../../utils/http-status-code";

export const validationErrorHandler = (res: Response, error: z.ZodError) => {
  return responseHandler(
    res,
    false,
    HTTP_STATUS_CODE.BAD_REQUEST,
    "Validation failed. Please check your input and try again.",
    { errors: z.flattenError(error) },
  );
};
