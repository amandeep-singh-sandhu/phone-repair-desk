// frontend/src/components/BoardQuickFilters.tsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Zap,
	Smartphone,
	User,
	RotateCcw,
	SlidersHorizontal,
	UserX,
} from "lucide-react";
import type { PriorityLevel, Ticket, Technician } from "../types";
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
	technicians: Technician[]; // 👈 Add technicians prop
	filters: FilterState;
	onFilterChange: (filters: FilterState) => void;
	totalTicketsCount: number;
	matchingTicketsCount: number;
}

export const BoardQuickFilters: React.FC<BoardQuickFiltersProps> = ({
	tickets,
	technicians,
	filters,
	onFilterChange,
	totalTicketsCount,
	matchingTicketsCount,
}) => {
	// Base filtered pool considering active filters other than Priority
	const ticketsForPriorityCounts = useMemo(() => {
		return tickets.filter((t) => {
			if (
				filters.brands.length > 0 &&
				!filters.brands.includes(t.deviceBrand?.trim())
			) {
				return false;
			}
			if (filters.technicians.length > 0) {
				const hasUnassigned = filters.technicians.includes("unassigned");
				const techId = t.assignedTechnicianId || t.assignedTechnician?.id;
				const matchesTech = techId && filters.technicians.includes(techId);
				const matchesUnassigned = hasUnassigned && !techId;
				if (!matchesTech && !matchesUnassigned) return false;
			}
			return true;
		});
	}, [tickets, filters.brands, filters.technicians]);

	// Base filtered pool considering active filters other than Brand
	const ticketsForBrandCounts = useMemo(() => {
		return tickets.filter((t) => {
			if (
				filters.priorities.length > 0 &&
				!filters.priorities.includes(t.priority)
			) {
				return false;
			}
			if (filters.technicians.length > 0) {
				const hasUnassigned = filters.technicians.includes("unassigned");
				const techId = t.assignedTechnicianId || t.assignedTechnician?.id;
				const matchesTech = techId && filters.technicians.includes(techId);
				const matchesUnassigned = hasUnassigned && !techId;
				if (!matchesTech && !matchesUnassigned) return false;
			}
			return true;
		});
	}, [tickets, filters.priorities, filters.technicians]);

	// Base filtered pool considering active filters other than Technician
	const ticketsForTechCounts = useMemo(() => {
		return tickets.filter((t) => {
			if (
				filters.priorities.length > 0 &&
				!filters.priorities.includes(t.priority)
			) {
				return false;
			}
			if (
				filters.brands.length > 0 &&
				!filters.brands.includes(t.deviceBrand?.trim())
			) {
				return false;
			}
			return true;
		});
	}, [tickets, filters.priorities, filters.brands]);

	// 1. Dynamic Brands
	const brandOptions: FilterOption[] = useMemo(() => {
		const allBrands = Array.from(
			new Set(tickets.map((t) => t.deviceBrand?.trim()).filter(Boolean)),
		).sort();

		return allBrands.map((brand) => ({
			id: brand,
			label: brand,
			count: ticketsForBrandCounts.filter(
				(t) => t.deviceBrand?.trim() === brand,
			).length,
		}));
	}, [tickets, ticketsForBrandCounts]);

	// 2. Priority Options
	const priorityOptions: FilterOption[] = useMemo(() => {
		const list: PriorityLevel[] = ["urgent", "high", "medium", "low"];
		return list.map((p) => ({
			id: p,
			label: p.charAt(0).toUpperCase() + p.slice(1),
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

	// 3. Dynamic Technician Options (Unassigned + All Active Technicians)
	const technicianOptions: FilterOption[] = useMemo(() => {
		const unassignedCount = ticketsForTechCounts.filter(
			(t) => !t.assignedTechnicianId && !t.assignedTechnician,
		).length;

		const options: FilterOption[] = [
			{
				id: "unassigned",
				label: "Unassigned",
				count: unassignedCount,
				icon: <UserX className="w-3.5 h-3.5 text-slate-400" />,
			},
		];

		(technicians || []).forEach((tech) => {
			const count = ticketsForTechCounts.filter(
				(t) =>
					t.assignedTechnicianId === tech.id ||
					t.assignedTechnician?.id === tech.id,
			).length;

			options.push({
				id: tech.id,
				label: tech.name,
				count,
				icon: (
					<span
						style={{ backgroundColor: tech.avatarColor || "#6366f1" }}
						className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white font-mono shrink-0"
					>
						{tech.name
							.split(" ")
							.map((n) => n[0])
							.join("")}
					</span>
				),
			});
		});

		return options;
	}, [technicians, ticketsForTechCounts]);

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
			{/* Filter Controls */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mr-1 shrink-0">
					<SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
					<span className="hidden sm:inline">Filter By:</span>
				</div>

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

				<FilterDropdownMenu
					title="Technician"
					icon={<User className="w-3.5 h-3.5" />}
					options={technicianOptions}
					selectedIds={filters.technicians}
					searchable={technicians.length > 5}
					onChange={(selected) =>
						onFilterChange({ ...filters, technicians: selected })
					}
				/>

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

			{/* Match Counter */}
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
