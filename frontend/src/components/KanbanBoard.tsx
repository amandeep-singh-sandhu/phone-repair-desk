// frontend/src/components/KanbanBoard.tsx
import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "@hello-pangea/dnd";
import type { Ticket, TicketStatus } from "../types";
import { WORKFLOW_STAGES } from "../constants/workflow";
import { TicketCard } from "./TicketCard";
import { handleKanbanDragEnd, TERMINAL_STATUS } from "../utils/kanbanDnd";
import ReactDOM from "react-dom";
import type {
	DraggableProvided,
	DraggableStateSnapshot,
} from "@hello-pangea/dnd";

interface KanbanBoardProps {
	tickets: Ticket[];
	onTicketsReorder?: (reorderedTickets: Ticket[]) => void;
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

interface DraggablePortalProps {
	provided: DraggableProvided;
	snapshot: DraggableStateSnapshot;
	children: React.ReactNode;
}

const DraggablePortal: React.FC<DraggablePortalProps> = ({
	provided,
	snapshot,
	children,
}) => {
	const content = (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			style={{
				...provided.draggableProps.style,
				cursor: snapshot.isDragging ? "grabbing" : "grab",
			}}
			className={`rounded-xl ${
				snapshot.isDragging
					? "shadow-2xl ring-2 ring-blue-500 scale-[1.02] opacity-95 pointer-events-none"
					: ""
			}`}
		>
			{children}
		</div>
	);

	// If dragging, mount directly to document.body to bypass column clipping/backdrop-blur
	if (snapshot.isDragging) {
		return ReactDOM.createPortal(content, document.body);
	}

	return content;
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
	tickets,
	onTicketsReorder,
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

	const onDragEnd = (result: DropResult) => {
		handleKanbanDragEnd({
			result,
			tickets: validTickets,
			onTicketsReorder,
			onStatusChange,
			onError: (msg) => {
				console.warn(msg);
			},
		});
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="flex gap-4 overflow-x-auto p-3 sm:p-6 flex-1 items-start min-h-[calc(100vh-68px)] snap-x snap-mandatory scroll-smooth w-full">
				{WORKFLOW_STAGES.map((col, index) => {
					const columnTickets = validTickets.filter((t) => t.status === col.id);
					const isDeliveredColumn = col.id === TERMINAL_STATUS;

					return (
						<motion.div
							key={col.id}
							custom={index}
							variants={columnVariants}
							initial="hidden"
							animate="visible"
							className="w-[84vw] sm:w-80 shrink-0 snap-center bg-[#0d1322]/80 border border-slate-800/60 rounded-2xl p-3 flex flex-col h-[75vh] sm:h-[78vh] shadow-xl backdrop-blur-md select-none"
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

							{/* Droppable Drop Zone */}
							<Droppable droppableId={col.id}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className={`relative flex flex-col gap-3 overflow-y-auto overflow-x-hidden p-1.5 flex-1 rounded-xl transition-colors scrollbar-thin scrollbar-thumb-slate-800/50 scrollbar-track-transparent ${
											snapshot.isDraggingOver ? "bg-slate-800/25" : ""
										}`}
									>
										{columnTickets.map((ticket, ticketIdx) => (
											<Draggable
												key={ticket.id}
												draggableId={ticket.id}
												index={ticketIdx}
												isDragDisabled={isDeliveredColumn}
											>
												{(dragProvided, dragSnapshot) => (
													<DraggablePortal
														provided={dragProvided}
														snapshot={dragSnapshot}
													>
														<TicketCard
															ticket={ticket}
															onStatusChange={onStatusChange}
															onClick={onSelectTicket}
															onDelete={onDeleteTicket}
														/>
													</DraggablePortal>
												)}
											</Draggable>
										))}

										{provided.placeholder}

										{/* Empty State */}
										{columnTickets.length === 0 && !snapshot.isDraggingOver && (
											<div className="absolute top-1.5 inset-x-1.5 h-32 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/20 flex flex-col items-center justify-center gap-1.5 text-center px-4 pointer-events-none">
												<span className="text-xs font-medium text-slate-400">
													No tickets
												</span>
												<span className="text-[11px] text-slate-600">
													Drop or advance tickets here
												</span>
											</div>
										)}
									</div>
								)}
							</Droppable>
						</motion.div>
					);
				})}
			</div>
		</DragDropContext>
	);
};
