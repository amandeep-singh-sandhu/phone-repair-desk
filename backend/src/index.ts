import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req: Request, res: Response) => {
	try {
		await sequelize.authenticate();
		res.json({
			status: "ok",
			message: "RepairDesk API is connected to PostgreSQL Docker!",
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Database connection failed",
			error: (error as Error).message,
		});
	}
});

app.listen(PORT, async () => {
	console.log(`Backend server running on http://localhost:${PORT}`);
	try {
		await sequelize.authenticate();
		console.log("Database connected successfully.");
	} catch (error) {
		console.error("Database connection error:", error);
	}
});
