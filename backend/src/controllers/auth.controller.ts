// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models";

/**
 * Controller: login
 * Validates user credentials, checks whether the account is active,
 * and responds with a signed JWT and safe user profile data.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;

	try {
		// 1. Guard clause: Ensure both email and password are provided in the request body
		if (!email || !password) {
			res
				.status(400)
				.json({ success: false, message: "Email and password are required." });
			return;
		}

		// 2. Sanitize email to prevent case-sensitive lookup mismatches
		const normalizedEmail = email.toLowerCase().trim();

		// 3. Find the user in the database by their unique email
		const user = await User.findOne({ where: { email: normalizedEmail } });

		// If no user exists with this email, return 401 (use generic message for security)
		if (!user || !user.passwordHash) {
			res
				.status(401)
				.json({ success: false, message: "Invalid email or password." });
			return;
		}

		// 4. Verify account status: Prevent deactivated users from logging in
		if (!user.isActive) {
			res.status(403).json({
				success: false,
				message: "Your account has been deactivated. Contact an administrator.",
			});
			return;
		}

		// 5. Compare plain text password against the hashed password stored in the database
		// Now TypeScript knows with 100% certainty that user.passwordHash is a string
		const isMatch = await bcrypt.compare(password, user.passwordHash);
		if (!isMatch) {
			res
				.status(401)
				.json({ success: false, message: "Invalid email or password." });
			return;
		}

		// 6. Read token settings from environment variables
		const jwtSecret = process.env.JWT_SECRET || "dev_secret_fallback";
		const expiresIn = process.env.JWT_EXPIRES_IN || "12h"; // Configured to 12 hours

		// 7. Define claims payload embedded into the token (avoid putting sensitive data like passwordHash here)
		const tokenPayload = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		};

		// 8. Sign the token with the secret key and configure expiration
		const token = jwt.sign(tokenPayload, jwtSecret, {
			expiresIn: expiresIn as any,
		});

		// 9. Send back the token and sanitized user details (excluding passwordHash)
		res.status(200).json({
			success: true,
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				avatarColor: user.avatarColor,
			},
		});
	} catch (error) {
		console.error("[AUTH_CONTROLLER] Login error:", error);
		res
			.status(500)
			.json({
				success: false,
				message: "Internal server error during authentication.",
			});
	}
};

/**
 * Controller: getMe
 * Uses the ID extracted from a validated token to fetch the current user's profile.
 * Useful for bootstrapping the frontend session when the page refreshes.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
	try {
		// Guard clause: ensure token authentication middleware attached the user
		if (!req.user) {
			res.status(401).json({ success: false, message: "Unauthenticated." });
			return;
		}

		// Fetch the freshest user data from database, selecting only safe fields
		const user = await User.findByPk(req.user.id, {
			attributes: ["id", "name", "email", "role", "avatarColor", "isActive"],
		});

		// Check if user was deleted or disabled while their token was still active
		if (!user || !user.isActive) {
			res
				.status(401)
				.json({ success: false, message: "User not found or deactivated." });
			return;
		}

		res.status(200).json({
			success: true,
			user,
		});
	} catch (error) {
		console.error("[AUTH_CONTROLLER] Session lookup error:", error);
		res
			.status(500)
			.json({ success: false, message: "Failed to retrieve session user." });
	}
};


/**
 * Updates the authenticated user's profile information.
 * Allows the user to change their display name, avatar color, and optionally
 * their password after verifying the current password. Returns the updated
 * safe user profile in the response payload.
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated.' });
      return;
    }

    const { name, currentPassword, newPassword, avatarColor } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Incorrect current password.' });
        return;
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (name) user.name = name.trim();
    if (avatarColor) user.avatarColor = avatarColor;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
      },
    });
  } catch (error) {
    console.error('[AUTH] Failed to update profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
