import bcrypt from "bcrypt";
import mongoose, { Document } from "mongoose";
import validator from "validator";

export interface UserType extends Document {
  name: string;
  email: string;
  photo?: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  comparePassword(
    candidatePassword: string,
    password: string
  ): Promise<boolean>;
  passwordChangedAfter(JWTTimeStamp: number): boolean;
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

export const User = mongoose.model("User", userSchema);
