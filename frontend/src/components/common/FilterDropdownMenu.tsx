// frontend/src/components/common/FilterDropdownMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface FilterOption {
	id: string;
	label: string;
	count?: number;
	icon?: React.ReactNode;
}

interface FilterDropdownMenuProps {
	title: string;
	icon: React.ReactNode;
	options: FilterOption[];
	selectedIds: string[];
	onChange: (selected: string[]) => void;
	searchable?: boolean;
}

export const FilterDropdownMenu: React.FC<FilterDropdownMenuProps> = ({
	title,
	icon,
	options,
	selectedIds,
	onChange,
	searchable = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on click outside
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

	const filteredOptions = options.filter((opt) =>
		opt.label.toLowerCase().includes(query.toLowerCase().trim()),
	);

	const toggleOption = (id: string) => {
		const next = selectedIds.includes(id)
			? selectedIds.filter((item) => item !== id)
			: [...selectedIds, id];
		onChange(next);
	};

	const clearSelection = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange([]);
	};

	const activeCount = selectedIds.length;

	return (
		<div
			ref={containerRef}
			className="relative inline-block text-left select-none"
		>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer ${
					activeCount > 0
						? "bg-indigo-950/80 border-indigo-500/80 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
						: "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
				}`}
			>
				<span
					className={activeCount > 0 ? "text-indigo-400" : "text-slate-400"}
				>
					{icon}
				</span>
				<span>{title}</span>

				{activeCount > 0 ? (
					<div className="flex items-center gap-1.5 ml-0.5">
						<span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
							{activeCount}
						</span>
						<span
							onClick={clearSelection}
							className="text-slate-400 hover:text-white p-0.5 hover:bg-indigo-900/50 rounded transition-colors"
						>
							<X className="w-3 h-3" />
						</span>
					</div>
				) : (
					<ChevronDown
						className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
							isOpen ? "rotate-180 text-slate-300" : ""
						}`}
					/>
				)}
			</button>

			{/* Floating Filter Popover */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 6, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 4, scale: 0.97 }}
						transition={{ duration: 0.16, ease: "easeOut" }}
						className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#0a0f1d] border border-indigo-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-2.5 z-50 overflow-visible"
					>
						{/* Ambient Top Glow Line */}
						<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />

						{/* Search Input for 20+ Brands */}
						{searchable && (
							<div className="relative mb-2">
								<Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
								<input
									type="text"
									autoFocus
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder={`Search ${title.toLowerCase()}...`}
									className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
								/>
							</div>
						)}

						{/* Options List */}
						<div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
							{filteredOptions.length > 0 ? (
								filteredOptions.map((opt) => {
									const isSelected = selectedIds.includes(opt.id);

									return (
										<div
											key={opt.id}
											onClick={() => toggleOption(opt.id)}
											className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
												isSelected
													? "bg-indigo-950/70 text-indigo-200"
													: "text-slate-300 hover:bg-slate-900 hover:text-white"
											}`}
										>
											<div className="flex items-center gap-2 truncate pr-2">
												<div
													className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
														isSelected
															? "bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-600/40"
															: "border-slate-700 bg-slate-900/60"
													}`}
												>
													{isSelected && (
														<Check className="w-3 h-3 stroke-[3]" />
													)}
												</div>
												{opt.icon}
												<span className="truncate">{opt.label}</span>
											</div>

											{opt.count !== undefined && (
												<span className="text-[10px] font-mono text-slate-500">
													{opt.count}
												</span>
											)}
										</div>
									);
								})
							) : (
								<div className="p-3 text-center text-xs text-slate-500">
									No matching {title.toLowerCase()}
								</div>
							)}
						</div>

						{/* Footer */}
						{activeCount > 0 && (
							<div className="pt-2 mt-1.5 border-t border-slate-800 flex items-center justify-between px-1 text-[11px]">
								<span className="text-slate-500 font-mono">
									{activeCount} selected
								</span>
								<button
									type="button"
									onClick={() => onChange([])}
									className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
								>
									Clear
								</button>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
