// frontend/src/types/index.ts
export type TicketStatus =
	| "received"
	| "diagnosing"
	| "in_progress"
	| "waiting_for_parts"
	| "ready"
	| "delivered";

export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export interface Customer {
	id: string;
	name: string;
	phone: string;
	email?: string;
	createdAt: string;
}

export interface Ticket {
	id: string;
	ticketNumber: string;
	customerId: string;
	customer?: Customer;
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
