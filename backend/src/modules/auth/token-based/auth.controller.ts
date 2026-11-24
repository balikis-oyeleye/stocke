import { Response, Request } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
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
import { sendEmail } from "../../../service/email.service";
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

  let existingUser = await User.findOne({ email: userData.email });
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
    verificationOtpHash: await hashPassword(otp),
    verificationOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
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

  if (hasExpired(user.verificationOtpExpiry)) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Verification code has expired",
    );
  }

  const isOTPMatch = await comparePassword(otp, user.verificationOtpHash);

  if (!isOTPMatch) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.BAD_REQUEST,
      "Invalid verification code",
    );
  }

  user.email_verified = true;
  user.verificationOtpHash = undefined;
  user.verificationOtpExpiry = undefined;

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

  const userData = await User.findOne({ email });
  const isPasswordValid = await comparePassword(
    password,
    userData?.password_hash,
  );

  if (!userData || !isPasswordValid) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  if (!userData.email_verified) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.FORBIDDEN,
      "Invalid email or password",
    );
  }

  const refreshToken = createToken(
    userData._id.toString(),
    userData.email,
    userData.role,
    env.JWT_REFRESH_TOKEN_SECRET,
    "7d",
  );
  const accessToken = createToken(
    userData._id.toString(),
    userData.email,
    userData.role,
    env.JWT_ACCESS_TOKEN_SECRET,
    "1h",
  );

  const data = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    role: userData.role,
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

  const userData = await User.findOne({ email });
  if (!userData) {
    return responseHandler(
      res,
      true,
      HTTP_STATUS_CODE.OK,
      "If you have an account with us, check your email for instructions to reset your password",
    );
  }

  const otp = generateVerificationOTP();

  userData.passwordOtpHash = await hashPassword(otp);
  userData.passwordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await userData.save();

  await sendEmail({
    to: userData.email,
    subject: "Reset your Stocke password",
    html: forgotPasswordEmailTemplate(userData.first_name, otp),
  });

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.OK,
    "If you have an account with us, check your email for instructions to reset your password",
  );
};
