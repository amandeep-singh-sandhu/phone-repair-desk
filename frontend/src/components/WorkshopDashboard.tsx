// frontend/src/components/WorkshopDashboard.tsx
import React from "react";
import { Navbar } from "./Navbar";
import { KanbanBoard } from "./KanbanBoard";
import { BoardQuickFilters } from "./BoardQuickFilters";
import { CreateTicketModal } from "./CreateTicketModal";
import { TicketDetailDrawer } from "./TicketDetailDrawer";
import { useTicketsManager } from "../hooks/useTicketsManager";

export const WorkshopDashboard: React.FC = () => {
	const {
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
	} = useTicketsManager();

	return (
		<div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
			<Navbar
				onSelectTicket={(ticket) => setActiveTicket(ticket)}
				onOpenCreate={() => setIsModalOpen(true)}
				onRefresh={fetchTickets}
				loading={loading}
			/>

			<BoardQuickFilters
				tickets={tickets}
				technicians={technicians}
				filters={filters}
				onFilterChange={setFilters}
				totalTicketsCount={tickets.length}
				matchingTicketsCount={displayedTickets.length}
			/>

			<main className="flex-1 w-full max-w-full overflow-x-auto relative">
				<KanbanBoard
					tickets={displayedTickets}
					onTicketsReorder={(reordered) => setTickets(reordered)}
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

			<TicketDetailDrawer
				isOpen={!!activeTicket}
				ticket={tickets.find((t) => t.id === activeTicket?.id) || activeTicket}
				onClose={() => setActiveTicket(null)}
				onUpdateStatus={handleUpdateStatus}
				onDeleteTicket={handleDeleteTicket}
				technicians={technicians}
				onAssignTechnician={handleAssignTechnician}
			/>
		</div>
	);
};
