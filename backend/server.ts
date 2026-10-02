// backend/src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./src/config/database";
import apiRoutes from "./src/routes/api";
import { seedInitialUsers } from "./src/utils/seedAdmin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/api", apiRoutes);

// Health check
app.get("/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sync DB and Start Server
const startServer = async () => {
	try {
		await sequelize.authenticate();
		console.log("✅ PostgreSQL connected successfully via Sequelize.");

		// { alter: true } synchronizes schema non-destructively
		await sequelize.sync({ alter: true });
		console.log("✅ Database models synchronized.");

		// Seed admin & starter users
		await seedInitialUsers();

		app.listen(PORT, () => {
			console.log(`🚀 FixDesk Server running on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("❌ Failed to connect to database:", err);
		process.exit(1);
	}
};

startServer();
