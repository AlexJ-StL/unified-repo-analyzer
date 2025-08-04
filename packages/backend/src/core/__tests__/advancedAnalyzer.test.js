/**
 * Tests for Advanced Analyzer
 */
import { AdvancedAnalyzer, } from '../advancedAnalyzer';
// Mock file system operations
jest.mock('../../utils/fileSystem', () => ({
    readFileWithErrorHandling: jest.fn(),
}));
jest.mock('fs', () => ({
    promises: {
        stat: jest.fn(),
    },
}));
const { readFileWithErrorHandling: mockReadFile } = await import('../../utils/fileSystem');
describe('AdvancedAnalyzer', () => {
    let analyzer;
    let mockAnalysis;
    beforeEach(() => {
        analyzer = new AdvancedAnalyzer();
        // Create mock repository analysis
        mockAnalysis = {
            id: 'test-repo',
            path: '/test/repo',
            name: 'test-repo',
            language: 'JavaScript',
            languages: ['JavaScript', 'TypeScript'],
            frameworks: ['React', 'Express'],
            fileCount: 50,
            directoryCount: 10,
            totalSize: 1024000,
            createdAt: new Date(),
            updatedAt: new Date(),
            structure: {
                directories: [
                    { path: 'src', files: 20, subdirectories: 3 },
                    { path: 'src/components', files: 10, subdirectories: 0 },
                    { path: 'src/services', files: 5, subdirectories: 0 },
                ],
                keyFiles: [
                    {
                        path: 'src/app.js',
                        language: 'JavaScript',
                        size: 2048,
                        lineCount: 100,
                        importance: 0.9,
                        functions: [],
                        classes: [],
                    },
                    {
                        path: 'src/config.js',
                        language: 'JavaScript',
                        size: 512,
                        lineCount: 25,
                        importance: 0.7,
                        functions: [],
                        classes: [],
                    },
                ],
                tree: 'mock-tree',
            },
            codeAnalysis: {
                functionCount: 25,
                classCount: 5,
                importCount: 15,
                complexity: {
                    cyclomaticComplexity: 10,
                    maintainabilityIndex: 70,
                    technicalDebt: 'Low',
                    codeQuality: 'good',
                },
                patterns: [],
            },
            dependencies: {
                production: [],
                development: [],
                frameworks: [],
            },
            insights: {
                executiveSummary: 'Test summary',
                technicalBreakdown: 'Test breakdown',
                recommendations: [],
                potentialIssues: [],
            },
            metadata: {
                analysisMode: 'comprehensive',
                processingTime: 5000,
            },
        };
        // Reset mocks
        jest.clearAllMocks();
    });
    describe('analyzeRepository', () => {
        it('should perform comprehensive advanced analysis', async () => {
            // Mock file content
            const mockJavaScriptContent = `
        const password = "hardcoded123";
        const apiKey = "sk-1234567890";
        
        function complexFunction() {
          if (condition1) {
            if (condition2) {
              while (loop) {
                for (let i = 0; i < 10; i++) {
                  if (condition3) {
                    // TODO: Fix this later
                    return result;
                  }
                }
              }
            }
          }
        }
        
        class TestClass {
          constructor() {
            this.data = data;
          }
          
          method1() { return 1; }
          method2() { return 2; }
        }
        
        document.innerHTML = userInput;
        eval(userCode);
      `;
            mockReadFile.mockResolvedValue(mockJavaScriptContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            // Verify structure of result
            expect(result).toHaveProperty('codeQuality');
            expect(result).toHaveProperty('security');
            expect(result).toHaveProperty('architecture');
            expect(result.codeQuality).toHaveProperty('overallScore');
            expect(result.codeQuality).toHaveProperty('fileMetrics');
            expect(result.codeQuality).toHaveProperty('technicalDebt');
            expect(result.security).toHaveProperty('vulnerabilities');
            expect(result.security).toHaveProperty('securityScore');
            expect(result.architecture).toHaveProperty('patterns');
            expect(result.architecture).toHaveProperty('recommendations');
            // Verify security vulnerabilities are detected
            expect(result.security.vulnerabilities.length).toBeGreaterThan(0);
            const vulnTypes = result.security.vulnerabilities.map((v) => v.type);
            expect(vulnTypes).toContain('Hardcoded Password');
            expect(vulnTypes).toContain('Hardcoded API Key');
            expect(vulnTypes).toContain('Potential XSS via innerHTML');
            expect(vulnTypes).toContain('Dangerous eval() usage');
            // Verify code quality metrics
            expect(result.codeQuality.fileMetrics.length).toBe(mockAnalysis.structure.keyFiles.length);
            expect(result.codeQuality.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.codeQuality.overallScore).toBeLessThanOrEqual(100);
            // Verify technical debt detection
            expect(result.codeQuality.technicalDebt.length).toBeGreaterThan(0);
            const debtTypes = result.codeQuality.technicalDebt.map((d) => d.type);
            expect(debtTypes).toContain('code_smell');
            // Verify architectural patterns
            expect(result.architecture.patterns.length).toBeGreaterThan(0);
            expect(result.architecture.maintainabilityScore).toBeGreaterThanOrEqual(0);
            expect(result.architecture.maintainabilityScore).toBeLessThanOrEqual(100);
        });
        it('should handle files with no content gracefully', async () => {
            mockReadFile.mockResolvedValue('');
            const result = await analyzer.analyzeRepository(mockAnalysis);
            expect(result.codeQuality.overallScore).toBe(0);
            expect(result.codeQuality.fileMetrics).toHaveLength(mockAnalysis.structure.keyFiles.length);
            expect(result.security.vulnerabilities).toHaveLength(0);
        });
        it('should handle file read errors gracefully', async () => {
            mockReadFile.mockRejectedValue(new Error('File not found'));
            const result = await analyzer.analyzeRepository(mockAnalysis);
            // Should not throw and should return valid structure
            expect(result).toHaveProperty('codeQuality');
            expect(result).toHaveProperty('security');
            expect(result).toHaveProperty('architecture');
        });
    });
    describe('Security Analysis', () => {
        it('should detect hardcoded secrets', async () => {
            const contentWithSecrets = `
        const password = "mypassword123";
        const apiKey = "sk-1234567890abcdef";
        const secret = "super-secret-key";
        const token = "bearer-token-123";
        const privateKey = "-----BEGIN PRIVATE KEY-----";
      `;
            mockReadFile.mockResolvedValue(contentWithSecrets);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const vulnerabilities = result.security.vulnerabilities;
            const vulnTypes = vulnerabilities.map((v) => v.type);
            expect(vulnTypes).toContain('Hardcoded Password');
            expect(vulnTypes).toContain('Hardcoded API Key');
            expect(vulnTypes).toContain('Hardcoded Secret');
            expect(vulnTypes).toContain('Hardcoded Token');
            expect(vulnTypes).toContain('Hardcoded Private Key');
            // Check severity levels
            const highSeverityVulns = vulnerabilities.filter((v) => v.severity === 'high');
            expect(highSeverityVulns.length).toBeGreaterThan(0);
        });
        it('should detect SQL injection vulnerabilities', async () => {
            const contentWithSQLInjection = `
        const query = "SELECT * FROM users WHERE id = " + userId;
        db.execute("SELECT * FROM products WHERE name = '" + productName + "'");
        const sql = "SELECT * FROM orders WHERE status = " + status + " AND user_id = " + userId;
      `;
            mockReadFile.mockResolvedValue(contentWithSQLInjection);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const sqlInjectionVulns = result.security.vulnerabilities.filter((v) => v.type === 'Potential SQL Injection');
            expect(sqlInjectionVulns.length).toBeGreaterThan(0);
            expect(sqlInjectionVulns[0].severity).toBe('critical');
        });
        it('should detect XSS vulnerabilities', async () => {
            const contentWithXSS = `
        document.getElementById('content').innerHTML = userInput;
        document.write(userData);
        eval(userCode);
      `;
            mockReadFile.mockResolvedValue(contentWithXSS);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const xssVulns = result.security.vulnerabilities.filter((v) => v.type.includes('XSS') || v.type.includes('eval'));
            expect(xssVulns.length).toBeGreaterThan(0);
        });
        it('should calculate security score correctly', async () => {
            // Test with no vulnerabilities
            mockReadFile.mockResolvedValue('const safeCode = "hello world";');
            let result = await analyzer.analyzeRepository(mockAnalysis);
            expect(result.security.securityScore).toBe(100);
            // Test with vulnerabilities
            const vulnerableContent = `
        const password = "hardcoded123";
        document.innerHTML = userInput;
      `;
            mockReadFile.mockResolvedValue(vulnerableContent);
            result = await analyzer.analyzeRepository(mockAnalysis);
            expect(result.security.securityScore).toBeLessThan(100);
            expect(result.security.securityScore).toBeGreaterThanOrEqual(0);
        });
    });
    describe('Code Quality Analysis', () => {
        it('should calculate cyclomatic complexity correctly', async () => {
            const complexContent = `
        function complexFunction() {
          if (condition1) {
            if (condition2) {
              while (loop) {
                for (let i = 0; i < 10; i++) {
                  if (condition3) {
                    switch (value) {
                      case 1:
                        return 1;
                      case 2:
                        return 2;
                    }
                  }
                }
              }
            }
          }
          return result && otherResult || fallback;
        }
      `;
            mockReadFile.mockResolvedValue(complexContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const fileMetrics = result.codeQuality.fileMetrics[0];
            expect(fileMetrics.cyclomaticComplexity).toBeGreaterThan(1);
            expect(fileMetrics.cyclomaticComplexity).toBeGreaterThan(10); // Should detect multiple decision points
        });
        it('should detect code smells', async () => {
            const smellContent = `
        // TODO: Fix this later
        // FIXME: This is broken
        const magicNumber = 12345;
        const anotherMagicNumber = 67890;
        
        function veryLongMethodNameThatDoesTooManyThings(param1, param2, param3, param4, param5, param6, param7, param8) {
          // This method is way too long and does too many things
          ${Array(100).fill('console.log("line");').join('\n')}
        }
        
        // const oldCode = "this is commented out";
        // const moreOldCode = "this too";
        // const evenMoreOldCode = "and this";
      `;
            mockReadFile.mockResolvedValue(smellContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const fileMetrics = result.codeQuality.fileMetrics[0];
            expect(fileMetrics.codeSmells.length).toBeGreaterThan(0);
            const smellTypes = fileMetrics.codeSmells.join(' ');
            expect(smellTypes).toContain('TODO/FIXME');
            expect(smellTypes).toContain('magic numbers');
            expect(smellTypes).toContain('Commented code');
        });
        it('should detect technical debt', async () => {
            const debtContent = `
        // TODO: Refactor this method
        function massiveMethod() {
          ${Array(150).fill('console.log("line");').join('\n')}
        }
        
        // FIXME: This is a critical bug
        function buggyFunction() {
          return undefined;
        }
        
        const duplicatedLine = "this line appears multiple times";
        const duplicatedLine = "this line appears multiple times";
        const duplicatedLine = "this line appears multiple times";
      `;
            mockReadFile.mockResolvedValue(debtContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            expect(result.codeQuality.technicalDebt.length).toBeGreaterThan(0);
            const debtTypes = result.codeQuality.technicalDebt.map((d) => d.type);
            expect(debtTypes).toContain('complexity');
            expect(debtTypes).toContain('code_smell');
            expect(debtTypes).toContain('duplication');
        });
        it('should calculate maintainability index', async () => {
            const maintainableContent = `
        function simpleFunction() {
          return "hello world";
        }
        
        class SimpleClass {
          constructor() {
            this.value = 1;
          }
          
          getValue() {
            return this.value;
          }
        }
      `;
            mockReadFile.mockResolvedValue(maintainableContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const fileMetrics = result.codeQuality.fileMetrics[0];
            expect(fileMetrics.maintainabilityIndex).toBeGreaterThanOrEqual(0);
            expect(fileMetrics.maintainabilityIndex).toBeLessThanOrEqual(100);
            expect(fileMetrics.maintainabilityIndex).toBeGreaterThan(50); // Simple code should have good maintainability
        });
    });
    describe('Architectural Pattern Detection', () => {
        it('should detect MVC pattern from directory structure', async () => {
            const mvcAnalysis = {
                ...mockAnalysis,
                structure: {
                    ...mockAnalysis.structure,
                    directories: [
                        { path: 'models', files: 5, subdirectories: 0 },
                        { path: 'views', files: 10, subdirectories: 0 },
                        { path: 'controllers', files: 8, subdirectories: 0 },
                    ],
                },
            };
            mockReadFile.mockResolvedValue('const simpleCode = "test";');
            const result = await analyzer.analyzeRepository(mvcAnalysis);
            const patternNames = result.architecture.patterns.map((p) => p.name);
            expect(patternNames).toContain('Model-View-Controller (MVC)');
        });
        it('should detect layered architecture', async () => {
            const layeredAnalysis = {
                ...mockAnalysis,
                structure: {
                    ...mockAnalysis.structure,
                    directories: [
                        { path: 'services', files: 5, subdirectories: 0 },
                        { path: 'repository', files: 3, subdirectories: 0 },
                        { path: 'controllers', files: 8, subdirectories: 0 },
                    ],
                },
            };
            mockReadFile.mockResolvedValue('const simpleCode = "test";');
            const result = await analyzer.analyzeRepository(layeredAnalysis);
            const patternNames = result.architecture.patterns.map((p) => p.name);
            expect(patternNames).toContain('Layered Architecture');
        });
        it('should detect component-based architecture', async () => {
            const componentAnalysis = {
                ...mockAnalysis,
                structure: {
                    ...mockAnalysis.structure,
                    directories: [{ path: 'components', files: 15, subdirectories: 3 }],
                    keyFiles: [
                        {
                            path: 'Button.component.js',
                            language: 'JavaScript',
                            size: 1024,
                            lineCount: 50,
                            importance: 0.8,
                            functions: [],
                            classes: [],
                        },
                    ],
                },
            };
            mockReadFile.mockResolvedValue('const simpleCode = "test";');
            const result = await analyzer.analyzeRepository(componentAnalysis);
            const patternNames = result.architecture.patterns.map((p) => p.name);
            expect(patternNames).toContain('Component-Based Architecture');
        });
        it('should detect design patterns in code', async () => {
            const patternContent = `
        class Singleton {
          private static instance: Singleton;
          
          public static getInstance(): Singleton {
            if (!Singleton.instance) {
              Singleton.instance = new Singleton();
            }
            return Singleton.instance;
          }
        }
        
        class UserFactory {
          createUser(type: string) {
            switch (type) {
              case 'admin':
                return new AdminUser();
              case 'regular':
                return new RegularUser();
            }
          }
        }
        
        class EventEmitter {
          private listeners = [];
          
          addEventListener(event, callback) {
            this.listeners.push({ event, callback });
          }
          
          notify(event, data) {
            this.listeners.forEach(listener => {
              if (listener.event === event) {
                listener.callback(data);
              }
            });
          }
        }
      `;
            mockReadFile.mockResolvedValue(patternContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            const patternNames = result.architecture.patterns.map((p) => p.name);
            expect(patternNames).toContain('Singleton Pattern');
            expect(patternNames).toContain('Factory Pattern');
            expect(patternNames).toContain('Observer Pattern');
        });
        it('should calculate maintainability score', async () => {
            mockReadFile.mockResolvedValue('const simpleCode = "test";');
            const result = await analyzer.analyzeRepository(mockAnalysis);
            expect(result.architecture.maintainabilityScore).toBeGreaterThanOrEqual(0);
            expect(result.architecture.maintainabilityScore).toBeLessThanOrEqual(100);
        });
        it('should generate architectural recommendations', async () => {
            const largeAnalysis = {
                ...mockAnalysis,
                fileCount: 150, // Large project
            };
            mockReadFile.mockResolvedValue('const simpleCode = "test";');
            const result = await analyzer.analyzeRepository(largeAnalysis);
            expect(result.architecture.recommendations.length).toBeGreaterThan(0);
            expect(result.architecture.recommendations.some((r) => r.includes('layered architecture') || r.includes('component'))).toBe(true);
        });
    });
    describe('Integration with AnalysisEngine', () => {
        it('should integrate with main analysis engine', async () => {
            // This test would verify that the advanced analyzer is properly integrated
            // with the main AnalysisEngine class
            mockReadFile.mockResolvedValue('const simpleCode = "test";');
            const result = await analyzer.analyzeRepository(mockAnalysis);
            // Verify that all expected properties are present
            expect(result).toHaveProperty('codeQuality');
            expect(result).toHaveProperty('security');
            expect(result).toHaveProperty('architecture');
            // Verify that the analysis updates the original analysis object
            expect(result.codeQuality.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.security.securityScore).toBeGreaterThanOrEqual(0);
            expect(result.architecture.maintainabilityScore).toBeGreaterThanOrEqual(0);
        });
    });
    describe('Error Handling', () => {
        it('should handle malformed code gracefully', async () => {
            const malformedContent = `
        function incomplete() {
          if (condition {
            // Missing closing brace
        
        class Incomplete
          // Missing opening brace
      `;
            mockReadFile.mockResolvedValue(malformedContent);
            const result = await analyzer.analyzeRepository(mockAnalysis);
            // Should not throw and should return valid results
            expect(result).toHaveProperty('codeQuality');
            expect(result).toHaveProperty('security');
            expect(result).toHaveProperty('architecture');
        });
        it('should handle empty repository gracefully', async () => {
            const emptyAnalysis = {
                ...mockAnalysis,
                structure: {
                    ...mockAnalysis.structure,
                    keyFiles: [],
                },
            };
            const result = await analyzer.analyzeRepository(emptyAnalysis);
            expect(result.codeQuality.overallScore).toBe(0);
            expect(result.codeQuality.fileMetrics).toHaveLength(0);
            expect(result.security.vulnerabilities).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=advancedAnalyzer.test.js.map