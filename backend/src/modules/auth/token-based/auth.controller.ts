import { Response, Request } from "express";
import { registerSchema } from "./auth.schema";
import { HTTP_STATUS_CODE } from "../../../utils/http-status-code";
import { User } from "../../user/user.model";
import { hashPassword } from "./auth.service";
import { responseHandler } from "../../helpers/response-handler";
import { validationErrorHandler } from "../../helpers/validation";

export const register = async (req: Request, res: Response) => {
  const rawData = registerSchema.safeParse(req.body);

  if (!rawData.success) {
    return validationErrorHandler(res, rawData.error);
  }

  const userData = rawData.data;

  let existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return responseHandler(
      res,
      false,
      HTTP_STATUS_CODE.CONFLICT,
      "User already exist",
    );
  }

  const data = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    role: userData.role,
  };

  const newUser = new User({
    ...data,
    password_hash: await hashPassword(userData.password),
  });

  await newUser.save();

  return responseHandler(
    res,
    true,
    HTTP_STATUS_CODE.CREATED,
    "User Created Successfully",
    { data },
  );
};

export const login = async (req: Request, res: Response) => {};
