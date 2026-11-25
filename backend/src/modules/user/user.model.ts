import mongoose, { InferSchemaType } from "mongoose";
import { HydratedDocument } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["Seller", "Customer"],
      default: "Customer",
    },
    password_hash: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    verification_otp_hash: {
      type: String,
      trim: true,
    },
    verification_otp_expiry: {
      type: Date,
    },
    password_otp_hash: {
      type: String,
      trim: true,
    },
    password_otp_expiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);

export type IUser = InferSchemaType<typeof userSchema>;

export type UserDocument = HydratedDocument<IUser>;
