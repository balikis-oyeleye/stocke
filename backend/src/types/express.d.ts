import type { TokenPayload } from "../utils/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<TokenPayload, "userId" | "email" | "role">;
    }
  }
}

export {};
