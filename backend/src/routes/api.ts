// backend/src/routes/api.ts
import { Router } from "express";
import { ticketController } from "../controllers/ticketController";
import { customerController } from "../controllers/customerController";

const router = Router();

// Customers
router.get("/customers", customerController.searchCustomers);

// Tickets
router.get("/tickets", ticketController.getAllTickets);
router.post("/tickets", ticketController.createTicket);
router.patch("/tickets/:id/status", ticketController.updateStatus);
router.delete("/tickets/:id", ticketController.deleteTicket); // <-- Added

export default router;
