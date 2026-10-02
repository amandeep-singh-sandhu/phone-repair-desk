// frontend/src/components/modals/AccountSettingsModal.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { repairApi } from "../../services/api";

const AVATAR_COLORS = [
	"#6366f1", // Indigo
	"#06b6d4", // Cyan
	"#10b981", // Emerald
	"#f59e0b", // Amber
	"#ec4899", // Pink
	"#8b5cf6", // Purple
	"#ef4444", // Red
];

interface AccountSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { user, login, token } = useAuth();
	const [name, setName] = useState(user?.name || "");
	const [avatarColor, setAvatarColor] = useState(
		user?.avatarColor || "#6366f1",
	);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	if (!isOpen || !user) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFeedback(null);

		if (newPassword && newPassword !== confirmPassword) {
			setFeedback({ type: "error", text: "New passwords do not match." });
			return;
		}

		try {
			setLoading(true);
			const res = await repairApi.updateProfile({
				name,
				avatarColor,
				...(newPassword ? { currentPassword, newPassword } : {}),
			});

			if (res.success && res.user && token) {
				login(token, res.user);
				setFeedback({
					type: "success",
					text: "Account settings saved successfully.",
				});
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
				setTimeout(() => onClose(), 1200);
			}
		} catch (err: any) {
			setFeedback({
				type: "error",
				text: err.message || "Failed to update settings.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.96 }}
				className="w-full max-w-md bg-[#0c1222] border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
			>
				<div className="flex items-center justify-between pb-4 border-b border-slate-800">
					<div>
						<h2 className="text-base font-semibold text-slate-100">
							Account Preferences
						</h2>
						<p className="text-xs text-slate-400">
							Manage your profile and station credentials
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
					>
						<X size={18} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="mt-4 space-y-4">
					<AnimatePresence mode="wait">
						{feedback && (
							<motion.div
								initial={{ opacity: 0, y: -4 }}
								animate={{ opacity: 1, y: 0 }}
								className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
									feedback.type === "success"
										? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
										: "bg-red-500/10 border border-red-500/20 text-red-400"
								}`}
							>
								{feedback.type === "success" ? (
									<Check size={14} />
								) : (
									<AlertCircle size={14} />
								)}
								<span>{feedback.text}</span>
							</motion.div>
						)}
					</AnimatePresence>

					<div>
						<label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
							Display Name
						</label>
						<input
							type="text"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-3 py-2 bg-[#070b14]/70 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
						/>
					</div>

					<div>
						<label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
							Email Address
						</label>
						<input
							type="email"
							disabled
							value={user.email}
							className="w-full px-3 py-2 bg-slate-900/40 border border-slate-800 rounded-lg text-sm text-slate-500 cursor-not-allowed"
						/>
					</div>

					<div>
						<label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
							Avatar Color Accent
						</label>
						<div className="flex items-center gap-2.5">
							{AVATAR_COLORS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setAvatarColor(c)}
									style={{ backgroundColor: c }}
									className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
										avatarColor === c
											? "scale-110 ring-2 ring-white/50"
											: "opacity-70 hover:opacity-100"
									}`}
								>
									{avatarColor === c && (
										<Check size={12} className="text-white" />
									)}
								</button>
							))}
						</div>
					</div>

					<div className="pt-2 border-t border-slate-800/80">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
							<Lock size={12} /> Change Password (Optional)
						</span>
						<div className="space-y-2">
							<input
								type="password"
								placeholder="Current password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className="w-full px-3 py-2 bg-[#070b14]/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
							/>
							<input
								type="password"
								placeholder="New password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full px-3 py-2 bg-[#070b14]/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
							/>
							<input
								type="password"
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-3 py-2 bg-[#070b14]/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
							/>
						</div>
					</div>

					<div className="pt-3 flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5"
						>
							{loading && <Loader2 size={13} className="animate-spin" />}
							<span>Save Changes</span>
						</button>
					</div>
				</form>
			</motion.div>
		</div>
	);
};
