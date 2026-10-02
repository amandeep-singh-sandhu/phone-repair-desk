// backend/src/routes/userManagement.routes.ts
import { Router } from "express";
import {
	getAllStaff,
	createStaffMember,
	toggleStaffStatus,
} from "../controllers/userManagement.controller";
import { authenticateToken, requireRoles } from "../middleware/auth.middleware";

const router = Router();

// Apply auth checkpoint and strict admin requirement across all endpoints in this router
router.use(authenticateToken);
router.use(requireRoles("admin"));

// GET /api/users - List all staff
router.get("/", getAllStaff);

// POST /api/users - Create new technician / front desk / admin
router.post("/", createStaffMember);

// PATCH /api/users/:id/toggle-status - Deactivate or reactivate an account
router.patch("/:id/toggle-status", toggleStaffStatus);

export default router;
