import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
	process.env.DB_NAME || "phone_repair_db",
	process.env.DB_USER || "postgres",
	process.env.DB_PASSWORD || "postgrespassword",
	{
		host: process.env.DB_HOST || "localhost",
		port: Number(process.env.DB_PORT) || 5432,
		dialect: "postgres",
		logging: false,
		define: {
			timestamps: true,
			paranoid: true,
			underscored: false,
		},
	},
);
