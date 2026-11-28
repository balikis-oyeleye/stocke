import { hashPassword } from "../../../utils/encryption";
import { generateOtp, validateOtp } from "../../../helpers/otp";
import { sendEmail } from "../../../service/email";
import { verificationEmailTemplate } from "../../../templates/verification-email";
import { User, type UserDocument } from "../../user/user.model";
import type { z } from "zod";
import type { registerSchema, verifyEmailSchema } from "./auth.schema";
import { AppError } from "../../../utils/error";
import { HTTP_STATUS_CODE } from "../../../utils/http-status-code";

export const registerUserService = async (
  userData: z.infer<typeof registerSchema>,
) => {
  await ensureUserDoesNotExist(userData.email);

  const { expiryDate, hashOtp, otp } = await generateOtp();

  const data = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    role: userData.role,
  };

  const newUser = new User({
    ...data,
    password_hash: await hashPassword(userData.password),
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
  const user = await ensureUserExists(payload.email, {
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

export const updatePassword = async (user: UserDocument, password: string) => {
  const hashedNewPassword = await hashPassword(password);

  user.password_hash = hashedNewPassword;
  user.password_otp_expiry = undefined;
  user.password_otp_hash = undefined;
  await user.save();
};

export const ensureUserDoesNotExist = async (email: string) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError("User already exists", HTTP_STATUS_CODE.CONFLICT);
  }
};

interface Payload {
  message?: string;
  statusCode?: number;
}

export const ensureUserExists = async (
  email: string,
  { message, statusCode }: Payload = {},
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(
      message ?? "User not found.",
      statusCode ?? HTTP_STATUS_CODE.NOT_FOUND,
    );
  }

  return user;
};
