/**
 * OpenRouter LLM provider implementation
 */

import type {
  LLMResponse,
  ProjectInfo,
  ProviderConfig,
} from "@unified-repo-analyzer/shared/src/types/provider";
import axios from "axios";
import { LLMProvider } from "./LLMProvider";

/**
 * OpenRouter API response interface
 */
interface OpenRouterAPIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * OpenRouter LLM provider implementation
 */
export class OpenRouterProvider extends LLMProvider {
  private readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";

  /**
   * Gets the name of the provider
   */
  get name(): string {
    return "openrouter";
  }

  /**
   * Validates and normalizes the OpenRouter provider configuration
   *
   * @param config - Provider configuration
   * @returns Validated and normalized configuration
   * @throws Error if configuration is invalid
   */
  protected validateAndNormalizeConfig(config: ProviderConfig): ProviderConfig {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    return {
      ...config,
      model: config.model || "openrouter/auto",
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
    };
  }

  /**
   * Formats a prompt for OpenRouter based on project information
   *
   * @param projectInfo - Information about the project to analyze
   * @returns Formatted prompt string
   */
  formatPrompt(projectInfo: ProjectInfo): string {
    return `
Analyze this codebase and provide both an executive summary and a technical breakdown.

# Repository Information
- Name: ${projectInfo.name}
- Primary Language: ${projectInfo.language || "Unknown"}
- File Count: ${projectInfo.fileCount}
- Directory Count: ${projectInfo.directoryCount}

${projectInfo.description ? `# Description\n${projectInfo.description}\n` : ""}

${projectInfo.readme ? `# README\n${projectInfo.readme}\n` : ""}

# Key Directories
${projectInfo.directories.map((dir) => `- ${dir}`).join("\n")}

# Key Files
${projectInfo.fileAnalysis
  .map((file) => {
    return `## ${file.path}
- Lines: ${file.lineCount}
- Functions: ${file.functionCount}
- Classes: ${file.classCount}
- Imports: ${file.importCount}
${file.sample ? `\`\`\`\n${file.sample}\n\`\`\`` : ""}
`;
  })
  .join("\n")}

${
  projectInfo.dependencies
    ? `# Dependencies\n${Object.entries(projectInfo.dependencies)
        .map(([name, version]) => `- ${name}: ${version}`)
        .join("\n")}\n`
    : ""
}

${
  projectInfo.devDependencies
    ? `# Dev Dependencies\n${Object.entries(projectInfo.devDependencies)
        .map(([name, version]) => `- ${name}: ${version}`)
        .join("\n")}\n`
    : ""
}

Please provide:
1. An executive summary (2-3 paragraphs) explaining the purpose and key features of this codebase in non-technical terms.
2. A technical breakdown including:
   - Architecture overview
   - Key components and their relationships
   - Technologies used and why they might have been chosen
   - Code quality assessment
   - Potential areas for improvement
`;
  }

  /**
   * Analyzes a prompt using the OpenRouter API
   *
   * @param prompt - The prompt to analyze
   * @returns Promise resolving to LLM response
   */
  async analyze(prompt: string): Promise<LLMResponse> {
    try {
      const response = await axios.post<OpenRouterAPIResponse>(
        this.API_URL,
        {
          model: this.config.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "HTTP-Referer": "https://unified-repo-analyzer.com", // Optional, for OpenRouter analytics
            "X-Title": "Unified Repo Analyzer", // Optional, for OpenRouter analytics
          },
          timeout: 60000, // 60 second timeout
        }
      );

      // Check if we have a valid response
      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error("OpenRouter returned no choices");
      }

      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("OpenRouter returned no content");
      }

      return {
        content: choice.message.content.trim(),
        tokenUsage: {
          prompt: response.data.usage.prompt_tokens,
          completion: response.data.usage.completion_tokens,
          total: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        );
      }
      throw new Error(
        `OpenRouter API error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
