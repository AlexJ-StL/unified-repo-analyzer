import type { BatchAnalysisResult, RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import type React from 'react';

interface PrintableReportProps {
  analysis?: RepositoryAnalysis;
  batchAnalysis?: BatchAnalysisResult;
  className?: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({
  analysis,
  batchAnalysis,
  className = '',
}) => {
  if (!analysis && !batchAnalysis) {
    return <div>No data available for printing</div>;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  if (analysis) {
    return (
      <div className={`print-report ${className}`}>
        <style>{`
          @media print {
            .print-report {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.4;
              color: #000;
              background: #fff;
            }
            .print-header {
              border-bottom: 2pt solid #000;
              margin-bottom: 20pt;
              padding-bottom: 10pt;
            }
            .print-section {
              margin-bottom: 20pt;
              page-break-inside: avoid;
            }
            .print-section h2 {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 10pt;
              border-bottom: 1pt solid #000;
              padding-bottom: 5pt;
            }
            .print-section h3 {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 8pt;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10pt;
            }
            .print-table th,
            .print-table td {
              border: 1pt solid #000;
              padding: 5pt;
              text-align: left;
            }
            .print-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .print-code {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              background-color: #f5f5f5;
              padding: 10pt;
              border: 1pt solid #ccc;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .print-list {
              margin-left: 20pt;
            }
            .print-grid {
              display: table;
              width: 100%;
            }
            .print-grid-item {
              display: table-cell;
              width: 50%;
              padding-right: 10pt;
              vertical-align: top;
            }
          }
        `}</style>

        <div className="print-header">
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0 }}>
            {analysis.name} - Repository Analysis Report
          </h1>
          <p style={{ margin: '5pt 0 0 0', fontSize: '10pt', color: '#666' }}>
            Generated on {formatDate(new Date())}
          </p>
        </div>

        <div className="print-section">
          <h2>Executive Summary</h2>
          <div style={{ whiteSpace: 'pre-wrap' }}>{analysis.insights.executiveSummary}</div>
        </div>

        <div className="print-section">
          <h2>Repository Overview</h2>
          <div className="print-grid">
            <div className="print-grid-item">
              <table className="print-table">
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
                <tr>
                  <td>Name</td>
                  <td>{analysis.name}</td>
                </tr>
                <tr>
                  <td>Path</td>
                  <td>{analysis.path}</td>
                </tr>
                <tr>
                  <td>Primary Language</td>
                  <td>{analysis.language}</td>
                </tr>
                <tr>
                  <td>Languages</td>
                  <td>{analysis.languages.join(', ')}</td>
                </tr>
                <tr>
                  <td>Frameworks</td>
                  <td>{analysis.frameworks.join(', ') || 'None detected'}</td>
                </tr>
              </table>
            </div>
            <div className="print-grid-item">
              <table className="print-table">
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
                <tr>
                  <td>Files</td>
                  <td>{analysis.fileCount}</td>
                </tr>
                <tr>
                  <td>Directories</td>
                  <td>{analysis.directoryCount}</td>
                </tr>
                <tr>
                  <td>Total Size</td>
                  <td>{formatSize(analysis.totalSize)}</td>
                </tr>
                <tr>
                  <td>Functions</td>
                  <td>{analysis.codeAnalysis.functionCount}</td>
                </tr>
                <tr>
                  <td>Classes</td>
                  <td>{analysis.codeAnalysis.classCount}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div className="print-section">
          <h2>Technical Breakdown</h2>
          <div style={{ whiteSpace: 'pre-wrap' }}>{analysis.insights.technicalBreakdown}</div>
        </div>

        <div className="print-section">
          <h2>Code Quality Metrics</h2>
          <table className="print-table">
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Cyclomatic Complexity</td>
              <td>{analysis.codeAnalysis.complexity.cyclomaticComplexity}</td>
            </tr>
            <tr>
              <td>Maintainability Index</td>
              <td>{analysis.codeAnalysis.complexity.maintainabilityIndex}</td>
            </tr>
            <tr>
              <td>Technical Debt</td>
              <td>{analysis.codeAnalysis.complexity.technicalDebt}</td>
            </tr>
            <tr>
              <td>Code Quality</td>
              <td style={{ textTransform: 'capitalize' }}>
                {analysis.codeAnalysis.complexity.codeQuality}
              </td>
            </tr>
          </table>
        </div>

        <div className="print-section">
          <h2>Architectural Patterns</h2>
          <ul className="print-list">
            {analysis.codeAnalysis.patterns.map((pattern, index) => (
              <li key={index}>
                <strong>{pattern.name}</strong> ({pattern.confidence}% confidence):{' '}
                {pattern.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="print-section">
          <h2>Key Files</h2>
          <table className="print-table">
            <tr>
              <th>File Path</th>
              <th>Language</th>
              <th>Lines</th>
              <th>Tokens</th>
            </tr>
            {analysis.structure.keyFiles.slice(0, 15).map((file, index) => (
              <tr key={index}>
                <td>{file.path}</td>
                <td>{file.language}</td>
                <td>{file.lineCount}</td>
                <td>{file.tokenCount || 'N/A'}</td>
              </tr>
            ))}
          </table>
        </div>

        <div className="print-section">
          <h2>Dependencies</h2>
          <div className="print-grid">
            <div className="print-grid-item">
              <h3>Production Dependencies</h3>
              {analysis.dependencies.production.length > 0 ? (
                <ul className="print-list">
                  {analysis.dependencies.production.map((dep: any, index) => (
                    <li key={index}>
                      {dep.name}@{dep.version}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>None detected</p>
              )}
            </div>
            <div className="print-grid-item">
              <h3>Development Dependencies</h3>
              {analysis.dependencies.development.length > 0 ? (
                <ul className="print-list">
                  {analysis.dependencies.development.map((dep: any, index) => (
                    <li key={index}>
                      {dep.name}@{dep.version}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>None detected</p>
              )}
            </div>
          </div>
        </div>

        <div className="print-section">
          <h2>Recommendations</h2>
          <ul className="print-list">
            {analysis.insights.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="print-section">
          <h2>Potential Issues</h2>
          <ul className="print-list">
            {analysis.insights.potentialIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>

        <div className="print-section">
          <h2>Directory Structure</h2>
          <div className="print-code">{analysis.structure.tree}</div>
        </div>

        <div className="print-section">
          <h2>Analysis Metadata</h2>
          <table className="print-table">
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Analysis Mode</td>
              <td style={{ textTransform: 'capitalize' }}>{analysis.metadata.analysisMode}</td>
            </tr>
            <tr>
              <td>LLM Provider</td>
              <td>{analysis.metadata.llmProvider || 'None'}</td>
            </tr>
            <tr>
              <td>Processing Time</td>
              <td>{analysis.metadata.processingTime} ms</td>
            </tr>
            <tr>
              <td>Token Usage</td>
              <td>
                {analysis.metadata.tokenUsage
                  ? `${analysis.metadata.tokenUsage.total} tokens (${analysis.metadata.tokenUsage.prompt} prompt, ${analysis.metadata.tokenUsage.completion} completion)`
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td>Created</td>
              <td>{formatDate(analysis.createdAt)}</td>
            </tr>
            <tr>
              <td>Updated</td>
              <td>{formatDate(analysis.updatedAt)}</td>
            </tr>
          </table>
        </div>
      </div>
    );
  }

  // Batch analysis report
  if (batchAnalysis) {
    return (
      <div className={`print-report ${className}`}>
        <div className="print-header">
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0 }}>
            Batch Repository Analysis Report
          </h1>
          <p style={{ margin: '5pt 0 0 0', fontSize: '10pt', color: '#666' }}>
            Generated on {formatDate(new Date())} | {batchAnalysis.repositories.length} repositories
            analyzed
          </p>
        </div>

        <div className="print-section">
          <h2>Batch Overview</h2>
          <table className="print-table">
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Batch ID</td>
              <td>{batchAnalysis.id}</td>
            </tr>
            <tr>
              <td>Repositories Analyzed</td>
              <td>{batchAnalysis.repositories.length}</td>
            </tr>
            <tr>
              <td>Processing Time</td>
              <td>{batchAnalysis.processingTime} ms</td>
            </tr>
            <tr>
              <td>Created</td>
              <td>{formatDate(batchAnalysis.createdAt)}</td>
            </tr>
          </table>
        </div>

        {batchAnalysis.repositories.map((repo, index) => (
          <div key={repo.id} className="print-section">
            <h2>
              {index + 1}. {repo.name}
            </h2>
            <div className="print-grid">
              <div className="print-grid-item">
                <table className="print-table">
                  <tr>
                    <th>Property</th>
                    <th>Value</th>
                  </tr>
                  <tr>
                    <td>Path</td>
                    <td>{repo.path}</td>
                  </tr>
                  <tr>
                    <td>Primary Language</td>
                    <td>{repo.language}</td>
                  </tr>
                  <tr>
                    <td>Languages</td>
                    <td>{repo.languages.join(', ')}</td>
                  </tr>
                  <tr>
                    <td>Files</td>
                    <td>{repo.fileCount}</td>
                  </tr>
                  <tr>
                    <td>Size</td>
                    <td>{formatSize(repo.totalSize)}</td>
                  </tr>
                </table>
              </div>
              <div className="print-grid-item">
                <h3>Executive Summary</h3>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '10pt' }}>
                  {repo.insights.executiveSummary}
                </div>
              </div>
            </div>
          </div>
        ))}

        {batchAnalysis.combinedInsights && (
          <div className="print-section">
            <h2>Combined Insights</h2>

            <h3>Commonalities</h3>
            <ul className="print-list">
              {batchAnalysis.combinedInsights.commonalities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>Differences</h3>
            <ul className="print-list">
              {batchAnalysis.combinedInsights.differences.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>Integration Opportunities</h3>
            <ul className="print-list">
              {batchAnalysis.combinedInsights.integrationOpportunities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PrintableReport;
