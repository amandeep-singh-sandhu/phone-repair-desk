// backend/src/models/index.ts
import { Customer } from "./Customer";
import { Ticket } from "./Ticket";
import { User } from "./User";

// 1. Customer -> Tickets relationship
Customer.hasMany(Ticket, { foreignKey: "customerId", as: "tickets" });
Ticket.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// 2. User (Technician) -> Tickets relationship
User.hasMany(Ticket, {
	foreignKey: "assignedTechnicianId",
	as: "assignedTickets",
});
Ticket.belongsTo(User, {
	foreignKey: "assignedTechnicianId",
	as: "assignedTechnician",
});

export { Customer, Ticket, User };
