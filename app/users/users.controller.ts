import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { registerUserService, loginUserService } from "./user.service";

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  const user = await registerUserService({ name, email, phone, password });
  res.status(201).json({ message: "User Registered!", userId: user._id });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = await loginUserService({ email, password });
  res.json({ token });
});
