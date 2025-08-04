#!/usr/bin/env node
/**
 * Find and remove duplicate .js files that have a same-directory, same-basename .ts or .tsx counterpart.
 * Then report remaining .js files without .ts/.tsx counterparts.
 *
 * Requirements handled:
 * - Traverse entire repo from current working directory (repo root).
 * - Exclude common dependency/build directories: node_modules, dist, build, .next, out, coverage, .git, .bun
 * - Do not follow symlinks.
 * - Idempotent.
 * - Preserve .d.ts files (never delete).
 * - Case sensitivity & index-style files handled (index.js vs index.ts/tsx).
 * - If any deletion conflicts, skip and report under "skipped".
 * - Print clear summary with counts and list.
 *
 * Run:
 *   node unified-repo-analyzer/scripts/find-and-clean-js-duplicates.mjs
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import os from "os";

const REPO_ROOT = process.cwd();
const EXCLUDED_DIRS = new Set([
	"node_modules",
	"dist",
	"build",
	".next",
	"out",
	"coverage",
	".git",
	".bun",
]);

/**
 * Utilities
 */
function isWindows() {
	return os.platform() === "win32";
}

function toRepoRelative(absPath) {
	return path.relative(REPO_ROOT, absPath).replace(/\\/g, "/");
}

function normalizeBaseForMatch(name) {
	// For matching basenames within the same directory; Windows filesystems are typically case-insensitive,
	// but we normalize for consistency. On case-sensitive FS, we still treat same-name, different-case as a match
	// for the purpose of counterpart detection, but will check real file existence before deletion and handle ambiguity.
	return name.toLowerCase();
}

function hasExtension(file, ext) {
	return file.toLowerCase().endsWith(ext.toLowerCase());
}

function isDts(file) {
	return /\.d\.ts$/i.test(file);
}

function isJsFile(file) {
	// Accept only plain .js (not .d.ts and not .cjs/.mjs). The task focuses on .js vs .ts/.tsx.
	// If you also want to include .mjs/.cjs, adjust here.
	return hasExtension(file, ".js") && !isDts(file);
}

function isTsOrTsxFile(file) {
	if (isDts(file)) return false;
	return hasExtension(file, ".ts") || hasExtension(file, ".tsx");
}

function basenameWithoutExt(file) {
	const ext = path.extname(file);
	return file.slice(0, -ext.length);
}

async function safeLstat(fullPath) {
	try {
		return await fsp.lstat(fullPath);
	} catch (e) {
		return null;
	}
}

async function safeUnlink(fullPath) {
	try {
		await fsp.unlink(fullPath);
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e };
	}
}

/**
 * Walk the directory tree without following symlinks, skipping excluded dirs.
 */
async function walkDir(dir, perDirectoryHandler) {
	const entries = await fsp.readdir(dir, { withFileTypes: true });
	// Partition dirents into files and subdirs
	const files = [];
	const subdirs = [];

	for (const dirent of entries) {
		const abs = path.join(dir, dirent.name);

		// Skip symlinks entirely
		if (dirent.isSymbolicLink()) {
			continue;
		}

		if (dirent.isDirectory()) {
			if (EXCLUDED_DIRS.has(dirent.name)) continue;
			subdirs.push(abs);
		} else if (dirent.isFile()) {
			files.push(abs);
		} else {
			// Skip other types (sockets, FIFOs, etc.)
			continue;
		}
	}

	await perDirectoryHandler(dir, files);

	for (const sub of subdirs) {
		await walkDir(sub, perDirectoryHandler);
	}
}

async function main() {
	const deletions = [];
	const remaining = [];
	const skipped = [];
	const warnings = [];

	// First pass: in each directory, delete .js files that have corresponding .ts or .tsx counterparts
	await walkDir(REPO_ROOT, async (dir, files) => {
		// Build maps by basename for quick lookup
		const jsFiles = [];
		const tsLikeBasenamesMap = new Map(); // normalized basename -> Set of real basenames that are ts/tsx
		const basenameToTsVariants = new Map(); // real basename case -> array of ts/tsx filenames

		for (const abs of files) {
			const name = path.basename(abs);
			if (isTsOrTsxFile(name)) {
				const base = basenameWithoutExt(name);
				const norm = normalizeBaseForMatch(base);
				if (!tsLikeBasenamesMap.has(norm))
					tsLikeBasenamesMap.set(norm, new Set());
				tsLikeBasenamesMap.get(norm).add(base);

				if (!basenameToTsVariants.has(base)) basenameToTsVariants.set(base, []);
				basenameToTsVariants.get(base).push(abs);
			}
		}

		for (const abs of files) {
			const name = path.basename(abs);
			if (!isJsFile(name)) continue;

			const base = basenameWithoutExt(name);
			const norm = normalizeBaseForMatch(base);

			// If any ts/tsx exists for this basename (case-insensitive), consider deletion
			if (tsLikeBasenamesMap.has(norm)) {
				const tsBaseSet = tsLikeBasenamesMap.get(norm);

				// Ambiguity: multiple TS basenames differing only by case within same dir
				if (tsBaseSet.size > 1 && !isWindows()) {
					skipped.push({
						file: toRepoRelative(abs),
						reason: `Ambiguous TS/TSX counterparts differing only by case: [${[...tsBaseSet].join(", ")}]`,
					});
					continue;
				}

				// Identify actual counterpart files on disk
				// Try matching each candidate base by constructing both .ts and .tsx paths
				const candidates = [];
				for (const tsBase of tsBaseSet) {
					const tsPath = path.join(dir, `${tsBase}.ts`);
					const tsxPath = path.join(dir, `${tsBase}.tsx`);
					const tsStat = await safeLstat(tsPath);
					const tsxStat = await safeLstat(tsxPath);
					if (tsStat && tsStat.isFile()) candidates.push(tsPath);
					if (tsxStat && tsxStat.isFile()) candidates.push(tsxPath);
				}

				if (candidates.length === 0) {
					// No real counterpart exists (race condition or FS mismatch); treat as remaining
					remaining.push({
						file: toRepoRelative(abs),
						dir: toRepoRelative(dir),
					});
					continue;
				}

				if (candidates.length > 1 && !isWindows()) {
					// Multiple real counterparts differing only by case or extension; skip for safety
					skipped.push({
						file: toRepoRelative(abs),
						reason: `Multiple TS/TSX counterparts detected: [${candidates.map(toRepoRelative).join(", ")}]`,
					});
					continue;
				}

				// Proceed to delete the .js file
				const st = await safeLstat(abs);
				if (!st) {
					// Already gone; idempotent
					deletions.push({
						file: toRepoRelative(abs),
						counterpart: candidates.map(toRepoRelative),
						status: "already-removed",
					});
					continue;
				}
				if (!st.isFile()) {
					skipped.push({
						file: toRepoRelative(abs),
						reason: "Not a regular file at deletion time",
					});
					continue;
				}

				// Ensure we're not deleting .d.ts (we already filter isJsFile, but double-guard)
				if (isDts(name)) {
					skipped.push({
						file: toRepoRelative(abs),
						reason: "Safety guard: .d.ts must never be deleted",
					});
					continue;
				}

				const del = await safeUnlink(abs);
				if (del.ok) {
					deletions.push({
						file: toRepoRelative(abs),
						counterpart: candidates.map(toRepoRelative),
						status: "deleted",
					});
				} else {
					skipped.push({
						file: toRepoRelative(abs),
						reason: `Failed to delete: ${del.error?.message || del.error}`,
					});
				}
			} else {
				// No counterpart; keep for reporting
				remaining.push({
					file: toRepoRelative(abs),
					dir: toRepoRelative(dir),
				});
			}
		}
	});

	// Sort outputs for deterministic reporting
	deletions.sort((a, b) => a.file.localeCompare(b.file));
	remaining.sort((a, b) => a.file.localeCompare(b.file));
	skipped.sort((a, b) => a.file.localeCompare(b.file));

	// Print summary
	const deletedCount = deletions.filter((d) => d.status === "deleted").length;
	const remainingCount = remaining.length;

	const summary = {
		repoRoot: REPO_ROOT.replace(/\\/g, "/"),
		deletedDuplicateJsCount: deletedCount,
		remainingConvertibleJsCount: remainingCount,
		deletedDuplicates: deletions,
		remainingConvertibleJsFiles: remaining,
		skipped: skipped,
		warnings: warnings,
	};

	// Human-readable output
	console.log("=== JS Duplicate Cleanup Summary ===");
	console.log(`Repo Root: ${summary.repoRoot}`);
	console.log(
		`Deleted duplicate .js files: ${summary.deletedDuplicateJsCount}`,
	);
	console.log(
		`Remaining .js files without .ts/.tsx counterpart: ${summary.remainingConvertibleJsCount}`,
	);
	if (summary.remainingConvertibleJsFiles.length > 0) {
		console.log("\nRemaining convertible .js files:");
		for (const r of summary.remainingConvertibleJsFiles) {
			console.log(`- ${r.file} (dir: ${r.dir})`);
		}
	}
	if (summary.skipped.length > 0) {
		console.log("\nSkipped deletions:");
		for (const s of summary.skipped) {
			console.log(`- ${s.file} :: ${s.reason}`);
		}
	}
	if (summary.deletedDuplicates.length > 0) {
		console.log("\nDeleted duplicates:");
		for (const d of summary.deletedDuplicates) {
			console.log(
				`- ${d.file} (counterpart: ${Array.isArray(d.counterpart) ? d.counterpart.join(", ") : ""}) [${d.status}]`,
			);
		}
	}

	// Also emit JSON blob (useful for machine processing)
	console.log("\n=== JSON OUTPUT START ===");
	console.log(JSON.stringify(summary, null, 2));
	console.log("=== JSON OUTPUT END ===");
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
