// frontend/src/components/BoardQuickFilters.tsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Zap,
	Smartphone,
	User,
	RotateCcw,
	SlidersHorizontal,
} from "lucide-react";
import type { PriorityLevel, Ticket } from "../types";
import {
	FilterDropdownMenu,
	type FilterOption,
} from "./common/FilterDropdownMenu";

export interface FilterState {
	priorities: PriorityLevel[];
	brands: string[];
	technicians: string[];
}

interface BoardQuickFiltersProps {
	tickets: Ticket[];
	filters: FilterState;
	onFilterChange: (filters: FilterState) => void;
	totalTicketsCount: number;
	matchingTicketsCount: number;
}

export const BoardQuickFilters: React.FC<BoardQuickFiltersProps> = ({
	tickets,
	filters,
	onFilterChange,
	totalTicketsCount,
	matchingTicketsCount,
}) => {
	// 1. Faceted Tickets for Priority: Filter by active brand/technician first
	const ticketsForPriorityCounts = useMemo(() => {
		return tickets.filter((t) => {
			if (
				filters.brands.length > 0 &&
				!filters.brands.includes(t.deviceBrand?.trim())
			) {
				return false;
			}
			return true;
		});
	}, [tickets, filters.brands]);

	// 2. Faceted Tickets for Brands: Filter by active priority first
	const ticketsForBrandCounts = useMemo(() => {
		return tickets.filter((t) => {
			if (
				filters.priorities.length > 0 &&
				!filters.priorities.includes(t.priority)
			) {
				return false;
			}
			return true;
		});
	}, [tickets, filters.priorities]);

	// 3. Dynamic Brands with contextual counts
	const brandOptions: FilterOption[] = useMemo(() => {
		// Discover all unique brands present in the store
		const allBrands = Array.from(
			new Set(tickets.map((t) => t.deviceBrand?.trim()).filter(Boolean)),
		).sort();

		return allBrands.map((brand) => {
			// Count how many match the current priority selection
			const count = ticketsForBrandCounts.filter(
				(t) => t.deviceBrand?.trim() === brand,
			).length;

			return {
				id: brand,
				label: brand,
				count,
			};
		});
	}, [tickets, ticketsForBrandCounts]);

	// 4. Priority Options with contextual counts
	const priorityOptions: FilterOption[] = useMemo(() => {
		const list: PriorityLevel[] = ["urgent", "high", "medium", "low"];
		return list.map((p) => ({
			id: p,
			label: p.charAt(0).toUpperCase() + p.slice(1),
			// Contextual count reflecting only the currently selected brand
			count: ticketsForPriorityCounts.filter((t) => t.priority === p).length,
			icon: (
				<span
					className={`w-2 h-2 rounded-full ${
						p === "urgent"
							? "bg-rose-500"
							: p === "high"
								? "bg-amber-500"
								: p === "medium"
									? "bg-blue-500"
									: "bg-slate-400"
					}`}
				/>
			),
		}));
	}, [ticketsForPriorityCounts]);

	// 5. Clean Technician Options (Placeholder names removed)
	const technicianOptions: FilterOption[] = useMemo(() => {
		return [
			{
				id: "unassigned",
				label: "Unassigned",
				count: matchingTicketsCount,
			},
		];
	}, [matchingTicketsCount]);

	const hasActiveFilters =
		filters.priorities.length > 0 ||
		filters.brands.length > 0 ||
		filters.technicians.length > 0;

	const handleReset = () => {
		onFilterChange({
			priorities: [],
			brands: [],
			technicians: [],
		});
	};

	return (
		<div className="relative z-20 w-full px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800/60 bg-[#080d19]/80 backdrop-blur-md">
			{/* Left: Filter Controls */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mr-1 shrink-0">
					<SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
					<span className="hidden sm:inline">Filter By:</span>
				</div>

				{/* Priority Dropdown */}
				<FilterDropdownMenu
					title="Priority"
					icon={<Zap className="w-3.5 h-3.5" />}
					options={priorityOptions}
					selectedIds={filters.priorities}
					onChange={(selected) =>
						onFilterChange({
							...filters,
							priorities: selected as PriorityLevel[],
						})
					}
				/>

				{/* Device Brand Dropdown with built-in search */}
				<FilterDropdownMenu
					title="Device Brand"
					icon={<Smartphone className="w-3.5 h-3.5" />}
					options={brandOptions}
					selectedIds={filters.brands}
					searchable={true}
					onChange={(selected) =>
						onFilterChange({ ...filters, brands: selected })
					}
				/>

				{/* Technician Dropdown (Cleaned of mock names) */}
				<FilterDropdownMenu
					title="Technician"
					icon={<User className="w-3.5 h-3.5" />}
					options={technicianOptions}
					selectedIds={filters.technicians}
					searchable={false}
					onChange={(selected) =>
						onFilterChange({ ...filters, technicians: selected })
					}
				/>

				{/* Reset Button */}
				<AnimatePresence>
					{hasActiveFilters && (
						<motion.button
							initial={{ opacity: 0, scale: 0.9, x: -4 }}
							animate={{ opacity: 1, scale: 1, x: 0 }}
							exit={{ opacity: 0, scale: 0.9, x: -4 }}
							transition={{ duration: 0.15 }}
							type="button"
							onClick={handleReset}
							className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer transition-colors active:scale-95 ml-1"
						>
							<RotateCcw className="w-3 h-3" />
							<span>Reset</span>
						</motion.button>
					)}
				</AnimatePresence>
			</div>

			{/* Right: Board Match Counter */}
			<div className="hidden md:flex items-center gap-2 text-xs text-slate-400 shrink-0">
				<span>Showing</span>
				<span className="font-mono font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-md">
					{matchingTicketsCount}
				</span>
				<span>of {totalTicketsCount} repairs</span>
			</div>
		</div>
	);
};
