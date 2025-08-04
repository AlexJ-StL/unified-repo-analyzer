/**
 * Advanced analysis features for code quality, security, and maintainability
 */
import path from 'path';
import fs from 'fs/promises';
import { readFileWithErrorHandling } from '../utils/fileSystem';
import { countTokens } from './tokenAnalyzer';
/**
 * Advanced analyzer for code quality, security, and architectural analysis
 */
export class AdvancedAnalyzer {
    /**
     * Performs comprehensive advanced analysis on a repository
     */
    async analyzeRepository(analysis) {
        const result = {
            codeQuality: {
                overallScore: 0,
                fileMetrics: [],
                technicalDebt: [],
            },
            security: {
                vulnerabilities: [],
                securityScore: 0,
                recommendations: [],
            },
            architecture: {
                patterns: [],
                recommendations: [],
                maintainabilityScore: 0,
            },
        };
        // Analyze code quality and complexity
        await this.analyzeCodeQuality(analysis, result);
        // Detect security vulnerabilities
        await this.analyzeSecurityVulnerabilities(analysis, result);
        // Detect architectural patterns
        await this.analyzeArchitecturalPatterns(analysis, result);
        // Analyze trends if historical data is available
        await this.analyzeTrends(analysis, result);
        return result;
    }
    /**
     * Analyzes code quality metrics and technical debt
     */
    async analyzeCodeQuality(analysis, result) {
        const fileMetrics = [];
        const technicalDebt = [];
        // Process each key file
        for (const fileInfo of analysis.structure.keyFiles) {
            try {
                const filePath = path.join(analysis.path, fileInfo.path);
                const content = await readFileWithErrorHandling(filePath);
                // Calculate file-level metrics
                const metrics = await this.calculateFileMetrics(fileInfo, content);
                fileMetrics.push(metrics);
                // Detect technical debt
                const debt = await this.detectTechnicalDebt(fileInfo, content);
                technicalDebt.push(...debt);
            }
            catch (error) {
                console.error(`Error analyzing file ${fileInfo.path}:`, error);
            }
        }
        // Calculate overall quality score
        const overallScore = this.calculateOverallQualityScore(fileMetrics, technicalDebt);
        result.codeQuality = {
            overallScore,
            fileMetrics,
            technicalDebt,
        };
        // Update analysis complexity metrics
        analysis.codeAnalysis.complexity = this.calculateComplexityMetrics(fileMetrics, technicalDebt);
    }
    /**
     * Calculates quality metrics for a single file
     */
    async calculateFileMetrics(fileInfo, content) {
        const lines = content.split('\n');
        const linesOfCode = lines.filter((line) => line.trim() && !line.trim().startsWith('//')).length;
        // Calculate cyclomatic complexity
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(content, fileInfo.language);
        // Calculate maintainability index
        const maintainabilityIndex = this.calculateMaintainabilityIndex(linesOfCode, cyclomaticComplexity, content);
        // Detect duplicated lines
        const duplicatedLines = this.detectDuplicatedLines(content);
        // Detect code smells
        const codeSmells = this.detectCodeSmells(content, fileInfo.language);
        return {
            file: fileInfo.path,
            cyclomaticComplexity,
            maintainabilityIndex,
            linesOfCode,
            duplicatedLines,
            codeSmells,
        };
    }
    /**
     * Calculates cyclomatic complexity for a file
     */
    calculateCyclomaticComplexity(content, language) {
        // Patterns for decision points that increase complexity
        const complexityPatterns = {
            javascript: [
                /\bif\s*\(/g,
                /\belse\s+if\s*\(/g,
                /\bwhile\s*\(/g,
                /\bfor\s*\(/g,
                /\bswitch\s*\(/g,
                /\bcase\s+/g,
                /\bcatch\s*\(/g,
                /\?\s*.*\s*:/g, // ternary operator
                /&&/g,
                /\|\|/g,
            ],
            python: [
                /\bif\s+/g,
                /\belif\s+/g,
                /\bwhile\s+/g,
                /\bfor\s+/g,
                /\btry\s*:/g,
                /\bexcept\s+/g,
                /\band\b/g,
                /\bor\b/g,
            ],
            java: [
                /\bif\s*\(/g,
                /\belse\s+if\s*\(/g,
                /\bwhile\s*\(/g,
                /\bfor\s*\(/g,
                /\bswitch\s*\(/g,
                /\bcase\s+/g,
                /\bcatch\s*\(/g,
                /\?\s*.*\s*:/g,
                /&&/g,
                /\|\|/g,
            ],
        };
        const patterns = complexityPatterns[language.toLowerCase()] || complexityPatterns.javascript;
        let complexity = 1; // Base complexity
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    /**
     * Calculates maintainability index
     */
    calculateMaintainabilityIndex(linesOfCode, cyclomaticComplexity, content) {
        // Simplified maintainability index calculation
        // Based on Halstead metrics and cyclomatic complexity
        const halsteadVolume = Math.log2(countTokens(content)) * countTokens(content);
        const maintainabilityIndex = Math.max(0, ((171 -
            5.2 * Math.log(halsteadVolume) -
            0.23 * cyclomaticComplexity -
            16.2 * Math.log(linesOfCode)) *
            100) /
            171);
        return Math.round(maintainabilityIndex);
    }
    /**
     * Detects duplicated lines in code
     */
    detectDuplicatedLines(content) {
        const lines = content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line);
        const lineCount = new Map();
        // Count occurrences of each line
        for (const line of lines) {
            if (line.length > 10) {
                // Only consider substantial lines
                lineCount.set(line, (lineCount.get(line) || 0) + 1);
            }
        }
        // Count duplicated lines
        let duplicatedLines = 0;
        for (const [, count] of lineCount) {
            if (count > 1) {
                duplicatedLines += count - 1; // Don't count the original
            }
        }
        return duplicatedLines;
    }
    /**
     * Detects code smells
     */
    detectCodeSmells(content, language) {
        const smells = [];
        const lines = content.split('\n');
        // Long method detection
        const methods = this.extractMethods(content, language);
        for (const method of methods) {
            if (method.lineCount > 50) {
                smells.push(`Long method: ${method.name} (${method.lineCount} lines)`);
            }
        }
        // Large class detection
        if (lines.length > 500) {
            smells.push(`Large class/file (${lines.length} lines)`);
        }
        // Magic numbers
        const magicNumbers = content.match(/\b\d{2,}\b/g);
        if (magicNumbers && magicNumbers.length > 1) {
            smells.push('Multiple magic numbers detected');
        }
        // Long parameter lists
        const longParameterLists = content.match(/\([^)]{50,}\)/g);
        if (longParameterLists) {
            smells.push('Long parameter lists detected');
        }
        // Commented code
        const commentedCodeLines = lines.filter((line) => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') && /[a-zA-Z]{3,}/.test(trimmed);
        });
        if (commentedCodeLines.length > 5) {
            smells.push('Commented code detected');
        }
        // TODO/FIXME comments
        const todoComments = content.match(/TODO|FIXME|HACK|XXX/gi);
        if (todoComments && todoComments.length > 0) {
            smells.push(`${todoComments.length} TODO/FIXME comments`);
        }
        return smells;
    }
    /**
     * Extracts method information for analysis
     */
    extractMethods(content, language) {
        const methods = [];
        const lines = content.split('\n');
        // Simple method extraction based on language patterns
        const methodPatterns = {
            javascript: /function\s+(\w+)\s*\(/g,
            python: /def\s+(\w+)\s*\(/g,
            java: /(?:public|private|protected)?\s*[\w<>[\]]+\s+(\w+)\s*\([^)]*\)\s*{/g,
        };
        const pattern = methodPatterns[language.toLowerCase()] || methodPatterns.javascript;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const methodName = match[1];
            if (methodName) {
                // Estimate method length (simplified)
                const methodStart = this.getLineNumber(content, match.index);
                let methodEnd = methodStart;
                // Find method end by looking for closing brace or next method
                let braceCount = 0;
                let foundOpenBrace = false;
                for (let i = methodStart; i < lines.length; i++) {
                    const line = lines[i];
                    for (const char of line) {
                        if (char === '{') {
                            braceCount++;
                            foundOpenBrace = true;
                        }
                        else if (char === '}') {
                            braceCount--;
                            if (foundOpenBrace && braceCount === 0) {
                                methodEnd = i;
                                break;
                            }
                        }
                    }
                    if (foundOpenBrace && braceCount === 0) {
                        break;
                    }
                }
                methods.push({
                    name: methodName,
                    lineCount: methodEnd - methodStart + 1,
                });
            }
        }
        return methods;
    }
    /**
     * Gets line number for a position in text
     */
    getLineNumber(text, position) {
        const textBefore = text.substring(0, position);
        return textBefore.split('\n').length;
    }
    /**
     * Detects technical debt in code
     */
    async detectTechnicalDebt(fileInfo, content) {
        const debt = [];
        // Detect high complexity methods
        const methods = this.extractMethods(content, fileInfo.language);
        for (const method of methods) {
            if (method.lineCount > 50) {
                debt.push({
                    type: 'complexity',
                    severity: 'high',
                    description: `Method ${method.name} is too long (${method.lineCount} lines)`,
                    file: fileInfo.path,
                    estimatedEffort: Math.ceil(method.lineCount / 20),
                    recommendation: 'Break down into smaller methods',
                });
            }
        }
        // Also check for very long files as complexity debt
        const fileLines = content.split('\n');
        if (fileLines.length > 100) {
            debt.push({
                type: 'complexity',
                severity: 'medium',
                description: `File is very long (${fileLines.length} lines)`,
                file: fileInfo.path,
                estimatedEffort: Math.ceil(fileLines.length / 50),
                recommendation: 'Consider breaking file into smaller modules',
            });
        }
        // Detect code duplication
        const duplicatedLines = this.detectDuplicatedLines(content);
        if (duplicatedLines > 20) {
            debt.push({
                type: 'duplication',
                severity: 'medium',
                description: `${duplicatedLines} duplicated lines detected`,
                file: fileInfo.path,
                estimatedEffort: Math.ceil(duplicatedLines / 10),
                recommendation: 'Extract common code into reusable functions',
            });
        }
        // Detect TODO/FIXME comments
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (/TODO|FIXME|HACK|XXX/i.test(line)) {
                const severity = /FIXME|HACK/i.test(line) ? 'medium' : 'low';
                debt.push({
                    type: 'code_smell',
                    severity,
                    description: 'Unresolved TODO/FIXME comment',
                    file: fileInfo.path,
                    line: i + 1,
                    estimatedEffort: severity === 'medium' ? 2 : 1,
                    recommendation: 'Address the TODO/FIXME comment or remove if no longer relevant',
                });
            }
        }
        return debt;
    }
    /**
     * Calculates overall quality score
     */
    calculateOverallQualityScore(fileMetrics, technicalDebt) {
        if (fileMetrics.length === 0)
            return 0;
        // Filter out invalid metrics
        const validMetrics = fileMetrics.filter((m) => !isNaN(m.maintainabilityIndex) &&
            !isNaN(m.cyclomaticComplexity) &&
            isFinite(m.maintainabilityIndex) &&
            isFinite(m.cyclomaticComplexity));
        if (validMetrics.length === 0)
            return 0;
        // Calculate average maintainability index
        const avgMaintainability = validMetrics.reduce((sum, m) => sum + m.maintainabilityIndex, 0) / validMetrics.length;
        // Calculate complexity penalty
        const avgComplexity = validMetrics.reduce((sum, m) => sum + m.cyclomaticComplexity, 0) / validMetrics.length;
        const complexityPenalty = Math.min(avgComplexity / 10, 20);
        // Calculate technical debt penalty
        const debtPenalty = technicalDebt.reduce((sum, debt) => {
            const severityWeight = { low: 1, medium: 3, high: 5 };
            return sum + severityWeight[debt.severity];
        }, 0);
        // Calculate final score (0-100)
        const score = Math.max(0, avgMaintainability - complexityPenalty - debtPenalty);
        return Math.round(score);
    }
    /**
     * Calculates complexity metrics for the repository
     */
    calculateComplexityMetrics(fileMetrics, technicalDebt) {
        if (fileMetrics.length === 0) {
            return {
                cyclomaticComplexity: 0,
                maintainabilityIndex: 0,
                technicalDebt: 'No files analyzed',
                codeQuality: 'poor',
            };
        }
        const avgComplexity = fileMetrics.reduce((sum, m) => sum + m.cyclomaticComplexity, 0) / fileMetrics.length;
        const avgMaintainability = fileMetrics.reduce((sum, m) => sum + m.maintainabilityIndex, 0) / fileMetrics.length;
        // Calculate technical debt summary
        const highDebt = technicalDebt.filter((d) => d.severity === 'high').length;
        const mediumDebt = technicalDebt.filter((d) => d.severity === 'medium').length;
        const lowDebt = technicalDebt.filter((d) => d.severity === 'low').length;
        const debtSummary = `${highDebt} high, ${mediumDebt} medium, ${lowDebt} low priority items`;
        // Determine code quality
        let codeQuality;
        if (avgMaintainability >= 80 && avgComplexity <= 5 && highDebt === 0) {
            codeQuality = 'excellent';
        }
        else if (avgMaintainability >= 60 && avgComplexity <= 10 && highDebt <= 2) {
            codeQuality = 'good';
        }
        else if (avgMaintainability >= 40 && avgComplexity <= 20) {
            codeQuality = 'fair';
        }
        else {
            codeQuality = 'poor';
        }
        return {
            cyclomaticComplexity: Math.round(avgComplexity),
            maintainabilityIndex: Math.round(avgMaintainability),
            technicalDebt: debtSummary,
            codeQuality,
        };
    }
    /**
     * Analyzes security vulnerabilities in the repository
     */
    async analyzeSecurityVulnerabilities(analysis, result) {
        const vulnerabilities = [];
        const recommendations = [];
        // Check for common security issues in different file types
        for (const fileInfo of analysis.structure.keyFiles) {
            try {
                const filePath = path.join(analysis.path, fileInfo.path);
                const content = await readFileWithErrorHandling(filePath);
                const fileVulns = await this.scanFileForVulnerabilities(fileInfo, content);
                vulnerabilities.push(...fileVulns);
            }
            catch (error) {
                console.error(`Error scanning file ${fileInfo.path} for vulnerabilities:`, error);
            }
        }
        // Check package.json for vulnerable dependencies
        const packageJsonVulns = await this.scanDependencyVulnerabilities(analysis);
        vulnerabilities.push(...packageJsonVulns);
        // Generate security recommendations
        recommendations.push(...this.generateSecurityRecommendations(analysis, vulnerabilities));
        // Calculate security score
        const securityScore = this.calculateSecurityScore(vulnerabilities);
        result.security = {
            vulnerabilities,
            securityScore,
            recommendations,
        };
    }
    /**
     * Scans a file for security vulnerabilities
     */
    async scanFileForVulnerabilities(fileInfo, content) {
        const vulnerabilities = [];
        const lines = content.split('\n');
        // Common security patterns to detect
        const securityPatterns = {
            // Hardcoded secrets
            hardcodedSecrets: [
                { pattern: /password\s*=\s*["'][^"']+["']/gi, type: 'Hardcoded Password' },
                { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/gi, type: 'Hardcoded API Key' },
                { pattern: /secret\s*=\s*["'][^"']+["']/gi, type: 'Hardcoded Secret' },
                { pattern: /token\s*=\s*["'][^"']+["']/gi, type: 'Hardcoded Token' },
                { pattern: /private[_-]?key\s*=\s*["'][^"']+["']/gi, type: 'Hardcoded Private Key' },
            ],
            // SQL Injection
            sqlInjection: [
                { pattern: /query\s*=\s*["'][^"']*\+/gi, type: 'Potential SQL Injection' },
                { pattern: /execute\s*\(\s*["'][^"']*\+/gi, type: 'Potential SQL Injection' },
                { pattern: /SELECT\s+.*\+.*FROM/gi, type: 'Potential SQL Injection' },
                { pattern: /["'][^"']*\+\s*\w+\s*\+[^"']*["']/gi, type: 'Potential SQL Injection' },
            ],
            // XSS vulnerabilities
            xss: [
                { pattern: /innerHTML\s*=\s*[^"'][^;]+/gi, type: 'Potential XSS via innerHTML' },
                { pattern: /document\.write\s*\(/gi, type: 'Potential XSS via document.write' },
                { pattern: /eval\s*\(/gi, type: 'Dangerous eval() usage' },
            ],
            // Insecure random
            insecureRandom: [
                { pattern: /Math\.random\(\)/gi, type: 'Insecure Random Number Generation' },
            ],
            // Insecure HTTP
            insecureHttp: [{ pattern: /http:\/\/[^"'\s]+/gi, type: 'Insecure HTTP URL' }],
            // Command injection
            commandInjection: [
                { pattern: /exec\s*\(\s*[^"'][^)]*\+/gi, type: 'Potential Command Injection' },
                { pattern: /system\s*\(\s*[^"'][^)]*\+/gi, type: 'Potential Command Injection' },
            ],
        };
        // Scan for each pattern type
        for (const [category, patterns] of Object.entries(securityPatterns)) {
            for (const { pattern, type } of patterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const lineNumber = this.getLineNumber(content, match.index);
                    // Determine severity based on vulnerability type
                    let severity;
                    if (type.includes('SQL Injection') || type.includes('Command Injection')) {
                        severity = 'critical';
                    }
                    else if (type.includes('XSS') || type.includes('Hardcoded')) {
                        severity = 'high';
                    }
                    else if (type.includes('Insecure')) {
                        severity = 'medium';
                    }
                    else {
                        severity = 'low';
                    }
                    vulnerabilities.push({
                        id: `${fileInfo.path}:${lineNumber}:${type}`,
                        severity,
                        type,
                        description: `${type} detected in ${fileInfo.path}`,
                        file: fileInfo.path,
                        line: lineNumber,
                        recommendation: this.getSecurityRecommendation(type),
                    });
                }
            }
        }
        return vulnerabilities;
    }
    /**
     * Scans for vulnerable dependencies
     */
    async scanDependencyVulnerabilities(analysis) {
        const vulnerabilities = [];
        // Check if package.json exists
        const packageJsonPath = path.join(analysis.path, 'package.json');
        try {
            if (await this.fileExists(packageJsonPath)) {
                const packageContent = await readFileWithErrorHandling(packageJsonPath);
                const packageJson = JSON.parse(packageContent);
                // Known vulnerable packages (simplified list)
                const knownVulnerablePackages = {
                    lodash: { versions: ['<4.17.21'], severity: 'medium' },
                    moment: { versions: ['<2.29.4'], severity: 'low' },
                    axios: { versions: ['<0.21.2'], severity: 'high' },
                    express: { versions: ['<4.18.2'], severity: 'medium' },
                };
                // Check dependencies
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                };
                for (const [depName, version] of Object.entries(allDeps)) {
                    if (knownVulnerablePackages[depName]) {
                        const vulnInfo = knownVulnerablePackages[depName];
                        vulnerabilities.push({
                            id: `dependency:${depName}:${version}`,
                            severity: vulnInfo.severity,
                            type: 'Vulnerable Dependency',
                            description: `Potentially vulnerable dependency: ${depName}@${version}`,
                            file: 'package.json',
                            recommendation: `Update ${depName} to a secure version`,
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error scanning dependencies:', error);
        }
        return vulnerabilities;
    }
    /**
     * Generates security recommendations
     */
    generateSecurityRecommendations(analysis, vulnerabilities) {
        const recommendations = [];
        // General recommendations based on project type
        if (analysis.frameworks.some((f) => f.toLowerCase().includes('express'))) {
            recommendations.push('Use helmet.js for security headers');
            recommendations.push('Implement rate limiting');
            recommendations.push('Use HTTPS in production');
        }
        if (analysis.frameworks.some((f) => f.toLowerCase().includes('react'))) {
            recommendations.push('Sanitize user inputs to prevent XSS');
            recommendations.push('Use Content Security Policy (CSP)');
        }
        // Specific recommendations based on vulnerabilities
        const vulnTypes = new Set(vulnerabilities.map((v) => v.type));
        if (vulnTypes.has('Hardcoded Password') || vulnTypes.has('Hardcoded API Key')) {
            recommendations.push('Use environment variables for sensitive data');
            recommendations.push('Implement proper secrets management');
        }
        if (vulnTypes.has('Potential SQL Injection')) {
            recommendations.push('Use parameterized queries or ORM');
            recommendations.push('Validate and sanitize all user inputs');
        }
        if (vulnTypes.has('Potential XSS via innerHTML')) {
            recommendations.push('Use textContent instead of innerHTML when possible');
            recommendations.push('Implement input validation and output encoding');
        }
        // Add dependency security recommendations
        if (vulnerabilities.some((v) => v.type === 'Vulnerable Dependency')) {
            recommendations.push('Regularly update dependencies');
            recommendations.push('Use npm audit or yarn audit to check for vulnerabilities');
            recommendations.push('Consider using automated dependency update tools');
        }
        return recommendations;
    }
    /**
     * Gets security recommendation for a specific vulnerability type
     */
    getSecurityRecommendation(type) {
        const recommendations = {
            'Hardcoded Password': 'Store passwords in environment variables or secure configuration',
            'Hardcoded API Key': 'Store API keys in environment variables or secure vault',
            'Hardcoded Secret': 'Use environment variables or secure secret management',
            'Hardcoded Token': 'Store tokens securely and rotate regularly',
            'Hardcoded Private Key': 'Store private keys in secure key management system',
            'Potential SQL Injection': 'Use parameterized queries or prepared statements',
            'Potential XSS via innerHTML': 'Use textContent or sanitize HTML content',
            'Potential XSS via document.write': 'Avoid document.write or sanitize content',
            'Dangerous eval() usage': 'Avoid eval() or use safer alternatives like JSON.parse',
            'Insecure Random Number Generation': 'Use cryptographically secure random number generator',
            'Insecure HTTP URL': 'Use HTTPS instead of HTTP for secure communication',
            'Potential Command Injection': 'Validate and sanitize command inputs',
            'Vulnerable Dependency': 'Update to a secure version of the dependency',
        };
        return recommendations[type] || 'Review and address this security issue';
    }
    /**
     * Calculates security score based on vulnerabilities
     */
    calculateSecurityScore(vulnerabilities) {
        if (vulnerabilities.length === 0)
            return 100;
        // Weight vulnerabilities by severity
        const severityWeights = { low: 1, medium: 3, high: 7, critical: 15 };
        const totalWeight = vulnerabilities.reduce((sum, vuln) => sum + severityWeights[vuln.severity], 0);
        // Calculate score (0-100, where 100 is most secure)
        const maxPenalty = 100;
        const penalty = Math.min(totalWeight * 2, maxPenalty);
        return Math.max(0, 100 - penalty);
    }
    /**
     * Analyzes architectural patterns in the repository
     */
    async analyzeArchitecturalPatterns(analysis, result) {
        const patterns = [];
        const recommendations = [];
        // Detect patterns based on file structure and content
        patterns.push(...this.detectStructuralPatterns(analysis));
        patterns.push(...this.detectFrameworkPatterns(analysis));
        patterns.push(...(await this.detectCodePatterns(analysis)));
        // Generate architectural recommendations
        recommendations.push(...this.generateArchitecturalRecommendations(analysis, patterns));
        // Calculate maintainability score
        const maintainabilityScore = this.calculateMaintainabilityScore(analysis, patterns);
        result.architecture = {
            patterns,
            recommendations,
            maintainabilityScore,
        };
        // Update analysis with detected patterns
        analysis.codeAnalysis.patterns = patterns;
    }
    /**
     * Detects architectural patterns based on file structure
     */
    detectStructuralPatterns(analysis) {
        const patterns = [];
        const directories = analysis.structure.directories.map((d) => d.path.toLowerCase());
        const files = analysis.structure.keyFiles.map((f) => f.path.toLowerCase());
        // MVC Pattern
        const hasMVC = directories.some((d) => d.includes('model')) &&
            directories.some((d) => d.includes('view')) &&
            directories.some((d) => d.includes('controller'));
        if (hasMVC) {
            patterns.push({
                name: 'Model-View-Controller (MVC)',
                confidence: 0.8,
                description: 'Traditional MVC architecture with separate model, view, and controller layers',
            });
        }
        // Layered Architecture
        const hasLayers = directories.some((d) => d.includes('service')) &&
            directories.some((d) => d.includes('repository')) &&
            directories.some((d) => d.includes('controller'));
        if (hasLayers) {
            patterns.push({
                name: 'Layered Architecture',
                confidence: 0.7,
                description: 'Layered architecture with service, repository, and controller layers',
            });
        }
        // Microservices
        const hasMicroservices = directories.filter((d) => d.includes('service')).length > 3 ||
            files.some((f) => f.includes('docker')) ||
            files.some((f) => f.includes('kubernetes'));
        if (hasMicroservices) {
            patterns.push({
                name: 'Microservices',
                confidence: 0.6,
                description: 'Microservices architecture with multiple independent services',
            });
        }
        // Component-Based (React/Vue/Angular)
        const hasComponents = directories.some((d) => d.includes('component')) ||
            files.some((f) => f.includes('.component.'));
        if (hasComponents) {
            patterns.push({
                name: 'Component-Based Architecture',
                confidence: 0.8,
                description: 'Component-based architecture with reusable UI components',
            });
        }
        // Plugin Architecture
        const hasPlugins = directories.some((d) => d.includes('plugin')) ||
            directories.some((d) => d.includes('extension')) ||
            files.some((f) => f.includes('plugin'));
        if (hasPlugins) {
            patterns.push({
                name: 'Plugin Architecture',
                confidence: 0.7,
                description: 'Plugin-based architecture allowing extensibility through plugins',
            });
        }
        return patterns;
    }
    /**
     * Detects patterns based on frameworks used
     */
    detectFrameworkPatterns(analysis) {
        const patterns = [];
        const frameworks = analysis.frameworks.map((f) => f.toLowerCase());
        // REST API
        if (frameworks.some((f) => f.includes('express') || f.includes('fastify') || f.includes('koa'))) {
            patterns.push({
                name: 'REST API',
                confidence: 0.9,
                description: 'RESTful API architecture using HTTP methods and resources',
            });
        }
        // Single Page Application
        if (frameworks.some((f) => f.includes('react') || f.includes('vue') || f.includes('angular'))) {
            patterns.push({
                name: 'Single Page Application (SPA)',
                confidence: 0.9,
                description: 'Single page application with client-side routing and state management',
            });
        }
        // Server-Side Rendering
        if (frameworks.some((f) => f.includes('next') || f.includes('nuxt') || f.includes('gatsby'))) {
            patterns.push({
                name: 'Server-Side Rendering (SSR)',
                confidence: 0.8,
                description: 'Server-side rendering for improved performance and SEO',
            });
        }
        // GraphQL
        if (frameworks.some((f) => f.includes('graphql') || f.includes('apollo'))) {
            patterns.push({
                name: 'GraphQL API',
                confidence: 0.9,
                description: 'GraphQL API with flexible query language and type system',
            });
        }
        return patterns;
    }
    /**
     * Detects patterns from code analysis
     */
    async detectCodePatterns(analysis) {
        const patterns = [];
        let singletonCount = 0;
        let factoryCount = 0;
        let observerCount = 0;
        // Analyze code files for design patterns
        for (const fileInfo of analysis.structure.keyFiles) {
            try {
                const filePath = path.join(analysis.path, fileInfo.path);
                const content = await readFileWithErrorHandling(filePath);
                // Singleton pattern
                if (/class\s+\w+.*{[\s\S]*private\s+static\s+instance/i.test(content) ||
                    /getInstance\s*\(\s*\)/i.test(content)) {
                    singletonCount++;
                }
                // Factory pattern
                if (/create\w*\s*\([^)]*\)\s*{[\s\S]*return\s+new/i.test(content) ||
                    /factory/i.test(fileInfo.path)) {
                    factoryCount++;
                }
                // Observer pattern
                const observerMatches = content.match(/addEventListener|subscribe|notify|observer/gi);
                if (observerMatches && observerMatches.length > 0) {
                    observerCount += observerMatches.length;
                }
            }
            catch (error) {
                console.error(`Error analyzing patterns in ${fileInfo.path}:`, error);
            }
        }
        // Add patterns based on detection counts
        if (singletonCount > 0) {
            patterns.push({
                name: 'Singleton Pattern',
                confidence: Math.min(singletonCount * 0.3, 0.9),
                description: 'Singleton pattern ensuring single instance of classes',
            });
        }
        if (factoryCount > 0) {
            patterns.push({
                name: 'Factory Pattern',
                confidence: Math.min(factoryCount * 0.2, 0.8),
                description: 'Factory pattern for object creation abstraction',
            });
        }
        if (observerCount > 2) {
            patterns.push({
                name: 'Observer Pattern',
                confidence: Math.min(observerCount * 0.1, 0.8),
                description: 'Observer pattern for event-driven communication',
            });
        }
        return patterns;
    }
    /**
     * Generates architectural recommendations
     */
    generateArchitecturalRecommendations(analysis, patterns) {
        const recommendations = [];
        const patternNames = patterns.map((p) => p.name.toLowerCase());
        // Recommendations based on project size and complexity
        if (analysis.fileCount > 100 && !patternNames.some((p) => p.includes('layered'))) {
            recommendations.push('Consider implementing layered architecture for better organization');
        }
        if (analysis.fileCount > 50 && !patternNames.some((p) => p.includes('component'))) {
            recommendations.push('Consider component-based architecture for better reusability');
        }
        // Framework-specific recommendations
        if (analysis.frameworks.some((f) => f.toLowerCase().includes('react'))) {
            if (!patternNames.some((p) => p.includes('component'))) {
                recommendations.push('Implement proper component hierarchy and state management');
            }
            recommendations.push('Consider using React hooks for state management');
        }
        if (analysis.frameworks.some((f) => f.toLowerCase().includes('express'))) {
            if (!patternNames.some((p) => p.includes('rest'))) {
                recommendations.push('Follow REST API conventions for better maintainability');
            }
            recommendations.push('Implement proper error handling middleware');
        }
        // General architectural recommendations
        if (patterns.length < 2) {
            recommendations.push('Consider implementing more architectural patterns for better structure');
        }
        recommendations.push('Maintain clear separation of concerns');
        recommendations.push('Follow SOLID principles in design');
        recommendations.push('Implement proper dependency injection');
        return recommendations;
    }
    /**
     * Calculates maintainability score based on architecture
     */
    calculateMaintainabilityScore(analysis, patterns) {
        let score = 50; // Base score
        // Bonus for good architectural patterns
        const goodPatterns = ['layered architecture', 'component-based', 'mvc', 'rest api'];
        const detectedGoodPatterns = patterns.filter((p) => goodPatterns.some((gp) => p.name.toLowerCase().includes(gp)));
        score += detectedGoodPatterns.length * 10;
        // Bonus for high confidence patterns
        const highConfidencePatterns = patterns.filter((p) => p.confidence > 0.7);
        score += highConfidencePatterns.length * 5;
        // Penalty for large files without proper structure
        if (analysis.fileCount > 100 && patterns.length < 2) {
            score -= 20;
        }
        // Bonus for modern frameworks
        const modernFrameworks = ['react', 'vue', 'angular', 'next', 'express'];
        const hasModernFramework = analysis.frameworks.some((f) => modernFrameworks.some((mf) => f.toLowerCase().includes(mf)));
        if (hasModernFramework) {
            score += 10;
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Analyzes repository trends over time
     */
    async analyzeTrends(analysis, result) {
        // This is a placeholder for trend analysis
        // In a real implementation, this would analyze git history
        // and track metrics over time
        try {
            const trends = await this.extractTrendsFromGitHistory(analysis.path);
            if (trends.length > 0) {
                result.trends = {
                    data: trends,
                    insights: this.generateTrendInsights(trends),
                };
            }
        }
        catch (error) {
            console.error('Error analyzing trends:', error);
            // Trends are optional, so we don't fail the entire analysis
        }
    }
    /**
     * Extracts trend data from git history
     */
    async extractTrendsFromGitHistory(repoPath) {
        // This is a simplified implementation
        // In practice, you would use git commands to analyze history
        const trends = [];
        // For now, return empty array as this requires git integration
        // which is beyond the scope of this basic implementation
        return trends;
    }
    /**
     * Generates insights from trend data
     */
    generateTrendInsights(trends) {
        const insights = [];
        if (trends.length < 2) {
            return ['Insufficient data for trend analysis'];
        }
        // Analyze trends (simplified)
        const latest = trends[trends.length - 1];
        const previous = trends[trends.length - 2];
        if (latest.linesOfCode > previous.linesOfCode * 1.2) {
            insights.push('Rapid code growth detected - consider refactoring');
        }
        if (latest.complexity > previous.complexity * 1.1) {
            insights.push('Increasing complexity trend - focus on simplification');
        }
        if (latest.vulnerabilities > previous.vulnerabilities) {
            insights.push('Security vulnerabilities increasing - prioritize security review');
        }
        return insights;
    }
    /**
     * Utility method to check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.stat(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=advancedAnalyzer.js.map