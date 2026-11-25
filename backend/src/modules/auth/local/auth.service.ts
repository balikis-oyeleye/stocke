import { hashPassword } from "../../../helpers/encryption";
import { UserDocument } from "../../user/user.model";

export const updatePassword = async (user: UserDocument, password: string) => {
  const hashedNewPassword = await hashPassword(password);

  user.password_hash = hashedNewPassword;
  user.password_otp_expiry = undefined;
  user.password_otp_hash = undefined;
  await user.save();
};
