import type React from "react";
import { useEffect, useRef } from "react";
import { useToast } from "../../hooks/useToast";
import Toast from "./Toast";

const ToastContainer: React.FC = () => {
	const { toasts, removeToast } = useToast();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	}, []);

	if (toasts.length === 0) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
			aria-live="polite"
			aria-atomic="false"
		>
			{toasts.map((toast) => (
				<Toast
					key={toast.id}
					id={toast.id}
					message={toast.message}
					type={toast.type}
					duration={toast.duration}
					action={toast.action}
					onClose={() => removeToast(toast.id)}
				/>
			))}
		</div>
	);
};

export default ToastContainer;
