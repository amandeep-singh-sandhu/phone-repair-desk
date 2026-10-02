// backend/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database";
import { User } from "./models/index.js";
import "./models/index.js";
import apiRoutes from "./routes/api.js";
import { seedInitialUsers } from "./utils/seedAdmin";

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

// Start Server & Sync Database
const start = async () => {
	try {
		await sequelize.authenticate();
		console.log("Database connected successfully.");

		// Automatically syncs models with PostgreSQL tables
		await sequelize.sync({ alter: true });
		console.log("Database models synchronized.");

		// // Seed initial technicians
		await seedInitialUsers();

		app.listen(PORT, () => {
			console.log(`Backend server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start backend server:", error);
		process.exit(1);
	}
};

start();
