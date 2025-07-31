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

export interface BiomeConfig {
  $schema: string;
  files: {
    include: string[];
    ignore: string[];
  };
  linter: {
    enabled: boolean;
    rules: Record<string, any>;
  };
  formatter: {
    enabled: boolean;
    indentStyle: "tab" | "space";
    indentWidth: number;
  };
  javascript?: {
    formatter: {
      quoteStyle: "double" | "single";
      trailingComma: "all" | "es5" | "none";
    };
  };
  typescript?: {
    formatter: {
      quoteStyle: "double" | "single";
    };
  };
}