import {
	ArrowPathIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type React from "react";

interface ErrorFallbackProps {
	error: Error;
	resetError?: () => void;
	title?: string;
	message?: string;
	showRetry?: boolean;
	showDetails?: boolean;
	className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	resetError,
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	showRetry = true,
	showDetails = false,
	className = "",
}) => {
	return (
		<div
			className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
		>
			<div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
				<ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
			<p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>

			{showDetails && error && process.env.NODE_ENV === "development" && (
				<div className="mb-6 p-4 bg-gray-100 rounded-md max-w-2xl w-full">
					<details className="text-left">
						<summary className="cursor-pointer font-medium text-gray-700 mb-2">
							Error Details (Development)
						</summary>
						<div className="text-xs text-gray-600">
							<p className="font-medium mb-1">Message:</p>
							<p className="mb-3 p-2 bg-white rounded border">
								{error.message}
							</p>
							{error.stack && (
								<>
									<p className="font-medium mb-1">Stack Trace:</p>
									<pre className="whitespace-pre-wrap break-all p-2 bg-white rounded border text-xs">
										{error.stack}
									</pre>
								</>
							)}
						</div>
					</details>
				</div>
			)}

			{showRetry && resetError && (
				<button
					type="button"
					onClick={resetError}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<ArrowPathIcon className="w-4 h-4 mr-2" />
					Try Again
				</button>
			)}
		</div>
	);
};

export default ErrorFallback;
