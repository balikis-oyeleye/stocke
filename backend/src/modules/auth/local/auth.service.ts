import { comparePassword, hashPassword } from "../../../utils/encryption";
import { generateOtp, validateOtp } from "../../../helpers/otp";
import { sendEmail } from "../../../service/email";
import { verificationEmailTemplate } from "../../../templates/verification-email";
import { forgotPasswordEmailTemplate } from "../../../templates/forgot-password";
import { User, type UserDocument } from "../../user/user.model";
import type { z } from "zod";
import type {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";
import { AppError } from "../../../utils/error";
import { HTTP_STATUS_CODE } from "../../../utils/http-status-code";
import { generateAuthToken } from "../../../utils/token";
import {
  ensureUserDoesNotExist,
  ensureUserExistsByEmail,
  ensureUserExistsById,
} from "../../../helpers/user";

export const registerUserService = async (
  payload: z.infer<typeof registerSchema>,
) => {
  await ensureUserDoesNotExist(payload.email);

  const { expiryDate, hashOtp, otp } = await generateOtp();

  const data = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    role: payload.role,
  };

  const newUser = new User({
    ...data,
    password_hash: await hashPassword(payload.password),
    verification_otp_hash: hashOtp,
    verification_otp_expiry: expiryDate,
  });

  await newUser.save();

  await sendEmail({
    to: data.email,
    subject: "Verify your Stocke email address",
    html: verificationEmailTemplate(data.first_name, otp),
  });

  return data;
};

export const verifyEmailService = async (
  payload: z.infer<typeof verifyEmailSchema>,
) => {
  const user = await ensureUserExistsByEmail(payload.email, {
    statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
    message: "Invalid or expired verification code",
  });

  if (user.email_verified) {
    throw new AppError("Email already verified", HTTP_STATUS_CODE.BAD_REQUEST);
  }

  const isValid = await validateOtp(
    payload.otp,
    user.verification_otp_hash,
    user.verification_otp_expiry,
  );

  if (!isValid) {
    throw new AppError(
      "Invalid or expired verification code.",
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }

  user.email_verified = true;
  user.verification_otp_hash = undefined;
  user.verification_otp_expiry = undefined;

  await user.save();
};

export const loginService = async (payload: z.infer<typeof loginSchema>) => {
  const user = await ensureUserExistsByEmail(payload.email, {
    statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
    message: "Invalid email or password",
  });
  const isPasswordValid = await comparePassword(
    payload.password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    throw new AppError(
      "Invalid email or password",
      HTTP_STATUS_CODE.UNAUTHORIZED,
    );
  }

  if (!user.email_verified) {
    throw new AppError(
      "Please verify your email address before logging in.",
      HTTP_STATUS_CODE.FORBIDDEN,
    );
  }

  const { accessToken, refreshToken } = generateAuthToken(
    user._id.toString(),
    user.email,
    user.role,
  );

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    refresh_token: refreshToken,
    access_token: accessToken,
  };
};

export const forgotPasswordService = async (
  payload: z.infer<typeof forgotPasswordSchema>,
) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) return;

  const { expiryDate, hashOtp, otp } = await generateOtp();

  user.password_otp_hash = hashOtp;
  user.password_otp_expiry = expiryDate;

  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Reset your Stocke password",
    html: forgotPasswordEmailTemplate(user.first_name, otp),
  });
};

export const resetPasswordService = async (
  payload: z.infer<typeof resetPasswordSchema>,
) => {
  const user = await ensureUserExistsByEmail(payload.email, {
    statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
    message: "Invalid or expired verification code.",
  });

  const isValid = await validateOtp(
    payload.otp,
    user.password_otp_hash,
    user.password_otp_expiry,
  );

  if (!isValid) {
    throw new AppError(
      "Invalid or expired verification code.",
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }

  await updatePassword(user, payload.password);
};

export const changePasswordService = async (
  payload: z.infer<typeof changePasswordSchema>,
  userId?: string,
) => {
  if (!userId) {
    throw new AppError(
      "Authentication required. Please log in to continue.",
      HTTP_STATUS_CODE.UNAUTHORIZED,
    );
  }

  const user = await ensureUserExistsById(userId);

  const isOldPasswordValid = await comparePassword(
    payload.current_password,
    user.password_hash,
  );

  if (!isOldPasswordValid) {
    throw new AppError(
      "The current password you entered is incorrect.",
      HTTP_STATUS_CODE.BAD_REQUEST,
    );
  }

  await updatePassword(user, payload.new_password);
};

const updatePassword = async (user: UserDocument, password: string) => {
  const hashedNewPassword = await hashPassword(password);

  user.password_hash = hashedNewPassword;
  user.password_otp_expiry = undefined;
  user.password_otp_hash = undefined;
  await user.save();
};
