// frontend/src/services/api.ts
import type { Ticket, CreateTicketPayload, TicketStatus, Customer } from "../types";

let mockCustomers: (Customer & { pastRepairsCount: number })[] = [
	{
		id: "c-1",
		name: "Alex Rivera",
		phone: "+1 (555) 019-2831",
		email: "alex@example.com",
		createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
		pastRepairsCount: 3,
	},
	{
		id: "c-2",
		name: "Elena Rostova",
		phone: "+1 (555) 014-9982",
		email: "elena@example.com",
		createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
		pastRepairsCount: 1,
	},
	{
		id: "c-3",
		name: "Marcus Chen",
		phone: "+1 (555) 438-1120",
		email: "m.chen@techcorp.io",
		createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
		pastRepairsCount: 5,
	},
	{
		id: "c-4",
		name: "Jackie Chen",
		phone: "+1 (555) 438-1420",
		email: "m.chen@techcorp.io",
		createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
		pastRepairsCount: 5,
	},
];

let mockTickets: Ticket[] = [
	{
		id: "t-1",
		ticketNumber: "TICK-1001",
		customerId: "c-1",
		customer: mockCustomers[0],
		deviceBrand: "Apple",
		deviceModel: "iPhone 13 Pro",
		imeiOrSerial: "356789102938475",
		issueDescription:
			"Cracked OLED screen, touch response unresponsive on bottom half.",
		status: "in_progress",
		priority: "high",
		estimatedCost: 180,
		createdAt: new Date(Date.now() - 86400000).toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "t-2",
		ticketNumber: "TICK-1002",
		customerId: "c-2",
		customer: mockCustomers[1],
		deviceBrand: "Samsung",
		deviceModel: "Galaxy S22",
		issueDescription: "Battery drains rapidly within 2 hours; device runs hot.",
		status: "received",
		priority: "medium",
		estimatedCost: 65,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: "t-3",
		ticketNumber: "TICK-1003",
		customerId: "c-3",
		customer: mockCustomers[1],
		deviceBrand: "Samsung",
		deviceModel: "Galaxy S22",
		issueDescription: "Battery drains rapidly within 2 hours; device runs hot.",
		status: "received",
		priority: "medium",
		estimatedCost: 65,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const repairApi = {
	getTickets: async (): Promise<Ticket[]> => {
		await new Promise((res) => setTimeout(res, 200));
		return [...mockTickets];
	},

	searchCustomers: async (
		query: string,
	): Promise<(Customer & { pastRepairsCount: number })[]> => {
		await new Promise((res) => setTimeout(res, 120));
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return mockCustomers.filter(
			(c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
		);
	},

	updateTicketStatus: async (
		ticketId: string,
		status: TicketStatus,
	): Promise<Ticket> => {
		await new Promise((res) => setTimeout(res, 150));
		const ticket = mockTickets.find((t) => t.id === ticketId);
		if (!ticket) throw new Error("Ticket not found");
		ticket.status = status;
		ticket.updatedAt = new Date().toISOString();
		return { ...ticket };
	},

	createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
		await new Promise((res) => setTimeout(res, 300));

		let resolvedCustomer: Customer;

		if (payload.customerId) {
			const existing = mockCustomers.find((c) => c.id === payload.customerId);
			if (!existing) throw new Error("Customer not found");
			existing.pastRepairsCount += 1;
			resolvedCustomer = existing;
		} else {
			resolvedCustomer = {
				id: `c-${Date.now()}`,
				name: payload.customer.name,
				phone: payload.customer.phone,
				email: payload.customer.email,
				createdAt: new Date().toISOString(),
			};
			mockCustomers.unshift({ ...resolvedCustomer, pastRepairsCount: 1 });
		}

		const newTicket: Ticket = {
			id: `t-${Date.now()}`,
			ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
			customerId: resolvedCustomer.id,
			customer: resolvedCustomer,
			deviceBrand: payload.deviceBrand,
			deviceModel: payload.deviceModel,
			imeiOrSerial: payload.imeiOrSerial,
			issueDescription: payload.issueDescription,
			diagnosticNotes: payload.diagnosticNotes,
			estimatedCost: payload.estimatedCost,
			status: payload.status || "received",
			priority: payload.priority || "medium",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		mockTickets.unshift(newTicket);
		return newTicket;
	},
};
