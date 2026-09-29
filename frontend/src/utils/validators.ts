// frontend/src/utils/validators.ts
import type { PriorityLevel } from "../types";

export const POPULAR_BRANDS: Record<string, string[]> = {
	Apple: [
		"iPhone 16 Pro Max",
		"iPhone 16 Pro",
		"iPhone 16 Plus",
		"iPhone 16",
		"iPhone 15 Pro Max",
		"iPhone 15 Pro",
		"iPhone 15 Plus",
		"iPhone 15",
		"iPhone 14 Pro Max",
		"iPhone 14 Pro",
		"iPhone 14 Plus",
		"iPhone 14",
		"iPhone 13 Pro Max",
		"iPhone 13 Pro",
		"iPhone 13",
		"iPhone 13 mini",
		"iPhone 12 Pro Max",
		"iPhone 12 Pro",
		"iPhone 12",
		"iPhone 11",
		"iPad Pro 12.9",
		"iPad Air 5",
		"iPad 10th Gen",
	],
	Samsung: [
		"Galaxy S24 Ultra",
		"Galaxy S24+",
		"Galaxy S24",
		"Galaxy S23 Ultra",
		"Galaxy S23+",
		"Galaxy S23",
		"Galaxy Z Fold 6",
		"Galaxy Z Flip 6",
		"Galaxy Z Fold 5",
		"Galaxy A55 5G",
		"Galaxy A54 5G",
		"Galaxy A35",
		"Galaxy A15",
	],
	Google: [
		"Pixel 9 Pro XL",
		"Pixel 9 Pro Fold",
		"Pixel 9 Pro",
		"Pixel 9",
		"Pixel 8 Pro",
		"Pixel 8",
		"Pixel 8a",
		"Pixel 7 Pro",
		"Pixel 7a",
	],
	OnePlus: [
		"OnePlus 12",
		"OnePlus 12R",
		"OnePlus Open",
		"OnePlus 11",
		"OnePlus Nord 4",
	],
	Xiaomi: [
		"Xiaomi 14 Ultra",
		"Xiaomi 14",
		"Xiaomi 13 Pro",
		"Redmi Note 13 Pro+",
	],
	Motorola: ["Razr 50 Ultra", "Razr 40 Ultra", "Edge 50 Ultra", "Edge 50 Pro"],
};

// Formats phone numbers into standard readable format
export function formatPhoneNumber(input: string): string {
	let value = input.replace(/[^\d+]/g, "");
	if (value.startsWith("+1")) {
		const digits = value.slice(2).replace(/\D/g, "");
		if (digits.length <= 3) return `+1 (${digits}`;
		if (digits.length <= 6)
			return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
		return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
	}
	if (!value.startsWith("+") && value.length <= 10) {
		if (value.length > 6)
			return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
		if (value.length > 3) return `(${value.slice(0, 3)}) ${value.slice(3)}`;
	}
	return value;
}

// Luhn Algorithm (Mod 10) for 15-digit IMEI or alphanumeric serials
export function isValidIMEI(imei: string): boolean {
	const clean = imei.trim();
	if (!clean) return true;
	if (/^\d{15}$/.test(clean)) {
		let sum = 0;
		for (let i = 0; i < 15; i++) {
			let digit = parseInt(clean.charAt(i), 10);
			if (i % 2 !== 0) {
				digit *= 2;
				if (digit > 9) digit -= 9;
			}
			sum += digit;
		}
		return sum % 10 === 0;
	}
	return /^[A-HJ-NPR-Z0-9]{8,18}$/i.test(clean);
}

export interface TicketFormData {
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	deviceBrand: string;
	deviceModel: string;
	imeiOrSerial: string;
	issueDescription: string;
	estimatedCost: string;
	priority: PriorityLevel;
}

export function validateTicketForm(
	form: TicketFormData,
	customerTab: "new" | "existing",
	hasSelectedExistingCustomer: boolean,
): Record<string, string> {
	const errs: Record<string, string> = {};

	// Step 1: Customer details
	if (customerTab === "new") {
		const name = form.customerName.trim();
		const namePattern = /^[a-zA-ZÀ-ÿ]+(?:[\s'-][a-zA-ZÀ-ÿ]+)+$/;
		if (!name) {
			errs.customerName = "Full name is required";
		} else if (name.length < 3) {
			errs.customerName = "Name must be at least 3 characters";
		} else if (!namePattern.test(name)) {
			errs.customerName = "Enter both first and last name (letters only)";
		}

		const phoneDigits = form.customerPhone.replace(/\D/g, "");
		if (!phoneDigits) {
			errs.customerPhone = "Phone number is required";
		} else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
			errs.customerPhone = "Phone must be 10-15 digits";
		} else if (/^(\d)\1+$/.test(phoneDigits)) {
			errs.customerPhone = "Enter a valid phone number (not repeated digits)";
		} else if (
			phoneDigits.includes("5550000") ||
			/55501\d{2}/.test(phoneDigits)
		) {
			errs.customerPhone = "Fictional 555 numbers are not permitted";
		}

		if (form.customerEmail.trim()) {
			const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			if (!emailPattern.test(form.customerEmail.trim())) {
				errs.customerEmail = "Enter a valid email address";
			}
		}
	} else if (!hasSelectedExistingCustomer) {
		errs.customerSelect = "Please select a returning client";
	}

	// Step 2: Hardware & Defect details
	const brand = form.deviceBrand.trim();
	if (!brand) {
		errs.deviceBrand = "Brand is required";
	} else if (brand.length < 2) {
		errs.deviceBrand = "Brand must be at least 2 characters";
	} else if (/^\d+$/.test(brand)) {
		errs.deviceBrand = "Brand cannot be numbers only";
	}

	const model = form.deviceModel.trim();
	if (!model) {
		errs.deviceModel = "Model is required";
	} else if (model.length < 2) {
		errs.deviceModel = "Model must be at least 2 characters";
	}

	const imei = form.imeiOrSerial.trim();
	if (imei && !isValidIMEI(imei)) {
		errs.imeiOrSerial = "Invalid IMEI (Luhn check failed) or serial number";
	}

	const issue = form.issueDescription.trim();
	if (!issue) {
		errs.issueDescription = "Issue description is required";
	} else if (issue.length < 8) {
		errs.issueDescription = "Description must be at least 8 characters";
	} else if (!/\s/.test(issue)) {
		errs.issueDescription =
			"Please provide multiple words explaining the defect";
	}

	const cost = parseFloat(form.estimatedCost);
	if (isNaN(cost) || cost <= 0) {
		errs.estimatedCost = "Estimate must be greater than $0.00";
	} else if (cost > 9999) {
		errs.estimatedCost = "Cost cannot exceed $9,999.00";
	}

	return errs;
}
