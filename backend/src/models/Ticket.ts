// backend/src/models/Ticket.ts
import { DataTypes, Model, Optional } from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/database";

export type TicketStatus =
	| "received"
	| "diagnosing"
	| "in_progress"
	| "waiting_for_parts"
	| "ready"
	| "delivered";

export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export interface TicketAttributes {
	id: string;
	ticketNumber: string;
	customerId: string;
	deviceBrand: string;
	deviceModel: string;
	imeiOrSerial?: string;
	issueDescription: string;
	clientNotes?: string;
	diagnosticNotes?: string;
	notificationPreference?: "sms" | "whatsapp" | "call";
	estimatedCost?: number;
	finalCost?: number;
	status: TicketStatus;
	priority: PriorityLevel;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface TicketCreationAttributes extends Optional<
	TicketAttributes,
	| "id"
	| "ticketNumber"
	| "imeiOrSerial"
	| "clientNotes"
	| "diagnosticNotes"
	| "notificationPreference"
	| "estimatedCost"
	| "finalCost"
	| "status"
	| "priority"
> {}

export class Ticket
	extends Model<TicketAttributes, TicketCreationAttributes>
	implements TicketAttributes
{
	declare id: string;
	declare ticketNumber: string;
	declare customerId: string;
	declare deviceBrand: string;
	declare deviceModel: string;
	declare imeiOrSerial?: string;
	declare issueDescription: string;
	declare clientNotes?: string;
	declare diagnosticNotes?: string;
	declare notificationPreference?: "sms" | "whatsapp" | "call";
	declare estimatedCost?: number;
	declare finalCost?: number;
	declare status: TicketStatus;
	declare priority: PriorityLevel;
	declare readonly createdAt: Date;
	declare readonly updatedAt: Date;
}

Ticket.init(
	{
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			defaultValue: () => crypto.randomUUID(),
		},
		ticketNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		customerId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		deviceBrand: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		deviceModel: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		imeiOrSerial: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		issueDescription: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		clientNotes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		diagnosticNotes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		notificationPreference: {
			type: DataTypes.ENUM("sms", "whatsapp", "call"),
			defaultValue: "whatsapp",
		},
		estimatedCost: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
			get() {
				const val = this.getDataValue("estimatedCost");
				return val !== undefined && val !== null
					? parseFloat(String(val))
					: undefined;
			},
		},
		finalCost: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
			get() {
				const val = this.getDataValue("finalCost");
				return val !== undefined && val !== null
					? parseFloat(String(val))
					: undefined;
			},
		},
		status: {
			type: DataTypes.ENUM(
				"received",
				"diagnosing",
				"in_progress",
				"waiting_for_parts",
				"ready",
				"delivered",
			),
			defaultValue: "received",
		},
		priority: {
			type: DataTypes.ENUM("low", "medium", "high", "urgent"),
			defaultValue: "medium",
		},
	},
	{
		sequelize,
		tableName: "tickets",
		timestamps: true,
	},
);
