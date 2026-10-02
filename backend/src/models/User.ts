// backend/src/models/User.ts
import { DataTypes, Model, Optional } from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/database";

export type UserRole = "admin" | "technician" | "front_desk";

export interface UserAttributes {
	id: string;
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	avatarColor: string;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<
	UserAttributes,
	"id" | "passwordHash" | "role" | "avatarColor" | "isActive"
> {}

export class User
	extends Model<UserAttributes, UserCreationAttributes>
	implements UserAttributes
{
	declare id: string;
	declare name: string;
	declare email: string;
	declare passwordHash: string;
	declare role: UserRole;
	declare avatarColor: string;
	declare isActive: boolean;

	declare readonly createdAt: Date;
	declare readonly updatedAt: Date;
}

User.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			defaultValue: () => crypto.randomUUID(),
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		passwordHash: {
			type: DataTypes.STRING,
			allowNull: false, // Nullable until Auth registration flow is active
		},
		role: {
			type: DataTypes.ENUM("admin", "technician", "front_desk"),
			defaultValue: "technician",
			allowNull: false,
		},
		avatarColor: {
			type: DataTypes.STRING,
			defaultValue: "#6366f1",
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "users",
		timestamps: true,
	},
);
