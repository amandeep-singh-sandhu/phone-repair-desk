// frontend/src/components/Navbar.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AccountSettingsModal } from "./modals/AccountSettingsModal";
import { motion, AnimatePresence } from "framer-motion";
import {
	Wrench,
	Plus,
	RefreshCw,
	LogOut,
	Settings,
	ChevronDown,
} from "lucide-react";
import { TicketSearchBar } from "./TicketSearchBar";
import type { Ticket } from "../types";

interface NavbarProps {
	onOpenCreate: () => void;
	onRefresh: () => void;
	loading: boolean;
	onSelectTicket: (ticket: Ticket) => void;
}

export const UserNavProfile = () => {
	const { user, logout } = useAuth();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	if (!user) return null;

	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<>
			<div className="relative">
				<button
					type="button"
					onClick={() => setDropdownOpen(!dropdownOpen)}
					className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full bg-[#0c1222] border border-slate-800 hover:border-slate-700 transition cursor-pointer"
				>
					<div
						style={{ backgroundColor: user.avatarColor || "#6366f1" }}
						className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0"
					>
						{initials}
					</div>
					<span className="text-xs font-medium text-slate-200 hidden md:inline max-w-25 truncate">
						{user.name}
					</span>
					<span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
						{user.role}
					</span>
					<ChevronDown
						size={13}
						className={`text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
					/>
				</button>

				<AnimatePresence>
					{dropdownOpen && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setDropdownOpen(false)}
							/>
							<motion.div
								initial={{ opacity: 0, y: 6, scale: 0.96 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: 6, scale: 0.96 }}
								transition={{ duration: 0.15 }}
								className="absolute right-0 top-full mt-2 w-52 bg-[#0c1222] border border-slate-800 rounded-xl shadow-2xl p-1 z-50 backdrop-blur-md"
							>
								<div className="px-3 py-2 border-b border-slate-800/80 mb-1">
									<p className="text-xs font-semibold text-slate-200 truncate">
										{user.name}
									</p>
									<p className="text-[10px] text-slate-400 truncate">
										{user.email}
									</p>
								</div>

								<button
									type="button"
									onClick={() => {
										setDropdownOpen(false);
										setSettingsOpen(true);
									}}
									className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60 transition cursor-pointer"
								>
									<Settings size={14} className="text-slate-400" />
									<span>Account Settings</span>
								</button>

								<button
									type="button"
									onClick={() => {
										setDropdownOpen(false);
										logout();
									}}
									className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
								>
									<LogOut size={14} />
									<span>Sign Out</span>
								</button>
							</motion.div>
						</>
					)}
				</AnimatePresence>
			</div>

			<AccountSettingsModal
				isOpen={settingsOpen}
				onClose={() => setSettingsOpen(false)}
			/>
		</>
	);
};

export const Navbar: React.FC<NavbarProps> = ({
	onOpenCreate,
	onRefresh,
	loading,
	onSelectTicket,
}) => {
	return (
		<header className="bg-[#090d18]/95 backdrop-blur-md border-b border-slate-800/80 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-30 w-full max-w-full">
			{/* Top ambient indigo beam */}
			<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

			{/* Left: Branding */}
			<div className="flex items-center gap-2 sm:gap-3 shrink-0">
				<motion.div
					whileHover={{ rotate: 15 }}
					className="p-1.5 sm:p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30 shrink-0"
				>
					<Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
				</motion.div>
				<div>
					<h1 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1">
						FixDesk
						<span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
							PRO
						</span>
					</h1>
					<p className="hidden md:block text-[11px] text-slate-400">
						Phone Repair Management
					</p>
				</div>
			</div>

			{/* Center: Search Bar with Fluid / Responsive Behavior */}
			<div className="flex items-center justify-center flex-1 mx-2 sm:mx-4 min-w-0">
				<TicketSearchBar onSelectTicket={onSelectTicket} />
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2 sm:gap-3 shrink-0">
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={onRefresh}
					className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-700"
					title="Refresh board"
				>
					<RefreshCw
						className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`}
					/>
				</motion.button>

				<motion.button
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.97 }}
					onClick={onOpenCreate}
					className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer shrink-0"
				>
					<Plus className="w-4 h-4 shrink-0" />
					<span className="hidden sm:inline">New Repair Ticket</span>
					<span className="inline sm:hidden text-xs">Ticket</span>
				</motion.button>

				{/* User Profile Pill & Dropdown */}
				<UserNavProfile />
			</div>
		</header>
	);
};
