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
import { User } from "../../user/user.model";
import { responseHandler } from "../../../helpers/response-handler";
import { sendEmail } from "../../../service/email";
import { generateAuthToken } from "../../../utils/token";
import { forgotPasswordEmailTemplate } from "../../../templates/forgot-password";
import { comparePassword } from "../../../utils/encryption";
import type { ValidatedRequest } from "../../../types/request";
import { generateOtp, validateOtp } from "../../../helpers/otp";
import { registerUser, updatePassword } from "./auth.service";

export const register = async (
  req: ValidatedRequest<typeof registerSchema>,
  res: Response,
) => {
  const data = await registerUser(req.body);

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
  const { otp, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid or expired verification code",
    );
  }

  if (user.email_verified) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Email already verified",
    );
  }

  const isValid = await validateOtp(
    otp,
    user.verification_otp_hash,
    user.verification_otp_expiry,
  );

  if (!isValid) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid or expired verification code.",
    );
  }

  user.email_verified = true;
  user.verification_otp_hash = undefined;
  user.verification_otp_expiry = undefined;

  await user.save();

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
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const isPasswordValid = await comparePassword(password, user?.password_hash);

  if (!user || !isPasswordValid) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  if (!user.email_verified) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.FORBIDDEN,
      "Please verify your email address before logging in.",
    );
  }

  const { accessToken, refreshToken } = generateAuthToken(
    user._id.toString(),
    user.email,
    user.role,
  );

  const data = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    refresh_token: refreshToken,
    access_token: accessToken,
  };

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
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(
      res,
      true,
      HTTP_STATUS_CODE.OK,
      "If you have an account with us, check your email for instructions to reset your password",
    );
  }

  const { expiryDate, hashOtp, otp } = await generateOtp();

  user.password_otp_hash = hashOtp;
  user.password_otp_expiry = expiryDate;

  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Reset your Stocke password",
    html: forgotPasswordEmailTemplate(user.first_name, otp),
  });

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
  const { otp, password, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "	Invalid or expired verification code.",
    );
  }

  const isValid = await validateOtp(
    otp,
    user.password_otp_hash,
    user.password_otp_expiry,
  );

  if (!isValid) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid or expired verification code.",
    );
  }

  await updatePassword(user, password);

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
  const { current_password, new_password } = req.body;

  const user = req?.user;

  if (!user?.userId) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Authentication required. Please log in to continue.",
    );
  }

  const userData = await User.findById(user.userId);
  if (!userData) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.NOT_FOUND,
      "User not found.",
    );
  }

  const isOldPasswordValid = await comparePassword(
    current_password,
    userData.password_hash,
  );

  if (!isOldPasswordValid) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "The current password you entered is incorrect.",
    );
  }

  await updatePassword(userData, new_password);

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "Password changed successfully",
  );
};
