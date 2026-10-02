// backend/src/controllers/userManagement.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models";

/**
 * Controller: getAllStaff
 * Admin-only: Retrieves a list of all shop personnel (active & inactive).
 */
export const getAllStaff = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const staff = await User.findAll({
			attributes: [
				"id",
				"name",
				"email",
				"role",
				"avatarColor",
				"isActive",
				"createdAt",
			],
			order: [["createdAt", "DESC"]],
		});

		res.status(200).json({ success: true, staff });
	} catch (error) {
		console.error("[USER_MGMT] Failed to fetch staff:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to retrieve staff members." });
	}
};

/**
 * Controller: createStaffMember
 * Admin-only: Provisions a new user account (technician, front_desk, or admin).
 */
export const createStaffMember = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { name, email, password, role, avatarColor } = req.body;

	try {
		// 1. Validate required fields
		if (!name || !email || !password || !role) {
			res.status(400).json({
				success: false,
				message: "Name, email, password, and role are required.",
			});
			return;
		}

		// 2. Normalize and check if email is already taken
		const normalizedEmail = email.toLowerCase().trim();
		const existing = await User.findOne({ where: { email: normalizedEmail } });
		if (existing) {
			res
				.status(409)
				.json({
					success: false,
					message: "A user with this email already exists.",
				});
			return;
		}

		// 3. Hash the initial password securely
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// 4. Generate random fallback avatar accent color if not provided
		const defaultColors = [
			"#6366f1",
			"#10b981",
			"#f59e0b",
			"#ec4899",
			"#8b5cf6",
			"#06b6d4",
		];
		const chosenColor =
			avatarColor ||
			defaultColors[Math.floor(Math.random() * defaultColors.length)];

		// 5. Create the staff record in PostgreSQL
		const newUser = await User.create({
			name: name.trim(),
			email: normalizedEmail,
			passwordHash,
			role,
			avatarColor: chosenColor,
			isActive: true,
		});

		// 6. Return sanitized record (never send back the password hash)
		res.status(201).json({
			success: true,
			message: "Staff member created successfully.",
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
				avatarColor: newUser.avatarColor,
				isActive: newUser.isActive,
			},
		});
	} catch (error) {
		console.error("[USER_MGMT] Error creating staff member:", error);
		res
			.status(500)
			.json({
				success: false,
				message: "Internal server error while creating staff member.",
			});
	}
};

/**
 * Controller: toggleStaffStatus
 * Admin-only: Activates or deactivates a user account.
 * Deactivated users cannot log in or be assigned new tickets.
 */
export const toggleStaffStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { id } = req.params;

	// 1. Guard against undefined or array types
	if (!id || typeof id !== "string") {
		res
			.status(400)
			.json({ success: false, message: "Invalid user ID parameter." });
		return;
	}

	try {
		// Prevent an admin from deactivating their own account
		if (req.user?.id === id) {
			res
				.status(400)
				.json({
					success: false,
					message: "You cannot deactivate your own administrative account.",
				});
			return;
		}

		// Now TypeScript knows `id` is strictly a string
		const user = await User.findByPk(id);
		if (!user) {
			res.status(404).json({ success: false, message: "User not found." });
			return;
		}

		user.isActive = !user.isActive;
		await user.save();

		res.status(200).json({
			success: true,
			message: `User account has been ${user.isActive ? "activated" : "deactivated"}.`,
			isActive: user.isActive,
		});
	} catch (error) {
		console.error("[USER_MGMT] Error updating staff status:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to update user status." });
	}
};
