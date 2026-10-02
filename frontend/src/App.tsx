// frontend/src/App.tsx
// import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./pages/LoginScreen";
import { WorkshopDashboard } from "./components/WorkshopDashboard";
import { Loader2 } from "lucide-react";

function RootNavigator() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="h-screen w-screen bg-[#070b14] flex flex-col items-center justify-center gap-3">
				<Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
				<span className="text-xs text-slate-500 font-mono tracking-wider">
					INITIALIZING FIXDESK OS...
				</span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <LoginScreen />;
	}

	return <WorkshopDashboard />;
}

export function App() {
	return (
		<AuthProvider>
			<RootNavigator />
		</AuthProvider>
	);
}

export default App;
