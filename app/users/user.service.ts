import User from "./user.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export const registerUserService = async ({ name, email, phone, password }: RegisterDTO) => {
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, phone, password: hash });
    return user;
  } catch (err: any) {
    if (err.code === 11000 && err.keyPattern?.email) {
      throw new Error("Email already exists");
    }
    throw err; // propagate other errors
  }
};

export const loginUserService = async ({ email, password }: LoginDTO) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No user");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }

  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};
