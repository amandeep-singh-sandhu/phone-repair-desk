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
} from "lucide-react";
import { repairApi } from "../services/api";
import type { Ticket } from "../types";

interface TicketSearchBarProps {
	onSelectTicket: (ticket: Ticket) => void;
}

// 🎯 Elastic Dropdown Pop
const dropdownSpringVariants: Variants = {
	hidden: {
		opacity: 0,
		y: -8,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: [0.94, 1.03, 0.99, 1], // Bounces past bounds, then settles
		transition: {
			y: {
				type: "spring",
				stiffness: 340,
				damping: 22,
			},
			scale: {
				duration: 0.38,
				ease: [0.22, 1.25, 0.36, 1],
			},
			opacity: { duration: 0.2 },
			staggerChildren: 0.035,
		},
	},
	exit: {
		opacity: 0,
		y: -4,
		scale: 0.96,
		transition: { duration: 0.15, ease: "easeOut" },
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, x: -4 },
	visible: {
		opacity: 1,
		x: 0,
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
		<div
			ref={containerRef}
			className="relative z-40 w-full max-w-[390px] flex justify-center"
		>
			{/* 🎯 Elastic Spring Input Capsule */}
			<motion.div
				animate={{
					width: isOpen || query ? "100%" : "240px",
					scale: isOpen ? [1, 1.025, 0.995, 1] : 1,
					boxShadow: isOpen
						? "0 0 25px -3px rgba(99, 102, 241, 0.45)"
						: "0 0 0px rgba(0,0,0,0)",
				}}
				transition={{
					width: {
						type: "spring",
						stiffness: 300,
						damping: 20, // Low damping provides the spring rebound
						mass: 0.7,
					},
					scale: {
						duration: 0.35,
						ease: [0.22, 1.25, 0.36, 1],
					},
					boxShadow: { duration: 0.2 },
				}}
				className={`relative flex items-center h-9 px-3 rounded-xl border transition-colors bg-[#090e1d]/90 backdrop-blur-md will-change-transform ${
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
					placeholder="Search repairs, clients, IMEI..."
					className="w-full min-w-0 bg-transparent text-xs text-white placeholder-slate-500 outline-none pr-2 truncate"
				/>

				{query ? (
					<button
						type="button"
						onClick={() => {
							setQuery("");
							inputRef.current?.focus();
						}}
						className="p-1 text-slate-400 hover:text-white rounded-md transition-colors shrink-0"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				) : (
					<kbd className="hidden md:inline-flex items-center text-[9px] text-slate-500 font-mono border border-slate-800 rounded px-1.5 py-0.5 bg-slate-900/80 shrink-0">
						⌘K
					</kbd>
				)}
			</motion.div>

			{/* Floating Dropdown */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						variants={dropdownSpringVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						style={{ transformOrigin: "top center" }}
						className="fixed sm:absolute top-14 sm:top-11 left-3 sm:left-1/2 sm:-translate-x-1/2 w-[calc(100vw-24px)] sm:w-[420px] max-w-[95vw] bg-[#080c18]/95 border border-indigo-500/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-2 overflow-hidden z-50 will-change-transform"
					>
						<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />

						<div className="px-2.5 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800/60">
							<div className="flex items-center gap-1.5">
								{mode === "recent" ? (
									<>
										<History className="w-3 h-3 text-emerald-400" />
										<span className="text-emerald-300">Recent Completed</span>
									</>
								) : (
									<>
										<Sparkles className="w-3 h-3 text-indigo-400" />
										<span>Results</span>
									</>
								)}
							</div>
							<span className="text-slate-500 font-mono">
								{results.length} found
							</span>
						</div>

						{results.length > 0 ? (
							<div className="space-y-1 max-h-80 sm:max-h-96 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
								{results.map((ticket) => {
									const isDelivered = ticket.status === "delivered";

									return (
										<motion.div
											key={ticket.id}
											variants={itemVariants}
											onClick={() => handleItemClick(ticket)}
											className="p-2.5 rounded-xl border border-transparent hover:border-indigo-500/40 hover:bg-[#131b2e]/90 transition cursor-pointer flex items-center justify-between group bg-slate-900/40"
										>
											<div className="flex flex-col gap-1 min-w-0 pr-2">
												<div className="flex items-center gap-2">
													<span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-800/50 shrink-0">
														{ticket.ticketNumber}
													</span>
													<span className="text-xs font-semibold text-white truncate flex items-center gap-1">
														<Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
														{ticket.deviceBrand} {ticket.deviceModel}
													</span>
												</div>

												<div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
													<span className="flex items-center gap-1 text-slate-300 truncate">
														<User className="w-3 h-3 text-slate-500 shrink-0" />
														{ticket.customer?.name || "Walk-in"}
													</span>
												</div>
											</div>

											<div className="flex flex-col items-end gap-1 shrink-0">
												{isDelivered ? (
													<span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
														<Lock className="w-2.5 h-2.5" /> Delivered
													</span>
												) : (
													<span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/90 text-indigo-300 border border-slate-700/60">
														{ticket.status.replace(/_/g, " ")}
													</span>
												)}
												{ticket.estimatedCost ? (
													<span className="text-[11px] font-mono text-slate-300">
														${Number(ticket.estimatedCost).toFixed(2)}
													</span>
												) : null}
											</div>
										</motion.div>
									);
								})}
							</div>
						) : (
							<div className="p-6 text-center space-y-1">
								<p className="text-xs text-slate-300 font-medium">
									No matches for "
									<span className="text-indigo-400">{query}</span>"
								</p>
								<p className="text-[11px] text-slate-500">
									Search customer name, phone, or IMEI.
								</p>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
