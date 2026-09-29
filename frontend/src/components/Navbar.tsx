// frontend/src/components/Navbar.tsx
import React from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, RefreshCw } from "lucide-react";

interface NavbarProps {
	onOpenCreate: () => void;
	onRefresh: () => void;
	loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
	onOpenCreate,
	onRefresh,
	loading,
}) => {
	return (
		<header className="bg-[#090d18]/90 backdrop-blur-md border-b border-slate-800/80 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
			{/* Top ambient indigo beam */}
			<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />

			<div className="flex items-center gap-3">
				<motion.div
					whileHover={{ rotate: 15 }}
					className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30"
				>
					<Wrench className="w-5 h-5" />
				</motion.div>
				<div>
					<h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
						FixDesk OS
						<span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
							PRO
						</span>
					</h1>
					<p className="text-[11px] text-slate-400">Phone Repair Management</p>
				</div>
			</div>

			<div className="flex items-center gap-3">
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
					className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
				>
					<Plus className="w-4 h-4" />
					New Repair Ticket
				</motion.button>
			</div>
		</header>
	);
};
