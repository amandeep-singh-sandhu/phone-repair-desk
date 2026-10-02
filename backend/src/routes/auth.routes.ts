// backend/src/routes/auth.routes.ts
import { Router } from "express";
import { login, getMe, updateProfile } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public route: Anyone can submit credentials to receive a token
// URL: POST /api/auth/login
router.post("/login", login);

// Protected route: Requires a valid Bearer token in headers to fetch session info
// URL: GET /api/auth/me
router.get("/me", authenticateToken, getMe);

// Protected route: Requires a valid Bearer token in headers to update the authenticated user's profile
// URL: PATCH /api/auth/profile
router.patch("/profile", authenticateToken, updateProfile);

export default router;
