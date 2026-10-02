// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

// Define the shape of the data stored inside the decrypted JWT token
export interface AuthenticatedUserPayload {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

// Extend Express's default Request interface so TypeScript recognizes `req.user`
declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUserPayload;
		}
	}
}

/**
 * Middleware: authenticateToken
 * Inspects incoming HTTP requests for an Authorization header containing a Bearer JWT.
 * If valid, decodes the user payload and attaches it to `req.user` for downstream controllers.
 */
export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	// Read the Authorization header (expected format: "Bearer <token>")
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Extract just the token string

	// If no token was sent, reject the request immediately with 401 Unauthorized
	if (!token) {
		res
			.status(401)
			.json({
				success: false,
				message: "Authentication required. No token provided.",
			});
		return;
	}

	// Load the secret key used to sign the token from environment variables
	const jwtSecret = process.env.JWT_SECRET || "dev_secret_fallback";

	try {
		// Verify that the token is valid, has not been tampered with, and has not expired
		const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUserPayload;

		// Attach decoded user info (id, email, name, role) to the request object
		req.user = decoded;

		// Hand over control to the next middleware or route handler
		next();
	} catch (error) {
		// Token is either expired, malformed, or signed with an incorrect secret
		res
			.status(401)
			.json({
				success: false,
				message: "Session expired or token is invalid.",
			});
	}
};

/**
 * Middleware Factory: requireRoles
 * Accepts one or more allowed roles (e.g., 'admin', 'technician') and ensures
 * the currently logged-in user belongs to one of those roles before allowing access.
 *
 * Example usage: requireRoles('admin') or requireRoles('admin', 'technician')
 */
export const requireRoles = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		// Safety check: ensure authenticateToken ran before this middleware
		if (!req.user) {
			res.status(401).json({ success: false, message: "Unauthenticated." });
			return;
		}

		// Check if the user's role is in the list of allowed roles
		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({
				success: false,
				message: `Forbidden: role '${req.user.role}' lacks permissions for this operation.`,
			});
			return;
		}

		// Role is authorized; continue to the route handler
		next();
	};
};
