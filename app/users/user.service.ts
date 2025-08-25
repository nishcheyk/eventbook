import User, { IUser } from "./user.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshSecret";

/**
 * Register a new user with hashed password
 * @param dto User registration data
 * @returns Created user document
 */
export const registerUserService = async (dto: RegisterDTO): Promise<IUser> => {
  const existingUser = await User.findOne({ email: dto.email });
  if (existingUser) {
    const error: any = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hash = await bcrypt.hash(dto.password, 10);
  const user = new User({ ...dto, password: hash });
  await user.save();
  return user;
};

/**
 * Authenticate user by email/password and issue JWT tokens
 * @param dto Login data
 * @returns Access token, refresh token, and user data
 */
export const loginUserService = async (dto: LoginDTO) => {
  const user = await User.findOne({ email: dto.email });
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) {
    const error: any = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  // Generate access token with short expiry
  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Generate refresh token with longer expiry
  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // Save refresh token in user document
  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    },
  };
};

/**
 * Refresh access token using refresh token
 * @param refreshToken Refresh token string
 * @returns New access token
 */
export const refreshAccessTokenService = async (refreshToken: string) => {
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
    };
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.refreshTokens.includes(refreshToken)) {
      throw new Error("Refresh token revoked");
    }
    const newToken = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    return newToken;
  } catch {
    throw new Error("Invalid refresh token");
  }
};

/**
 * Logout user and revoke refresh token
 * @param refreshToken Refresh token to revoke
 * @returns true if revoked successfully
 */
export const logoutUserService = async (refreshToken: string) => {
  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) return false;
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  await user.save();
  return true;
};
