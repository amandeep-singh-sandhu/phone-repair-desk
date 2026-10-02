// backend/src/routes/auth.routes.ts
import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public route: Anyone can submit credentials to receive a token
// URL: POST /api/auth/login
router.post("/login", login);

// Protected route: Requires a valid Bearer token in headers to fetch session info
// URL: GET /api/auth/me
router.get("/me", authenticateToken, getMe);

export default router;
