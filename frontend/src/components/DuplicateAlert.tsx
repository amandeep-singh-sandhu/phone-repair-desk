import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExistingCustomer {
	id: string;
	name: string;
	phone: string;
	email?: string;
}

interface DuplicateAlertProps {
	existingCustomer: ExistingCustomer | null;
	onContinueAsExisting: (cust: ExistingCustomer) => void;
	onDismiss: () => void;
}

export const DuplicateCustomerAlert: React.FC<DuplicateAlertProps> = ({
	existingCustomer,
	onContinueAsExisting,
	onDismiss,
}) => {
	return (
		<AnimatePresence>
			{existingCustomer && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -8, scale: 0.98 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
					className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 backdrop-blur-md"
				>
					<div className="flex items-start gap-3">
						<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>

						<div className="flex-1 text-xs">
							<p className="font-semibold text-amber-200">
								Customer Record Already Exists
							</p>
							<p className="mt-1 text-slate-300">
								Found existing client{" "}
								<span className="font-medium text-white">
									{existingCustomer.name}
								</span>{" "}
								with phone{" "}
								<span className="font-medium text-white">
									{existingCustomer.phone}
								</span>
								.
							</p>

							<div className="mt-3 flex items-center gap-2">
								<button
									type="button"
									onClick={() => onContinueAsExisting(existingCustomer)}
									className="rounded-lg bg-amber-500 px-3 py-1.5 font-medium text-black transition-colors hover:bg-amber-400"
								>
									Link to Existing & Continue →
								</button>
								<button
									type="button"
									onClick={onDismiss}
									className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-400 hover:text-white"
								>
									Edit Information
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
