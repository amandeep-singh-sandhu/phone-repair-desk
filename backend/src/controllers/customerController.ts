// backend/src/controllers/customerController.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import { Customer } from "../models/Customer";
import { Ticket } from "../models/Ticket";

export const customerController = {
	// GET /api/customers?q=...
	searchCustomers: async (req: Request, res: Response) => {
		try {
			const q =
				typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";

			const whereClause = q
				? {
						[Op.or]: [
							{ name: { [Op.iLike]: `%${q}%` } },
							{ phone: { [Op.iLike]: `%${q}%` } },
						],
					}
				: {};

			const customers = await Customer.findAll({
				where: whereClause,
				include: [{ model: Ticket, as: "tickets", attributes: ["id"] }],
				limit: 10,
				order: [["updatedAt", "DESC"]],
			});

			const response = customers.map((c: any) => ({
				id: c.id,
				name: c.name,
				phone: c.phone,
				email: c.email,
				createdAt: c.createdAt,
				pastRepairsCount: c.tickets ? c.tickets.length : 0,
			}));

			res.json(response);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	},

	// GET /api/customers/check-exists?phone=...&name=...
	checkCustomerExists: async (req: Request, res: Response) => {
		try {
			const phone =
				typeof req.query.phone === "string" ? req.query.phone.trim() : "";
			const name =
				typeof req.query.name === "string" ? req.query.name.trim() : "";

			if (!phone) {
				return res.status(400).json({
					error: "Validation Error",
					detail: "Phone number is required to verify customer existence.",
				});
			}

			// Match by phone, and optionally refine with name if provided
			const whereClause: any = { phone };
			if (name) {
				whereClause.name = { [Op.iLike]: name };
			}

			const existingCustomer: any = await Customer.findOne({
				where: whereClause,
				include: [{ model: Ticket, as: "tickets", attributes: ["id"] }],
			});

			if (!existingCustomer) {
				return res.json({ exists: false, customer: null });
			}

			return res.json({
				exists: true,
				customer: {
					id: existingCustomer.id,
					name: existingCustomer.name,
					phone: existingCustomer.phone,
					email: existingCustomer.email,
					pastRepairsCount: existingCustomer.tickets
						? existingCustomer.tickets.length
						: 0,
				},
			});
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	},
};
