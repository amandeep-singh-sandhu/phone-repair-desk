// backend/src/utils/seedAdmin.ts
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models";

export const seedInitialUsers = async (): Promise<void> => {
	try {
		const adminEmail = (process.env.ADMIN_EMAIL || "admin@fixdesk.internal")
			.toLowerCase()
			.trim();
		const adminPassword =
			process.env.ADMIN_INITIAL_PASSWORD || "AdminFixDesk2026!";
		const adminName = process.env.ADMIN_NAME || "FixDesk Admin";

		// 1. Ensure Super Admin exists
		const existingAdmin = await User.findOne({
			where: { email: adminEmail },
		});

		if (!existingAdmin) {
			const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
			await User.create({
				id: crypto.randomUUID(),
				name: adminName,
				email: adminEmail,
				passwordHash: adminPasswordHash,
				role: "admin",
				avatarColor: "#6366f1", // Indigo
				isActive: true,
			});
			console.log(`✅ [SEED] Super admin created: ${adminEmail}`);
		} else {
			console.log(`ℹ️ [SEED] Super admin verified: ${adminEmail}`);
		}

		// 2. Check and seed staff members if they don't exist
		const defaultStaffPasswordHash = await bcrypt.hash("TechPassword123!", 10);

		const staffSeedList = [
			{
				name: "Devon Miles",
				email: "devon@fixdesk.internal",
				passwordHash: defaultStaffPasswordHash,
				role: "technician" as const,
				avatarColor: "#06b6d4", // Cyan
				isActive: true,
			},
			{
				name: "Elena Fisher",
				email: "elena@fixdesk.internal",
				passwordHash: defaultStaffPasswordHash,
				role: "front_desk" as const,
				avatarColor: "#ec4899", // Pink
				isActive: true,
			},
			{
				name: "Marcus Vance",
				email: "marcus@fixdesk.internal",
				passwordHash: defaultStaffPasswordHash,
				role: "technician" as const,
				avatarColor: "#8b5cf6", // Purple
				isActive: true,
			},
		];

		for (const member of staffSeedList) {
			const exists = await User.findOne({
				where: { email: member.email },
			});
			if (!exists) {
				await User.create({
					id: crypto.randomUUID(),
					...member,
				});
				console.log(`✅ [SEED] Created ${member.role}: ${member.email}`);
			}
		}
	} catch (error) {
		console.error("❌ [SEED] Error during user seed:", error);
	}
};
