import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
};

export default env;
