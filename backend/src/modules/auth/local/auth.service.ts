import { hashPassword } from "../../../utils/encryption";
import { generateOtp } from "../../../helpers/otp";
import { sendEmail } from "../../../service/email";
import { verificationEmailTemplate } from "../../../templates/verification-email";
import { User, type UserDocument } from "../../user/user.model";
import type { z } from "zod";
import type { registerSchema } from "./auth.schema";

export const registerUser = async (
  userData: z.infer<typeof registerSchema>,
) => {
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

export const updatePassword = async (user: UserDocument, password: string) => {
  const hashedNewPassword = await hashPassword(password);

  user.password_hash = hashedNewPassword;
  user.password_otp_expiry = undefined;
  user.password_otp_hash = undefined;
  await user.save();
};
