// backend/src/controllers/technicianController.ts
import { Request, Response } from "express";
import { User } from "../models";

export const technicianController = {
	getAllTechnicians: async (_req: Request, res: Response) => {
		try {
			const technicians = await User.findAll({
				where: { role: "technician", isActive: true },
				attributes: ["id", "name", "email", "role", "avatarColor"],
				order: [["name", "ASC"]],
			});
			res.json(technicians);
		} catch (error: any) {
			console.error("Error fetching technicians:", error);
			res
				.status(500)
				.json({ error: error.message || "Failed to fetch technicians" });
		}
	},
};
