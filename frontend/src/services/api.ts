// frontend/src/services/api.ts
import type { Ticket, CreateTicketPayload, TicketStatus, Customer } from "../types";

const API_BASE_URL = "http://localhost:5000/api";

export const repairApi = {
	getTickets: async (): Promise<Ticket[]> => {
		const res = await fetch(`${API_BASE_URL}/tickets`);
		if (!res.ok) throw new Error("Failed to fetch tickets");
		const data = await res.json();
		// Guard against any null items from DB
		return Array.isArray(data) ? data.filter(Boolean) : [];
	},

	searchCustomers: async (
		query: string,
	): Promise<(Customer & { pastRepairsCount: number })[]> => {
		const res = await fetch(
			`${API_BASE_URL}/customers?q=${encodeURIComponent(query)}`,
		);
		if (!res.ok) throw new Error("Failed to search customers");
		return res.json();
	},

	// frontend/src/services/api.ts

	createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
		const res = await fetch(`${API_BASE_URL}/tickets`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			console.error("❌ Backend Create Ticket Error:", errorData);
			throw new Error(
				errorData.error || errorData.detail || "Failed to create ticket",
			);
		}

		const responseJson = await res.json();
		console.log("📦 Server returned payload:", responseJson);

		// Unpack ticket if wrapped in { ticket: ... } or { data: ... }
		const ticketData: Ticket =
			responseJson?.ticket || responseJson?.data || responseJson;

		if (!ticketData || !ticketData.id) {
			console.error("❌ Unexpected response structure:", responseJson);
			throw new Error("Server returned invalid ticket data");
		}

		return ticketData;
	},

	updateTicketStatus: async (
		ticketId: string,
		status: TicketStatus,
		diagnosticNotes?: string,
	): Promise<Ticket> => {
		const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status, diagnosticNotes }),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.error || "Failed to update ticket status");
		}

		return res.json();
	},

	deleteTicket: async (ticketId: string): Promise<void> => {
		const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.error || "Failed to delete ticket");
		}
	},
};
