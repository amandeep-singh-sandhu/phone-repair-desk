// frontend/src/components/TicketCard.tsx
import React from "react";
import { motion } from "framer-motion";
import type { Ticket, TicketStatus } from "../types";
import { Smartphone, User, ArrowRight } from "lucide-react";

interface TicketCardProps {
	ticket: Ticket;
	onStatusChange: (ticketId: string, nextStatus: TicketStatus) => void;
	onClick: (ticket: Ticket) => void;
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
}) => {
	const nextStatus = statusFlow[ticket.status];

	const priorityStyles: Record<string, string> = {
		low: "bg-slate-800/80 text-slate-300 border-slate-700",
		medium: "bg-blue-950/60 text-blue-400 border-blue-800/50",
		high: "bg-amber-950/60 text-amber-300 border-amber-800/50",
		urgent: "bg-rose-950/60 text-rose-300 border-rose-800/50",
	};

	return (
		<motion.div
			layoutId={ticket.id}
			initial={{ opacity: 0, scale: 0.97 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95 }}
			whileHover={{ y: -2, zIndex: 10 }}
			whileTap={{ scale: 0.98 }}
			transition={{
				type: "spring",
				stiffness: 450,
				damping: 32,
				layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
			}}
			onClick={() => onClick(ticket)}
			className="group relative bg-[#131b2e] hover:bg-[#17223b] border border-slate-800/80 hover:border-indigo-500/50 rounded-xl p-4 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 transition-colors duration-150 cursor-pointer flex flex-col justify-between gap-3 shrink-0"
		>
			<div>
				<div className="flex justify-between items-start mb-2.5">
					<span className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-indigo-300 transition-colors">
						{ticket.ticketNumber}
					</span>
					<span
						className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${priorityStyles[ticket.priority]}`}
					>
						{ticket.priority}
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
					<Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
					<span>
						{ticket.deviceBrand} {ticket.deviceModel}
					</span>
				</div>

				<p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
					{ticket.issueDescription}
				</p>
			</div>

			<div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
				<div className="flex items-center gap-1.5">
					<User className="w-3.5 h-3.5 text-slate-500" />
					<span className="truncate max-w-30 font-medium text-slate-300">
						{ticket.customer?.name}
					</span>
				</div>

				{nextStatus && (
					<motion.button
						whileTap={{ scale: 0.92 }}
						onClick={(e) => {
							e.stopPropagation();
							onStatusChange(ticket.id, nextStatus);
						}}
						className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] px-2.5 py-1 rounded-md bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40 transition cursor-pointer"
					>
						Advance{" "}
						<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
					</motion.button>
				)}
			</div>
		</motion.div>
	);
};
