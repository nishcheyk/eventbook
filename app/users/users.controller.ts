import { Request, Response } from "express";
import { registerUserService, loginUserService } from "./user.service";

// Register Controller
export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const user = await registerUserService({ name, email, phone, password });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id
    });

  } catch (err: any) {
    console.error("Register error:", err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

// Login Controller
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const { token, user } = await loginUserService({ email, password });
    res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};
