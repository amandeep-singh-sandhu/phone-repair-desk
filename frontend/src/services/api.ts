// frontend/src/services/api.ts
import type {
	Ticket,
	CreateTicketPayload,
	TicketStatus,
	Customer,
	Technician,
	AuthResponse,
	AuthUser,
} from "../types";

const API_BASE_URL = "http://localhost:5000/api";

// Helper to attach JWT Bearer token and JSON headers
const getAuthHeaders = (): Record<string, string> => {
	const token = localStorage.getItem("fixdesk_token");
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}
	return headers;
};

// Guard against 401 unauthenticated requests across all API calls
const handleAuthError = (res: Response) => {
	if (res.status === 401) {
		localStorage.removeItem("fixdesk_token");
	}
};

export const repairApi = {
	// Authentication
	login: async (email: string, password: string): Promise<AuthResponse> => {
		const res = await fetch(`${API_BASE_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(
				errorData.message || errorData.error || "Authentication failed",
			);
		}

		return res.json();
	},

	getMe: async (): Promise<{ success: boolean; user: AuthUser }> => {
		const res = await fetch(`${API_BASE_URL}/auth/me`, {
			headers: getAuthHeaders(),
		});

		if (!res.ok) {
			handleAuthError(res);
			const errorData = await res.json().catch(() => ({}));
			throw new Error(
				errorData.message || errorData.error || "Session invalid",
			);
		}

		return res.json();
	},

	// Tickets
	getTickets: async (): Promise<Ticket[]> => {
		const res = await fetch(`${API_BASE_URL}/tickets`, {
			headers: getAuthHeaders(),
		});
		if (!res.ok) {
			handleAuthError(res);
			throw new Error("Failed to fetch tickets");
		}
		const data = await res.json();
		return Array.isArray(data) ? data.filter(Boolean) : [];
	},

	getTechnicians: async (): Promise<Technician[]> => {
		const res = await fetch(`${API_BASE_URL}/technicians`, {
			headers: getAuthHeaders(),
		});
		if (!res.ok) {
			handleAuthError(res);
			throw new Error("Failed to fetch technicians");
		}
		return res.json();
	},

	assignTechnician: async (
		ticketId: string,
		technicianId: string | null,
	): Promise<Ticket> => {
		const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
			method: "PATCH",
			headers: getAuthHeaders(),
			body: JSON.stringify({ technicianId }),
		});

		if (!res.ok) {
			handleAuthError(res);
			const errorData = await res.json().catch(() => ({}));
			throw new Error(
				errorData.error || errorData.message || "Failed to assign technician",
			);
		}

		return res.json();
	},

	searchCustomers: async (
		query: string,
	): Promise<(Customer & { pastRepairsCount: number })[]> => {
		const res = await fetch(
			`${API_BASE_URL}/customers?q=${encodeURIComponent(query)}`,
			{
				headers: getAuthHeaders(),
			},
		);
		if (!res.ok) {
			handleAuthError(res);
			throw new Error("Failed to search customers");
		}
		return res.json();
	},

	checkCustomerExists: async (phone: string, name?: string) => {
		const params = new URLSearchParams({ phone });
		if (name) params.append("name", name);
		const res = await fetch(
			`${API_BASE_URL}/customers/check-exists?${params.toString()}`,
			{
				headers: getAuthHeaders(),
			},
		);
		if (!res.ok) {
			handleAuthError(res);
			throw new Error("Failed to check customer existence");
		}
		return res.json();
	},

	createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
		const res = await fetch(`${API_BASE_URL}/tickets`, {
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			handleAuthError(res);
			const errorData = await res.json().catch(() => ({}));
			console.error("❌ Backend Create Ticket Error:", errorData);
			throw new Error(
				errorData.error ||
					errorData.detail ||
					errorData.message ||
					"Failed to create ticket",
			);
		}

		const responseJson = await res.json();
		console.log("📦 Server returned payload:", responseJson);

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
			headers: getAuthHeaders(),
			body: JSON.stringify({ status, diagnosticNotes }),
		});

		if (!res.ok) {
			handleAuthError(res);
			const errorData = await res.json().catch(() => ({}));
			throw new Error(
				errorData.error ||
					errorData.message ||
					"Failed to update ticket status",
			);
		}

		return res.json();
	},

	searchTickets: async (
		query: string,
	): Promise<{ mode: "recent" | "search"; tickets: Ticket[] }> => {
		const res = await fetch(
			`${API_BASE_URL}/tickets/search?q=${encodeURIComponent(query)}`,
			{
				headers: getAuthHeaders(),
			},
		);
		if (!res.ok) {
			handleAuthError(res);
			throw new Error("Failed to search tickets");
		}
		return res.json();
	},

	deleteTicket: async (ticketId: string): Promise<void> => {
		const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
			method: "DELETE",
			headers: getAuthHeaders(),
		});

		if (!res.ok) {
			handleAuthError(res);
			const errorData = await res.json().catch(() => ({}));
			throw new Error(
				errorData.error || errorData.message || "Failed to delete ticket",
			);
		}
	},
};
