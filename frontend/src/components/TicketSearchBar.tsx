// frontend/src/components/TicketSearchBar.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
	Search,
	X,
	Smartphone,
	User,
	Lock,
	History,
	Sparkles,
	Loader2,
	ArrowUpRight,
} from "lucide-react";
import { repairApi } from "../services/api";
import type { Ticket } from "../types";

interface TicketSearchBarProps {
	onSelectTicket: (ticket: Ticket) => void;
}

const containerVariants: Variants = {
	hidden: { opacity: 0, y: 10, scale: 0.98 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.22,
			ease: "easeOut",
			staggerChildren: 0.04,
		},
	},
	exit: {
		opacity: 0,
		y: 8,
		scale: 0.98,
		transition: { duration: 0.15 },
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 6 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.16, ease: "easeOut" },
	},
};

export const TicketSearchBar: React.FC<TicketSearchBarProps> = ({
	onSelectTicket,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Ticket[]>([]);
	const [mode, setMode] = useState<"recent" | "search">("recent");
	const [loading, setLoading] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Load recent completed orders on initial mount or when opening without query
	const fetchTickets = async (searchTerm: string) => {
		setLoading(true);
		try {
			const res = await repairApi.searchTickets(searchTerm);
			setResults(res.tickets || []);
			setMode(res.mode);
		} catch (err) {
			console.error("Search error:", err);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	// Focus & Global Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
				setIsOpen(true);
			}
			if (e.key === "Escape") {
				inputRef.current?.blur();
				setIsOpen(false);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Click outside listener
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Debounced backend search
	useEffect(() => {
		if (!isOpen) return;

		const timer = setTimeout(() => {
			fetchTickets(query);
		}, 180);

		return () => clearTimeout(timer);
	}, [query, isOpen]);

	const handleItemClick = (ticket: Ticket) => {
		onSelectTicket(ticket);
		setIsOpen(false);
		setQuery("");
	};

	return (
		<div ref={containerRef} className="relative z-30">
			{/* Animated Expanding Input Pill */}
			<motion.div
				animate={{
					width: isOpen || query ? 390 : 240,
					boxShadow: isOpen
						? "0 0 25px -4px rgba(99, 102, 241, 0.45)"
						: "0 0 0px rgba(0,0,0,0)",
				}}
				transition={{ type: "spring", stiffness: 380, damping: 30 }}
				className={`relative flex items-center h-9 px-3 rounded-xl border transition-colors bg-[#090e1d]/90 backdrop-blur-md ${
					isOpen
						? "border-indigo-500/90 ring-1 ring-indigo-500/40"
						: "border-slate-800/90 hover:border-slate-700"
				}`}
			>
				<motion.div
					animate={{ rotate: loading ? 360 : 0 }}
					transition={
						loading
							? { repeat: Infinity, duration: 1, ease: "linear" }
							: { duration: 0.2 }
					}
					className="mr-2 shrink-0"
				>
					{loading ? (
						<Loader2 className="w-3.5 h-3.5 text-indigo-400" />
					) : (
						<Search className="w-3.5 h-3.5 text-slate-400" />
					)}
				</motion.div>

				<input
					ref={inputRef}
					type="text"
					value={query}
					onFocus={() => {
						setIsOpen(true);
						if (!results.length) fetchTickets(query);
					}}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search active & archived repairs, clients, IMEI..."
					className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none pr-6"
				/>

				{query ? (
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.9 }}
						type="button"
						onClick={() => {
							setQuery("");
							inputRef.current?.focus();
						}}
						className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</motion.button>
				) : (
					<kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] text-slate-500 font-mono border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900/80">
						⌘K
					</kbd>
				)}
			</motion.div>

			{/* Floating Animated Dropdown Shell */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="absolute top-11 left-0 w-full min-w-97.5 bg-[#080c18]/95 border border-indigo-500/35 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-2 overflow-hidden"
					>
						{/* Ambient Top Glow Line */}
						<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/50 to-transparent" />

						{/* Header Tag */}
						<div className="px-2.5 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800/60">
							<div className="flex items-center gap-1.5">
								{mode === "recent" ? (
									<>
										<History className="w-3 h-3 text-emerald-400" />
										<span className="text-emerald-300">
											Recent Order History (Delivered)
										</span>
									</>
								) : (
									<>
										<Sparkles className="w-3 h-3 text-indigo-400" />
										<span>All Database Results</span>
									</>
								)}
							</div>
							<span className="text-slate-500 font-mono">
								{results.length} found
							</span>
						</div>

						{/* Results List */}
						{results.length > 0 ? (
							<div className="space-y-1 max-h-85 overflow-y-auto pr-1">
								{results.map((ticket) => {
									const isDelivered = ticket.status === "delivered";

									return (
										<motion.div
											key={ticket.id}
											variants={itemVariants}
											onMouseDown={() => handleItemClick(ticket)}
											className="p-2.5 rounded-xl border border-transparent hover:border-indigo-500/40 hover:bg-[#131b2e]/90 hover:translate-x-1 transition-all duration-150 ease-out cursor-pointer flex items-center justify-between group bg-slate-900/40 will-change-transform"
										>
											<div className="flex flex-col gap-1 min-w-0 pr-2">
												<div className="flex items-center gap-2">
													<span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-800/50">
														{ticket.ticketNumber}
													</span>
													<span className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
														<Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
														{ticket.deviceBrand} {ticket.deviceModel}
													</span>
												</div>

												<div className="text-[11px] text-slate-400 flex items-center gap-2 truncate pl-0.5">
													<span className="flex items-center gap-1 text-slate-300">
														<User className="w-3 h-3 text-slate-500" />
														{ticket.customer?.name || "Walk-in"}
													</span>
													{ticket.customer?.phone && (
														<>
															<span className="text-slate-600">•</span>
															<span className="font-mono text-slate-400">
																{ticket.customer.phone}
															</span>
														</>
													)}
												</div>
											</div>

											{/* Right Side: Status Badge & Quote */}
											<div className="flex flex-col items-end gap-1 shrink-0">
												{isDelivered ? (
													<span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs shadow-emerald-500/20">
														<Lock className="w-2.5 h-2.5" /> Delivered
													</span>
												) : (
													<span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-indigo-300 border border-slate-700/60">
														{ticket.status.replace(/_/g, " ")}
													</span>
												)}

												<div className="flex items-center gap-1 text-[11px] font-mono font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">
													{ticket.estimatedCost ? (
														<span>
															${Number(ticket.estimatedCost).toFixed(2)}
														</span>
													) : (
														<span className="text-slate-600">No quote</span>
													)}
													<ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="p-7 text-center space-y-1.5"
							>
								<p className="text-xs text-slate-300 font-medium">
									No tickets or clients matched "
									<span className="text-indigo-400">{query}</span>"
								</p>
								<p className="text-[11px] text-slate-500">
									Try searching by IMEI, customer phone, or device model.
								</p>
							</motion.div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
