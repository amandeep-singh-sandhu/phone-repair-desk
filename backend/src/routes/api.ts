// backend/src/routes/api.ts
import { Router } from "express";
import { ticketController } from "../controllers/ticketController";
import { customerController } from "../controllers/customerController";

const router = Router();

// Customers
router.get("/customers", customerController.searchCustomers);
router.get("/customers/check-exists", customerController.checkCustomerExists);

// Tickets
router.get("/tickets", ticketController.getAllTickets);
router.post("/tickets", ticketController.createTicket);
router.patch("/tickets/:id/status", ticketController.updateStatus);
router.get("/tickets/archived", ticketController.getArchivedTickets);
router.delete("/tickets/:id", ticketController.deleteTicket); 

export default router;
