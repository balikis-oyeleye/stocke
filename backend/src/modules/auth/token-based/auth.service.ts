import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const generateVerificationOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};
