// frontend/src/utils/kanbanDnd.ts
import type { DropResult } from "@hello-pangea/dnd";
import type { Ticket, TicketStatus } from "../types";

export const TERMINAL_STATUS: TicketStatus = "delivered";

export function canTransition(sourceStatus: TicketStatus): boolean {
	return sourceStatus !== TERMINAL_STATUS;
}

export interface HandleDragEndParams {
	result: DropResult;
	tickets: Ticket[];
	onTicketsReorder?: (reorderedTickets: Ticket[]) => void;
	onStatusChange: (
		ticketId: string,
		nextStatus: TicketStatus,
	) => Promise<void> | void;
	onError?: (message: string) => void;
}

export async function handleKanbanDragEnd({
	result,
	tickets,
	onTicketsReorder,
	onStatusChange,
	onError,
}: HandleDragEndParams): Promise<void> {
	const { destination, source, draggableId } = result;

	// 1. Dropped outside droppable
	if (!destination) return;

	// 2. No movement
	if (
		destination.droppableId === source.droppableId &&
		destination.index === source.index
	) {
		return;
	}

	const sourceStatus = source.droppableId as TicketStatus;
	const targetStatus = destination.droppableId as TicketStatus;

	// 3. Prevent dragging out of terminal state
	if (!canTransition(sourceStatus)) {
		onError?.("Delivered tickets are locked and cannot be moved.");
		return;
	}

	// 4. Same column re-order
	if (sourceStatus === targetStatus) {
		if (onTicketsReorder) {
			const columnTickets = tickets.filter((t) => t.status === sourceStatus);
			const otherTickets = tickets.filter((t) => t.status !== sourceStatus);

			const [movedTicket] = columnTickets.splice(source.index, 1);
			if (movedTicket) {
				columnTickets.splice(destination.index, 0, movedTicket);
				onTicketsReorder([...otherTickets, ...columnTickets]);
			}
		}
		return;
	}

	// 5. Cross-column transition
	try {
		await onStatusChange(draggableId, targetStatus);
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.message : "Failed to update ticket";
		onError?.(message);
	}
}
