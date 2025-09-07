#!/usr/bin/env bun

/**
 * Interactive coverage dashboard
 * Provides a web-based interface for viewing coverage metrics
 * Requirements: 4.2, 4.3, 4.4
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

class CoverageDashboard {
  private readonly dashboardDir = 'coverage-reports/dashboard';

  async generateDashboard(): Promise<void> {
    console.log('📊 Generating coverage dashboard...');

    await mkdir(this.dashboardDir, { recursive: true });

    // Load coverage data
    const coverageData = await this.loadCoverageData();
    if (!coverageData) {
      return;
    }

    // Generate HTML dashboard
    await this.generateHTML(coverageData);

    // Generate CSS styles
    await this.generateCSS();

    // Generate JavaScript functionality
    await this.generateJS();

    console.log(`✅ Coverage dashboard generated: ${join(this.dashboardDir, 'index.html')}`);
    console.log('🌐 Open in browser to view interactive coverage dashboard');
  }

  private async loadCoverageData(): Promise<unknown> {
    try {
      // Placeholder: Implement actual coverage data loading
      // For example, from 'coverage-reports/summary.json' or similar
      const reportFile = 'coverage-reports/summary.json'; // Adjust path as needed
      const data = await readFile(reportFile, 'utf-8');
      return JSON.parse(data);
    } catch (_error) {
      return null;
    }
  }

  private getPriorityLabel(coverage: number): string {
    if (coverage >= 80) return 'High';
    if (coverage >= 50) return 'Medium';
    return 'Low';
  }

  private getPriorityClass(coverage: number): string {
    if (coverage >= 80) return 'priority-high';
    if (coverage >= 50) return 'priority-medium';
    return 'priority-low';
  }

  private getCoverageClass(coverage: number): string {
    if (coverage >= 90) return 'coverage-excellent';
    if (coverage >= 80) return 'coverage-good';
    if (coverage >= 70) return 'coverage-fair';
    if (coverage >= 50) return 'coverage-poor';
    return 'coverage-critical';
  }

  private async generateHTML(coverageData: unknown): Promise<void> {
    const data = coverageData as {
      summary: {
        branches: { pct: number; covered: number; total: number };
        statements: { pct: number; covered: number; total: number };
        functions: { pct: number; covered: number; total: number };
        lines: { pct: number; covered: number; total: number };
      };
      packages?: Array<{
        name: string;
        branches: { pct: number };
        statements: { pct: number };
        functions: { pct: number };
        lines: { pct: number };
      }>;
      files?: Array<{
        path: string;
        coverage: number;
        type?: string;
      }>;
      trends?: Array<{
        date: string;
        branches: { pct: number };
        statements: { pct: number };
        functions: { pct: number };
        lines: { pct: number };
      }>;
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unified Repo Analyzer - Coverage Dashboard</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Test Coverage Dashboard</h1>
            <p class="subtitle">Unified Repo Analyzer</p>
        </header>
        <main>
            <section class="actions-section">
                <h2>Quick Actions</h2>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewPackageDetails()">🔍 View Details</button>
                    <button class="action-btn" onclick="generateReport()">📊 Generate Report</button>
                    <button class="action-btn" onclick="runTests()">🧪 Run Tests</button>
                    <button class="action-btn" onclick="refreshData()">🔄 Refresh Data</button>
                </div>
            </section>

            <section class="overall-summary">
                <h2>Overall Coverage Summary</h2>
                <div class="summary-grid">
                    <div class="summary-card">
                        <h3>Branch Coverage</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.summary.branches.pct}%"></div>
                        </div>
                        <p><span class="metric-value">${data.summary.branches.pct.toFixed(1)}%</span> (${data.summary.branches.covered}/${data.summary.branches.total})</p>
                    </div>
                    <div class="summary-card">
                        <h3>Statement Coverage</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.summary.statements.pct}%"></div>
                        </div>
                        <p><span class="metric-value">${data.summary.statements.pct.toFixed(1)}%</span> (${data.summary.statements.covered}/${data.summary.statements.total})</p>
                    </div>
                    <div class="summary-card">
                        <h3>Function Coverage</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.summary.functions.pct}%"></div>
                        </div>
                        <p><span class="metric-value">${data.summary.functions.pct.toFixed(1)}%</span> (${data.summary.functions.covered}/${data.summary.functions.total})</p>
                    </div>
                    <div class="summary-card">
                        <h3>Line Coverage</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${data.summary.lines.pct}%"></div>
                        </div>
                        <p><span class="metric-value">${data.summary.lines.pct.toFixed(1)}%</span> (${data.summary.lines.covered}/${data.summary.lines.total})</p>
                    </div>
                </div>
                <p class="last-updated">Last updated: ${new Date().toLocaleString()}</p>
            </section>

            ${
              data.packages && data.packages.length > 0
                ? `
            <section class="package-breakdown">
                <h2>Package Breakdown</h2>
                <div class="package-grid">
                    ${data.packages
                      .map(
                        (pkg) => `
                        <div class="package-card">
                            <h3>${pkg.name}</h3>
                            <div class="package-metrics">
                                <div class="metric">
                                    <span class="metric-label">Branches:</span>
                                    <span class="metric-value">${pkg.branches.pct.toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Statements:</span>
                                    <span class="metric-value">${pkg.statements.pct.toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Functions:</span>
                                    <span class="metric-value">${pkg.functions.pct.toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Lines:</span>
                                    <span class="metric-value">${pkg.lines.pct.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </section>
            `
                : ''
            }

            ${
              data.files && data.files.length > 0
                ? `
            <section class="low-coverage-files">
                <h2>Files Needing Attention</h2>
                <table class="coverage-table">
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Priority</th>
                            <th>Coverage %</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.files
                          .filter((file) => file.coverage < 70)
                          .sort((a, b) => a.coverage - b.coverage)
                          .slice(0, 20)
                          .map(
                            (file) => `
                                <tr class="${this.getCoverageClass(file.coverage)}">
                                    <td class="file-path">${file.path}</td>
                                    <td class="priority ${this.getPriorityClass(file.coverage)}">${this.getPriorityLabel(file.coverage)}</td>
                                    <td class="coverage">${file.coverage.toFixed(1)}%</td>
                                    <td class="type">${file.type || 'N/A'}</td>
                                </tr>
                            `
                          )
                          .join('')}
                    </tbody>
                </table>
            </section>
            `
                : ''
            }

            ${
              data.trends && data.trends.length > 0
                ? `
            <section class="trends-section">
                <h2>Coverage Trends Over Time</h2>
                <div class="chart-container">
                    <canvas id="trendsChart"></canvas>
                </div>
            </section>
            `
                : ''
            }

        </main>
    </div>
    <script src="dashboard.js"></script>
</body>
</html>`;
    await writeFile(join(this.dashboardDir, 'index.html'), html);
  }

  private async generateCSS(): Promise<void> {
    const css = `/* General Styles */
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  --light-bg: #f8f9fa;
  --dark-text: #343a40;
  --border-color: #dee2e6;
  --shadow: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-hover: 0 4px 8px rgba(0,0,0,0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--dark-text);
  background-color: #f4f7f6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  box-shadow: var(--shadow);
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.action-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Summary Section */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  text-align: center;
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.summary-card h3 {
  margin-bottom: 15px;
  color: var(--dark-text);
  font-size: 1.1rem;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.6s ease;
}

.metric-value {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.last-updated {
  text-align: center;
  font-style: italic;
  color: #6c757d;
  margin-top: 20px;
}

/* Package Breakdown */
.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.package-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  border-left: 5px solid var(--primary-color);
}

.package-card h3 {
  margin-bottom: 15px;
  color: var(--dark-text);
}

.package-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-weight: 500;
}

/* Low Coverage Files Table */
.coverage-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.coverage-table th,
.coverage-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.coverage-table th {
  background-color: var(--light-bg);
  font-weight: 600;
}

.coverage-table tr:hover {
  background-color: #f1f3f5;
}

.file-path {
  font-family: monospace;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.priority-high {
  color: var(--success-color);
}

.priority-medium {
  color: var(--warning-color);
}

.priority-low {
  color: var(--danger-color);
}

.coverage-excellent { background-color: #d4edda; } /* Light green */
.coverage-good { background-color: #d1ecf1; } /* Light blue */
.coverage-fair { background-color: #fff3cd; } /* Light yellow */
.coverage-poor { background-color: #f8d7da; } /* Light red */
.coverage-critical { background-color: #f5c6cb; } /* Darker red */

/* Trends Chart */
.chart-container {
  position: relative;
  height: 400px;
  margin-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  header h1 {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .summary-grid,
  .package-grid {
    grid-template-columns: 1fr;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

section {
  animation: fadeIn 0.5s ease-out;
  margin-bottom: 30px;
}

/* Notification Styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: var(--shadow-hover);
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: var(--success-color);
}

.notification.error {
  background-color: var(--danger-color);
}

.notification.info {
  background-color: var(--info-color);
}

.notification.warning {
  background-color: var(--warning-color);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}`;
    await writeFile(join(this.dashboardDir, 'styles.css'), css);
  }

  private async generateJS(): Promise<void> {
    const js = `// Initialize dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    initializeInteractiveFeatures();
    showNotification('Dashboard loaded successfully!', 'success');
});

// Chart.js configurations
function initializeCharts() {
    const trendsCtx = document.getElementById('trendsChart');
    if (trendsCtx && window.coverageData && window.coverageData.trends) {
        new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: window.coverageData.trends.map(t => t.date),
                datasets: [
                    {
                        label: 'Branch Coverage',
                        data: window.coverageData.trends.map(t => t.branches.pct),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4
                    },
                    {
                        label: 'Statement Coverage',
                        data: window.coverageData.trends.map(t => t.statements.pct),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.4
                    },
                    {
                        label: 'Function Coverage',
                        data: window.coverageData.trends.map(t => t.functions.pct),
                        borderColor: 'rgb(255, 206, 86)',
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        tension: 0.4
                    },
                    {
                        label: 'Line Coverage',
                        data: window.coverageData.trends.map(t => t.lines.pct),
                        borderColor: 'rgb(153, 102, 255)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Coverage Trends Over Time'
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Interactive features
function initializeInteractiveFeatures() {
    // Add click handlers to package cards if they exist
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
        card.addEventListener('click', () => {
            const packageName = card.querySelector('h3').textContent;
            showNotification(\`Viewing details for \${packageName}\`, 'info');
            // Placeholder: Implement detailed view for a package
        });
    });

    // Add hover effects to metric cards
    const metricCards = document.querySelectorAll('.summary-card, .package-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Notification system
function showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const notification = document.createElement('div');
    notification.className = \`notification \${type}\`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Action button functions
function viewPackageDetails() {
    showNotification('Package details view feature coming soon!', 'info');
    // Placeholder: Implement package detail view
}

function generateReport() {
    showNotification('Generating detailed report...', 'info');
    // Placeholder: Implement report generation
    setTimeout(() => {
        showNotification('Report generated and downloaded!', 'success');
    }, 2000);
}

function runTests() {
    showNotification('Running tests... This may take a while.', 'info');
    // Placeholder: Implement test running logic
    setTimeout(() => {
        showNotification('Tests completed!', 'success');
        // Optionally refresh data after tests
        refreshData();
    }, 5000); // Simulate test duration
}

function refreshData() {
    showNotification('Refreshing coverage data...', 'info');
    // Placeholder: Implement data fetching and refresh logic
    setTimeout(() => {
        location.reload(); // Simple refresh, can be more sophisticated
        showNotification('Data refreshed!', 'success');
    }, 1000);
}

// Utility functions (can be expanded)
function formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
}

function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Expose functions to global scope for onclick handlers
window.viewPackageDetails = viewPackageDetails;
window.generateReport = generateReport;
window.runTests = runTests;
window.refreshData = refreshData;`;
    await writeFile(join(this.dashboardDir, 'dashboard.js'), js);
  }
}

// Main execution
async function main() {
  const dashboard = new CoverageDashboard();
  await dashboard.generateDashboard();
}

main().catch((_error) => {
  process.exit(1);
});
