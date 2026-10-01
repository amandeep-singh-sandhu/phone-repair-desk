// frontend/src/components/TicketCard.tsx
import React from "react";
import type { Ticket, TicketStatus } from "../types";
import { Smartphone, User, ArrowRight, Trash2, Lock } from "lucide-react";
import { TechAvatarBadge } from "./common/TechAvatarBadge";

interface TicketCardProps {
	ticket: Ticket;
	onStatusChange: (ticketId: string, nextStatus: TicketStatus) => void;
	onClick: (ticket: Ticket) => void;
	onDelete?: (ticketId: string) => void;
}

const statusFlow: Record<TicketStatus, TicketStatus | null> = {
	received: "diagnosing",
	diagnosing: "in_progress",
	in_progress: "ready",
	waiting_for_parts: "in_progress",
	ready: "delivered",
	delivered: null,
};

export const TicketCard: React.FC<TicketCardProps> = ({
	ticket,
	onStatusChange,
	onClick,
	onDelete,
}) => {
	const nextStatus = statusFlow[ticket.status];
	const isDelivered = ticket.status === "delivered";

	const priorityStyles: Record<string, string> = {
		low: "bg-slate-800/80 text-slate-300 border-slate-700",
		medium: "bg-blue-950/60 text-blue-400 border-blue-800/50",
		high: "bg-amber-950/60 text-amber-300 border-amber-800/50",
		urgent: "bg-rose-950/60 text-rose-300 border-rose-800/50",
	};

	return (
		<div
			onClick={() => onClick(ticket)}
			className={`group relative rounded-xl p-4 shadow-md transition-all duration-150 flex flex-col justify-between gap-3 shrink-0 ${
				isDelivered
					? "bg-[#111827]/70 hover:bg-[#141d30] border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5 cursor-pointer"
					: "bg-[#131b2e] hover:bg-[#17223b] border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 cursor-grab active:cursor-grabbing"
			}`}
		>
			<div>
				{/* Header: Ticket Number, Delete Icon & Badges */}
				<div className="flex justify-between items-center mb-2.5">
					<span
						className={`text-[11px] font-mono font-medium transition-colors ${
							isDelivered
								? "text-emerald-400/90"
								: "text-slate-400 group-hover:text-indigo-300"
						}`}
					>
						{ticket.ticketNumber}
					</span>

					<div className="flex items-center gap-1.5">
						{onDelete && !isDelivered && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onDelete(ticket.id);
								}}
								className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-md border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
								title="Delete Ticket"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						)}

						{/* Terminal Lock Pill */}
						{isDelivered && (
							<span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
								<Lock className="w-2.5 h-2.5" /> Locked
							</span>
						)}

						<span
							className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${priorityStyles[ticket.priority]}`}
						>
							{ticket.priority}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
					<Smartphone
						className={`w-4 h-4 shrink-0 ${
							isDelivered ? "text-emerald-400" : "text-indigo-400"
						}`}
					/>
					<span>
						{ticket.deviceBrand} {ticket.deviceModel}
					</span>
				</div>

				<p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
					{ticket.issueDescription}
				</p>
			</div>

			{/* Footer: Customer, Assigned Tech Badge, Quote & Advance */}
			<div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
				<div className="flex flex-col gap-1.5 min-w-0">
					<div className="flex items-center gap-1.5">
						<User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
						<span className="truncate max-w-28 font-medium text-slate-300">
							{ticket.customer?.name || "Walk-in Client"}
						</span>
					</div>

					{/* Assigned Technician Badge */}
					<div>
						<TechAvatarBadge technician={ticket.assignedTechnician} size="sm" />
					</div>
				</div>

				<div className="flex flex-col items-end gap-1.5 shrink-0">
					{ticket.estimatedCost !== undefined && (
						<span className="text-[11px] font-mono font-semibold text-emerald-400">
							${Number(ticket.estimatedCost).toFixed(2)}
						</span>
					)}

					{nextStatus && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onStatusChange(ticket.id, nextStatus);
							}}
							className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 active:scale-95 font-semibold text-[11px] px-2.5 py-1 rounded-md bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40 transition cursor-pointer"
						>
							Advance{" "}
							<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
						</button>
					)}

					{isDelivered && (
						<span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md">
							<Lock className="w-2.5 h-2.5" /> Finalized
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
