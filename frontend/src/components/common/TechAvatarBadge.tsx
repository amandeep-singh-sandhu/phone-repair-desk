// frontend/src/components/common/TechAvatarBadge.tsx
import React from "react";
import type { Technician } from "../../types";
import { UserX } from "lucide-react";

interface TechAvatarBadgeProps {
	technician?: Technician | null;
	size?: "sm" | "md";
	showName?: boolean;
	onClick?: () => void;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export const TechAvatarBadge: React.FC<TechAvatarBadgeProps> = ({
	technician,
	size = "sm",
	onClick,
}) => {
	if (!technician) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer select-none ${
					size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
				}`}
				title="Assign Technician"
			>
				<UserX className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
				<span>Unassigned</span>
			</button>
		);
	}

	const initials = getInitials(technician.name);
	const color = technician.avatarColor || "#6366f1";

	return (
		<div
			onClick={onClick}
			className={`inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 text-slate-200 shadow-sm transition-all duration-150 select-none ${
				onClick
					? "cursor-pointer hover:border-slate-700 hover:bg-slate-800"
					: ""
			} ${size === "sm" ? "pl-0.5 pr-2 py-0.5 text-[11px]" : "pl-1 pr-2.5 py-1 text-xs"}`}
		>
			<span
				style={{ backgroundColor: color }}
				className={`flex items-center justify-center rounded-full font-bold text-white shadow-xs font-mono shrink-0 ${
					size === "sm" ? "w-4 h-4 text-[9px]" : "w-5 h-5 text-[10px]"
				}`}
			>
				{initials}
			</span>
			<span className="font-medium truncate max-w-28">{technician.name}</span>
		</div>
	);
};
