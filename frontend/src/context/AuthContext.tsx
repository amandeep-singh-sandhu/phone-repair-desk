// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { repairApi } from "../services/api";
import type { AuthUser, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(() =>
		localStorage.getItem("fixdesk_token"),
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Synchronize session token with localStorage
	useEffect(() => {
		if (token) {
			localStorage.setItem("fixdesk_token", token);
		} else {
			localStorage.removeItem("fixdesk_token");
		}
	}, [token]);

	// Session restoration on app boot
	useEffect(() => {
		const verifySession = async () => {
			const storedToken = localStorage.getItem("fixdesk_token");
			if (!storedToken) {
				setIsLoading(false);
				return;
			}

			try {
				const response = await repairApi.getMe();
				if (response.success && response.user) {
					setUser(response.user);
				} else {
					logout();
				}
			} catch (error) {
				console.warn("[AUTH] Session invalid or expired. Logging out.");
				logout();
			} finally {
				setIsLoading(false);
			}
		};

		verifySession();
	}, []);

	const login = (newToken: string, newUser: AuthUser) => {
		setToken(newToken);
		setUser(newUser);
		localStorage.setItem("fixdesk_token", newToken);
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("fixdesk_token");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated: !!token && !!user,
				isLoading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
