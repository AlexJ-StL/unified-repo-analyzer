/**
 * Gemini LLM provider implementation
 */
import axios from 'axios';
import { LLMProvider } from './LLMProvider';
/**
 * Gemini LLM provider implementation
 */
export class GeminiProvider extends LLMProvider {
    API_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
    /**
     * Gets the name of the provider
     */
    get name() {
        return 'gemini';
    }
    /**
     * Validates and normalizes the Gemini provider configuration
     *
     * @param config - Provider configuration
     * @returns Validated and normalized configuration
     * @throws Error if configuration is invalid
     */
    validateAndNormalizeConfig(config) {
        if (!config.apiKey) {
            throw new Error('Gemini API key is required');
        }
        return {
            ...config,
            model: config.model || 'gemini-pro',
            maxTokens: config.maxTokens || 4000,
            temperature: config.temperature !== undefined ? config.temperature : 0.7,
        };
    }
    /**
     * Formats a prompt for Gemini based on project information
     *
     * @param projectInfo - Information about the project to analyze
     * @returns Formatted prompt string
     */
    formatPrompt(projectInfo) {
        return `
Analyze this codebase and provide both an executive summary and a technical breakdown.

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
     * Analyzes a prompt using the Gemini API
     *
     * @param prompt - The prompt to analyze
     * @returns Promise resolving to LLM response
     */
    async analyze(prompt) {
        try {
            const apiUrl = `${this.API_URL_BASE}/${this.config.model}:generateContent?key=${this.config.apiKey}`;
            const response = await axios.post(apiUrl, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: this.config.temperature,
                    maxOutputTokens: this.config.maxTokens,
                    topP: 0.95,
                    topK: 40,
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Check for content filtering or other issues
            if (response.data.promptFeedback?.blockReason) {
                throw new Error(`Gemini content filtered: ${response.data.promptFeedback.blockReason}`);
            }
            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('Gemini returned no candidates');
            }
            const content = response.data.candidates[0].content.parts.map((part) => part.text).join('');
            return {
                content: content.trim(),
                tokenUsage: {
                    prompt: response.data.usageMetadata.promptTokenCount,
                    completion: response.data.usageMetadata.candidatesTokenCount,
                    total: response.data.usageMetadata.totalTokenCount,
                },
            };
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`Gemini API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=GeminiProvider.js.map