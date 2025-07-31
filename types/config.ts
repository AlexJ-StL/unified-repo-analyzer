/**
 * Configuration type definitions for build tools and frameworks
 */

export interface PostCSSConfig {
  plugins: Record<string, any>;
}

export interface TailwindConfig {
  content: string[];
  theme: {
    extend: Record<string, any>;
  };
  plugins: any[];
}

export interface BiomeRuleConfig {
  level?: "error" | "warn" | "info" | "off";
  options?: Record<string, any>;
}

export interface BiomeRules {
  recommended?: boolean;
  suspicious?: Record<string, BiomeRuleConfig | string>;
  style?: Record<string, BiomeRuleConfig | string>;
  correctness?: Record<string, BiomeRuleConfig | string>;
  complexity?: Record<string, BiomeRuleConfig | string>;
  performance?: Record<string, BiomeRuleConfig | string>;
  security?: Record<string, BiomeRuleConfig | string>;
  nursery?: Record<string, BiomeRuleConfig | string>;
}

export interface BiomeFormatterConfig {
  enabled: boolean;
  formatWithErrors?: boolean;
  indentStyle: "tab" | "space";
  indentWidth: number;
  lineEnding?: "lf" | "crlf" | "cr";
  lineWidth?: number;
  attributePosition?: "auto" | "multiline";
}

export interface BiomeJavaScriptFormatter {
  quoteStyle: "double" | "single";
  trailingCommas?: "all" | "es5" | "none";
  semicolons?: "always" | "asNeeded";
  arrowParentheses?: "always" | "asNeeded";
  bracketSpacing?: boolean;
  bracketSameLine?: boolean;
  quoteProperties?: "asNeeded" | "preserve";
  attributePosition?: "auto" | "multiline";
}

export interface BiomeTypeScriptFormatter {
  quoteStyle: "double" | "single";
  trailingCommas?: "all" | "es5" | "none";
  semicolons?: "always" | "asNeeded";
}

export interface BiomeJsonFormatter {
  enabled: boolean;
  indentStyle: "tab" | "space";
  indentWidth: number;
  lineEnding: "lf" | "crlf" | "cr";
  lineWidth: number;
  trailingCommas: "none";
}

export interface BiomeAssistConfig {
  actions?: {
    source?: {
      organizeImports?: "on" | "off";
    };
  };
}

export interface BiomeOverride {
  includes: string[];
  linter?: {
    enabled: boolean;
    rules?: BiomeRules;
  };
  formatter?: {
    enabled: boolean;
  };
}

export interface BiomeConfig {
  $schema?: string;
  files?: {
    includes?: string[];
    excludes?: string[];
    ignore?: string[];
  };
  linter?: {
    enabled: boolean;
    rules?: BiomeRules;
  };
  formatter?: BiomeFormatterConfig;
  assist?: BiomeAssistConfig;
  javascript?: {
    formatter?: BiomeJavaScriptFormatter;
  };
  typescript?: {
    formatter?: BiomeTypeScriptFormatter;
  };
  json?: BiomeJsonFormatter;
  overrides?: BiomeOverride[];
}

/**
 * Test runner type definitions
 */
export interface TestResult {
  status: 'passed' | 'failed' | 'skipped' | 'generated' | 'unknown';
  duration?: number;
  error?: string;
}

export interface TestResults {
  unit: TestResult | null;
  integration: TestResult | null;
  e2e: TestResult | null;
  performance: TestResult | null;
  coverage: TestResult | null;
}

export interface TestEnvironment {
  nodeVersion: string;
  platform: string;
  arch: string;
  ci: boolean;
}

export interface TestReport {
  timestamp: string;
  totalDuration: number;
  results: TestResults;
  environment: TestEnvironment;
}