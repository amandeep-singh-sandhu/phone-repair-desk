// backend/src/models/Customer.ts
import { DataTypes, Model, Optional } from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/database";

export interface CustomerAttributes {
	id: string;
	name: string;
	phone: string;
	email?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CustomerCreationAttributes extends Optional<
	CustomerAttributes,
	"id" | "email"
> {}

// backend/src/models/Customer.ts

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  declare id: string;
  declare name: string;
  declare phone: string;
  declare email?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Customer.init(
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
		phone: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "customers",
		timestamps: true,
	},
);
