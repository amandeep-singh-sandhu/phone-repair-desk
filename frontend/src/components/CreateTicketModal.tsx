// frontend/src/components/CreateTicketModal.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreateTicketPayload, PriorityLevel, Customer } from "../types";
import { repairApi } from "../services/api";
import {
	X,
	User,
	UserPlus,
	Search,
	ArrowRight,
	ArrowLeft,
	Smartphone,
	ShieldAlert,
	DollarSign,
	Check,
	Sparkles,
	CheckCircle2,
	Clock,
	Hash,
	BellRing,
	History,
	FileText,
} from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateTicketPayload) => Promise<void>;
}

type TabType = "new" | "existing";
type NotificationChannel = "sms" | "whatsapp" | "call";

export const CreateTicketModal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [step, setStep] = useState<1 | 2>(1);
	const [customerTab, setCustomerTab] = useState<TabType>("new");
	const [submitting, setSubmitting] = useState(false);

	// Search & Recent Clients state
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<
		(Customer & { pastRepairsCount: number })[]
	>([]);
	const [recentClients, setRecentClients] = useState<
		(Customer & { pastRepairsCount: number })[]
	>([]);
	const [searching, setSearching] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<
		(Customer & { pastRepairsCount: number }) | null
	>(null);

	// Notification preference state for New Customer
	const [notificationPref, setNotificationPref] =
		useState<NotificationChannel>("whatsapp");
	const [customerNotes, setCustomerNotes] = useState("");

	// Form state
	const [form, setForm] = useState({
		customerName: "",
		customerPhone: "",
		customerEmail: "",
		deviceBrand: "",
		deviceModel: "",
		imeiOrSerial: "",
		issueDescription: "",
		estimatedCost: "120",
		priority: "medium" as PriorityLevel,
	});

	// Load recent customers on initial open
	useEffect(() => {
		if (isOpen) {
			repairApi.searchCustomers("").then((res) => {
				// Fallback: if search("") is empty, pull all mock customers
				if (res.length > 0) {
					setRecentClients(res.slice(0, 3));
				} else {
					repairApi.getTickets().then((tickets) => {
						const list = tickets
							.filter((t) => t.customer)
							.map((t) => ({ ...t.customer!, pastRepairsCount: 2 }));
						setRecentClients(list.slice(0, 3));
					});
				}
			});
		}
	}, [isOpen]);

	// Debounced search on name/phone
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			return;
		}
		const timer = setTimeout(async () => {
			setSearching(true);
			const res = await repairApi.searchCustomers(searchQuery);
			setSearchResults(res);
			setSearching(false);
		}, 180);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Handle Escape Key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// Reset state when opening
	useEffect(() => {
		if (isOpen) {
			setStep(1);
			setCustomerTab("new");
			setSelectedCustomer(null);
			setSearchQuery("");
			setCustomerNotes("");
			setNotificationPref("whatsapp");
			setForm({
				customerName: "",
				customerPhone: "",
				customerEmail: "",
				deviceBrand: "",
				deviceModel: "",
				imeiOrSerial: "",
				issueDescription: "",
				estimatedCost: "120",
				priority: "medium",
			});
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSelectExisting = (
		cust: Customer & { pastRepairsCount: number },
	) => {
		setSelectedCustomer(cust);
		setForm((prev) => ({
			...prev,
			customerName: cust.name,
			customerPhone: cust.phone,
			customerEmail: cust.email || "",
		}));
	};

	const isStep1Valid =
		customerTab === "new"
			? form.customerName.trim().length > 1 &&
				form.customerPhone.trim().length > 6
			: selectedCustomer !== null;

	const handleFinalSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!isStep1Valid ||
			!form.deviceBrand ||
			!form.deviceModel ||
			!form.issueDescription
		)
			return;

		setSubmitting(true);
		try {
			await onSubmit({
				customerId: selectedCustomer?.id,
				customer: {
					name: form.customerName,
					phone: form.customerPhone,
					email: form.customerEmail || undefined,
				},
				deviceBrand: form.deviceBrand,
				deviceModel: form.deviceModel,
				imeiOrSerial: form.imeiOrSerial || undefined,
				issueDescription: form.issueDescription,
				diagnosticNotes: customerNotes
					? `Intake Note: ${customerNotes}`
					: undefined,
				estimatedCost: form.estimatedCost
					? parseFloat(form.estimatedCost)
					: undefined,
				priority: form.priority,
				status: "received",
			});
			onClose();
		} finally {
			setSubmitting(false);
		}
	};

	const priorityGlow: Record<PriorityLevel, string> = {
		low: "from-blue-600/30 to-cyan-500/20 text-blue-400 border-blue-500/30",
		medium:
			"from-indigo-600/30 to-violet-500/20 text-indigo-400 border-indigo-500/30",
		high: "from-amber-600/30 to-orange-500/20 text-amber-400 border-amber-500/30",
		urgent: "from-rose-600/30 to-red-500/20 text-rose-400 border-rose-500/30",
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* 1. Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
			/>

			{/* 2. Modal Shell */}
			<div className="flex min-h-full items-center justify-center p-3 sm:p-6 pointer-events-none">
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: 10 }}
					transition={{ type: "spring", damping: 30, stiffness: 320 }}
					className="w-full max-w-4xl min-h-145 md:h-145 bg-[#090d18] border border-indigo-500/35 rounded-3xl shadow-[0_0_70px_-12px_rgba(99,102,241,0.4)] overflow-hidden pointer-events-auto flex flex-col md:flex-row relative"
				>
					{/* Ambient Top Laser Seam */}
					<div
						className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-30 pointer-events-none"
						aria-hidden="true"
					/>

					{/* Close Action Button */}
					<motion.button
						whileHover={{ scale: 1.08, rotate: 90 }}
						whileTap={{ scale: 0.92 }}
						onClick={onClose}
						className="absolute top-5 right-5 z-40 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 shadow-lg transition-colors cursor-pointer"
					>
						<X className="w-4 h-4" />
					</motion.button>

					{/* =========================================
                         LEFT PANEL: Intake Workflow
                        ========================================= */}
					<div className="w-full md:w-[58%] h-full p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#0b1020]/70">
						<div className="flex-1 flex flex-col">
							{/* Step indicator pills */}
							<div className="flex items-center gap-2 mb-4 shrink-0">
								<span
									className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
										step === 1
											? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
											: "bg-slate-800 text-slate-400"
									}`}
								>
									{step === 2 && <Check className="w-3 h-3 text-emerald-400" />}{" "}
									Step 1 • Client
								</span>
								<span className="text-slate-600 font-mono">/</span>
								<span
									className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-colors ${
										step === 2
											? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
											: "bg-slate-800 text-slate-400"
									}`}
								>
									Step 2 • Device & Fault
								</span>
							</div>

							<div className="flex-1 flex flex-col justify-start">
								<AnimatePresence mode="wait">
									{step === 1 ? (
										<motion.div
											key="step1"
											initial={{ opacity: 0, x: -16 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 16 }}
											transition={{ duration: 0.2 }}
											className="space-y-3.5"
										>
											<div>
												<h2 className="text-xl font-bold text-white tracking-tight">
													Who is this repair for?
												</h2>
												<p className="text-xs text-slate-400 mt-0.5">
													Look up returning customer records or register a new
													client profile.
												</p>
											</div>

											{/* Morphing Switcher Pills */}
											<div className="flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 relative">
												<button
													type="button"
													onClick={() => setCustomerTab("new")}
													className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
														customerTab === "new"
															? "text-white"
															: "text-slate-400 hover:text-slate-200"
													}`}
												>
													<UserPlus className="w-3.5 h-3.5" /> New Customer
													{customerTab === "new" && (
														<motion.div
															layoutId="tabPill"
															className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-md shadow-indigo-600/30"
															transition={{
																type: "spring",
																damping: 25,
																stiffness: 350,
															}}
														/>
													)}
												</button>

												<button
													type="button"
													onClick={() => setCustomerTab("existing")}
													className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
														customerTab === "existing"
															? "text-white"
															: "text-slate-400 hover:text-slate-200"
													}`}
												>
													<Search className="w-3.5 h-3.5" /> Returning Client
													{customerTab === "existing" && (
														<motion.div
															layoutId="tabPill"
															className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-md shadow-indigo-600/30"
															transition={{
																type: "spring",
																damping: 25,
																stiffness: 350,
															}}
														/>
													)}
												</button>
											</div>

											{/* ========================================================
                                                 TAB A: New Customer Form (Now fully utilizing space!)
                                                ======================================================== */}
											{customerTab === "new" && (
												<motion.div
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													className="space-y-3 pt-0.5"
												>
													<div>
														<label className="block text-xs font-medium text-slate-300 mb-1">
															Full Name *
														</label>
														<div className="relative">
															<User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
															<input
																autoFocus
																placeholder="e.g. Alex Rivera"
																value={form.customerName}
																onChange={(e) =>
																	setForm({
																		...form,
																		customerName: e.target.value,
																	})
																}
																className="w-full text-sm rounded-xl pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
															/>
														</div>
													</div>

													<div className="grid grid-cols-2 gap-3">
														<div>
															<label className="block text-xs font-medium text-slate-300 mb-1">
																Phone Number *
															</label>
															<input
																placeholder="+1 (555) 000-0000"
																value={form.customerPhone}
																onChange={(e) =>
																	setForm({
																		...form,
																		customerPhone: e.target.value,
																	})
																}
																className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
															/>
														</div>
														<div>
															<label className="block text-xs font-medium text-slate-300 mb-1">
																Email (Optional)
															</label>
															<input
																type="email"
																placeholder="alex@gmail.com"
																value={form.customerEmail}
																onChange={(e) =>
																	setForm({
																		...form,
																		customerEmail: e.target.value,
																	})
																}
																className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
															/>
														</div>
													</div>

													{/* New Feature: Notification Preferences */}
													<div>
														<label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
															<BellRing className="w-3.5 h-3.5 text-indigo-400" />{" "}
															Completion Notification Via
														</label>
														<div className="grid grid-cols-3 gap-2">
															{(
																[
																	"whatsapp",
																	"sms",
																	"call",
																] as NotificationChannel[]
															).map((channel) => (
																<button
																	key={channel}
																	type="button"
																	onClick={() => setNotificationPref(channel)}
																	className={`py-1.5 px-3 rounded-lg text-xs font-medium border capitalize flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
																		notificationPref === channel
																			? "bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-xs"
																			: "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
																	}`}
																>
																	{channel}
																	{notificationPref === channel && (
																		<Check className="w-3 h-3 text-indigo-400" />
																	)}
																</button>
															))}
														</div>
													</div>

													{/* New Feature: Customer Instructions / Preferences */}
													<div>
														<label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
															<FileText className="w-3.5 h-3.5 text-slate-400" />{" "}
															Client Notes / Special Instructions
														</label>
														<input
															placeholder="e.g. Call after 5 PM, request pickup slip, etc."
															value={customerNotes}
															onChange={(e) => setCustomerNotes(e.target.value)}
															className="w-full text-xs rounded-xl px-3 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
														/>
													</div>
												</motion.div>
											)}

											{/* ========================================================
                                                 TAB B: Existing Customer Instant Lookup & Recent Searches
                                                ======================================================== */}
											{customerTab === "existing" && (
												<motion.div
													initial={{ opacity: 0, y: 8 }}
													animate={{ opacity: 1, y: 0 }}
													className="space-y-3 pt-0.5"
												>
													{/* Search Input with Clear Button (X) */}
													<div className="relative">
														<Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
														<input
															autoFocus
															placeholder="Search customer by name or phone..."
															value={searchQuery}
															onChange={(e) => setSearchQuery(e.target.value)}
															className="w-full text-sm rounded-xl pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
														/>
														{/* In-field clear button */}
														{searchQuery && (
															<button
																type="button"
																onClick={() => setSearchQuery("")}
																className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition cursor-pointer"
																title="Clear query"
															>
																<X className="w-3.5 h-3.5" />
															</button>
														)}
													</div>

													{/* Selected Customer Confirmation */}
													{selectedCustomer && (
														<motion.div
															initial={{ scale: 0.96, opacity: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/50 flex items-center justify-between shadow-md shadow-indigo-950/40"
														>
															<div>
																<div className="text-xs font-bold text-white flex items-center gap-1.5">
																	<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
																	{selectedCustomer.name}
																</div>
																<div className="text-[11px] text-indigo-300 mt-0.5">
																	{selectedCustomer.phone} •{" "}
																	{selectedCustomer.pastRepairsCount} previous
																	repairs
																</div>
															</div>
															<button
																type="button"
																onClick={() => setSelectedCustomer(null)}
																className="text-xs text-slate-400 hover:text-white underline cursor-pointer px-2 py-0.5"
															>
																Change
															</button>
														</motion.div>
													)}

													{/* Search Results List OR Recent Clients */}
													<div className="space-y-2 max-h-48 overflow-y-auto px-1.5 py-1">
														{/* Case 1: Active Search Results */}
														{searchQuery.trim().length > 0 ? (
															<>
																{searchResults.map((cust) => {
																	const isSelected =
																		selectedCustomer?.id === cust.id;
																	return (
																		<motion.div
																			key={cust.id}
																			whileHover={{ x: 3 }}
																			whileTap={{ scale: 0.99 }}
																			transition={{
																				type: "spring",
																				stiffness: 450,
																				damping: 25,
																			}}
																			onClick={() => handleSelectExisting(cust)}
																			className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
																				isSelected
																					? "bg-indigo-950/70 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
																					: "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90 hover:border-indigo-500/40 text-slate-300"
																			}`}
																		>
																			<div>
																				<div className="font-semibold text-white flex items-center gap-1.5">
																					{cust.name}
																					{isSelected && (
																						<Check className="w-3 h-3 text-indigo-400" />
																					)}
																				</div>
																				<div className="text-[11px] text-slate-400 mt-0.5">
																					{cust.phone}
																				</div>
																			</div>
																			<span className="text-[10px] font-medium bg-slate-800/90 px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700/80 flex items-center gap-1 shrink-0">
																				<Clock className="w-3 h-3 text-indigo-400" />{" "}
																				{cust.pastRepairsCount} repairs
																			</span>
																		</motion.div>
																	);
																})}

																{searchResults.length === 0 && !searching && (
																	<div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
																		No customer matched "{searchQuery}". Try
																		switching to "New Customer".
																	</div>
																)}
															</>
														) : (
															/* Case 2: Empty Query -> Display Recent & Frequent Searches */
															<div className="space-y-2">
																<div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-0.5">
																	<History className="w-3 h-3 text-indigo-400" />{" "}
																	Recent & Frequent Clients
																</div>
																{recentClients.map((cust) => {
																	const isSelected =
																		selectedCustomer?.id === cust.id;
																	return (
																		<motion.div
																			key={cust.id}
																			whileHover={{ x: 3 }}
																			whileTap={{ scale: 0.99 }}
																			transition={{
																				type: "spring",
																				stiffness: 450,
																				damping: 25,
																			}}
																			onClick={() => handleSelectExisting(cust)}
																			className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
																				isSelected
																					? "bg-indigo-950/70 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
																					: "bg-slate-900/40 hover:bg-slate-800/70 border-slate-800/80 hover:border-indigo-500/30 text-slate-300"
																			}`}
																		>
																			<div>
																				<div className="font-semibold text-white flex items-center gap-1.5">
																					{cust.name}
																					{isSelected && (
																						<Check className="w-3 h-3 text-indigo-400" />
																					)}
																				</div>
																				<div className="text-[11px] text-slate-400 mt-0.5">
																					{cust.phone}
																				</div>
																			</div>
																			<span className="text-[10px] font-medium bg-slate-800/70 px-2 py-0.5 rounded-full text-indigo-300 border border-slate-700/60 flex items-center gap-1 shrink-0">
																				<Clock className="w-3 h-3 text-indigo-400" />{" "}
																				{cust.pastRepairsCount} repairs
																			</span>
																		</motion.div>
																	);
																})}
															</div>
														)}
													</div>
												</motion.div>
											)}
										</motion.div>
									) : (
										/* Step 2: Hardware & Defect */
										<motion.div
											key="step2"
											initial={{ opacity: 0, x: 16 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -16 }}
											transition={{ duration: 0.2 }}
											className="space-y-3.5"
										>
											<div>
												<h2 className="text-xl font-bold text-white tracking-tight">
													Device & Defect Information
												</h2>
												<p className="text-xs text-slate-400 mt-0.5">
													Document the incoming hardware, reported faults, and
													estimated quote.
												</p>
											</div>

											<div className="grid grid-cols-2 gap-3">
												<div>
													<label className="block text-xs font-medium text-slate-300 mb-1">
														Brand *
													</label>
													<input
														autoFocus
														placeholder="e.g. Apple"
														value={form.deviceBrand}
														onChange={(e) =>
															setForm({ ...form, deviceBrand: e.target.value })
														}
														className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
													/>
												</div>
												<div>
													<label className="block text-xs font-medium text-slate-300 mb-1">
														Model *
													</label>
													<input
														placeholder="e.g. iPhone 13 Pro"
														value={form.deviceModel}
														onChange={(e) =>
															setForm({ ...form, deviceModel: e.target.value })
														}
														className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
													/>
												</div>
											</div>

											<div>
												<label className="block text-xs font-medium text-slate-300 mb-1">
													IMEI or Serial (Optional)
												</label>
												<div className="relative">
													<Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
													<input
														placeholder="15-digit IMEI or serial number"
														value={form.imeiOrSerial}
														onChange={(e) =>
															setForm({ ...form, imeiOrSerial: e.target.value })
														}
														className="w-full text-sm rounded-xl pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden font-mono"
													/>
												</div>
											</div>

											<div>
												<label className="block text-xs font-medium text-slate-300 mb-1">
													Issue Description *
												</label>
												<textarea
													rows={2}
													placeholder="Shattered OLED screen, no touch response..."
													value={form.issueDescription}
													onChange={(e) =>
														setForm({
															...form,
															issueDescription: e.target.value,
														})
													}
													className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
												/>
											</div>

											<div className="grid grid-cols-2 gap-3">
												<div>
													<label className="block text-xs font-medium text-slate-300 mb-1">
														Quote Estimate ($)
													</label>
													<div className="relative">
														<DollarSign className="w-4 h-4 text-emerald-400 absolute left-3.5 top-2.5" />
														<input
															type="number"
															step="0.01"
															value={form.estimatedCost}
															onChange={(e) =>
																setForm({
																	...form,
																	estimatedCost: e.target.value,
																})
															}
															className="w-full text-sm rounded-xl pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
														/>
													</div>
												</div>
												<div>
													<label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
														<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />{" "}
														Priority
													</label>
													<select
														value={form.priority}
														onChange={(e) =>
															setForm({
																...form,
																priority: e.target.value as PriorityLevel,
															})
														}
														className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
													>
														<option value="low">Low</option>
														<option value="medium">Medium</option>
														<option value="high">High</option>
														<option value="urgent">Urgent</option>
													</select>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>

						{/* Bottom Form Actions */}
						<div className="flex items-center justify-between pt-4 border-t border-slate-800/80 shrink-0">
							{step === 2 ? (
								<button
									type="button"
									onClick={() => setStep(1)}
									className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer"
								>
									<ArrowLeft className="w-3.5 h-3.5" /> Back to Client
								</button>
							) : (
								<button
									type="button"
									onClick={onClose}
									className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
								>
									Cancel
								</button>
							)}

							{step === 1 ? (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type="button"
									disabled={!isStep1Valid}
									onClick={() => setStep(2)}
									className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
								>
									Configure Hardware <ArrowRight className="w-3.5 h-3.5" />
								</motion.button>
							) : (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type="button"
									disabled={
										submitting ||
										!form.deviceBrand ||
										!form.deviceModel ||
										!form.issueDescription
									}
									onClick={handleFinalSubmit}
									className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/40 cursor-pointer"
								>
									{submitting
										? "Generating Ticket..."
										: "Confirm & Create Ticket"}
									<Sparkles className="w-3.5 h-3.5" />
								</motion.button>
							)}
						</div>
					</div>

					{/* =========================================
              RIGHT PANEL: Vertically Centered Live Ticket Pass
              ========================================= */}
					<div className="w-full md:w-[42%] h-full p-6 sm:p-8 bg-linear-to-br from-[#0c1224] via-[#0b101e] to-[#070a14] relative flex flex-col justify-between overflow-hidden">
						{/* Ambient Background Glow Orb */}
						<div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
						<div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

						{/* Top Pass Header */}
						<div className="relative z-10 flex items-center justify-between pr-12 pb-3 shrink-0">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
								<span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
									Live Ticket Card
								</span>
							</div>
							<span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800/40 flex items-center gap-1 shadow-sm">
								<Sparkles className="w-3 h-3 text-indigo-400" /> INTAKE DRAFT
							</span>
						</div>

						{/* Centered Ticket Preview Card */}
						<div className="flex-1 flex items-center justify-center my-auto py-2">
							<motion.div
								layout
								className="relative z-10 w-full bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 shadow-2xl flex flex-col justify-between gap-4"
							>

								<div>
									<div className="flex justify-between items-start mb-3">
										<span className="font-mono text-xs text-slate-400">
											TICK-NEW
										</span>
										<span
											className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityGlow[form.priority]} flex items-center gap-1`}
										>
											<ShieldAlert className="w-3 h-3" /> {form.priority}
										</span>
									</div>

									<div className="flex items-center gap-2 text-base font-bold text-white">
										<Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
										<span>
											{form.deviceBrand || "Device Brand"}{" "}
											{form.deviceModel || "Model"}
										</span>
									</div>

									<p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed italic">
										"
										{form.issueDescription ||
											"Describe the issue to preview defect details here..."}
										"
									</p>
								</div>

								{/* Pass Metadata Grid */}
								<div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
									<div>
										<span className="text-slate-500 block text-[10px]">
											CLIENT
										</span>
										<span className="font-medium text-slate-200 truncate block">
											{form.customerName || "Customer Name"}
										</span>
									</div>
									<div>
										<span className="text-slate-500 block text-[10px]">
											EST. QUOTE
										</span>
										<span className="font-bold text-emerald-400 text-xs">
											$
											{form.estimatedCost
												? parseFloat(form.estimatedCost).toFixed(2)
												: "0.00"}
										</span>
									</div>
								</div>

								{form.imeiOrSerial && (
									<div className="text-[10px] font-mono text-slate-400 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800 truncate flex items-center gap-1">
										<Hash className="w-3 h-3 text-slate-500" />
										<span>{form.imeiOrSerial}</span>
									</div>
								)}
							</motion.div>
						</div>

						{/* Helpful Guide Footer */}
						<div className="relative z-10 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2 shrink-0 pt-2">
							<Clock className="w-4 h-4 text-indigo-400 shrink-0" />
							<span>
								<strong className="text-slate-400 font-semibold">
									Turnaround:
								</strong>{" "}
								Standard diagnostics complete in ~2-4 hours.
							</span>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};
