// frontend/src/components/common/DeleteActionButton.tsx
import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface DeleteActionButtonProps {
	onDelete: () => void;
	variant?: "icon" | "button";
	title?: string;
}

export const DeleteActionButton: React.FC<DeleteActionButtonProps> = ({
	onDelete,
	variant = "icon",
	title = "Delete Ticket",
}) => {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete();
	};

	if (variant === "button") {
		return (
			<motion.button
				whileTap={{ scale: 0.96 }}
				type="button"
				onClick={handleClick}
				className="group flex items-center gap-1.5 px-3.5 py-2 text-rose-400 hover:text-rose-200 bg-rose-950/20 hover:bg-rose-950/60 border border-rose-900/30 hover:border-rose-800/60 rounded-xl text-xs font-semibold transition-all duration-150 ease-out cursor-pointer shadow-sm hover:shadow-rose-950/50"
				title={title}
			>
				<Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-300 transition-transform duration-150 group-hover:-rotate-12" />
				<span>Delete Ticket</span>
			</motion.button>
		);
	}

	return (
		<motion.button
			whileTap={{ scale: 0.9 }}
			type="button"
			onClick={handleClick}
			className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-800/40 hover:scale-110 active:scale-95 transition-all duration-150 ease-out cursor-pointer"
			title={title}
		>
			<Trash2 className="w-3.5 h-3.5 transition-transform duration-150 hover:-rotate-6" />
		</motion.button>
	);
};
