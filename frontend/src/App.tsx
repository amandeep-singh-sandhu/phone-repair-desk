// frontend/src/App.tsx
import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { KanbanBoard } from "./components/KanbanBoard";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { TicketDetailDrawer } from "./components/TicketDetailDrawer";
import { repairApi } from "./services/api";
import type { Ticket, TicketStatus, CreateTicketPayload } from "./types";

export function App() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

	const fetchTickets = async () => {
		setLoading(true);
		try {
			const data = await repairApi.getTickets();
			// Filter out null/undefined entries to prevent Kanban crashes
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

	useEffect(() => {
		fetchTickets();
	}, []);

	// 1. Create ticket handler
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

	// 2. Advance / Update status handler
	const handleUpdateStatus = async (
		ticketId: string,
		nextStatus: TicketStatus,
		notes?: string,
	) => {
		try {
			// 1. Optimistic UI update for board and drawer
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

			// 2. Persist to Postgres via Express
			const updated = await repairApi.updateTicketStatus(
				ticketId,
				nextStatus,
				notes,
			);

			// 3. Sync returned server state
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

	// 3. Delete ticket handler
	const handleDeleteTicket = async (ticketId: string) => {
		if (!window.confirm("Are you sure you want to delete this repair ticket?"))
			return;

		try {
			// Optimistic remove and close drawer if active
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

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
			<Navbar
				onSelectTicket={(ticket) => setActiveTicket(ticket)}
				onOpenCreate={() => setIsModalOpen(true)}
				onRefresh={fetchTickets}
				loading={loading}
			/>

			<main className="flex-1 overflow-x-auto">
				<KanbanBoard
					tickets={tickets}
					onStatusChange={handleUpdateStatus}
					onDeleteTicket={handleDeleteTicket}
					onSelectTicket={(ticket) => setActiveTicket(ticket)}
				/>
			</main>

			<CreateTicketModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleCreateTicket}
			/>

			{/* Drawer with active status sync and delete capability */}
			<TicketDetailDrawer
				isOpen={!!activeTicket}
				ticket={activeTicket}
				onClose={() => setActiveTicket(null)}
				onUpdateStatus={handleUpdateStatus}
				onDeleteTicket={handleDeleteTicket}
			/>
		</div>
	);
}

export default App;
