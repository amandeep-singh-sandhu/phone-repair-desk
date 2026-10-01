// backend/src/routes/api.ts
import { Router } from "express";
import { ticketController } from "../controllers/ticketController";
import { customerController } from "../controllers/customerController";
import { technicianController } from "../controllers/technicianController";

const router = Router();

// Customers
router.get("/customers", customerController.searchCustomers);
router.get("/customers/check-exists", customerController.checkCustomerExists);

// Technicians
router.get("/technicians", technicianController.getAllTechnicians);

// Tickets
router.get("/tickets", ticketController.getAllTickets);
router.post("/tickets", ticketController.createTicket);
router.patch("/tickets/:id/status", ticketController.updateStatus);
router.patch("/tickets/:id/assign", ticketController.assignTechnician); // 👈 New route
router.get("/tickets/archived", ticketController.getArchivedTickets);
router.get("/tickets/search", ticketController.searchAllTickets);
router.delete("/tickets/:id", ticketController.deleteTicket);

export default router;
