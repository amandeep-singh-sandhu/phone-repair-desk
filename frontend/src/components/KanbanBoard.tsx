// frontend/src/components/KanbanBoard.tsx
import React, { useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { Ticket, TicketStatus } from "../types";
import { WORKFLOW_STAGES } from "../constants/workflow";
import { TicketCard } from "./TicketCard";

interface KanbanBoardProps {
	tickets: Ticket[];
	onStatusChange: (
		ticketId: string,
		nextStatus: TicketStatus,
	) => Promise<void> | void;
	onSelectTicket: (ticket: Ticket) => void;
	onDeleteTicket?: (ticketId: string) => Promise<void> | void;
}

const columnVariants: Variants = {
	hidden: { opacity: 0, y: 15 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
	}),
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
	tickets,
	onStatusChange,
	onSelectTicket,
	onDeleteTicket,
}) => {
	const validTickets = useMemo(
		() =>
			Array.isArray(tickets)
				? tickets.filter((t): t is Ticket => Boolean(t && t.id && t.status))
				: [],
		[tickets],
	);

	return (
		<div className="flex gap-4 overflow-x-auto p-6 flex-1 items-start min-h-[calc(100vh-76px)]">
			{WORKFLOW_STAGES.map((col, index) => {
				const columnTickets = validTickets.filter((t) => t.status === col.id);

				return (
					<motion.div
						key={col.id}
						custom={index}
						variants={columnVariants}
						initial="hidden"
						animate="visible"
						className="w-80 shrink-0 bg-[#0d1322]/80 border border-slate-800/60 rounded-2xl p-3 flex flex-col h-[78vh] shadow-xl backdrop-blur-md select-none"
					>
						{/* Column Header */}
						<div className="flex items-center justify-between mb-3 px-2 pt-1 shrink-0">
							<h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
								{col.label}
							</h2>
							<span className="text-xs font-bold bg-[#1e293b]/70 border border-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-full">
								{columnTickets.length}
							</span>
						</div>

						{/* Tickets Container */}
						<div className="relative flex flex-col gap-3 overflow-y-auto overflow-x-hidden p-1.5 flex-1 scrollbar-thin scrollbar-thumb-slate-800/50 scrollbar-track-transparent">
							<AnimatePresence mode="popLayout">
								{columnTickets.map((ticket) => (
									<TicketCard
										key={ticket.id}
										ticket={ticket}
										onStatusChange={onStatusChange}
										onClick={onSelectTicket}
										onDelete={onDeleteTicket}
									/>
								))}
							</AnimatePresence>

							<AnimatePresence>
								{columnTickets.length === 0 && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.15 }}
										className="absolute top-1.5 inset-x-1.5 h-32 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/20 flex flex-col items-center justify-center gap-1.5 text-center px-4 pointer-events-none"
									>
										<span className="text-xs font-medium text-slate-400">
											No tickets
										</span>
										<span className="text-[11px] text-slate-600">
											Drop or advance tickets here
										</span>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
};
