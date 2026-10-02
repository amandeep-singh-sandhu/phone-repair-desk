// frontend/src/hooks/useTicketsManager.ts
import { useState, useEffect, useMemo } from "react";
import { repairApi } from "../services/api";
import type {
	Ticket,
	TicketStatus,
	CreateTicketPayload,
	Technician,
} from "../types";
import type { FilterState } from "../components/BoardQuickFilters";

export function useTicketsManager() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [technicians, setTechnicians] = useState<Technician[]>([]);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

	const [filters, setFilters] = useState<FilterState>({
		priorities: [],
		brands: [],
		technicians: [],
	});

	const fetchTickets = async () => {
		setLoading(true);
		try {
			const data = await repairApi.getTickets();
			const cleanData = Array.isArray(data)
				? data.filter((t): t is Ticket => Boolean(t && t.id && t.status))
				: [];
			setTickets(cleanData);
		} catch (err) {
			console.error("Failed to load tickets", err);
		} finally {
			setLoading(false);
		}
	};

	const fetchTechnicians = async () => {
		try {
			const techs = await repairApi.getTechnicians();
			setTechnicians(Array.isArray(techs) ? techs : []);
		} catch (err) {
			console.error("Failed to load technicians", err);
		}
	};

	useEffect(() => {
		fetchTickets();
		fetchTechnicians();
	}, []);

	const handleAssignTechnician = async (
		ticketId: string,
		technicianId: string | null,
	) => {
		const targetTech = technicians.find((t) => t.id === technicianId) || null;

		setTickets((prev) =>
			prev.map((t) =>
				t.id === ticketId
					? {
							...t,
							assignedTechnicianId: technicianId,
							assignedTechnician: targetTech,
						}
					: t,
			),
		);

		setActiveTicket((prev) =>
			prev && prev.id === ticketId
				? {
						...prev,
						assignedTechnicianId: technicianId,
						assignedTechnician: targetTech,
					}
				: prev,
		);

		try {
			const updated = await repairApi.assignTechnician(ticketId, technicianId);
			if (updated && updated.id) {
				setTickets((prev) =>
					prev.map((t) => (t.id === ticketId ? updated : t)),
				);
				setActiveTicket((prev) => (prev?.id === ticketId ? updated : prev));
			}
		} catch (err) {
			console.error("Failed to persist technician assignment:", err);
			fetchTickets();
		}
	};

	const displayedTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			if (
				filters.priorities.length > 0 &&
				!filters.priorities.includes(ticket.priority)
			) {
				return false;
			}

			if (
				filters.brands.length > 0 &&
				!filters.brands.includes(ticket.deviceBrand?.trim())
			) {
				return false;
			}

			if (filters.technicians.length > 0) {
				const hasUnassigned = filters.technicians.includes("unassigned");
				const techId =
					ticket.assignedTechnicianId || ticket.assignedTechnician?.id;

				const matchesSelectedTech = Boolean(
					techId && filters.technicians.includes(techId),
				);
				const matchesUnassigned = Boolean(hasUnassigned && !techId);

				if (!matchesSelectedTech && !matchesUnassigned) {
					return false;
				}
			}

			return true;
		});
	}, [tickets, filters]);

	const handleCreateTicket = async (ticketData: CreateTicketPayload) => {
		try {
			const createdTicket = await repairApi.createTicket(ticketData);
			if (createdTicket && createdTicket.id) {
				setTickets((prev) => [createdTicket, ...prev.filter(Boolean)]);
			}
		} catch (err) {
			console.error("Failed to create ticket:", err);
			throw err;
		}
	};

	const handleUpdateStatus = async (
		ticketId: string,
		nextStatus: TicketStatus,
		notes?: string,
	) => {
		try {
			setTickets((prev) =>
				prev.map((t) =>
					t && t.id === ticketId
						? {
								...t,
								status: nextStatus,
								...(notes !== undefined ? { diagnosticNotes: notes } : {}),
							}
						: t,
				),
			);

			setActiveTicket((prev) =>
				prev && prev.id === ticketId
					? {
							...prev,
							status: nextStatus,
							...(notes !== undefined ? { diagnosticNotes: notes } : {}),
						}
					: prev,
			);

			const updated = await repairApi.updateTicketStatus(
				ticketId,
				nextStatus,
				notes,
			);

			if (updated && updated.id) {
				setTickets((prev) =>
					prev.map((t) => (t && t.id === ticketId ? updated : t)),
				);
				setActiveTicket((prev) =>
					prev && prev.id === ticketId ? updated : prev,
				);
			}
		} catch (err) {
			console.error("Failed to advance ticket status or update notes:", err);
			const fresh = await repairApi.getTickets();
			setTickets(Array.isArray(fresh) ? fresh.filter(Boolean) : []);
		}
	};

	const handleDeleteTicket = async (ticketId: string) => {
		if (!window.confirm("Are you sure you want to delete this repair ticket?"))
			return;

		try {
			setTickets((prev) => prev.filter((t) => t && t.id !== ticketId));
			if (activeTicket?.id === ticketId) {
				setActiveTicket(null);
			}

			await repairApi.deleteTicket(ticketId);
		} catch (err) {
			console.error("Failed to delete ticket:", err);
			const fresh = await repairApi.getTickets();
			setTickets(Array.isArray(fresh) ? fresh.filter(Boolean) : []);
		}
	};

	return {
		tickets,
		setTickets,
		technicians,
		loading,
		isModalOpen,
		setIsModalOpen,
		activeTicket,
		setActiveTicket,
		filters,
		setFilters,
		displayedTickets,
		fetchTickets,
		handleAssignTechnician,
		handleCreateTicket,
		handleUpdateStatus,
		handleDeleteTicket,
	};
}
