import { Router } from 'express';
import { loginSchema, registerSchema } from "../models/auth.js";
import { register, login } from "../controllers/authController.js";
import { validateBody } from "../middlewares/validation.js";

const router = Router ()

router.post('/register', validateBody(registerSchema), register)
router.post('/login',validateBody(loginSchema),login)


export default router;
