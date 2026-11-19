import { z } from "zod";

export const registerSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  email: z.email("Please enter a valid email address").trim().toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),

  role: z.enum(["Seller", "Customer"]).default("Customer"),
});

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters"),
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
});
