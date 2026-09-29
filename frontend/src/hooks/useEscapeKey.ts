// frontend/src/hooks/useEscapeKey.ts
import { useEffect } from "react";

export function useEscapeKey(handler: () => void, active = true) {
	useEffect(() => {
		if (!active) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") handler();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handler, active]);
}
