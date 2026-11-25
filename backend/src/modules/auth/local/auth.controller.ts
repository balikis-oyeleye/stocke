import { Response, Request } from "express";
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
import {
  comparePassword,
  generateVerificationOTP,
  hasExpired,
  hashPassword,
} from "./auth.service";
import { responseHandler } from "../../../helpers/response-handler";
import { validationErrorHandler } from "../../../helpers/validation";
import { sendEmail } from "../../../service/email";
import { verificationEmailTemplate } from "../../../templates/verification-email";
import { createToken } from "../../../utils/token";
import env from "../../../configs/env";
import { forgotPasswordEmailTemplate } from "../../../templates/forgot-password";

export const register = async (req: Request, res: Response) => {
  const rawData = registerSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }

  const userData = rawData.data;

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.CONFLICT,
      "User already exist",
    );
  }

  const otp = generateVerificationOTP();

  const data = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    role: userData.role,
  };

  const newUser = new User({
    ...data,
    password_hash: await hashPassword(userData.password),
    verification_otp_hash: await hashPassword(otp),
    verification_otp_expiry: new Date(Date.now() + 10 * 60 * 1000),
  });

  await newUser.save();

  await sendEmail({
    to: data.email,
    subject: "Verify your Stocke email address",
    html: verificationEmailTemplate(data.first_name, otp),
  });

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.CREATED,
    "User Created Successfully",
    { data },
  );
};

export const verifyEmail = async (req: Request, res: Response) => {
  const rawData = verifyEmailSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }

  const { otp, email } = rawData.data;

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

  if (hasExpired(user.verification_otp_expiry)) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Verification code has expired",
    );
  }

  const isOTPMatch = await comparePassword(otp, user.verification_otp_hash);

  if (!isOTPMatch) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid verification code",
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

export const login = async (req: Request, res: Response) => {
  const rawData = loginSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }

  const { email, password } = rawData.data;

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
      "Invalid email or password",
    );
  }

  const refreshToken = createToken(
    user._id.toString(),
    user.email,
    user.role,
    env.JWT_REFRESH_TOKEN_SECRET,
    "7d",
  );
  const accessToken = createToken(
    user._id.toString(),
    user.email,
    user.role,
    env.JWT_ACCESS_TOKEN_SECRET,
    "1h",
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

export const forgotPassword = async (req: Request, res: Response) => {
  const rawData = forgotPasswordSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }

  const { email } = rawData.data;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(
      res,
      true,
      HTTP_STATUS_CODE.OK,
      "If you have an account with us, check your email for instructions to reset your password",
    );
  }

  const otp = generateVerificationOTP();

  user.password_otp_hash = await hashPassword(otp);
  user.password_otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

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

export const resetPassword = async (req: Request, res: Response) => {
  const rawData = resetPasswordSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }

  const { otp, password, email } = rawData.data;

  const user = await User.findOne({ email });
  if (!user) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid or expired token",
    );
  }

  if (!user.password_otp_hash || hasExpired(user.password_otp_expiry)) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid or expired token",
    );
  }

  const isOTPMatch = await comparePassword(otp, user.password_otp_hash);

  if (!isOTPMatch) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid or expired token",
    );
  }

  user.password_hash = await hashPassword(password);
  user.password_otp_expiry = undefined;
  user.password_otp_hash = undefined;

  await user.save();

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "Password reset successfully",
  );
};

export const changePassword = async (req: Request, res: Response) => {
  const rawData = changePasswordSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }
  const { current_password, new_password } = rawData.data;

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

  const hashedNewPassword = await hashPassword(new_password);

  userData.password_hash = hashedNewPassword;
  userData.password_otp_expiry = undefined;
  userData.password_otp_hash = undefined;
  await userData.save();

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "Password changed successfully",
  );
};
