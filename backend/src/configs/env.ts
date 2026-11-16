import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
};

export default env;
