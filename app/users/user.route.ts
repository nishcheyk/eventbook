import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from "./users.controller";

import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  logoutLimiter,
} from "../common/middlewares/rateLimiters";

import { authenticator } from "../common/middlewares/auth.middleware";

const router = Router();

// Public routes with rate limiters
router.post("/register", registerLimiter, registerController);
router.post("/login", loginLimiter, loginController);
router.post("/refresh-token", refreshLimiter, refreshTokenController);

// Protected logout route with authenticator middleware & rate limiting
router.post("/logout", authenticator, logoutLimiter, logoutController);

export default router;
