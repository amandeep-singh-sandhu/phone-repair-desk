// frontend/src/hooks/usePermissions.ts
import { useAuth } from "../context/AuthContext";

export const usePermissions = () => {
	const { user } = useAuth();
	const role = user?.role;

	return {
		user,
		role,
		isAdmin: role === "admin",
		isTechnician: role === "technician",
		isFrontDesk: role === "front_desk",

		// Ticket operations
		canCreateTicket: ["admin", "front_desk", "technician"].includes(role || ""),
		canReassignTicket: role === "admin",
		canDeleteTicket: role === "admin",
		canUpdateStatus: role === "admin" || role === "technician",

		// Internal staff management
		canManageStaff: role === "admin",

		// Repair bench notes: Only Admins or the specifically assigned technician
		canEditBenchNotes: (assignedTechnicianId?: string | null) => {
			if (role === "admin") return true;
			if (role === "technician" && user?.id === assignedTechnicianId)
				return true;
			return false;
		},
	};
};
