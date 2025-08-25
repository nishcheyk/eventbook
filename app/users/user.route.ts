import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerController, loginController } from "./users.controller";

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  message: {
    status: 429,
    error: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,
});

router.post('/register', authRateLimiter, registerController);
router.post('/login', authRateLimiter, loginController);

export default router;
