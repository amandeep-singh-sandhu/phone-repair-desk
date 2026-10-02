// backend/src/routes/api.ts
import { Router } from "express";
import { ticketController } from "../controllers/ticketController";
import { customerController } from "../controllers/customerController";
import { technicianController } from "../controllers/technicianController";
import userManagementRoutes from "./userManagement.routes";
import authRoutes from "./auth.routes";
import { authenticateToken, requireRoles } from "../middleware/auth.middleware";

const router = Router();

// ==========================================
// 1. PUBLIC AUTH ROUTES
// ==========================================
// /api/auth/login is public; /api/auth/me uses authenticateToken internally
router.use("/auth", authRoutes);

// ==========================================
// 2. GLOBAL AUTHENTICATION CHECKPOINT
// ==========================================
// Every route below this line requires a valid Authorization: Bearer <token>
router.use(authenticateToken);

// ==========================================
// 3. ADMIN-ONLY STAFF MANAGEMENT
// ==========================================
// /api/users (Creation, status toggles, staff listings)
router.use("/users", userManagementRoutes);

// ==========================================
// 4. CUSTOMER ROUTES
// ==========================================
// Read/lookup allowed for all authenticated staff
router.get("/customers", customerController.searchCustomers);
router.get("/customers/check-exists", customerController.checkCustomerExists);

// ==========================================
// 5. TECHNICIAN ROUTES
// ==========================================
// Filter dropdowns and badge lookups accessible by all authenticated roles
router.get("/technicians", technicianController.getAllTechnicians);

// ==========================================
// 6. TICKET ROUTES WITH RBAC
// ==========================================
// Viewing / Searching tickets (All roles)
router.get("/tickets", ticketController.getAllTickets);
router.get("/tickets/archived", ticketController.getArchivedTickets);
router.get("/tickets/search", ticketController.searchAllTickets);

// Ticket Intake (Admin, Front Desk, Technician)
router.post(
	"/tickets",
	requireRoles("admin", "front_desk", "technician"),
	ticketController.createTicket,
);

// Repair Bench Status Update (Admin and Technicians)
router.patch(
	"/tickets/:id/status",
	requireRoles("admin", "technician"),
	ticketController.updateStatus,
);

// Reassigning Technician (Strictly Admin)
router.patch(
	"/tickets/:id/assign",
	requireRoles("admin"),
	ticketController.assignTechnician,
);

// Deleting Tickets (Strictly Admin)
router.delete(
	"/tickets/:id",
	requireRoles("admin"),
	ticketController.deleteTicket,
);

export default router;
