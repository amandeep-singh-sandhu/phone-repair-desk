// backend/src/models/index.ts
import { Customer } from "./Customer";
import { Ticket } from "./Ticket";

// Define one-to-many relationship
Customer.hasMany(Ticket, { foreignKey: "customerId", as: "tickets" });
Ticket.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

export { Customer, Ticket };
