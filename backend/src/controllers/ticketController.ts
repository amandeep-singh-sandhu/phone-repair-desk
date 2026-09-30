// backend/src/controllers/ticketController.ts
import { Request, Response } from "express";
import crypto from "crypto";
import { Customer, Ticket } from "../models";
import { Op } from "sequelize";

export const ticketController = {
	getAllTickets: async (_req: Request, res: Response) => {
		try {
			// Calculate the 48-hour cutoff timestamp
			const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

			const tickets = await Ticket.findAll({
				where: {
					[Op.or]: [
						// 1. All tickets that are in active/in-progress stages
						{
							status: {
								[Op.ne]: "delivered",
							},
						},
						// 2. Only show 'delivered' tickets completed within the last 48 hours
						{
							status: "delivered",
							updatedAt: {
								[Op.gte]: fortyEightHoursAgo,
							},
						},
					],
				},
				include: [
					{
						model: Customer,
						as: "customer",
					},
				],
				order: [["createdAt", "DESC"]],
			});

			return res.json(tickets);
		} catch (err: any) {
			console.error("❌ Failed to fetch tickets:", err);
			return res.status(500).json({
				error: "Failed to fetch tickets",
				detail: err.message,
			});
		}
	},

	// backend/src/controllers/ticketController.ts

	createTicket: async (req: Request, res: Response) => {
		try {
			console.log(
				"📥 Incoming Ticket Payload:",
				JSON.stringify(req.body, null, 2),
			);

			// Support both nested payload ({ customer, ticket }) and flat payload
			const ticketData = req.body.ticket || req.body;
			const customerData = req.body.customer;
			const customerId = req.body.customerId || ticketData.customerId;

			let resolvedCustomerId: string | null = customerId || null;

			// 1. If returning customerId provided, verify it exists in DB
			if (resolvedCustomerId) {
				const existing = await Customer.findByPk(resolvedCustomerId);
				if (!existing) {
					resolvedCustomerId = null;
				}
			}

			// 2. If new customer (or no customerId), find existing by phone or create a new one
			if (!resolvedCustomerId) {
				const customerName = customerData?.name?.trim();
				const customerPhone = customerData?.phone?.trim();

				if (!customerName || !customerPhone) {
					return res.status(400).json({
						error: "Customer information is missing",
						detail: "Both customer name and phone number are required.",
					});
				}

				// Deduplication guard: Find existing customer by phone or create new
				const [customerRecord] = await Customer.findOrCreate({
					where: { phone: customerPhone },
					defaults: {
						id: crypto.randomUUID(),
						name: customerName,
						phone: customerPhone,
						email: customerData?.email?.trim() || null,
					},
				});

				resolvedCustomerId = customerRecord.id;
				console.log("✅ Resolved Customer ID:", resolvedCustomerId);
			}

			if (!resolvedCustomerId) {
				return res.status(400).json({
					error: "SequelizeValidationError",
					detail: "Failed to resolve or generate customer ID.",
				});
			}

			// 3. Generate Ticket ID and Ticket Number upfront
			const newTicketId = crypto.randomUUID();
			const ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

			// Parse estimated cost safely
			const rawCost = ticketData.estimatedCost;
			const parsedCost =
				rawCost !== undefined && rawCost !== null && !isNaN(Number(rawCost))
					? parseFloat(String(rawCost))
					: undefined;

			// 4. Create Ticket record
			const newTicket = await Ticket.create({
				id: newTicketId,
				ticketNumber,
				customerId: resolvedCustomerId,
				deviceBrand: ticketData.deviceBrand?.trim() || "Unknown",
				deviceModel: ticketData.deviceModel?.trim() || "Unknown",
				imeiOrSerial: ticketData.imeiOrSerial?.trim() || undefined,
				issueDescription:
					ticketData.issueDescription?.trim() || "No description provided",
				clientNotes: ticketData.clientNotes?.trim() || undefined,
				diagnosticNotes: ticketData.diagnosticNotes?.trim() || undefined,
				notificationPreference: ticketData.notificationPreference || "whatsapp",
				estimatedCost: parsedCost,
				priority: ticketData.priority || "medium",
				status: ticketData.status || "received",
			});

			console.log(
				"✅ Created Ticket:",
				newTicket.ticketNumber,
				"with ID:",
				newTicket.id,
			);

			// 5. Fetch with Customer populated and return directly
			const result = await Ticket.findByPk(newTicket.id, {
				include: [{ model: Customer, as: "customer" }],
			});

			return res
				.status(201)
				.json(result ? result.toJSON() : newTicket.toJSON());
		} catch (err: any) {
			console.error("❌ Detailed createTicket Error in Backend:", err);
			return res.status(500).json({
				error: err.message,
				detail: err.parent?.detail || err.original?.message || err.name,
			});
		}
	},

	// updateStatus: async (req: Request, res: Response) => {
	// 	try {
	// 		const { id } = req.params;
	// 		const { status, diagnosticNotes } = req.body;

	// 		console.log(`🔄 Updating ticket ${id} to status: "${status}"`);

	// 		const validStatuses = [
	// 			"received",
	// 			"diagnosing",
	// 			"in_progress",
	// 			"waiting_for_parts",
	// 			"ready",
	// 			"delivered",
	// 		];

	// 		if (!validStatuses.includes(status)) {
	// 			console.error(`❌ Invalid status received: "${status}"`);
	// 			return res.status(400).json({
	// 				error: `Invalid status: "${status}". Must be one of: ${validStatuses.join(", ")}`,
	// 			});
	// 		}

	// 		const ticketId = Array.isArray(id) ? id[0] : id;
	// 		if (!ticketId) {
	// 			return res.status(400).json({ error: "Ticket ID required" });
	// 		}

	// 		const ticket = await Ticket.findByPk(ticketId);
	// 		if (!ticket) {
	// 			return res.status(404).json({ error: "Ticket not found" });
	// 		}

	// 		if (status) ticket.status = status;
	// 		if (diagnosticNotes !== undefined)
	// 			ticket.diagnosticNotes = diagnosticNotes;

	// 		await ticket.save();

	// 		const updated = await Ticket.findByPk(ticketId, {
	// 			include: [{ model: Customer, as: "customer" }],
	// 		});

	// 		console.log(`✅ Ticket ${ticketId} successfully moved to: ${status}`);
	// 		return res.json(updated ? updated.toJSON() : ticket.toJSON());
	// 	} catch (err: any) {
	// 		console.error("❌ updateStatus error in DB:", err);
	// 		return res.status(500).json({
	// 			error: err.message,
	// 			detail: err.parent?.detail || err.original?.message,
	// 		});
	// 	}
	// },

	updateStatus: async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { status, diagnosticNotes } = req.body;

			// Narrow down string | string[] to a single string for Sequelize
			const ticketId = Array.isArray(id) ? id[0] : id;

			if (!ticketId) {
				return res.status(400).json({
					error: "Invalid Parameter",
					detail: "A valid ticket ID is required.",
				});
			}

			const ticket = await Ticket.findByPk(ticketId);

			if (!ticket) {
				return res.status(404).json({
					error: "Ticket not found",
					detail: `No ticket exists with ID: ${ticketId}`,
				});
			}

			// Terminal State Guard: Once delivered, it cannot be modified or reverted
			if (ticket.status === "delivered") {
				return res.status(400).json({
					error: "Ticket is Locked",
					detail:
						"Tickets marked as 'delivered' are archived and cannot be modified or reverted.",
				});
			}

			// Update status and optional diagnostic notes
			ticket.status = status;
			if (diagnosticNotes !== undefined) {
				ticket.diagnosticNotes = diagnosticNotes
					? diagnosticNotes.trim()
					: undefined;
			}

			await ticket.save();

			// Reload ticket with customer populated to return the full payload
			const updatedTicket = await Ticket.findByPk(ticketId, {
				include: [{ model: Customer, as: "customer" }],
			});

			return res.json(updatedTicket ? updatedTicket.toJSON() : ticket.toJSON());
		} catch (err: any) {
			console.error("❌ Failed to update ticket status:", err);
			return res.status(500).json({
				error: "Failed to update ticket status",
				detail: err.parent?.detail || err.original?.message || err.message,
			});
		}
	},

	// GET /api/tickets/archived
	getArchivedTickets: async (req: Request, res: Response) => {
		try {
			const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

			const archivedTickets = await Ticket.findAll({
				where: {
					status: "delivered",
					updatedAt: {
						[Op.lt]: fortyEightHoursAgo,
					},
				},
				include: [{ model: Customer, as: "customer" }],
				order: [["updatedAt", "DESC"]],
			});

			return res.json(archivedTickets);
		} catch (err: any) {
			return res.status(500).json({ error: err.message });
		}
	},

	// GET /api/tickets/search?q=...
	searchAllTickets: async (req: Request, res: Response) => {
		try {
			const q =
				typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";

			// If no search query is provided, return recently completed/delivered tickets
			if (!q) {
				const recentDelivered = await Ticket.findAll({
					where: { status: "delivered" },
					include: [{ model: Customer, as: "customer" }],
					order: [["updatedAt", "DESC"]],
					limit: 4,
				});
				return res.json({ mode: "recent", tickets: recentDelivered });
			}

			// Search across all tickets (active + archived of all time)
			const tickets = await Ticket.findAll({
				where: {
					[Op.or]: [
						{ ticketNumber: { [Op.iLike]: `%${q}%` } },
						{ deviceBrand: { [Op.iLike]: `%${q}%` } },
						{ deviceModel: { [Op.iLike]: `%${q}%` } },
						{ imeiOrSerial: { [Op.iLike]: `%${q}%` } },
						{ issueDescription: { [Op.iLike]: `%${q}%` } },
						{ "$customer.name$": { [Op.iLike]: `%${q}%` } },
						{ "$customer.phone$": { [Op.iLike]: `%${q}%` } },
					],
				},
				include: [{ model: Customer, as: "customer" }],
				order: [["updatedAt", "DESC"]],
				limit: 10,
			});

			return res.json({ mode: "search", tickets });
		} catch (err: any) {
			console.error("❌ Failed to search tickets:", err);
			return res.status(500).json({
				error: "Failed to search tickets",
				detail: err.parent?.detail || err.message,
			});
		}
	},

	deleteTicket: async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const ticketId = Array.isArray(id) ? id[0] : id;

			if (!ticketId) {
				return res.status(400).json({ error: "Ticket ID required" });
			}

			const ticket = await Ticket.findByPk(ticketId);
			if (!ticket) {
				return res.status(404).json({ error: "Ticket not found" });
			}

			await ticket.destroy();
			return res.json({
				success: true,
				message: "Ticket deleted successfully",
				id: ticketId,
			});
		} catch (err: any) {
			console.error("❌ deleteTicket error:", err);
			return res.status(500).json({ error: err.message });
		}
	},
};
