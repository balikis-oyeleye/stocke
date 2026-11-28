import { Response } from "express";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";
import { HTTP_STATUS_CODE } from "../../../utils/http-status-code";
import { responseHandler } from "../../../helpers/response-handler";
import type { ValidatedRequest } from "../../../types/request";
import {
  changePasswordService,
  forgotPasswordService,
  loginService,
  registerUserService,
  resetPasswordService,
  verifyEmailService,
} from "./auth.service";

export const register = async (
  req: ValidatedRequest<typeof registerSchema>,
  res: Response,
) => {
  const data = await registerUserService(req.body);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.CREATED,
    "User created successfully",
    { data },
  );
};

export const verifyEmail = async (
  req: ValidatedRequest<typeof verifyEmailSchema>,
  res: Response,
) => {
  await verifyEmailService(req.body);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "Email verified successfully",
  );
};

export const login = async (
  req: ValidatedRequest<typeof loginSchema>,
  res: Response,
) => {
  const data = await loginService(req.body);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "User logged in successfully",
    { data },
  );
};

export const forgotPassword = async (
  req: ValidatedRequest<typeof forgotPasswordSchema>,
  res: Response,
) => {
  await forgotPasswordService(req.body);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "If you have an account with us, check your email for instructions to reset your password",
  );
};

export const resetPassword = async (
  req: ValidatedRequest<typeof resetPasswordSchema>,
  res: Response,
) => {
  await resetPasswordService(req.body);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "Password reset successfully",
  );
};

export const changePassword = async (
  req: ValidatedRequest<typeof changePasswordSchema>,
  res: Response,
) => {
  await changePasswordService(req.body, req.user?.userId);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "Password changed successfully",
  );
};
