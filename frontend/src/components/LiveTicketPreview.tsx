// frontend/src/components/LiveTicketPreview.tsx
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, Smartphone, Hash, Clock } from "lucide-react";
import type { PriorityLevel } from "../types";
import type { TicketFormData } from "../utils/validators";

interface LiveTicketPreviewProps {
	form: TicketFormData;
}

const priorityGlow: Record<PriorityLevel, string> = {
	low: "from-blue-600/30 to-cyan-500/20 text-blue-400 border-blue-500/30",
	medium:
		"from-indigo-600/30 to-violet-500/20 text-indigo-400 border-indigo-500/30",
	high: "from-amber-600/30 to-orange-500/20 text-amber-400 border-amber-500/30",
	urgent: "from-rose-600/30 to-red-500/20 text-rose-400 border-rose-500/30",
};

export const LiveTicketPreview: React.FC<LiveTicketPreviewProps> = ({
	form,
}) => {
	const costDisplay =
		form.estimatedCost && !isNaN(parseFloat(form.estimatedCost))
			? parseFloat(form.estimatedCost).toFixed(2)
			: "0.00";

	return (
		<div className="w-full md:w-[42%] h-full p-6 sm:p-8 bg-linear-to-br from-[#0c1224] via-[#0b101e] to-[#070a14] relative flex flex-col justify-between overflow-hidden">
			<div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

			<div className="relative z-10 flex items-center justify-between pr-12 pb-3 shrink-0">
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
					<span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
						Live Ticket Card
					</span>
				</div>
				<span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800/40 flex items-center gap-1 shadow-sm">
					<Sparkles className="w-3 h-3 text-indigo-400" /> INTAKE DRAFT
				</span>
			</div>

			<div className="flex-1 flex items-center justify-center my-auto py-2">
				<motion.div
					layout
					className="relative z-10 w-full bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-4"
				>
					<div
						className={`absolute inset-x-0 top-0 h-0.5 bg-linear-to-r ${priorityGlow[form.priority]}`}
					/>

					<div>
						<div className="flex justify-between items-start mb-3">
							<span className="font-mono text-xs text-slate-400">TICK-NEW</span>
							<span
								className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityGlow[form.priority]} flex items-center gap-1`}
							>
								<ShieldAlert className="w-3 h-3" /> {form.priority}
							</span>
						</div>

						<div className="flex items-center gap-2 text-base font-bold text-white">
							<Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
							<span>
								{form.deviceBrand.trim() || "Device Brand"}{" "}
								{form.deviceModel.trim() || "Model"}
							</span>
						</div>

						<p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed italic">
							"
							{form.issueDescription.trim() ||
								"Describe the issue to preview defect details here..."}
							"
						</p>
					</div>

					<div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
						<div>
							<span className="text-slate-500 block text-[10px]">CLIENT</span>
							<span className="font-medium text-slate-200 truncate block">
								{form.customerName.trim() || "Customer Name"}
							</span>
						</div>
						<div>
							<span className="text-slate-500 block text-[10px]">
								EST. QUOTE
							</span>
							<span className="font-bold text-emerald-400 text-xs">
								${costDisplay}
							</span>
						</div>
					</div>

					{form.imeiOrSerial.trim() && (
						<div className="text-[10px] font-mono text-slate-400 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800 truncate flex items-center gap-1">
							<Hash className="w-3 h-3 text-slate-500" />
							<span>{form.imeiOrSerial.trim()}</span>
						</div>
					)}
				</motion.div>
			</div>

			<div className="relative z-10 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2 shrink-0 pt-2">
				<Clock className="w-4 h-4 text-indigo-400 shrink-0" />
				<span>
					<strong className="text-slate-400 font-semibold">Turnaround:</strong>{" "}
					Standard diagnostics complete in ~2-4 hours.
				</span>
			</div>
		</div>
	);
};
