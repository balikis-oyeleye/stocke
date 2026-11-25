import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import env from "../configs/env";
import { ROLE } from "../types/user";

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: "Seller" | "Customer";
}

export const createToken = (
  userId: string,
  email: string,
  role: TokenPayload["role"],
  secret: string,
  expiration: string,
): string => {
  const payload = { userId, email, role };

  return jwt.sign(payload, secret, {
    expiresIn: expiration as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  const decoded = jwt.verify(token, secret);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    typeof decoded.email !== "string" ||
    !["Seller", "Customer"].includes(decoded.role)
  ) {
    throw new Error("Invalid token payload");
  }

  return decoded as TokenPayload;
};

export const generateAuthToken = (id: string, email: string, role: ROLE) => {
  const refreshToken = createToken(
    id,
    email,
    role,
    env.JWT_REFRESH_TOKEN_SECRET,
    "7d",
  );
  const accessToken = createToken(
    id,
    email,
    role,
    env.JWT_ACCESS_TOKEN_SECRET,
    "1h",
  );

  return { accessToken, refreshToken };
};
