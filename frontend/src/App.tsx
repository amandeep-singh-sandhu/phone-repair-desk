// frontend/src/App.tsx
import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { KanbanBoard } from "./components/KanbanBoard";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { TicketDetailDrawer } from "./components/TicketDetailDrawer"; // <-- Import Drawer
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
			setTickets(data);
		} catch (err) {
			console.error("Failed to load tickets", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTickets();
	}, []);

	const handleStatusChange = async (
		ticketId: string,
		nextStatus: TicketStatus,
	) => {
		try {
			const updated = await repairApi.updateTicketStatus(ticketId, nextStatus);
			// Update both the list and the open drawer's active ticket
			setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
			if (activeTicket?.id === ticketId) {
				setActiveTicket(updated);
			}
		} catch (err) {
			console.error("Failed to update status", err);
		}
	};

	const handleCreateTicket = async (payload: CreateTicketPayload) => {
		const created = await repairApi.createTicket(payload);
		setTickets((prev) => [created, ...prev]);
	};

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
			<Navbar
				onOpenCreate={() => setIsModalOpen(true)}
				onRefresh={fetchTickets}
				loading={loading}
			/>

			<main className="flex-1 overflow-x-auto">
				<KanbanBoard
					tickets={tickets}
					onStatusChange={handleStatusChange}
					onSelectTicket={(ticket) => setActiveTicket(ticket)}
				/>
			</main>

			<CreateTicketModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleCreateTicket}
			/>

			{/* Drawer mounted here */}
			<TicketDetailDrawer
				isOpen={!!activeTicket}
				ticket={activeTicket}
				onClose={() => setActiveTicket(null)}
				onUpdateStatus={handleStatusChange}
			/>
		</div>
	);
}

export default App;
