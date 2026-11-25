import crypto from "node:crypto";

export const generateVerificationOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};
