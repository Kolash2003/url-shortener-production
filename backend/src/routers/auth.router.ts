import { Router } from "express";
import { validateRequestBody } from "../validators";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
} from "../controllers/auth.controller";
import { googleLogin, googleCallback, githubLogin, githubCallback } from "../controllers/oauth.controller";

const router = Router();

router.post("/register", validateRequestBody(registerSchema), register);
router.post("/login", validateRequestBody(loginSchema), login);
router.post("/forgot-password", validateRequestBody(forgotPasswordSchema), forgotPassword);

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, validateRequestBody(updateProfileSchema), updateProfile);
router.put("/password", authMiddleware, validateRequestBody(changePasswordSchema), changePassword);

export default router;
