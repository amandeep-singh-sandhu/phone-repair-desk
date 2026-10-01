// frontend/src/components/TicketDetailDrawer.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ticket, TicketStatus, Technician } from "../types";
import { WORKFLOW_STAGES, PRIORITY_STYLES } from "../constants/workflow";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { DeleteActionButton } from "./common/DeleteActionButton";
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
	FileText,
	BellRing,
	Package,
	Wrench,
	Save,
	Check,
	Edit3,
	Trash2,
	Lock,
} from "lucide-react";
import type { Variants } from "framer-motion";

// 1. Add props for technicians and assignment handler:
interface DrawerProps {
	ticket: Ticket | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdateStatus: (
		ticketId: string,
		status: TicketStatus,
		notes?: string,
	) => Promise<void> | void;
	onAssignTechnician?: (
		ticketId: string,
		technicianId: string | null,
	) => Promise<void> | void;
	technicians?: Technician[];
	onDeleteTicket?: (ticketId: string) => Promise<void> | void;
}

// 🎯 Elastic Rubber-Band Spring (Overshoots and snaps back)
const bouncySpringVariants: Variants = {
	closed: {
		x: "100%",
		scaleX: 0.96,
		transition: {
			type: "spring",
			stiffness: 420,
			damping: 38,
		},
	},
	open: {
		x: 0,
		scaleX: [0.94, 1.035, 0.99, 1], // Stretches out past original size, then snaps back
		transition: {
			x: {
				type: "spring",
				stiffness: 280,
				damping: 22, // Low damping lets it bounce past the screen edge
				mass: 0.8,
			},
			scaleX: {
				duration: 0.45,
				ease: [0.22, 1.25, 0.36, 1], // Elastic overshoot bezier
			},
		},
	},
};

export const TicketDetailDrawer: React.FC<DrawerProps> = ({
	ticket,
	isOpen,
	onClose,
	onUpdateStatus,
	onDeleteTicket,
	technicians,
	onAssignTechnician,
}) => {
	const [techNotes, setTechNotes] = useState("");
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [isSavingNotes, setIsSavingNotes] = useState(false);
	const [savedSuccess, setSavedSuccess] = useState(false);

	// Check if ticket is in terminal state
	const isDelivered = ticket?.status === "delivered";

	useEscapeKey(onClose, isOpen);

	// Reset editing mode to FALSE whenever ticket changes
	useEffect(() => {
		if (ticket) {
			setTechNotes(ticket.diagnosticNotes || "");
			setIsEditingNotes(false);
		}
	}, [ticket?.id]);

	const handleSaveNotes = async () => {
		if (!ticket || isDelivered) return;
		setIsSavingNotes(true);
		try {
			await onUpdateStatus(ticket.id, ticket.status, techNotes.trim());
			setSavedSuccess(true);
			setIsEditingNotes(false);
			setTimeout(() => setSavedSuccess(false), 2000);
		} finally {
			setIsSavingNotes(false);
		}
	};

	const handleClearNotes = async (e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}

		if (!ticket || isDelivered) return;
		if (
			!window.confirm("Are you sure you want to clear these technician notes?")
		)
			return;

		setIsSavingNotes(true);
		try {
			await onUpdateStatus(ticket.id, ticket.status, "");
			setTechNotes("");
			setIsEditingNotes(false);
			setSavedSuccess(true);
			setTimeout(() => setSavedSuccess(false), 2000);
		} finally {
			setIsSavingNotes(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && ticket && (
				<div className="fixed inset-0 z-50 overflow-hidden">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
					/>

					{/* Slide Panel Container */}
					<div className="fixed inset-y-0 right-0 flex max-w-full pointer-events-none">
						<motion.div
							variants={bouncySpringVariants}
							initial="closed"
							animate="open"
							exit="closed"
							style={{ transformOrigin: "right center" }}
							className="relative w-screen max-w-xl bg-[#0c1222] border-l border-indigo-500/30 flex flex-col justify-between pointer-events-auto shadow-[-25px_0_60px_-10px_rgba(99,102,241,0.35)] will-change-transform"
						>
							{/* Restored Ambient Left Glow Beam */}
							<div
								className="absolute inset-y-0 left-[-1.5px] w-0.5 bg-gradient-to-b from-transparent via-indigo-400 to-transparent pointer-events-none z-30 shadow-[-6px_0_22px_2px_rgba(99,102,241,0.7)]"
								aria-hidden="true"
							/>

							{/* Header */}
							<div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/30">
								<div>
									<div className="flex items-center gap-2">
										<span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-md">
											{ticket.ticketNumber}
										</span>
										<span
											className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
												PRIORITY_STYLES[ticket.priority] ||
												PRIORITY_STYLES.medium
											}`}
										>
											{ticket.priority}
										</span>

										{/* 🔒 Terminal Lock Badge in Header */}
										{isDelivered && (
											<span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
												<Lock className="w-2.5 h-2.5" /> Locked
											</span>
										)}
									</div>
									<h2 className="text-lg font-bold text-white mt-1.5">
										{ticket.deviceBrand} {ticket.deviceModel}
									</h2>
								</div>

								{/* Header Controls (Buttons as they originally were) */}
								<div className="flex items-center gap-2">
									{onDeleteTicket && (
										<div
											className={
												isDelivered
													? "opacity-30 pointer-events-none cursor-not-allowed"
													: ""
											}
										>
											<DeleteActionButton
												onDelete={() =>
													!isDelivered && onDeleteTicket(ticket.id)
												}
											/>
										</div>
									)}

									<motion.button
										whileHover={{ scale: 1.08, rotate: 90 }}
										whileTap={{ scale: 0.92 }}
										type="button"
										onClick={onClose}
										className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 shadow-lg transition-colors cursor-pointer"
										title="Close Drawer"
									>
										<X className="w-4 h-4" />
									</motion.button>
								</div>
							</div>

							{/* Drawer Body */}
							<div className="flex-1 overflow-y-auto p-6 space-y-6">
								{/* Workflow Status Selector */}
								<div>
									<div className="flex items-center justify-between mb-2.5">
										<label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
											Update Workflow Stage
										</label>
										{isDelivered && (
											<span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
												<Lock className="w-3 h-3" /> Terminal / Read Only
											</span>
										)}
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
										{WORKFLOW_STAGES.map((st) => {
											const isActive = ticket.status === st.id;
											return (
												<motion.button
													key={st.id}
													whileHover={!isDelivered ? { scale: 1.02 } : {}}
													whileTap={!isDelivered ? { scale: 0.98 } : {}}
													type="button"
													disabled={isDelivered}
													onClick={() =>
														!isDelivered &&
														onUpdateStatus(ticket.id, st.id, techNotes)
													}
													className={`text-xs font-medium py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between ${
														isActive && isDelivered
															? "border-emerald-500/60 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-default"
															: isActive
																? "border-indigo-500 bg-indigo-950/50 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)] cursor-pointer"
																: isDelivered
																	? "border-slate-900 bg-slate-950/40 text-slate-600 opacity-40 cursor-not-allowed"
																	: "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
													}`}
												>
													<span>{st.badgeLabel}</span>
													{isActive && (
														<CheckCircle2
															className={`w-3.5 h-3.5 ${
																isDelivered
																	? "text-emerald-400"
																	: "text-indigo-400"
															}`}
														/>
													)}
												</motion.button>
											);
										})}
									</div>
								</div>
								{/* Customer Details */}
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
										{ticket.notificationPreference && (
											<div className="flex items-center gap-2 text-indigo-300 text-xs mt-1">
												<BellRing className="w-3.5 h-3.5 text-indigo-400" />
												<span className="capitalize">
													Notify via: {ticket.notificationPreference}
												</span>
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

									{ticket.clientNotes && (
										<div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-3.5">
											<div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
												<FileText className="w-3 h-3 text-slate-400" /> Client
												Notes / Instructions
											</div>
											<p className="text-xs text-slate-300 italic">
												"{ticket.clientNotes}"
											</p>
										</div>
									)}
								</div>

								{/* Technician Assignment Section*/}
								<div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-4">
									<div className="flex items-center justify-between mb-2.5">
										<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
											<User className="w-3.5 h-3.5 text-indigo-400" /> Assigned
											Technician
										</h3>
										{ticket.assignedTechnician &&
											!isDelivered &&
											onAssignTechnician && (
												<button
													type="button"
													onClick={() => onAssignTechnician(ticket.id, null)}
													className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
												>
													Unassign
												</button>
											)}
									</div>

									<div className="flex flex-wrap gap-2">
										{(technicians || []).map((tech) => {
											const isAssigned =
												ticket.assignedTechnician?.id === tech.id;
											return (
												<button
													key={tech.id}
													type="button"
													disabled={isDelivered}
													onClick={() =>
														!isDelivered &&
														onAssignTechnician?.(ticket.id, tech.id)
													}
													className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer ${
														isAssigned
															? "bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/20"
															: isDelivered
																? "opacity-40 border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed"
																: "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
													}`}
												>
													<span
														style={{ backgroundColor: tech.avatarColor }}
														className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 font-mono"
													>
														{tech.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</span>
													<span>{tech.name}</span>
													{isAssigned && (
														<Check className="w-3 h-3 text-indigo-400 ml-0.5" />
													)}
												</button>
											);
										})}
									</div>
								</div>
								
								{/* Tech & Parts Log */}
								<div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
									<div className="flex items-center justify-between">
										<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
											{ticket.status === "waiting_for_parts" ? (
												<>
													<Package className="w-3.5 h-3.5 text-amber-400" />{" "}
													Parts & Supplier Order
												</>
											) : (
												<>
													<Wrench className="w-3.5 h-3.5 text-indigo-400" />{" "}
													Diagnostic & Tech Note
												</>
											)}
										</h3>

										{/* Header Controls - Hidden when delivered */}
										{!isDelivered && (
											<div className="flex items-center gap-2">
												{savedSuccess && (
													<span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
														<Check className="w-3.5 h-3.5" /> Updated
													</span>
												)}

												{isEditingNotes ? (
													<div className="flex items-center gap-1.5">
														<button
															type="button"
															onClick={() => {
																setTechNotes(ticket.diagnosticNotes || "");
																setIsEditingNotes(false);
															}}
															className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg transition cursor-pointer"
														>
															Cancel
														</button>

														{ticket.diagnosticNotes && (
															<button
																type="button"
																disabled={isSavingNotes}
																onClick={(e) => handleClearNotes(e)}
																className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
																title="Clear all technician notes"
															>
																<Trash2 className="w-3 h-3" /> Clear
															</button>
														)}

														<button
															type="button"
															disabled={isSavingNotes || !techNotes.trim()}
															onClick={handleSaveNotes}
															className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition cursor-pointer"
														>
															<Save className="w-3.5 h-3.5" />{" "}
															{isSavingNotes ? "Saving..." : "Save Note"}
														</button>
													</div>
												) : ticket.diagnosticNotes ? (
													<div className="flex items-center gap-1.5">
														<button
															type="button"
															disabled={isSavingNotes}
															onClick={handleClearNotes}
															className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
															title="Clear all technician notes"
														>
															<Trash2 className="w-3 h-3" /> Clear
														</button>

														<button
															type="button"
															onClick={() => setIsEditingNotes(true)}
															className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
														>
															<Edit3 className="w-3.5 h-3.5 text-indigo-400" />{" "}
															Edit
														</button>
													</div>
												) : (
													<button
														type="button"
														onClick={() => setIsEditingNotes(true)}
														className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-800/50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
													>
														<Edit3 className="w-3.5 h-3.5 text-indigo-400" />{" "}
														Add Note
													</button>
												)}
											</div>
										)}
									</div>

									{/* Body */}
									{isEditingNotes && !isDelivered ? (
										<textarea
											autoFocus
											rows={3}
											value={techNotes}
											onChange={(e) => setTechNotes(e.target.value)}
											placeholder={
												ticket.status === "waiting_for_parts"
													? "Specify required components (e.g., OEM AMOLED Panel, Vendor PO #8491, ETA Friday)..."
													: "Document test voltages, diagnostic results, bench observations, or repairs completed..."
											}
											className="w-full text-xs rounded-xl p-3 bg-slate-950/90 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden resize-none leading-relaxed"
										/>
									) : ticket.diagnosticNotes ? (
										<p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 whitespace-pre-wrap">
											{ticket.diagnosticNotes}
										</p>
									) : isDelivered ? (
										<div className="p-4 rounded-xl border border-dashed border-slate-900 bg-slate-950/20 text-center">
											<p className="text-xs text-slate-500 italic">
												No technician notes recorded for this closed ticket.
											</p>
										</div>
									) : (
										<div
											onClick={() => setIsEditingNotes(true)}
											className="group flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-dashed border-slate-800/80 hover:border-indigo-500/50 bg-slate-950/30 hover:bg-indigo-950/10 cursor-pointer transition-all duration-200 text-center"
										>
											<div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-indigo-300 transition-colors">
												<Edit3 className="w-3.5 h-3.5 text-indigo-400" />
												<span>No technician notes recorded yet</span>
											</div>
											<p className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
												Click to log diagnostic bench checks, component
												findings, or part order details.
											</p>
										</div>
									)}
								</div>
								{/* Pricing & Intake Date */}
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
													? Number(ticket.estimatedCost).toFixed(2)
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
							<div className="p-4 border-t border-slate-800/80 bg-slate-950/50 flex justify-between items-center">
								{onDeleteTicket ? (
									<div
										className={
											isDelivered
												? "opacity-30 pointer-events-none cursor-not-allowed"
												: ""
										}
									>
										<DeleteActionButton
											variant="button"
											onDelete={() => !isDelivered && onDeleteTicket(ticket.id)}
										/>
									</div>
								) : (
									<div />
								)}

								<button
									type="button"
									onClick={onClose}
									className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer transition-colors"
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
