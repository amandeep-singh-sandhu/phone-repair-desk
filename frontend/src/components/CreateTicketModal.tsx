// frontend/src/components/CreateTicketModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreateTicketPayload, PriorityLevel, Customer } from "../types";
import { repairApi } from "../services/api";
import {
	POPULAR_BRANDS,
	formatPhoneNumber,
	validateTicketForm,
	type TicketFormData,
} from "../utils/validators";
import { LiveTicketPreview } from "./LiveTicketPreview";
import {
	X,
	User,
	UserPlus,
	Search,
	ArrowRight,
	ArrowLeft,
	ShieldAlert,
	DollarSign,
	Check,
	Sparkles,
	CheckCircle2,
	Clock,
	Hash,
	BellRing,
	FileText,
	AlertCircle,
	Loader2, // <-- Added for subtle search spinner
} from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateTicketPayload) => Promise<void>;
}

type TabType = "new" | "existing";
type NotificationChannel = "sms" | "whatsapp" | "call";

const initialForm: TicketFormData = {
	customerName: "",
	customerPhone: "",
	customerEmail: "",
	deviceBrand: "",
	deviceModel: "",
	imeiOrSerial: "",
	issueDescription: "",
	estimatedCost: "120",
	priority: "medium",
};

export const CreateTicketModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
	const [step, setStep] = useState<1 | 2>(1);
	const [customerTab, setCustomerTab] = useState<TabType>("new");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

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

	const [notificationPref, setNotificationPref] =
		useState<NotificationChannel>("whatsapp");
	const [customerNotes, setCustomerNotes] = useState("");
	const [form, setForm] = useState<TicketFormData>(initialForm);
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const markTouched = (field: string) =>
		setTouched((prev) => ({ ...prev, [field]: true }));

	// Validation mapping
	const errors = useMemo(
		() => validateTicketForm(form, customerTab, Boolean(selectedCustomer)),
		[form, customerTab, selectedCustomer],
	);

	const isStep1Valid =
		customerTab === "new"
			? !errors.customerName && !errors.customerPhone && !errors.customerEmail
			: Boolean(selectedCustomer);

	const isStep2Valid =
		!errors.deviceBrand &&
		!errors.deviceModel &&
		!errors.issueDescription &&
		!errors.estimatedCost &&
		!errors.imeiOrSerial;

	// Fetch recent clients & handle shortcuts
	useEffect(() => {
		if (isOpen) {
			repairApi.searchCustomers("").then((res) => {
				if (res?.length) setRecentClients(res.slice(0, 3));
			});
		}
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// Customer search debouncing
	useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			return;
		}
		const timer = setTimeout(async () => {
			setSearching(true);
			try {
				const res = await repairApi.searchCustomers(searchQuery);
				setSearchResults(res || []);
			} finally {
				setSearching(false);
			}
		}, 180);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Reset state when opened
	useEffect(() => {
		if (isOpen) {
			setStep(1);
			setCustomerTab("new");
			setSelectedCustomer(null);
			setSearchQuery("");
			setCustomerNotes("");
			setNotificationPref("whatsapp");
			setTouched({});
			setSubmitError(null);
			setForm(initialForm);
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

	const handleGoToStep2 = () => {
		if (customerTab === "new") {
			setTouched((prev) => ({
				...prev,
				customerName: true,
				customerPhone: true,
				customerEmail: true,
			}));
		}
		if (isStep1Valid) {
			setStep(2);
		}
	};

	const handleFinalSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setTouched({
			deviceBrand: true,
			deviceModel: true,
			issueDescription: true,
			estimatedCost: true,
			imeiOrSerial: true,
		});

		if (!isStep1Valid || !isStep2Valid) return;

		setSubmitting(true);
		setSubmitError(null);
		try {
			await onSubmit({
				customerId: selectedCustomer?.id,
				customer: {
					name: form.customerName.trim(),
					phone: form.customerPhone.trim(),
					email: form.customerEmail.trim() || undefined,
				},
				deviceBrand: form.deviceBrand.trim(),
				deviceModel: form.deviceModel.trim(),
				imeiOrSerial: form.imeiOrSerial.trim() || undefined,
				issueDescription: form.issueDescription.trim(),
				clientNotes: customerNotes.trim() || undefined,

				// ⬇️ CHANGE THIS LINE: Do NOT copy client notes into diagnostic notes
				diagnosticNotes: undefined,

				notificationPreference: notificationPref,
				estimatedCost: form.estimatedCost
					? parseFloat(form.estimatedCost)
					: undefined,
				priority: form.priority,
				status: "received",
			});
			onClose();
		} catch (err: any) {
			setSubmitError(err.message || "Failed to create ticket.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
			/>

			<div className="flex min-h-full items-center justify-center p-3 sm:p-6 pointer-events-none">
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 15 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: 10 }}
					transition={{ type: "spring", damping: 30, stiffness: 320 }}
					className="w-full max-w-4xl min-h-145 md:h-145 bg-[#090d18] border border-indigo-500/35 rounded-3xl shadow-[0_0_70px_-12px_rgba(99,102,241,0.4)] overflow-hidden pointer-events-auto flex flex-col md:flex-row relative"
				>
					<div className="absolute inset-x-0 top-0 h-[1.5px] bg-linear-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-30 pointer-events-none" />

					<motion.button
						whileHover={{ scale: 1.08, rotate: 90 }}
						whileTap={{ scale: 0.92 }}
						onClick={onClose}
						className="absolute top-5 right-5 z-40 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 shadow-lg transition-colors cursor-pointer"
					>
						<X className="w-4 h-4" />
					</motion.button>

					{/* LEFT PANEL: INTAKE WORKFLOW */}
					<div className="w-full md:w-[58%] h-full p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#0b1020]/70">
						<div className="flex-1 flex flex-col">
							{/* Step Indicator */}
							<div className="flex items-center gap-2 mb-4 shrink-0">
								<span
									className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
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
									className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
										step === 2
											? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
											: "bg-slate-800 text-slate-400"
									}`}
								>
									Step 2 • Device & Fault
								</span>
							</div>

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

										{/* Pill Switcher */}
										<div className="flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 relative">
											<button
												type="button"
												onClick={() => setCustomerTab("new")}
												className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${customerTab === "new" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
											>
												<UserPlus className="w-3.5 h-3.5" /> New Customer
												{customerTab === "new" && (
													<motion.div
														layoutId="tabPill"
														className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-md shadow-indigo-600/30"
													/>
												)}
											</button>
											<button
												type="button"
												onClick={() => setCustomerTab("existing")}
												className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${customerTab === "existing" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
											>
												<Search className="w-3.5 h-3.5" /> Returning Client
												{customerTab === "existing" && (
													<motion.div
														layoutId="tabPill"
														className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-md shadow-indigo-600/30"
													/>
												)}
											</button>
										</div>

										{/* NEW CUSTOMER SUB-VIEW */}
										{customerTab === "new" ? (
											<div className="space-y-2.5 pt-0.5">
												<div>
													<div className="flex justify-between items-center mb-1">
														<label className="text-xs font-medium text-slate-300">
															Full Name *
														</label>
														{touched.customerName && errors.customerName && (
															<span className="text-[11px] text-rose-400 flex items-center gap-1">
																<AlertCircle className="w-3 h-3" />{" "}
																{errors.customerName}
															</span>
														)}
													</div>
													<div className="relative">
														<User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
														<input
															placeholder="e.g. Alex Rivera"
															value={form.customerName}
															onBlur={() => markTouched("customerName")}
															onChange={(e) =>
																setForm({
																	...form,
																	customerName: e.target.value,
																})
															}
															className={`w-full text-sm rounded-xl pl-10 pr-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden transition-colors ${
																touched.customerName && errors.customerName
																	? "border-rose-500/80 focus:border-rose-500"
																	: "border-slate-800 focus:border-indigo-500"
															}`}
														/>
													</div>
												</div>

												<div className="grid grid-cols-2 gap-3">
													<div>
														<label className="text-xs font-medium text-slate-300 mb-1 block">
															Phone Number *
														</label>
														<input
															placeholder="(555) 000-0000"
															value={form.customerPhone}
															onBlur={() => markTouched("customerPhone")}
															onChange={(e) =>
																setForm({
																	...form,
																	customerPhone: formatPhoneNumber(
																		e.target.value,
																	),
																})
															}
															className={`w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden transition-colors ${
																touched.customerPhone && errors.customerPhone
																	? "border-rose-500/80"
																	: "border-slate-800 focus:border-indigo-500"
															}`}
														/>
														{touched.customerPhone && errors.customerPhone && (
															<p className="text-[10px] text-rose-400 mt-1">
																{errors.customerPhone}
															</p>
														)}
													</div>

													<div>
														<label className="text-xs font-medium text-slate-300 mb-1 block">
															Email (Optional)
														</label>
														<input
															type="email"
															placeholder="alex@gmail.com"
															value={form.customerEmail}
															onBlur={() => markTouched("customerEmail")}
															onChange={(e) =>
																setForm({
																	...form,
																	customerEmail: e.target.value,
																})
															}
															className={`w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden transition-colors ${
																touched.customerEmail && errors.customerEmail
																	? "border-rose-500/80"
																	: "border-slate-800 focus:border-indigo-500"
															}`}
														/>
														{touched.customerEmail && errors.customerEmail && (
															<p className="text-[10px] text-rose-400 mt-1">
																{errors.customerEmail}
															</p>
														)}
													</div>
												</div>

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
																		? "bg-indigo-950/70 border-indigo-500 text-indigo-300"
																		: "bg-slate-950/40 border-slate-800 text-slate-400"
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

												<div>
													<label className="text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
														<FileText className="w-3.5 h-3.5 text-slate-400" />{" "}
														Client Notes / Special Instructions
													</label>
													<input
														placeholder="e.g. Call after 5 PM, urgent pickup"
														value={customerNotes}
														onChange={(e) => setCustomerNotes(e.target.value)}
														className="w-full text-xs rounded-xl px-3 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 outline-hidden"
													/>
												</div>
											</div>
										) : (
											/* RETURNING CLIENT SUB-VIEW */
											<div className="space-y-3 pt-0.5">
												<div className="relative">
													{searching ? (
														<Loader2 className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3 animate-spin" />
													) : (
														<Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
													)}
													<input
														autoFocus
														placeholder="Search customer by name or phone..."
														value={searchQuery}
														onChange={(e) => setSearchQuery(e.target.value)}
														className="w-full text-sm rounded-xl pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500 outline-hidden"
													/>
													{searchQuery && (
														<button
															type="button"
															onClick={() => setSearchQuery("")}
															className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
														>
															<X className="w-3.5 h-3.5" />
														</button>
													)}
												</div>

												{selectedCustomer && (
													<div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/50 flex items-center justify-between">
														<div>
															<div className="text-xs font-bold text-white flex items-center gap-1.5">
																<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{" "}
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
															className="text-xs text-slate-400 hover:text-white underline"
														>
															Change
														</button>
													</div>
												)}

												<div className="space-y-2 max-h-48 overflow-y-auto px-1.5 py-1">
													{(searchQuery.trim().length > 0
														? searchResults
														: recentClients
													).map((cust) => {
														const isSelected = selectedCustomer?.id === cust.id;
														return (
															<div
																key={cust.id}
																onClick={() => handleSelectExisting(cust)}
																className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
																	isSelected
																		? "bg-indigo-950/70 border-indigo-500 text-white"
																		: "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300"
																}`}
															>
																<div>
																	<div className="font-semibold text-white flex items-center gap-1.5">
																		{cust.name}{" "}
																		{isSelected && (
																			<Check className="w-3 h-3 text-indigo-400" />
																		)}
																	</div>
																	<div className="text-[11px] text-slate-400 mt-0.5">
																		{cust.phone}
																	</div>
																</div>
																<span className="text-[10px] font-medium bg-slate-800/90 px-2 py-0.5 rounded-full text-indigo-300 flex items-center gap-1">
																	<Clock className="w-3 h-3 text-indigo-400" />{" "}
																	{cust.pastRepairsCount} repairs
																</span>
															</div>
														);
													})}
												</div>
											</div>
										)}
									</motion.div>
								) : (
									/* STEP 2: HARDWARE & DEFECT */
									<motion.div
										key="step2"
										initial={{ opacity: 0, x: 16 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -16 }}
										transition={{ duration: 0.2 }}
										className="space-y-3"
									>
										<div>
											<h2 className="text-xl font-bold text-white tracking-tight">
												Device & Defect Information
											</h2>
											<p className="text-xs text-slate-400 mt-0.5">
												Document incoming hardware, reported faults, and
												estimated quote.
											</p>
										</div>

										<div className="grid grid-cols-2 gap-3">
											<div>
												<div className="flex justify-between items-center mb-1">
													<label className="text-xs font-medium text-slate-300">
														Brand *
													</label>
													{touched.deviceBrand && errors.deviceBrand && (
														<span className="text-[10px] text-rose-400">
															{errors.deviceBrand}
														</span>
													)}
												</div>
												<input
													list="brand-suggestions"
													placeholder="e.g. Apple, Samsung, Google"
													value={form.deviceBrand}
													onBlur={() => markTouched("deviceBrand")}
													onChange={(e) => {
														const brand = e.target.value;
														setForm((prev) => ({
															...prev,
															deviceBrand: brand,
															deviceModel:
																prev.deviceBrand !== brand && prev.deviceModel
																	? ""
																	: prev.deviceModel,
														}));
													}}
													className={`w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden transition-colors ${
														touched.deviceBrand && errors.deviceBrand
															? "border-rose-500/80"
															: "border-slate-800 focus:border-indigo-500"
													}`}
												/>
												<datalist id="brand-suggestions">
													{Object.keys(POPULAR_BRANDS).map((brand) => (
														<option key={brand} value={brand} />
													))}
												</datalist>
											</div>

											<div>
												<div className="flex justify-between items-center mb-1">
													<label className="text-xs font-medium text-slate-300">
														Model *
													</label>
													{touched.deviceModel && errors.deviceModel && (
														<span className="text-[10px] text-rose-400">
															{errors.deviceModel}
														</span>
													)}
												</div>
												<input
													list="model-suggestions"
													placeholder={
														form.deviceBrand && POPULAR_BRANDS[form.deviceBrand]
															? `e.g. ${POPULAR_BRANDS[form.deviceBrand][0]}`
															: "e.g. iPhone 15 Pro"
													}
													value={form.deviceModel}
													onBlur={() => markTouched("deviceModel")}
													onChange={(e) =>
														setForm({ ...form, deviceModel: e.target.value })
													}
													className={`w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden transition-colors ${
														touched.deviceModel && errors.deviceModel
															? "border-rose-500/80"
															: "border-slate-800 focus:border-indigo-500"
													}`}
												/>
												<datalist id="model-suggestions">
													{(POPULAR_BRANDS[form.deviceBrand] || []).map((m) => (
														<option key={m} value={m} />
													))}
												</datalist>
											</div>
										</div>

										<div>
											<div className="flex justify-between items-center mb-1">
												<label className="text-xs font-medium text-slate-300">
													IMEI or Serial (Optional)
												</label>
												{touched.imeiOrSerial && errors.imeiOrSerial && (
													<span className="text-[10px] text-rose-400">
														{errors.imeiOrSerial}
													</span>
												)}
											</div>
											<div className="relative">
												<Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
												<input
													placeholder="15-digit IMEI or hardware serial"
													value={form.imeiOrSerial}
													onBlur={() => markTouched("imeiOrSerial")}
													onChange={(e) =>
														setForm({ ...form, imeiOrSerial: e.target.value })
													}
													className={`w-full text-sm rounded-xl pl-10 pr-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden font-mono ${
														touched.imeiOrSerial && errors.imeiOrSerial
															? "border-rose-500/80"
															: "border-slate-800 focus:border-indigo-500"
													}`}
												/>
											</div>
										</div>

										<div>
											<div className="flex justify-between items-center mb-1">
												<label className="text-xs font-medium text-slate-300">
													Issue Description *
												</label>
												{touched.issueDescription &&
													errors.issueDescription && (
														<span className="text-[10px] text-rose-400">
															{errors.issueDescription}
														</span>
													)}
											</div>
											<textarea
												rows={2}
												placeholder="Cracked AMOLED glass, touch unresponsive..."
												value={form.issueDescription}
												onBlur={() => markTouched("issueDescription")}
												onChange={(e) =>
													setForm({ ...form, issueDescription: e.target.value })
												}
												className={`w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border text-white placeholder-slate-600 outline-hidden ${
													touched.issueDescription && errors.issueDescription
														? "border-rose-500/80"
														: "border-slate-800 focus:border-indigo-500"
												}`}
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
														className="w-full text-sm rounded-xl pl-10 pr-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white focus:border-indigo-500 outline-hidden"
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
													className="w-full text-sm rounded-xl px-3.5 py-2 bg-slate-950/80 border border-slate-800 text-white focus:border-indigo-500 outline-hidden cursor-pointer"
												>
													<option value="low">Low</option>
													<option value="medium">Medium</option>
													<option value="high">High</option>
													<option value="urgent">Urgent</option>
												</select>
											</div>
										</div>

										{submitError && (
											<div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
												<AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
												<span>{submitError}</span>
											</div>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Action Buttons */}
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
									onClick={handleGoToStep2}
									className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer transition-opacity"
								>
									Configure Hardware <ArrowRight className="w-3.5 h-3.5" />
								</motion.button>
							) : (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									type="button"
									disabled={submitting || !isStep2Valid}
									onClick={handleFinalSubmit}
									className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/40 cursor-pointer transition-opacity"
								>
									{submitting
										? "Generating Ticket..."
										: "Confirm & Create Ticket"}
									<Sparkles className="w-3.5 h-3.5" />
								</motion.button>
							)}
						</div>
					</div>

					{/* RIGHT PANEL: LIVE TICKET PREVIEW */}
					<LiveTicketPreview form={form} />
				</motion.div>
			</div>
		</div>
	);
};;
