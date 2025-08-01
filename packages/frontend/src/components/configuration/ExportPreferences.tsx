/**
 * Export preferences component
 */

import { FolderOpenIcon } from "@heroicons/react/24/outline";
import type { OutputFormat } from "@unified-repo-analyzer/shared";
import type React from "react";
import { useToast } from "../../hooks/useToast";
import { useSettingsStore } from "../../store/useSettingsStore";

const ExportPreferences: React.FC = () => {
	const { preferences, updatePreferenceSection } = useSettingsStore();
	const { showToast } = useToast();

	const handleUpdate = async (updates: any) => {
		try {
			await updatePreferenceSection("export", updates);
			showToast({ type: "success", title: "Export preferences updated" });
		} catch {
			showToast({ type: "error", title: "Failed to update preferences" });
		}
	};

	const selectDirectory = async () => {
		try {
			// In a real implementation, this would use the file system API
			// For now, we'll just show a placeholder
			showToast({
				type: "info",
				title: "Directory selection not implemented in demo",
			});
		} catch {
			showToast({ type: "error", title: "Failed to select directory" });
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
					Export Preferences
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
					Configure default export settings and output formats
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Default Format */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Default Export Format
					</label>
					<select
						value={preferences.export.defaultFormat}
						onChange={(e) =>
							handleUpdate({ defaultFormat: e.target.value as OutputFormat })
						}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
					>
						<option value="json">JSON</option>
						<option value="markdown">Markdown</option>
						<option value="html">HTML</option>
					</select>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Default format for exporting analysis results
					</p>
				</div>

				{/* Output Directory */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Output Directory
					</label>
					<div className="flex">
						<input
							type="text"
							value={preferences.export.outputDirectory}
							onChange={(e) =>
								handleUpdate({ outputDirectory: e.target.value })
							}
							className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
						<button
							onClick={selectDirectory}
							className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
						>
							<FolderOpenIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
						</button>
					</div>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Default directory for saving exported files
					</p>
				</div>
			</div>

			{/* Export Options */}
			<div className="space-y-4">
				<div className="flex items-center">
					<input
						id="include-metadata"
						type="checkbox"
						checked={preferences.export.includeMetadata}
						onChange={(e) =>
							handleUpdate({ includeMetadata: e.target.checked })
						}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label
						htmlFor="include-metadata"
						className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
					>
						Include metadata in exports
					</label>
				</div>

				<div className="flex items-center">
					<input
						id="compress-large"
						type="checkbox"
						checked={preferences.export.compressLargeFiles}
						onChange={(e) =>
							handleUpdate({ compressLargeFiles: e.target.checked })
						}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label
						htmlFor="compress-large"
						className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
					>
						Compress large export files
					</label>
				</div>
			</div>

			{/* Format-specific Settings */}
			<div className="space-y-6">
				<h4 className="text-md font-medium text-gray-900 dark:text-white">
					Format-specific Settings
				</h4>

				{/* JSON Settings */}
				<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
					<h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
						JSON Export
					</h5>
					<div className="space-y-3">
						<div className="flex items-center">
							<input
								id="json-pretty"
								type="checkbox"
								defaultChecked={true}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="json-pretty"
								className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
							>
								Pretty print JSON (formatted with indentation)
							</label>
						</div>
						<div className="flex items-center">
							<input
								id="json-minify"
								type="checkbox"
								defaultChecked={false}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="json-minify"
								className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
							>
								Minify JSON for smaller file size
							</label>
						</div>
					</div>
				</div>

				{/* Markdown Settings */}
				<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
					<h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
						Markdown Export
					</h5>
					<div className="space-y-3">
						<div className="flex items-center">
							<input
								id="md-toc"
								type="checkbox"
								defaultChecked={true}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="md-toc"
								className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
							>
								Include table of contents
							</label>
						</div>
						<div className="flex items-center">
							<input
								id="md-code-blocks"
								type="checkbox"
								defaultChecked={true}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="md-code-blocks"
								className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
							>
								Include code examples in fenced blocks
							</label>
						</div>
					</div>
				</div>

				{/* HTML Settings */}
				<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
					<h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
						HTML Export
					</h5>
					<div className="space-y-3">
						<div className="flex items-center">
							<input
								id="html-standalone"
								type="checkbox"
								defaultChecked={true}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="html-standalone"
								className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
							>
								Generate standalone HTML (includes CSS and JS)
							</label>
						</div>
						<div className="flex items-center">
							<input
								id="html-interactive"
								type="checkbox"
								defaultChecked={true}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="html-interactive"
								className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
							>
								Include interactive elements (collapsible sections, search)
							</label>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Theme
							</label>
							<select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
								<option value="default">Default</option>
								<option value="github">GitHub</option>
								<option value="dark">Dark</option>
								<option value="minimal">Minimal</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExportPreferences;
