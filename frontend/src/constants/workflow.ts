// frontend/src/constants/workflow.ts
import type { TicketStatus, PriorityLevel } from "../types";

export interface WorkflowStage {
	id: TicketStatus;
	label: string;
	badgeLabel: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
	{ id: "received", label: "Intake / Received", badgeLabel: "Received" },
	{ id: "diagnosing", label: "Diagnosing", badgeLabel: "Diagnosing" },
	{
		id: "waiting_for_parts",
		label: "Parts Pending",
		badgeLabel: "Parts Pending",
	},
	{ id: "in_progress", label: "In Repair", badgeLabel: "In Progress" },
	{ id: "ready", label: "Ready for Pickup", badgeLabel: "Ready" },
	{ id: "delivered", label: "Closed / Delivered", badgeLabel: "Delivered" },
];

export const STATUS_PROGRESSION: Record<TicketStatus, TicketStatus | null> = {
	received: "diagnosing",
	diagnosing: "in_progress",
	in_progress: "ready",
	waiting_for_parts: "in_progress",
	ready: "delivered",
	delivered: null,
};

export const PRIORITY_STYLES: Record<PriorityLevel, string> = {
	low: "bg-slate-800/80 text-slate-300 border-slate-700",
	medium: "bg-blue-950/60 text-blue-400 border-blue-800/50",
	high: "bg-amber-950/60 text-amber-300 border-amber-800/50",
	urgent: "bg-rose-950/60 text-rose-300 border-rose-800/50",
};
