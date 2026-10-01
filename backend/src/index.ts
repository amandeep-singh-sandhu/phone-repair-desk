// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database";
import { User } from "./models/index.js";
import "./models/index.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main API Endpoints
app.use("/api", apiRoutes);

// Health Check
app.get("/api/health", async (_req: Request, res: Response) => {
	try {
		await sequelize.authenticate();
		res.json({
			status: "ok",
			message: "RepairDesk API is connected to PostgreSQL!",
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Database connection failed",
			error: (error as Error).message,
		});
	}
});

// Seed default technicians if table is empty
async function seedTechnicians() {
	try {
		const count = await User.count({ where: { role: "technician" } });
		if (count === 0) {
			await User.bulkCreate([
				{
					name: "Marcus Vance",
					email: "marcus@fixdesk.internal",
					role: "technician",
					avatarColor: "#8b5cf6",
					isActive: true,
				},
				{
					name: "Elena Rostova",
					email: "elena@fixdesk.internal",
					role: "technician",
					avatarColor: "#ec4899",
					isActive: true,
				},
				{
					name: "Devon Miles",
					email: "devon@fixdesk.internal",
					role: "technician",
					avatarColor: "#06b6d4",
					isActive: true,
				},
			]);
			console.log("✅ Seeded initial technicians into PostgreSQL.");
		}
	} catch (seedErr) {
		console.error("⚠️ Technician seeding error:", seedErr);
	}
}

// Start Server & Sync Database
const start = async () => {
	try {
		await sequelize.authenticate();
		console.log("Database connected successfully.");

		// Automatically syncs models with PostgreSQL tables
		await sequelize.sync({ alter: true });
		console.log("Database models synchronized.");

		// Seed initial technicians
		await seedTechnicians();

		app.listen(PORT, () => {
			console.log(`Backend server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start backend server:", error);
		process.exit(1);
	}
};

start();
