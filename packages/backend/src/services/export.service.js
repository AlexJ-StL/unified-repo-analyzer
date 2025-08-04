/**
 * Export service for generating repository analysis exports in various formats
 */
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
/**
 * Service for exporting repository analysis in various formats
 */
export class ExportService {
    /**
     * Export repository analysis to the specified format
     *
     * @param analysis - Repository analysis to export
     * @param format - Output format
     * @returns Promise resolving to the exported content
     */
    async exportAnalysis(analysis, format) {
        switch (format) {
            case 'json':
                return this.exportToJson(analysis);
            case 'markdown':
                return this.exportToMarkdown(analysis);
            case 'html':
                return this.exportToHtml(analysis);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Export batch analysis result to the specified format
     *
     * @param batchResult - Batch analysis result to export
     * @param format - Output format
     * @returns Promise resolving to the exported content
     */
    async exportBatchAnalysis(batchResult, format) {
        switch (format) {
            case 'json':
                return this.exportBatchToJson(batchResult);
            case 'markdown':
                return this.exportBatchToMarkdown(batchResult);
            case 'html':
                return this.exportBatchToHtml(batchResult);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Save exported content to a file
     *
     * @param content - Content to save
     * @param outputPath - Path to save the content to
     * @returns Promise resolving to the file path
     */
    async saveToFile(content, outputPath) {
        // Create directory if it doesn't exist
        const directory = path.dirname(outputPath);
        await mkdir(directory, { recursive: true });
        // Write content to file
        await writeFile(outputPath, content, 'utf8');
        return outputPath;
    }
    /**
     * Export repository analysis to JSON format
     *
     * @param analysis - Repository analysis to export
     * @returns JSON string
     */
    exportToJson(analysis) {
        return JSON.stringify(analysis, null, 2);
    }
    /**
     * Export repository analysis to Markdown format
     *
     * @param analysis - Repository analysis to export
     * @returns Markdown string
     */
    exportToMarkdown(analysis) {
        return `# ${analysis.name} Repository Analysis

## Overview

- **Repository:** ${analysis.name}
- **Path:** ${analysis.path}
- **Description:** ${analysis.description || 'N/A'}
- **Primary Language:** ${analysis.language}
- **Languages:** ${analysis.languages.join(', ')}
- **Frameworks:** ${analysis.frameworks.join(', ') || 'None detected'}
- **Files:** ${analysis.fileCount}
- **Directories:** ${analysis.directoryCount}
- **Total Size:** ${(analysis.totalSize / 1024).toFixed(2)} KB
- **Created:** ${analysis.createdAt.toISOString()}
- **Updated:** ${analysis.updatedAt.toISOString()}

## Executive Summary

${analysis.insights.executiveSummary}

## Technical Breakdown

${analysis.insights.technicalBreakdown}

## Code Structure

- **Functions:** ${analysis.codeAnalysis.functionCount}
- **Classes:** ${analysis.codeAnalysis.classCount}
- **Imports:** ${analysis.codeAnalysis.importCount}
- **Complexity:** ${analysis.codeAnalysis.complexity.cyclomaticComplexity}
- **Maintainability Index:** ${analysis.codeAnalysis.complexity.maintainabilityIndex}
- **Technical Debt:** ${analysis.codeAnalysis.complexity.technicalDebt}
- **Code Quality:** ${analysis.codeAnalysis.complexity.codeQuality}

## Architectural Patterns

${analysis.codeAnalysis.patterns.map((pattern) => `- **${pattern.name}** (${pattern.confidence}% confidence): ${pattern.description}`).join('\n')}

## Key Files

${analysis.structure.keyFiles
            .slice(0, 10)
            .map((file) => `- **${file.path}** (${file.language}, ${file.lineCount} lines)`)
            .join('\n')}

## Directory Structure

\`\`\`
${analysis.structure.tree}
\`\`\`

## Dependencies

### Production Dependencies
${analysis.dependencies.production.length > 0
            ? analysis.dependencies.production.map((dep) => `- ${dep.name}@${dep.version}`).join('\n')
            : 'None detected'}

### Development Dependencies
${analysis.dependencies.development.length > 0
            ? analysis.dependencies.development.map((dep) => `- ${dep.name}@${dep.version}`).join('\n')
            : 'None detected'}

## Recommendations

${analysis.insights.recommendations.map((rec) => `- ${rec}`).join('\n')}

## Potential Issues

${analysis.insights.potentialIssues.map((issue) => `- ${issue}`).join('\n')}

## Analysis Metadata

- **Analysis Mode:** ${analysis.metadata.analysisMode}
- **LLM Provider:** ${analysis.metadata.llmProvider || 'None'}
- **Processing Time:** ${analysis.metadata.processingTime} ms
- **Token Usage:** ${analysis.metadata.tokenUsage ? `${analysis.metadata.tokenUsage.total} tokens (${analysis.metadata.tokenUsage.prompt} prompt, ${analysis.metadata.tokenUsage.completion} completion)` : 'N/A'}
`;
    }
    /**
     * Export repository analysis to HTML format
     *
     * @param analysis - Repository analysis to export
     * @returns HTML string
     */
    exportToHtml(analysis) {
        // Convert Markdown to HTML with styling
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${analysis.name} Repository Analysis</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    h1 {
      border-bottom: 2px solid #eaecef;
      padding-bottom: 10px;
    }
    h2 {
      margin-top: 30px;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 5px;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 5px;
      padding: 16px;
      overflow: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background-color: #f6f8fa;
      padding: 2px 4px;
      border-radius: 3px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f6f8fa;
    }
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .overview-card {
      background-color: #f6f8fa;
      border-radius: 5px;
      padding: 15px;
    }
    .overview-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #dfe2e5;
      padding-bottom: 5px;
    }
    .nav {
      position: sticky;
      top: 0;
      background-color: #fff;
      padding: 10px 0;
      border-bottom: 1px solid #eaecef;
      margin-bottom: 20px;
    }
    .nav ul {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .nav a {
      text-decoration: none;
      color: #0366d6;
    }
    .nav a:hover {
      text-decoration: underline;
    }
    .quality-excellent { color: #2ecc71; }
    .quality-good { color: #3498db; }
    .quality-fair { color: #f39c12; }
    .quality-poor { color: #e74c3c; }
  </style>
</head>
<body>
  <div class="nav">
    <ul>
      <li><a href="#overview">Overview</a></li>
      <li><a href="#executive-summary">Executive Summary</a></li>
      <li><a href="#technical-breakdown">Technical Breakdown</a></li>
      <li><a href="#code-structure">Code Structure</a></li>
      <li><a href="#architectural-patterns">Architectural Patterns</a></li>
      <li><a href="#key-files">Key Files</a></li>
      <li><a href="#directory-structure">Directory Structure</a></li>
      <li><a href="#dependencies">Dependencies</a></li>
      <li><a href="#recommendations">Recommendations</a></li>
      <li><a href="#potential-issues">Potential Issues</a></li>
      <li><a href="#metadata">Metadata</a></li>
    </ul>
  </div>

  <h1>${analysis.name} Repository Analysis</h1>
  
  <h2 id="overview">Overview</h2>
  <div class="overview-grid">
    <div class="overview-card">
      <h3>Repository Info</h3>
      <p><strong>Name:</strong> ${analysis.name}</p>
      <p><strong>Path:</strong> ${analysis.path}</p>
      <p><strong>Description:</strong> ${analysis.description || 'N/A'}</p>
      <p><strong>Created:</strong> ${new Date(analysis.createdAt).toLocaleString()}</p>
      <p><strong>Updated:</strong> ${new Date(analysis.updatedAt).toLocaleString()}</p>
    </div>
    
    <div class="overview-card">
      <h3>Languages & Frameworks</h3>
      <p><strong>Primary Language:</strong> ${analysis.language}</p>
      <p><strong>Languages:</strong> ${analysis.languages.join(', ')}</p>
      <p><strong>Frameworks:</strong> ${analysis.frameworks.join(', ') || 'None detected'}</p>
    </div>
    
    <div class="overview-card">
      <h3>Size & Structure</h3>
      <p><strong>Files:</strong> ${analysis.fileCount}</p>
      <p><strong>Directories:</strong> ${analysis.directoryCount}</p>
      <p><strong>Total Size:</strong> ${(analysis.totalSize / 1024).toFixed(2)} KB</p>
    </div>
    
    <div class="overview-card">
      <h3>Code Metrics</h3>
      <p><strong>Functions:</strong> ${analysis.codeAnalysis.functionCount}</p>
      <p><strong>Classes:</strong> ${analysis.codeAnalysis.classCount}</p>
      <p><strong>Imports:</strong> ${analysis.codeAnalysis.importCount}</p>
      <p><strong>Code Quality:</strong> <span class="quality-${analysis.codeAnalysis.complexity.codeQuality}">${analysis.codeAnalysis.complexity.codeQuality}</span></p>
    </div>
  </div>
  
  <h2 id="executive-summary">Executive Summary</h2>
  <div>${analysis.insights.executiveSummary.replace(/\n/g, '<br>')}</div>
  
  <h2 id="technical-breakdown">Technical Breakdown</h2>
  <div>${analysis.insights.technicalBreakdown.replace(/\n/g, '<br>')}</div>
  
  <h2 id="code-structure">Code Structure</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Functions</td>
      <td>${analysis.codeAnalysis.functionCount}</td>
    </tr>
    <tr>
      <td>Classes</td>
      <td>${analysis.codeAnalysis.classCount}</td>
    </tr>
    <tr>
      <td>Imports</td>
      <td>${analysis.codeAnalysis.importCount}</td>
    </tr>
    <tr>
      <td>Cyclomatic Complexity</td>
      <td>${analysis.codeAnalysis.complexity.cyclomaticComplexity}</td>
    </tr>
    <tr>
      <td>Maintainability Index</td>
      <td>${analysis.codeAnalysis.complexity.maintainabilityIndex}</td>
    </tr>
    <tr>
      <td>Technical Debt</td>
      <td>${analysis.codeAnalysis.complexity.technicalDebt}</td>
    </tr>
    <tr>
      <td>Code Quality</td>
      <td class="quality-${analysis.codeAnalysis.complexity.codeQuality}">${analysis.codeAnalysis.complexity.codeQuality}</td>
    </tr>
  </table>
  
  <h2 id="architectural-patterns">Architectural Patterns</h2>
  <ul>
    ${analysis.codeAnalysis.patterns
            .map((pattern) => `<li><strong>${pattern.name}</strong> (${pattern.confidence}% confidence): ${pattern.description}</li>`)
            .join('\n')}
  </ul>
  
  <h2 id="key-files">Key Files</h2>
  <table>
    <tr>
      <th>File</th>
      <th>Language</th>
      <th>Lines</th>
      <th>Tokens</th>
    </tr>
    ${analysis.structure.keyFiles
            .slice(0, 10)
            .map((file) => `
      <tr>
        <td>${file.path}</td>
        <td>${file.language}</td>
        <td>${file.lineCount}</td>
        <td>${file.tokenCount || 'N/A'}</td>
      </tr>
    `)
            .join('')}
  </table>
  
  <h2 id="directory-structure">Directory Structure</h2>
  <pre><code>${analysis.structure.tree}</code></pre>
  
  <h2 id="dependencies">Dependencies</h2>
  
  <h3>Production Dependencies</h3>
  ${analysis.dependencies.production.length > 0
            ? `<ul>${analysis.dependencies.production.map((dep) => `<li>${dep.name}@${dep.version}</li>`).join('')}</ul>`
            : '<p>None detected</p>'}
  
  <h3>Development Dependencies</h3>
  ${analysis.dependencies.development.length > 0
            ? `<ul>${analysis.dependencies.development.map((dep) => `<li>${dep.name}@${dep.version}</li>`).join('')}</ul>`
            : '<p>None detected</p>'}
  
  <h2 id="recommendations">Recommendations</h2>
  <ul>
    ${analysis.insights.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
  </ul>
  
  <h2 id="potential-issues">Potential Issues</h2>
  <ul>
    ${analysis.insights.potentialIssues.map((issue) => `<li>${issue}</li>`).join('')}
  </ul>
  
  <h2 id="metadata">Analysis Metadata</h2>
  <table>
    <tr>
      <th>Property</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Analysis Mode</td>
      <td>${analysis.metadata.analysisMode}</td>
    </tr>
    <tr>
      <td>LLM Provider</td>
      <td>${analysis.metadata.llmProvider || 'None'}</td>
    </tr>
    <tr>
      <td>Processing Time</td>
      <td>${analysis.metadata.processingTime} ms</td>
    </tr>
    <tr>
      <td>Token Usage</td>
      <td>${analysis.metadata.tokenUsage
            ? `${analysis.metadata.tokenUsage.total} tokens (${analysis.metadata.tokenUsage.prompt} prompt, ${analysis.metadata.tokenUsage.completion} completion)`
            : 'N/A'}</td>
    </tr>
  </table>
  
  <footer style="margin-top: 50px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eaecef; padding-top: 20px;">
    Generated by Unified Repository Analyzer on ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;
    }
    /**
     * Export batch analysis result to JSON format
     *
     * @param batchResult - Batch analysis result to export
     * @returns JSON string
     */
    exportBatchToJson(batchResult) {
        return JSON.stringify(batchResult, null, 2);
    }
    /**
     * Export batch analysis result to Markdown format
     *
     * @param batchResult - Batch analysis result to export
     * @returns Markdown string
     */
    exportBatchToMarkdown(batchResult) {
        const repositories = batchResult.repositories;
        let markdown = `# Batch Repository Analysis

## Overview

- **Batch ID:** ${batchResult.id}
- **Created:** ${batchResult.createdAt.toISOString()}
- **Processing Time:** ${batchResult.processingTime} ms
- **Repositories Analyzed:** ${repositories.length}

## Repositories

`;
        // Add summary for each repository
        repositories.forEach((repo, index) => {
            markdown += `### ${index + 1}. ${repo.name}

- **Path:** ${repo.path}
- **Primary Language:** ${repo.language}
- **Languages:** ${repo.languages.join(', ')}
- **Files:** ${repo.fileCount}
- **Size:** ${(repo.totalSize / 1024).toFixed(2)} KB

#### Executive Summary

${repo.insights.executiveSummary}

`;
        });
        // Add combined insights if available
        if (batchResult.combinedInsights) {
            markdown += `## Combined Insights

### Commonalities

${batchResult.combinedInsights.commonalities.map((item) => `- ${item}`).join('\n')}

### Differences

${batchResult.combinedInsights.differences.map((item) => `- ${item}`).join('\n')}

### Integration Opportunities

${batchResult.combinedInsights.integrationOpportunities.map((item) => `- ${item}`).join('\n')}

`;
        }
        return markdown;
    }
    /**
     * Export batch analysis result to HTML format
     *
     * @param batchResult - Batch analysis result to export
     * @returns HTML string
     */
    exportBatchToHtml(batchResult) {
        const repositories = batchResult.repositories;
        // Generate repository cards HTML
        const repoCardsHtml = repositories
            .map((repo, index) => `
      <div class="repo-card">
        <h3>${index + 1}. ${repo.name}</h3>
        <div class="repo-details">
          <p><strong>Path:</strong> ${repo.path}</p>
          <p><strong>Primary Language:</strong> ${repo.language}</p>
          <p><strong>Languages:</strong> ${repo.languages.join(', ')}</p>
          <p><strong>Files:</strong> ${repo.fileCount}</p>
          <p><strong>Size:</strong> ${(repo.totalSize / 1024).toFixed(2)} KB</p>
        </div>
        <div class="repo-summary">
          <h4>Executive Summary</h4>
          <p>${repo.insights.executiveSummary.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `)
            .join('');
        // Generate combined insights HTML if available
        let combinedInsightsHtml = '';
        if (batchResult.combinedInsights) {
            combinedInsightsHtml = `
        <h2 id="combined-insights">Combined Insights</h2>
        
        <h3>Commonalities</h3>
        <ul>
          ${batchResult.combinedInsights.commonalities.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        
        <h3>Differences</h3>
        <ul>
          ${batchResult.combinedInsights.differences.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        
        <h3>Integration Opportunities</h3>
        <ul>
          ${batchResult.combinedInsights.integrationOpportunities.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      `;
        }
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch Repository Analysis</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 {
      color: #2c3e50;
    }
    h1 {
      border-bottom: 2px solid #eaecef;
      padding-bottom: 10px;
    }
    h2 {
      margin-top: 30px;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 5px;
    }
    .overview-card {
      background-color: #f6f8fa;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .repo-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .repo-card {
      background-color: #f6f8fa;
      border-radius: 5px;
      padding: 15px;
      border: 1px solid #eaecef;
    }
    .repo-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #dfe2e5;
      padding-bottom: 5px;
    }
    .repo-details {
      margin-bottom: 15px;
    }
    .repo-summary h4 {
      margin-top: 0;
    }
    .nav {
      position: sticky;
      top: 0;
      background-color: #fff;
      padding: 10px 0;
      border-bottom: 1px solid #eaecef;
      margin-bottom: 20px;
    }
    .nav ul {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    .nav a {
      text-decoration: none;
      color: #0366d6;
    }
    .nav a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="nav">
    <ul>
      <li><a href="#overview">Overview</a></li>
      <li><a href="#repositories">Repositories</a></li>
      ${batchResult.combinedInsights ? '<li><a href="#combined-insights">Combined Insights</a></li>' : ''}
    </ul>
  </div>

  <h1>Batch Repository Analysis</h1>
  
  <h2 id="overview">Overview</h2>
  <div class="overview-card">
    <p><strong>Batch ID:</strong> ${batchResult.id}</p>
    <p><strong>Created:</strong> ${new Date(batchResult.createdAt).toLocaleString()}</p>
    <p><strong>Processing Time:</strong> ${batchResult.processingTime} ms</p>
    <p><strong>Repositories Analyzed:</strong> ${repositories.length}</p>
  </div>
  
  <h2 id="repositories">Repositories</h2>
  <div class="repo-cards">
    ${repoCardsHtml}
  </div>
  
  ${combinedInsightsHtml}
  
  <footer style="margin-top: 50px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eaecef; padding-top: 20px;">
    Generated by Unified Repository Analyzer on ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;
    }
}
export default new ExportService();
//# sourceMappingURL=export.service.js.map