import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const generateVerificationOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hasExpired = (expiryDate: Date | null | undefined): boolean => {
  if (!expiryDate) return true;

  return Date.now() >= expiryDate.getTime();
};

export const comparePassword = async (
  password: string,
  hashedPassword?: string | null,
): Promise<boolean> => {
  if (!hashedPassword) return false;

  return bcrypt.compare(password, hashedPassword);
};
