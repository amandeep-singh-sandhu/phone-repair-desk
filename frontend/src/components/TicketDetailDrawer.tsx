// frontend/src/components/TicketDetailDrawer.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ticket, TicketStatus } from "../types";
import {
	X,
	Smartphone,
	User,
	Phone,
	Mail,
	Hash,
	Calendar,
	DollarSign,
	CheckCircle2,
} from "lucide-react";

interface DrawerProps {
	ticket: Ticket | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdateStatus: (ticketId: string, status: TicketStatus) => void;
}

const ALL_STATUSES: { id: TicketStatus; label: string }[] = [
	{ id: "received", label: "Received" },
	{ id: "diagnosing", label: "Diagnosing" },
	{ id: "waiting_for_parts", label: "Parts Pending" },
	{ id: "in_progress", label: "In Progress" },
	{ id: "ready", label: "Ready" },
	{ id: "delivered", label: "Delivered" },
];

export const TicketDetailDrawer: React.FC<DrawerProps> = ({
	ticket,
	isOpen,
	onClose,
	onUpdateStatus,
}) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && ticket && (
				<div className="fixed inset-0 z-50 overflow-hidden">
					{/* Backdrop with Fade */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
					/>

					{/* Slide Panel Positioning */}
					<div className="fixed inset-y-0 right-0 flex max-w-full pointer-events-none">
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							/* 
                Notice: 
                - No overflow-hidden on this outer wrapper, allowing outward shadow projection
                - border-indigo-500/40 defines a sleek edge
                - shadow-[-25px_0_60px...] radiates soft indigo light out to the left onto the backdrop
              */
							className="relative w-screen max-w-xl bg-[#0c1222] border-l border-indigo-500/30 flex flex-col justify-between pointer-events-auto shadow-[-25px_0_60px_-10px_rgba(99,102,241,0.35)]"
						>
							{/* 
                EXTERNAL GLOWING BEAM:
                - Positioned at -left-[1.5px] strictly outside the drawer boundary
                - shadow-[-6px_0_20px_2px_rgba(99,102,241,0.7)] projects illumination outwards to the left
              */}
							<div
								className="absolute inset-y-0 left-[-1.5px] w-0.5 bg-linear-to-b from-transparent via-indigo-400 to-transparent pointer-events-none z-30 shadow-[-6px_0_22px_2px_rgba(99,102,241,0.7)]"
								aria-hidden="true"
							/>

							{/* Header */}
							<div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/30">
								<div>
									<div className="flex items-center gap-2">
										<span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-md">
											{ticket.ticketNumber}
										</span>
										<span className="text-xs uppercase tracking-wide font-medium text-slate-400">
											Priority:{" "}
											<strong className="text-slate-200">
												{ticket.priority}
											</strong>
										</span>
									</div>
									<h2 className="text-lg font-bold text-white mt-1.5">
										{ticket.deviceBrand} {ticket.deviceModel}
									</h2>
								</div>
								{/* Close Action Button */}
                                <motion.button
                                    whileHover={{ scale: 1.08, rotate: 90 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={onClose}
                                    className="absolute top-5 right-5 z-40 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 shadow-lg transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
							</div>

							{/* Body Content */}
							<div className="flex-1 overflow-y-auto p-6 space-y-6">
								<div>
									<label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
										Update Workflow Stage
									</label>
									<div className="grid grid-cols-3 gap-2">
										{ALL_STATUSES.map((st) => {
											const isActive = ticket.status === st.id;
											return (
												<motion.button
													key={st.id}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													type="button"
													onClick={() => onUpdateStatus(ticket.id, st.id)}
													className={`text-xs font-medium py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
														isActive
															? "border-indigo-500 bg-indigo-950/50 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
															: "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
													}`}
												>
													<span>{st.label}</span>
													{isActive && (
														<CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
													)}
												</motion.button>
											);
										})}
									</div>
								</div>

								{/* Customer Information Card */}
								<div className="bg-[#111827]/70 rounded-xl p-4 border border-slate-800/80">
									<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
										<User className="w-3.5 h-3.5 text-indigo-400" /> Customer
										Details
									</h3>
									<div className="space-y-2 text-sm">
										<div className="font-semibold text-white">
											{ticket.customer?.name || "Walk-in Customer"}
										</div>
										<div className="flex items-center gap-2 text-slate-400 text-xs">
											<Phone className="w-3.5 h-3.5 text-slate-500" />
											<span>
												{ticket.customer?.phone || "No phone recorded"}
											</span>
										</div>
										{ticket.customer?.email && (
											<div className="flex items-center gap-2 text-slate-400 text-xs">
												<Mail className="w-3.5 h-3.5 text-slate-500" />
												<span>{ticket.customer.email}</span>
											</div>
										)}
									</div>
								</div>

								{/* Hardware & Fault Details */}
								<div className="space-y-3">
									<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
										<Smartphone className="w-3.5 h-3.5 text-indigo-400" />{" "}
										Hardware & Fault Details
									</h3>

									{ticket.imeiOrSerial && (
										<div className="flex items-center gap-2 text-xs font-mono bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
											<Hash className="w-3.5 h-3.5 text-slate-500" />
											<span>IMEI/Serial: {ticket.imeiOrSerial}</span>
										</div>
									)}

									<div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-3.5">
										<div className="text-xs text-slate-500 font-medium mb-1">
											Reported Issue
										</div>
										<p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
											{ticket.issueDescription}
										</p>
									</div>
								</div>

								{/* Pricing & Dates */}
								<div className="grid grid-cols-2 gap-3 pt-2">
									<div className="border border-slate-800 bg-[#111827]/50 p-3.5 rounded-xl flex items-center gap-3">
										<div className="p-2 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-900/50">
											<DollarSign className="w-4 h-4" />
										</div>
										<div>
											<div className="text-[11px] text-slate-400 font-medium">
												Est. Quote
											</div>
											<div className="text-base font-bold text-white">
												$
												{ticket.estimatedCost
													? ticket.estimatedCost.toFixed(2)
													: "0.00"}
											</div>
										</div>
									</div>

									<div className="border border-slate-800 bg-[#111827]/50 p-3.5 rounded-xl flex items-center gap-3">
										<div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
											<Calendar className="w-4 h-4" />
										</div>
										<div>
											<div className="text-[11px] text-slate-400 font-medium">
												Intake Date
											</div>
											<div className="text-xs font-semibold text-slate-200">
												{new Date(ticket.createdAt).toLocaleDateString()}
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Footer */}
							<div className="p-4 border-t border-slate-800/80 bg-slate-950/50 flex justify-end">
								<button
									type="button"
									onClick={onClose}
									className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
								>
									Close
								</button>
							</div>
						</motion.div>
					</div>
				</div>
			)}
		</AnimatePresence>
	);
};
