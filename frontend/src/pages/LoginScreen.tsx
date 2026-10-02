// frontend/src/pages/LoginScreen.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Wrench,
	ArrowRight,
	Lock,
	Mail,
	AlertCircle,
	Loader2,
} from "lucide-react";
import { repairApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const LoginScreen: React.FC = () => {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const res = await repairApi.login(email.trim(), password);
			if (res.success && res.token && res.user) {
				login(res.token, res.user);
			} else {
				throw new Error("Invalid response from server");
			}
		} catch (err: any) {
			setError(
				err.message || "Authentication failed. Please verify your credentials.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="relative min-h-screen w-full bg-[#070b14] flex items-center justify-center p-4 selection:bg-indigo-500/30 selection:text-indigo-200">
			{/* Ambient background glow */}
			<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, ease: "easeOut" }}
				className="w-full max-w-sm relative z-10"
			>
				{/* Brand Header */}
				<div className="flex flex-col items-center mb-8">
					<div className="h-11 w-11 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3 border border-indigo-400/20">
						<Wrench className="w-5 h-5 text-white" />
					</div>
					<h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
						FixDesk{" "}
						<span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
							OS
						</span>
					</h1>
					<p className="text-xs text-slate-400 mt-1">
						Internal Repair & Workshop Station
					</p>
				</div>

				{/* Login Card */}
				<div className="bg-[#0c1222]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
					<form onSubmit={handleSubmit} className="space-y-4">
						<AnimatePresence mode="wait">
							{error && (
								<motion.div
									initial={{ opacity: 0, y: -6, height: 0 }}
									animate={{ opacity: 1, y: 0, height: "auto" }}
									exit={{ opacity: 0, y: -6, height: 0 }}
									className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400 overflow-hidden"
								>
									<AlertCircle className="w-4 h-4 shrink-0" />
									<span>{error}</span>
								</motion.div>
							)}
						</AnimatePresence>

						<div>
							<label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
								Staff Email
							</label>
							<div className="relative">
								<Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input
									type="email"
									required
									placeholder="admin@fixdesk.internal"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full pl-9 pr-3 py-2 bg-[#070b14]/70 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
								Password
							</label>
							<div className="relative">
								<Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input
									type="password"
									required
									placeholder="••••••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full pl-9 pr-3 py-2 bg-[#070b14]/70 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
						>
							{isSubmitting ? (
								<Loader2 className="w-4 h-4 animate-spin text-white" />
							) : (
								<>
									<span>Sign In to Terminal</span>
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</button>
					</form>
				</div>

				<p className="text-[11px] text-center text-slate-500 mt-6">
					Access restricted to authorized shop personnel. Contact your shop
					manager for credentials.
				</p>
			</motion.div>
		</div>
	);
};
