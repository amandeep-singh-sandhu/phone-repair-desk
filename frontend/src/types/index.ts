// frontend/src/types/index.ts

// Define the exact stages a phone repair can go through in the workshop.
// Using a TypeScript Union Type ensures no invalid status string can ever be assigned.
export type TicketStatus =
	| "received" // Customer just dropped off the phone
	| "diagnosing" // Technician inspecting the fault
	| "in_progress" // Active repair/screen replacement/soldering
	| "waiting_for_parts" // Waiting on an ordered replacement part
	| "ready" // Repair finished, ready for customer collection
	| "delivered"; // Handed back to customer and marked complete

// Allowed priority levels for triage and sorting
export type PriorityLevel = "low" | "medium" | "high" | "urgent";

// Shape of a Customer record
export interface Customer {
	id: string;
	name: string;
	phone: string;
	email?: string; // Optional: Customer may choose not to provide an email
	createdAt: string; // ISO timestamp string (e.g., "2026-09-29T12:00:00Z")
}

// Shape of a Repair Ticket, containing device details, progress status, and financials
export interface Ticket {
	id: string; // Unique primary key ID (e.g., "t-1")
	ticketNumber: string; // User-friendly reference number (e.g., "TICK-1001")
	customerId: string; // Foreign key pointing to Customer.id
	customer?: Customer; // Populated nested customer object for easy UI display
	deviceBrand: string; // Manufacturer (e.g., "Apple", "Samsung")
	deviceModel: string; // Model name (e.g., "iPhone 13 Pro")
	imeiOrSerial?: string; // Optional: Device IMEI or serial number for identification
	issueDescription: string; // The problem reported during check-in
	diagnosticNotes?: string; // Optional: Technician internal repair notes
	estimatedCost?: number; // Preliminary repair quote in dollars
	finalCost?: number; // Final billed cost
	status: TicketStatus; // Current lifecycle status (from the union above)
	priority: PriorityLevel; // Urgency of the repair
	createdAt: string; // Record creation timestamp
	updatedAt: string; // Record last modified timestamp
}

// Data needed when submitting a new ticket intake form:
// We use Omit to strip out system-generated fields (id, ticketNumber, timestamps)
// because the backend/database generates those automatically.
export type CreateTicketPayload = {
	customerId?: string; // <-- Add this line
	customer: {
		name: string;
		phone: string;
		email?: string;
	};
	deviceBrand: string;
	deviceModel: string;
	imeiOrSerial?: string;
	issueDescription: string;
	diagnosticNotes?: string;
	estimatedCost?: number;
	priority: PriorityLevel;
	status: TicketStatus;
};
