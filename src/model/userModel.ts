import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose, { Document } from "mongoose";
import validator from "validator";

export interface UserType extends Document {
  name: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string;
  // had to make this number type since ts is not happy about it
  // but mongoDB will convert it into Date type automatically
  // since we defined this field as Date in schema
  passwordResetTokenExpiration: number;
  comparePassword(
    candidatePassword: string,
    password: string
  ): Promise<boolean>;
  passwordChangedAfter(JWTTimeStamp: number): boolean;
  generatePasswordResetToken(): string;
}

const userSchema = new mongoose.Schema<UserType>({
  name: {
    type: String,
    required: [true, "A user must have a name."],
    minlength: [5, "Username must be longer than 5 characters."],
    maxlength: [15, "Username must be shorter than 15 characters."],
  },
  email: {
    type: String,
    required: [true, "A user must have an email."],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email."],
    unique: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password required."],
    minlength: [8, "Password must be longer than 8 characters."],
    select: false,
  },
  passwordConfirm: {
    type: String || undefined,
    required: [true, "Please confim your password."],
    validate: {
      validator: function (this: UserType, val: string): boolean {
        return val === this.password;
      },
      message: "Passwords are not the same.",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: {
    type: String,
    required: true,
  },
  passwordResetTokenExpiration: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
  password: string
) {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.methods.passwordChangedAfter = function (
  this: UserType,
  JWTTimeStamp: number
) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = Number(this.passwordChangedAt.getTime() / 1000);

    // check if the user changed the password after jwt is issued (logged in or signed in)
    return JWTTimeStamp < changedTimeStamp;
  }

  return false; // false by default
};

userSchema.methods.generatePasswordResetToken = function (this: UserType) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpiration = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
