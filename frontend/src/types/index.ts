// frontend/src/types/index.ts
export type TicketStatus =
	| "received"
	| "diagnosing"
	| "in_progress"
	| "waiting_for_parts"
	| "ready"
	| "delivered";

export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export type UserRole = "admin" | "technician" | "front_desk";

export interface Customer {
	id: string;
	name: string;
	phone: string;
	email?: string;
	createdAt: string;
}

export interface Technician {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarColor: string;
}

export interface Ticket {
	id: string;
	ticketNumber: string;
	customerId: string;
	customer?: Customer;
	assignedTechnicianId?: string | null;
	assignedTechnician?: Technician | null;
	deviceBrand: string;
	deviceModel: string;
	imeiOrSerial?: string;
	issueDescription: string;
	clientNotes?: string;
	diagnosticNotes?: string;
	notificationPreference?: "sms" | "whatsapp" | "call";
	estimatedCost?: number;
	finalCost?: number;
	status: TicketStatus;
	priority: PriorityLevel;
	createdAt: string;
	updatedAt: string;
}

export type CreateTicketPayload = {
	customerId?: string;
	customer: {
		name: string;
		phone: string;
		email?: string;
	};
	assignedTechnicianId?: string | null; // Added: Direct technician assignment at intake
	deviceBrand: string;
	deviceModel: string;
	imeiOrSerial?: string;
	issueDescription: string;
	clientNotes?: string;
	diagnosticNotes?: string;
	notificationPreference?: "sms" | "whatsapp" | "call";
	estimatedCost?: number;
	priority: PriorityLevel;
	status: TicketStatus;
};

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarColor: string;
}

export interface AuthResponse {
	success: boolean;
	token: string;
	user: AuthUser;
	message?: string;
}

export interface AuthContextType {
	user: AuthUser | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (token: string, user: AuthUser) => void;
	logout: () => void;
}
