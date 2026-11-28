import { User } from "../modules/user/user.model";
import { AppError } from "../utils/error";
import { HTTP_STATUS_CODE } from "../utils/http-status-code";

interface EnsureUserExistsOptions {
  message?: string;
  statusCode?: number;
}

export const ensureUserDoesNotExist = async (email: string) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError("User already exists", HTTP_STATUS_CODE.CONFLICT);
  }
};

export const ensureUserExistsByEmail = async (
  email: string,
  { message, statusCode }: EnsureUserExistsOptions = {},
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

export const ensureUserExistsById = async (
  id: string,
  { message, statusCode }: EnsureUserExistsOptions = {},
) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(
      message ?? "User not found.",
      statusCode ?? HTTP_STATUS_CODE.NOT_FOUND,
    );
  }

  return user;
};
