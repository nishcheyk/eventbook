import { Router } from 'express';
import { registerController, loginController } from "./users.controller";


const router = Router();
router.post('/register', registerController);
router.post('/login', loginController);
export default router;
