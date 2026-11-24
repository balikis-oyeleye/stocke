import mongoose from "mongoose";

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
    verificationOtpHash: {
      type: String,
      trim: true,
    },
    verificationOtpExpiry: {
      type: Date,
    },
    passwordOtpHash: {
      type: String,
      trim: true,
    },
    passwordOtpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
