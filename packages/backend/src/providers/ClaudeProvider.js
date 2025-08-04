/**
 * Claude LLM provider implementation
 */
import axios from 'axios';
import { LLMProvider } from './LLMProvider';
/**
 * Claude LLM provider implementation
 */
export class ClaudeProvider extends LLMProvider {
    API_URL = 'https://api.anthropic.com/v1/complete';
    /**
     * Gets the name of the provider
     */
    get name() {
        return 'claude';
    }
    /**
     * Validates and normalizes the Claude provider configuration
     *
     * @param config - Provider configuration
     * @returns Validated and normalized configuration
     * @throws Error if configuration is invalid
     */
    validateAndNormalizeConfig(config) {
        if (!config.apiKey) {
            throw new Error('Claude API key is required');
        }
        return {
            ...config,
            model: config.model || 'claude-2.1',
            maxTokens: config.maxTokens || 4000,
            temperature: config.temperature !== undefined ? config.temperature : 0.7,
        };
    }
    /**
     * Formats a prompt for Claude based on project information
     *
     * @param projectInfo - Information about the project to analyze
     * @returns Formatted prompt string
     */
    formatPrompt(projectInfo) {
        return `
Human: I need you to analyze this codebase and provide both an executive summary and a technical breakdown.

# Repository Information
- Name: ${projectInfo.name}
- Primary Language: ${projectInfo.language || 'Unknown'}
- File Count: ${projectInfo.fileCount}
- Directory Count: ${projectInfo.directoryCount}

${projectInfo.description ? `# Description\n${projectInfo.description}\n` : ''}

${projectInfo.readme ? `# README\n${projectInfo.readme}\n` : ''}

# Key Directories
${projectInfo.directories.map((dir) => `- ${dir}`).join('\n')}

# Key Files
${projectInfo.fileAnalysis
            .map((file) => {
            return `## ${file.path}
- Lines: ${file.lineCount}
- Functions: ${file.functionCount}
- Classes: ${file.classCount}
- Imports: ${file.importCount}
${file.sample ? `\`\`\`\n${file.sample}\n\`\`\`` : ''}
`;
        })
            .join('\n')}

${projectInfo.dependencies
            ? `# Dependencies\n${Object.entries(projectInfo.dependencies)
                .map(([name, version]) => `- ${name}: ${version}`)
                .join('\n')}\n`
            : ''}

${projectInfo.devDependencies
            ? `# Dev Dependencies\n${Object.entries(projectInfo.devDependencies)
                .map(([name, version]) => `- ${name}: ${version}`)
                .join('\n')}\n`
            : ''}

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
     * Analyzes a prompt using the Claude API
     *
     * @param prompt - The prompt to analyze
     * @returns Promise resolving to LLM response
     */
    async analyze(prompt) {
        try {
            const response = await axios.post(this.API_URL, {
                prompt: prompt,
                model: this.config.model,
                max_tokens_to_sample: this.config.maxTokens,
                temperature: this.config.temperature,
                stop_sequences: ['Human:', 'Assistant:'],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey,
                    'Anthropic-Version': '2023-06-01',
                },
            });
            return {
                content: response.data.completion.trim(),
                tokenUsage: {
                    prompt: response.data.usage.prompt_tokens,
                    completion: response.data.usage.completion_tokens,
                    total: response.data.usage.total_tokens,
                },
            };
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`Claude API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Claude API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=ClaudeProvider.js.map