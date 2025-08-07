/**
 * Language detection utilities for repository analysis
 */

import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const readFile = promisify(fs.readFile);

/**
 * Language information
 */
export interface LanguageInfo {
	/**
	 * Language name
	 */
	name: string;

	/**
	 * Associated file extensions
	 */
	extensions: string[];

	/**
	 * Associated filenames
	 */
	filenames?: string[];

	/**
	 * Associated shebang patterns
	 */
	shebangs?: string[];

	/**
	 * Associated frameworks
	 */
	frameworks?: {
		name: string;
		files: string[];
		dependencies?: string[];
	}[];
}

/**
 * Common programming languages with their extensions and associated files
 */
export const LANGUAGES: LanguageInfo[] = [
	{
		name: "JavaScript",
		extensions: [".js", ".mjs", ".cjs"],
		filenames: ["package.json", ".babelrc", "webpack.config.js", "biome.json"],
		frameworks: [
			{
				name: "React",
				files: ["jsx", "tsx", "react"],
				dependencies: ["react", "react-dom"],
			},
			{
				name: "Vue",
				files: ["vue"],
				dependencies: ["vue"],
			},
			{
				name: "Angular",
				files: ["component.ts", "module.ts", "service.ts"],
				dependencies: ["@angular/core"],
			},
			{
				name: "Express",
				files: ["app.js", "server.js", "index.js"],
				dependencies: ["express"],
			},
			{
				name: "Next.js",
				files: ["next.config.js", "pages", "_app.js"],
				dependencies: ["next"],
			},
		],
	},
	{
		name: "TypeScript",
		extensions: [".ts", ".tsx", ".d.ts"],
		filenames: ["tsconfig.json", "biome.json"],
		frameworks: [
			{
				name: "React",
				files: ["tsx", "react"],
				dependencies: ["react", "react-dom", "@types/react"],
			},
			{
				name: "NestJS",
				files: ["module.ts", "controller.ts", "service.ts", "entity.ts"],
				dependencies: ["@nestjs/core", "@nestjs/common"],
			},
			{
				name: "Angular",
				files: ["component.ts", "module.ts", "service.ts"],
				dependencies: ["@angular/core"],
			},
		],
	},
	{
		name: "Python",
		extensions: [".py", ".pyw", ".pyc", ".pyo", ".pyd"],
		filenames: ["requirements.txt", "setup.py", "Pipfile", "pyproject.toml"],
		shebangs: ["python", "python3"],
		frameworks: [
			{
				name: "Django",
				files: ["settings.py", "urls.py", "views.py", "models.py"],
				dependencies: ["django"],
			},
			{
				name: "Flask",
				files: ["app.py", "wsgi.py"],
				dependencies: ["flask"],
			},
			{
				name: "FastAPI",
				files: ["main.py", "app.py"],
				dependencies: ["fastapi"],
			},
		],
	},
	{
		name: "Java",
		extensions: [".java", ".class", ".jar"],
		filenames: ["pom.xml", "build.gradle", "gradle.properties"],
		frameworks: [
			{
				name: "Spring",
				files: [
					"Application.java",
					"Controller.java",
					"Service.java",
					"Repository.java",
				],
				dependencies: ["org.springframework"],
			},
			{
				name: "Android",
				files: ["AndroidManifest.xml", "Activity.java", "Fragment.java"],
				dependencies: ["android"],
			},
		],
	},
	{
		name: "C#",
		extensions: [".cs", ".csx", ".csproj"],
		filenames: ["packages.config", "App.config", "Web.config"],
		frameworks: [
			{
				name: "ASP.NET",
				files: ["Startup.cs", "Program.cs", "Controller.cs"],
				dependencies: ["Microsoft.AspNetCore"],
			},
			{
				name: "WPF",
				files: ["App.xaml", "Window.xaml", "MainWindow.xaml"],
				dependencies: ["PresentationFramework"],
			},
		],
	},
	{
		name: "PHP",
		extensions: [".php", ".phtml", ".php3", ".php4", ".php5", ".php7", ".phps"],
		filenames: ["composer.json", ".htaccess"],
		shebangs: ["php"],
		frameworks: [
			{
				name: "Laravel",
				files: ["artisan", "routes/web.php", "app/Http/Controllers"],
				dependencies: ["laravel/framework"],
			},
			{
				name: "Symfony",
				files: ["symfony.lock", "config/bundles.php"],
				dependencies: ["symfony/symfony"],
			},
			{
				name: "WordPress",
				files: ["wp-config.php", "wp-content"],
				dependencies: ["wordpress"],
			},
		],
	},
	{
		name: "Ruby",
		extensions: [".rb", ".erb", ".gemspec"],
		filenames: ["Gemfile", "Rakefile", "config.ru"],
		shebangs: ["ruby"],
		frameworks: [
			{
				name: "Rails",
				files: ["config/routes.rb", "app/controllers", "app/models"],
				dependencies: ["rails"],
			},
			{
				name: "Sinatra",
				files: ["app.rb", "config.ru"],
				dependencies: ["sinatra"],
			},
		],
	},
	{
		name: "Go",
		extensions: [".go"],
		filenames: ["go.mod", "go.sum"],
		frameworks: [
			{
				name: "Gin",
				files: ["gin.go"],
				dependencies: ["github.com/gin-gonic/gin"],
			},
			{
				name: "Echo",
				files: ["echo.go"],
				dependencies: ["github.com/labstack/echo"],
			},
		],
	},
	{
		name: "Rust",
		extensions: [".rs"],
		filenames: ["Cargo.toml", "Cargo.lock"],
		frameworks: [
			{
				name: "Actix",
				files: ["actix"],
				dependencies: ["actix-web"],
			},
			{
				name: "Rocket",
				files: ["rocket"],
				dependencies: ["rocket"],
			},
		],
	},
	{
		name: "Swift",
		extensions: [".swift"],
		filenames: ["Package.swift"],
		frameworks: [
			{
				name: "SwiftUI",
				files: ["View.swift", "App.swift"],
				dependencies: ["SwiftUI"],
			},
			{
				name: "Vapor",
				files: ["configure.swift", "routes.swift"],
				dependencies: ["vapor"],
			},
		],
	},
	{
		name: "Kotlin",
		extensions: [".kt", ".kts"],
		filenames: ["build.gradle.kts"],
		frameworks: [
			{
				name: "Spring Boot",
				files: ["Application.kt", "Controller.kt", "Service.kt"],
				dependencies: ["org.springframework.boot"],
			},
			{
				name: "Android",
				files: ["AndroidManifest.xml", "Activity.kt", "Fragment.kt"],
				dependencies: ["android"],
			},
		],
	},
	{
		name: "HTML",
		extensions: [".html", ".htm", ".xhtml"],
		frameworks: [
			{
				name: "Bootstrap",
				files: ["bootstrap.min.css", "bootstrap.min.js"],
				dependencies: ["bootstrap"],
			},
		],
	},
	{
		name: "CSS",
		extensions: [".css", ".scss", ".sass", ".less", ".styl"],
		frameworks: [
			{
				name: "Tailwind",
				files: ["tailwind.config.js"],
				dependencies: ["tailwindcss"],
			},
			{
				name: "Bootstrap",
				files: ["bootstrap"],
				dependencies: ["bootstrap"],
			},
		],
	},
	{
		name: "Shell",
		extensions: [".sh", ".bash", ".zsh", ".fish"],
		shebangs: ["sh", "bash", "zsh", "fish"],
	},
	{
		name: "Markdown",
		extensions: [".md", ".markdown"],
	},
	{
		name: "JSON",
		extensions: [".json"],
	},
	{
		name: "YAML",
		extensions: [".yml", ".yaml"],
	},
	{
		name: "XML",
		extensions: [".xml", ".svg", ".xsl", ".xsd"],
	},
	{
		name: "SQL",
		extensions: [".sql"],
	},
	{
		name: "C",
		extensions: [".c", ".h"],
	},
	{
		name: "C++",
		extensions: [".cpp", ".cc", ".cxx", ".hpp", ".hxx", ".h++"],
	},
];

/**
 * Detects language based on file extension and name
 *
 * @param filePath - Path to the file
 * @returns Detected language name or 'Unknown'
 */
export function detectLanguageFromPath(filePath: string): string {
	const ext = path.extname(filePath).toLowerCase();
	const basename = path.basename(filePath);

	// First check by filename
	for (const lang of LANGUAGES) {
		if (lang.filenames?.includes(basename)) {
			return lang.name;
		}
	}

	// Then check by extension
	for (const lang of LANGUAGES) {
		if (lang.extensions.includes(ext)) {
			return lang.name;
		}
	}

	return "Unknown";
}

/**
 * Detects language based on file content (shebang)
 *
 * @param content - File content
 * @returns Detected language name or null if not detected
 */
export function detectLanguageFromShebang(content: string): string | null {
	const firstLine = content.split("\n")[0];

	if (firstLine?.startsWith("#!")) {
		const shebangLine = firstLine.substring(2).trim();

		for (const lang of LANGUAGES) {
			if (lang.shebangs) {
				for (const shebang of lang.shebangs) {
					if (shebangLine.includes(shebang)) {
						return lang.name;
					}
				}
			}
		}
	}

	return null;
}

/**
 * Detects language based on file path and content
 *
 * @param filePath - Path to the file
 * @param content - Optional file content
 * @returns Promise resolving to detected language name
 */
export async function detectLanguage(
	filePath: string,
	content?: string,
): Promise<string> {
	// First try to detect by path
	const langByPath = detectLanguageFromPath(filePath);
	if (langByPath !== "Unknown") {
		return langByPath;
	}

	// If content is not provided, try to read the file
	if (!content) {
		try {
			content = await readFile(filePath, "utf8");
		} catch {
			// If we can't read the file, return Unknown
			return "Unknown";
		}
	}

	// Try to detect by shebang
	const langByShebang = detectLanguageFromShebang(content);
	if (langByShebang) {
		return langByShebang;
	}

	// If all else fails, return Unknown
	return "Unknown";
}

/**
 * Detects frameworks used in a repository based on file patterns and dependencies
 *
 * @param files - List of files in the repository
 * @param packageJsonPath - Optional path to package.json for Node.js projects
 * @returns Promise resolving to list of detected frameworks
 */
export async function detectFrameworks(
	files: string[],
	packageJsonPath?: string,
): Promise<{ name: string; confidence: number }[]> {
	const frameworks = new Map<string, number>();

	// Check for framework-specific files
	for (const lang of LANGUAGES) {
		if (lang.frameworks) {
			for (const framework of lang.frameworks) {
				let matches = 0;

				// Check for framework-specific files
				for (const file of files) {
					const basename = path.basename(file);
					for (const pattern of framework.files) {
						if (file.includes(pattern) || basename.includes(pattern)) {
							matches++;
						}
					}
				}

				if (matches > 0) {
					frameworks.set(
						framework.name,
						(frameworks.get(framework.name) || 0) + matches * 0.5,
					);
				}
			}
		}
	}

	// Check package.json for Node.js projects
	if (packageJsonPath) {
		try {
			const packageJsonContent = await readFile(packageJsonPath, "utf8");
			const packageJson = JSON.parse(packageJsonContent);

			const dependencies = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			for (const lang of LANGUAGES) {
				if (lang.frameworks) {
					for (const framework of lang.frameworks) {
						if (framework.dependencies) {
							for (const dep of framework.dependencies) {
								if (dependencies[dep]) {
									frameworks.set(
										framework.name,
										(frameworks.get(framework.name) || 0) + 1,
									);
								}
							}
						}
					}
				}
			}
		} catch {
			// Ignore package.json errors
		}
	}

	// Convert to array and normalize confidence
	return Array.from(frameworks.entries())
		.map(([name, score]) => ({
			name,
			confidence: Math.min(score / 3, 1), // Normalize to 0-1
		}))
		.filter((f) => f.confidence > 0.2) // Filter out low confidence
		.sort((a, b) => b.confidence - a.confidence);
}
