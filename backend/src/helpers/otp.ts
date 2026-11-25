import crypto from "node:crypto";
import { comparePassword, hashPassword } from "./encryption";

export const generateVerificationOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const generateOtp = async (timeInMinutes: number = 10) => {
  const otp = generateVerificationOTP();
  const hashOtp = await hashPassword(otp);
  const expiryDate = new Date(Date.now() + 10 * timeInMinutes * 1000);

  return { otp, hashOtp, expiryDate };
};

export const validateOtp = async (
  otp: string,
  verification_otp_hash?: string | null,
  verification_otp_expiry?: NativeDate | null,
) => {
  if (!verification_otp_expiry || !verification_otp_hash) return false;

  const isOTPMatch = await comparePassword(otp, verification_otp_hash);

  return isOTPMatch;
};
