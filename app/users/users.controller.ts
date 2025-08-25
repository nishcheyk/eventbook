import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
} from "./user.service";

/**
 * Handle user registration request
 */
export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }
    const user = await registerUserService({ name, email, phone, password });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  }
);

/**
 * Handle user login request
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }
    const { token, refreshToken, user } = await loginUserService({
      email,
      password,
    });

    // Set HttpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // set false for local dev HTTP
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Login successful", token, user });
  }
);

/**
 * Handle refresh token request
 */
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401);
      throw new Error("Refresh token missing");
    }
    const token = await refreshAccessTokenService(refreshToken);
    res.json({ success: true, token });
  }
);

/**
 * Handle logout request
 */
export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token missing");
    }
    const success = await logoutUserService(refreshToken);
    res.clearCookie("refreshToken");
    if (success) {
      res.json({ success: true, message: "Logged out successfully" });
    } else {
      res.status(400);
      throw new Error("Invalid refresh token");
    }
  }
);
