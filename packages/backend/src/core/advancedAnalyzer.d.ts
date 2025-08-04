/**
 * Advanced analysis features for code quality, security, and maintainability
 */
import { RepositoryAnalysis, ArchitecturalPattern } from '@unified-repo-analyzer/shared/src/types/analysis';
/**
 * Security vulnerability information
 */
export interface SecurityVulnerability {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    file: string;
    line?: number;
    recommendation: string;
}
/**
 * Code quality metrics for a file
 */
export interface FileQualityMetrics {
    file: string;
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    linesOfCode: number;
    duplicatedLines: number;
    testCoverage?: number;
    codeSmells: string[];
}
/**
 * Technical debt information
 */
export interface TechnicalDebt {
    type: 'code_smell' | 'bug' | 'vulnerability' | 'duplication' | 'complexity';
    severity: 'low' | 'medium' | 'high';
    description: string;
    file: string;
    line?: number;
    estimatedEffort: number;
    recommendation: string;
}
/**
 * Repository trend data
 */
export interface RepositoryTrend {
    date: Date;
    linesOfCode: number;
    complexity: number;
    testCoverage?: number;
    vulnerabilities: number;
    technicalDebt: number;
}
/**
 * Advanced analysis result
 */
export interface AdvancedAnalysisResult {
    codeQuality: {
        overallScore: number;
        fileMetrics: FileQualityMetrics[];
        technicalDebt: TechnicalDebt[];
    };
    security: {
        vulnerabilities: SecurityVulnerability[];
        securityScore: number;
        recommendations: string[];
    };
    architecture: {
        patterns: ArchitecturalPattern[];
        recommendations: string[];
        maintainabilityScore: number;
    };
    trends?: {
        data: RepositoryTrend[];
        insights: string[];
    };
}
/**
 * Advanced analyzer for code quality, security, and architectural analysis
 */
export declare class AdvancedAnalyzer {
    /**
     * Performs comprehensive advanced analysis on a repository
     */
    analyzeRepository(analysis: RepositoryAnalysis): Promise<AdvancedAnalysisResult>;
    /**
     * Analyzes code quality metrics and technical debt
     */
    private analyzeCodeQuality;
    /**
     * Calculates quality metrics for a single file
     */
    private calculateFileMetrics;
    /**
     * Calculates cyclomatic complexity for a file
     */
    private calculateCyclomaticComplexity;
    /**
     * Calculates maintainability index
     */
    private calculateMaintainabilityIndex;
    /**
     * Detects duplicated lines in code
     */
    private detectDuplicatedLines;
    /**
     * Detects code smells
     */
    private detectCodeSmells;
    /**
     * Extracts method information for analysis
     */
    private extractMethods;
    /**
     * Gets line number for a position in text
     */
    private getLineNumber;
    /**
     * Detects technical debt in code
     */
    private detectTechnicalDebt;
    /**
     * Calculates overall quality score
     */
    private calculateOverallQualityScore;
    /**
     * Calculates complexity metrics for the repository
     */
    private calculateComplexityMetrics;
    /**
     * Analyzes security vulnerabilities in the repository
     */
    private analyzeSecurityVulnerabilities;
    /**
     * Scans a file for security vulnerabilities
     */
    private scanFileForVulnerabilities;
    /**
     * Scans for vulnerable dependencies
     */
    private scanDependencyVulnerabilities;
    /**
     * Generates security recommendations
     */
    private generateSecurityRecommendations;
    /**
     * Gets security recommendation for a specific vulnerability type
     */
    private getSecurityRecommendation;
    /**
     * Calculates security score based on vulnerabilities
     */
    private calculateSecurityScore;
    /**
     * Analyzes architectural patterns in the repository
     */
    private analyzeArchitecturalPatterns;
    /**
     * Detects architectural patterns based on file structure
     */
    private detectStructuralPatterns;
    /**
     * Detects patterns based on frameworks used
     */
    private detectFrameworkPatterns;
    /**
     * Detects patterns from code analysis
     */
    private detectCodePatterns;
    /**
     * Generates architectural recommendations
     */
    private generateArchitecturalRecommendations;
    /**
     * Calculates maintainability score based on architecture
     */
    private calculateMaintainabilityScore;
    /**
     * Analyzes repository trends over time
     */
    private analyzeTrends;
    /**
     * Extracts trend data from git history
     */
    private extractTrendsFromGitHistory;
    /**
     * Generates insights from trend data
     */
    private generateTrendInsights;
    /**
     * Utility method to check if file exists
     */
    private fileExists;
}
