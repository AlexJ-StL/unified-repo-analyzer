# Output from 'bunx vitest run test' 2025-09-15 22:57

*This is what I could copy from the terminal. It is incomplete because the terminal only saves the last 1000 lines or something like that. If you need the first part of the tests I can change the setting to capture more lines and re-run the tests.*

```Bash
etadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","fileCount":5,"totalSize":931,"languageCount":3,"duration":"37ms"}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Metrics Collection Performance > should collect metrics without significant overhead
{"timestamp":"2025-09-15 22:48:12.639","level":"INFO","component":"analysis-engine","requestId":"e0d3ebed-ed03-4145-aa16-7d25001c1dfc","message":"Repository analysis completed successfully","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","fileCount":5,"totalSize":931,"processingTime":"43ms","analysisMode":"standard","cacheHit":false}}
{"timestamp":"2025-09-15 22:48:12.640","level":"INFO","component":"analysis-engine","requestId":"e31c5ed5-e3a4-474a-b654-a7563c727bb1","message":"Analysis completed: C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","metadata":{"fileCount":5,"totalSize":931,"duration":43,"cacheHit":false,"requestId":"e0d3ebed-ed03-4145-aa16-7d25001c1dfc"}}
{"timestamp":"2025-09-15 22:48:12.641","level":"INFO","component":"analysis-engine","requestId":"49cc8102-aed1-4e71-9aa9-6024da83dc70","message":"Performance: repository_analysis","metadata":{"duration":"43ms","repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","fileCount":5,"totalSizeBytes":931,"analysisMode":"standard","languageCount":3}}


stdout | packages/backend/src/__tests__/logging-system-integration.test.ts > Logging System Integration Tests > Log Format and Content Validation > should include proper error details in error logs
{"timestamp":"2025-09-15 22:48:12.696","level":"ERROR","component":"unified-repo-analyzer","requestId":"error-correlation-789","message":"Error occurred during test","metadata":{"context":"unit-test","operation":"error-logging"},"error":{"name":"TestError","message":"Test error message","stack":"TestError: Test error message\n    at test location"}}

 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts (7 tests | 7 failed) 57ms
   × useProviders > should initialize with empty providers and no loading/error state 35ms
     → document is not defined
   × useProviders > should fetch providers successfully 5ms
     → document is not defined
   × useProviders > should handle fetch providers error 2ms
     → document is not defined
   × useProviders > should test provider successfully 3ms
     → document is not defined
   × useProviders > should handle test provider error 2ms
     → document is not defined
   × useProviders > should fetch provider models successfully 2ms
     → document is not defined
   × useProviders > should handle fetch provider models error 2ms
     → document is not defined
stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Metrics Collection Performance > should collect metrics without significant overhead
{"timestamp":"2025-09-15 22:48:12.797","level":"INFO","component":"analysis-engine","requestId":"05fb7da6-03f5-41c5-9d4e-731edddde5ea","message":"Analysis started: C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","metadata":{"mode":"standard","requestId":"588f8ab7-af45-4f72-b8b5-f645cbe2155b"}}
{"timestamp":"2025-09-15 22:48:12.798","level":"INFO","component":"analysis-engine","requestId":"588f8ab7-af45-4f72-b8b5-f645cbe2155b","message":"Starting repository analysis","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","analysisMode":"standard","options":{"maxFiles":100,"maxLinesPerFile":1000,"includeTree":true}}}
info: New analysis request for: C:\Users\AlexJ\Documents\Coding\Repos\my-repos\myRepoAnalyzer\unified-repo-analyzer\packages\backend\src\__tests__\test-repo-perf {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:12.801Z"}
{"timestamp":"2025-09-15 22:48:12.802","level":"INFO","component":"analysis-engine","requestId":"588f8ab7-af45-4f72-b8b5-f645cbe2155b","message":"Analysis completed from cache","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","fileCount":5,"totalSize":931,"duration":"6ms","cacheHit":true}}
{"timestamp":"2025-09-15 22:48:12.803","level":"INFO","component":"analysis-engine","requestId":"cf405223-cdc8-404e-93b6-bb2935287194","message":"Analysis completed: C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\test-repo-perf","metadata":{"fileCount":5,"totalSize":931,"duration":6,"cacheHit":true,"requestId":"588f8ab7-af45-4f72-b8b5-f645cbe2155b"}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Metrics Collection Performance > should collect metrics without significant overhead
Without metrics: 45.67ms
With metrics: 7.39ms
Overhead: -83.81%

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Metrics Collection Performance > should handle high-frequency metric recording   
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:12.806Z"}
info: All pending requests cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:12.806Z"}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Metrics Collection Performance > should handle high-frequency metric recording   
Recorded 10000 metrics in 29.98ms
Rate: 333590 metrics/second

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently      
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:12.838Z"}
info: All pending requests cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:12.839Z"}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.844","level":"INFO","component":"log-management","requestId":"3ec849ec-7d95-4577-aa53-8364d353410a","message":"Log management service started","metadata":{"logDirectory":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows","retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1},"monitoringEnabled":true}}


stdout | packages/backend/src/__tests__/logging-system-integration.test.ts > Logging System Integration Tests > Log Format and Content Validation > should handle special characters and unicode in logs
{"timestamp":"2025-09-15 22:48:12.889","level":"INFO","component":"unified-repo-analyzer","requestId":"error-correlation-789","message":"Special characters test","metadata":{"unicode":"🚀 Unicode test with émojis and spëcial chars","quotes":"String with \"quotes\" and 'apostrophes'","newlines":"String with\nnewlines\nand\ttabs","backslashes":"Path\\with\\backslashes","nullValue":null}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.899","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-success-001","message":"Starting repository analysis workflow","metadata":{"repoPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo","workflow":"complete-analysis"}}
{"timestamp":"2025-09-15 22:48:12.900","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Validating repository path","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo"}}
{"timestamp":"2025-09-15 22:48:12.906","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"format_validation","percentage":10,"message":"Validating path format..."}}
{"timestamp":"2025-09-15 22:48:12.910","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"format_validation","percentage":20,"message":"Path format validation completed"}}
{"timestamp":"2025-09-15 22:48:12.910","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"normalization","percentage":30,"message":"Normalizing path..."}}
{"timestamp":"2025-09-15 22:48:12.911","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"normalization","percentage":40,"message":"Path normalization completed"}}
{"timestamp":"2025-09-15 22:48:12.912","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"existence_check","percentage":50,"message":"Checking path existence..."}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.914","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"existence_check","percentage":60,"message":"Path existence check completed"}}
{"timestamp":"2025-09-15 22:48:12.915","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"permission_check","percentage":70,"message":"Checking permissions..."}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.919","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"permission_check","percentage":80,"message":"Permission check completed"}}
{"timestamp":"2025-09-15 22:48:12.920","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"finalization","percentage":90,"message":"Finalizing validation..."}}
{"timestamp":"2025-09-15 22:48:12.920","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Path validation progress","metadata":{"stage":"completed","percentage":100,"message":"Path validation completed"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.936","level":"INFO","component":"path-handler","requestId":"repo-analysis-success-001","message":"Repository path validated successfully","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo","isValid":true,"isDirectory":true}}
{"timestamp":"2025-09-15 22:48:12.936","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-success-001","message":"Checking repository permissions","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.941","level":"INFO","component":"path-handler","requestId":"repo-analysis-success-001","message":"Repository permissions verified","metadata":{"canRead":true,"canWrite":true,"canExecute":true}}
{"timestamp":"2025-09-15 22:48:12.941","level":"DEBUG","component":"analysis-engine","requestId":"repo-analysis-success-001","message":"Analyzing repository structure","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.954","level":"INFO","component":"analysis-engine","requestId":"repo-analysis-success-001","message":"Repository structure analyzed","metadata":{"totalFiles":9,"totalDirectories":4,"languages":["Markdown","JSON","JavaScript"]}}
{"timestamp":"2025-09-15 22:48:12.954","level":"DEBUG","component":"file-processor","requestId":"repo-analysis-success-001","message":"Processing file","metadata":{"file":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo\\.gitignore"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.961","level":"DEBUG","component":"file-processor","requestId":"repo-analysis-success-001","message":"File processed successfully","metadata":{"file":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo\\.gitignore","size":24,"type":"unknown"}}
{"timestamp":"2025-09-15 22:48:12.962","level":"DEBUG","component":"file-processor","requestId":"repo-analysis-success-001","message":"Processing file","metadata":{"file":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo\\docs\\API.md"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.967","level":"DEBUG","component":"file-processor","requestId":"repo-analysis-success-001","message":"File processed successfully","metadata":{"file":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo\\docs\\API.md","size":19,"type":".md"}}
{"timestamp":"2025-09-15 22:48:12.967","level":"DEBUG","component":"file-processor","requestId":"repo-analysis-success-001","message":"Processing file","metadata":{"file":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo\\package.json"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:12.972","level":"DEBUG","component":"file-processor","requestId":"repo-analysis-success-001","message":"File processed successfully","metadata":{"file":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo\\package.json","size":99,"type":".json"}}
{"timestamp":"2025-09-15 22:48:12.973","level":"DEBUG","component":"report-generator","requestId":"repo-analysis-success-001","message":"Generating analysis report"}
{"timestamp":"2025-09-15 22:48:12.974","level":"INFO","component":"report-generator","requestId":"repo-analysis-success-001","message":"Analysis report generated","metadata":{"repoPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\sample-repo","totalFiles":9,"totalDirectories":4,"languages":["Markdown","JSON","JavaScript"],"analysisTime":"2025-09-16T03:48:12.973Z","status":"completed"}}
{"timestamp":"2025-09-15 22:48:12.974","level":"DEBUG","component":"cleanup-service","requestId":"repo-analysis-success-001","message":"Performing cleanup"}       
{"timestamp":"2025-09-15 22:48:12.974","level":"INFO","component":"log-management","requestId":"repo-analysis-success-001","message":"Starting log cleanup","metadata":{"retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1}}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:13.015","level":"INFO","component":"log-management","requestId":"repo-analysis-success-001","message":"Log cleanup completed","metadata":{"filesRemoved":0,"spaceFreed":0,"errors":[],"duration":"40ms","totalFiles":1,"filesChecked":1}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:13.017","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-success-001","message":"Repository analysis workflow completed successfully","metadata":{"requestId":"repo-analysis-success-001","duration":"< 1s","filesAnalyzed":9,"cleanupResult":{"filesRemoved":0,"spaceFreed":0}}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish
{"timestamp":"2025-09-15 22:48:13.037","level":"INFO","component":"log-management","requestId":"repo-analysis-success-001","message":"Log management service stopped"}


stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle repository analysis with path validation errors
{"timestamp":"2025-09-15 22:48:13.153","level":"INFO","component":"log-management","requestId":"repo-analysis-success-001","message":"Log management service started","metadata":{"logDirectory":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows","retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1},"monitoringEnabled":true}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle repository analysis with path validation errors
{"timestamp":"2025-09-15 22:48:13.154","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-error-002","message":"Starting repository analysis with invalid path","metadata":{"repoPath":"C:\\invalid\\path\\with\\reserved\\CON\\name","workflow":"error-handling"}}
{"timestamp":"2025-09-15 22:48:13.155","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-error-002","message":"Validating repository path","metadata":{"path":"C:\\invalid\\path\\with\\reserved\\CON\\name"}}

stdout | packages/backend/src/__tests__/logging-system-integration.test.ts > Logging System Integration Tests > Log Format and Content Validation > should validate log entry structure consistency
{"timestamp":"2025-09-15 22:48:13.166","level":"DEBUG","component":"unified-repo-analyzer","requestId":"error-correlation-789","message":"Debug message","metadata":{"debugData":true}}
{"timestamp":"2025-09-15 22:48:13.167","level":"INFO","component":"unified-repo-analyzer","requestId":"error-correlation-789","message":"Info message","metadata":{"infoData":"value"}}
{"timestamp":"2025-09-15 22:48:13.167","level":"WARN","component":"unified-repo-analyzer","requestId":"error-correlation-789","message":"Warning message","metadata":{"warnData":123}}
{"timestamp":"2025-09-15 22:48:13.168","level":"ERROR","component":"unified-repo-analyzer","requestId":"error-correlation-789","message":"Error message","metadata":{"errorData":false},"error":{"name":"Error","message":"Test","stack":"Error: Test\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\logging-system-integration.test.ts:757:37\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runTest (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)\n    at runSuite (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)\n    at runSuite (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)\n    at runSuite (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle repository analysis with path validation errors
{"timestamp":"2025-09-15 22:48:13.159","level":"WARN","component":"path-handler","requestId":"repo-analysis-error-002","message":"Repository path validation failed","metadata":{"path":"C:\\invalid\\path\\with\\reserved\\CON\\name","errors":[{"code":"RESERVED_NAME","message":"Path contains Windows reserved name: CON","suggestions":["Rename the file or directory to avoid reserved names"]}]}}
{"timestamp":"2025-09-15 22:48:13.165","level":"DEBUG","component":"error-handler","requestId":"repo-analysis-error-002","message":"Processing validation errors","metadata":{"errorCount":1}}
{"timestamp":"2025-09-15 22:48:13.167","level":"INFO","component":"error-handler","requestId":"repo-analysis-error-002","message":"User-friendly error messages generated","metadata":{"errorCount":1,"errorTypes":["RESERVED_NAME"]}}
{"timestamp":"2025-09-15 22:48:13.190","level":"ERROR","component":"workflow-manager","requestId":"repo-analysis-error-002","message":"Repository analysis workflow terminated due to path validation errors","metadata":{"requestId":"repo-analysis-error-002","originalPath":"C:\\invalid\\path\\with\\reserved\\CON\\name","errorCount":1,"userErrors":[{"type":"path_validation_error","code":"RESERVED_NAME","message":"Path contains Windows reserved name: CON","details":"Reserved names: CON, PRN, AUX, NUL, COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9, LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9","suggestions":["Rename the file or directory to avoid reserved names"],"userMessage":"The path contains a reserved Windows name. Please rename the file or folder."}]},"error":{"name":"Error","message":"Path validation failed","stack":"Error: Path validation failed\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\end-to-end-workflows.test.ts:312:9\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle repository analysis with path validation errors
{"timestamp":"2025-09-15 22:48:13.201","level":"INFO","component":"log-management","requestId":"repo-analysis-error-002","message":"Log management service stopped"}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.220","level":"INFO","component":"log-management","requestId":"repo-analysis-error-002","message":"Log management service started","metadata":{"logDirectory":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows","retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1},"monitoringEnabled":true}}


stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.251","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-timeout-003","message":"Starting repository analysis with timeout testing","metadata":{"repoPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\timeout-test-repo","workflow":"timeout-handling"}}
{"timestamp":"2025-09-15 22:48:13.260","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Validating repository path with timeout","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\timeout-test-repo","timeoutMs":500}}
{"timestamp":"2025-09-15 22:48:13.262","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"format_validation","percentage":10}}
{"timestamp":"2025-09-15 22:48:13.266","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"format_validation","percentage":20}}
{"timestamp":"2025-09-15 22:48:13.266","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"normalization","percentage":30}}
{"timestamp":"2025-09-15 22:48:13.267","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"normalization","percentage":40}}
{"timestamp":"2025-09-15 22:48:13.268","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"existence_check","percentage":50}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.270","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"existence_check","percentage":60}}
{"timestamp":"2025-09-15 22:48:13.270","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"permission_check","percentage":70}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.277","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"permission_check","percentage":80}}
{"timestamp":"2025-09-15 22:48:13.279","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"finalization","percentage":90}}
{"timestamp":"2025-09-15 22:48:13.280","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation progress (timeout test)","metadata":{"stage":"completed","percentage":100}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.282","level":"INFO","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation completed within timeout","metadata":{"isValid":true,"timeoutMs":500}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.293","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Testing timeout scenario","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\timeout-test-repo\\slow-file.txt","timeoutMs":100}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.407","level":"WARN","component":"path-handler","requestId":"repo-analysis-timeout-003","message":"Path validation timed out as expected","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\timeout-test-repo\\slow-file.txt","timeoutMs":100,"errors":["Path validation timed out after 100ms"]}}
{"timestamp":"2025-09-15 22:48:13.408","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-timeout-003","message":"Timeout handling test completed","metadata":{"requestId":"repo-analysis-timeout-003","workflow":"timeout-handling"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle timeout scenarios gracefully
{"timestamp":"2025-09-15 22:48:13.409","level":"INFO","component":"log-management","requestId":"repo-analysis-timeout-003","message":"Log management service stopped"}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.489","level":"INFO","component":"log-management","requestId":"repo-analysis-timeout-003","message":"Log management service started","metadata":{"logDirectory":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows","retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1},"monitoringEnabled":true}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.516","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-cancel-004","message":"Starting repository analysis with cancellation testing","metadata":{"repoPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\cancel-test-repo","workflow":"cancellation-handling"}}
{"timestamp":"2025-09-15 22:48:13.516","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Starting path validation with cancellation support","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\cancel-test-repo"}}
{"timestamp":"2025-09-15 22:48:13.517","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"format_validation","percentage":10}}
{"timestamp":"2025-09-15 22:48:13.517","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"format_validation","percentage":20}}
{"timestamp":"2025-09-15 22:48:13.518","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"normalization","percentage":30}}
{"timestamp":"2025-09-15 22:48:13.518","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"normalization","percentage":40}}
{"timestamp":"2025-09-15 22:48:13.518","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"existence_check","percentage":50}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.519","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"existence_check","percentage":60}}
{"timestamp":"2025-09-15 22:48:13.519","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"permission_check","percentage":70}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.521","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"permission_check","percentage":80}}
{"timestamp":"2025-09-15 22:48:13.521","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"finalization","percentage":90}}
{"timestamp":"2025-09-15 22:48:13.521","level":"DEBUG","component":"path-handler","requestId":"repo-analysis-cancel-004","message":"Path validation progress (cancellation test)","metadata":{"stage":"completed","percentage":100}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.524","level":"INFO","component":"workflow-manager","requestId":"repo-analysis-cancel-004","message":"Cancellation handling test completed","metadata":{"requestId":"repo-analysis-cancel-004","wasCancelled":false}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.525","level":"INFO","component":"log-management","requestId":"repo-analysis-cancel-004","message":"Log management service stopped"}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle cancellation scenarios
{"timestamp":"2025-09-15 22:48:13.571","level":"DEBUG","component":"workflow-manager","requestId":"repo-analysis-cancel-004","message":"Cancelling path validation"}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Settings Tab Path Input Workflow > should simulate settings tab path validation workflow
{"timestamp":"2025-09-15 22:48:13.621","level":"INFO","component":"log-management","requestId":"repo-analysis-cancel-004","message":"Log management service started","metadata":{"logDirectory":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows","retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1},"monitoringEnabled":true}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Settings Tab Path Input Workflow > should simulate settings tab path validation workflow
{"timestamp":"2025-09-15 22:48:13.622","level":"INFO","component":"frontend","requestId":"settings-workflow-001","message":"User entered path in settings tab","metadata":{"userInput":"C:\\Users\\TestUser\\Documents\\Projects","source":"settings-tab"}}
{"timestamp":"2025-09-15 22:48:13.623","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Performing real-time path validation","metadata":{"path":"C:\\Users\\TestUser\\Documents\\Projects"}}
{"timestamp":"2025-09-15 22:48:13.625","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"format_validation","percentage":10}}
{"timestamp":"2025-09-15 22:48:13.626","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"format_validation","percentage":20}}
{"timestamp":"2025-09-15 22:48:13.626","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"normalization","percentage":30}}
{"timestamp":"2025-09-15 22:48:13.627","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"normalization","percentage":40}}
{"timestamp":"2025-09-15 22:48:13.627","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"existence_check","percentage":50}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Settings Tab Path Input Workflow > should simulate settings tab path validation workflow
{"timestamp":"2025-09-15 22:48:13.629","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"existence_check","percentage":60}}
{"timestamp":"2025-09-15 22:48:13.629","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"finalization","percentage":90}}
{"timestamp":"2025-09-15 22:48:13.629","level":"DEBUG","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation progress","metadata":{"stage":"completed","percentage":100}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Settings Tab Path Input Workflow > should simulate settings tab path validation workflow
{"timestamp":"2025-09-15 22:48:13.630","level":"INFO","component":"settings-validator","requestId":"settings-workflow-001","message":"Real-time validation feedback generated","metadata":{"isValid":true,"exists":false,"canRead":false,"errors":[],"warnings":[]}}
{"timestamp":"2025-09-15 22:48:13.630","level":"WARN","component":"settings-manager","requestId":"settings-workflow-001","message":"User attempted to save invalid path","metadata":{"path":"C:\\Users\\TestUser\\Documents\\Projects","errors":[]}}
{"timestamp":"2025-09-15 22:48:13.630","level":"INFO","component":"settings-tab","requestId":"settings-workflow-001","message":"Settings tab workflow completed","metadata":{"requestId":"settings-workflow-001","finalPath":"C:\\Users\\TestUser\\Documents\\Projects","wasValid":true}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Settings Tab Path Input Workflow > should simulate settings tab path validation workflow
{"timestamp":"2025-09-15 22:48:13.631","level":"INFO","component":"log-management","requestId":"settings-workflow-001","message":"Log management service stopped"} 

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.670","level":"INFO","component":"log-management","requestId":"settings-workflow-001","message":"Log management service started","metadata":{"logDirectory":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows","retentionPolicy":{"maxAge":7,"maxSize":"50MB","maxFiles":10,"cleanupInterval":1},"monitoringEnabled":true}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.746","level":"INFO","component":"frontend","requestId":"analyze-workflow-001","message":"User initiated repository analysis","metadata":{"selectedPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\analyze-repo","source":"analyze-tab"}}
{"timestamp":"2025-09-15 22:48:13.746","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Performing pre-analysis validation","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\analyze-repo"}}
{"timestamp":"2025-09-15 22:48:13.747","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"format_validation","percentage":10,"message":"Validating path format..."}}
{"timestamp":"2025-09-15 22:48:13.747","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"format_validation","percentage":20,"message":"Path format validation completed"}}
{"timestamp":"2025-09-15 22:48:13.747","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"normalization","percentage":30,"message":"Normalizing path..."}}
{"timestamp":"2025-09-15 22:48:13.748","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"normalization","percentage":40,"message":"Path normalization completed"}}
{"timestamp":"2025-09-15 22:48:13.748","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"existence_check","percentage":50,"message":"Checking path existence..."}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.749","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"existence_check","percentage":60,"message":"Path existence check completed"}}
{"timestamp":"2025-09-15 22:48:13.749","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"permission_check","percentage":70,"message":"Checking permissions..."}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.751","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"permission_check","percentage":80,"message":"Permission check completed"}}
{"timestamp":"2025-09-15 22:48:13.751","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"finalization","percentage":90,"message":"Finalizing validation..."}}
{"timestamp":"2025-09-15 22:48:13.751","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation progress","metadata":{"stage":"completed","percentage":100,"message":"Path validation completed"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.752","level":"DEBUG","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Verifying analysis permissions","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\analyze-repo"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.755","level":"INFO","component":"analyze-validator","requestId":"analyze-workflow-001","message":"Pre-analysis validation completed","metadata":{"isValid":true,"canRead":true}}
{"timestamp":"2025-09-15 22:48:13.755","level":"INFO","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Starting repository analysis process","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\analyze-repo","analysisId":"analyze-workflow-001"}}
{"timestamp":"2025-09-15 22:48:13.756","level":"DEBUG","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Analysis progress update","metadata":{"step":"File Discovery","percentage":20,"analysisId":"analyze-workflow-001"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.776","level":"DEBUG","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Analysis progress update","metadata":{"step":"Language Detection","percentage":40,"analysisId":"analyze-workflow-001"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.794","level":"DEBUG","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Analysis progress update","metadata":{"step":"Dependency Analysis","percentage":60,"analysisId":"analyze-workflow-001"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.822","level":"DEBUG","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Analysis progress update","metadata":{"step":"Code Structure Analysis","percentage":80,"analysisId":"analyze-workflow-001"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.849","level":"DEBUG","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Analysis progress update","metadata":{"step":"Report Generation","percentage":100,"analysisId":"analyze-workflow-001"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.871","level":"INFO","component":"analysis-engine","requestId":"analyze-workflow-001","message":"Repository analysis completed successfully","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\test-e2e-workflows\\analyze-repo","totalFiles":15,"languages":["JavaScript","TypeScript","JSON"],"linesOfCode":1250,"dependencies":8,"analysisTime":"2025-09-16T03:48:13.870Z","status":"completed"}}
{"timestamp":"2025-09-15 22:48:13.871","level":"INFO","component":"frontend","requestId":"analyze-workflow-001","message":"Analysis results presented to user","metadata":{"analysisId":"analyze-workflow-001","resultsSummary":{"files":15,"languages":3,"loc":1250}}}
{"timestamp":"2025-09-15 22:48:13.871","level":"INFO","component":"analyze-tab","requestId":"analyze-workflow-001","message":"Analyze tab workflow completed","metadata":{"requestId":"analyze-workflow-001","success":true,"duration":"< 1s"}}

stdout | packages/backend/src/__tests__/end-to-end-workflows.test.ts > End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow
{"timestamp":"2025-09-15 22:48:13.872","level":"INFO","component":"log-management","requestId":"analyze-workflow-001","message":"Log management service stopped"}  

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently      
{"timestamp":"2025-09-15 22:48:13.632","level":"INFO","component":"analysis-engine","requestId":"a92b91c1-0f7e-4246-b120-3766f35c5cf9","message":"Analysis started: C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","metadata":{"mode":"standard","requestId":"5cb625af-d613-4b81-a0ca-a2f5012c88e9"}}
{"timestamp":"2025-09-15 22:48:13.633","level":"INFO","component":"analysis-engine","requestId":"5cb625af-d613-4b81-a0ca-a2f5012c88e9","message":"Starting repository analysis","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","analysisMode":"standard","options":{"maxFiles":1000,"maxLinesPerFile":5000,"includeTree":true}}}
info: New analysis request for: C:\Users\AlexJ\Documents\Coding\Repos\my-repos\myRepoAnalyzer\unified-repo-analyzer\packages\backend\src\__tests__\large-test-repo {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:13.633Z"}
{"timestamp":"2025-09-15 22:48:13.634","level":"INFO","component":"analysis-engine","requestId":"5cb625af-d613-4b81-a0ca-a2f5012c88e9","message":"Starting repository discovery","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","discoveryOptions":{"maxFiles":1000,"maxLinesPerFile":5000,"includeTree":true}}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently      
{"timestamp":"2025-09-15 22:48:13.639","level":"INFO","component":"filesystem","requestId":"b6135d05-6a9b-464d-9c15-648684858439","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","options":{"maxDepth":0,"maxFiles":1000,"ignorePatterns":40,"hasFileFilter":false}}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently      
{"timestamp":"2025-09-15 22:48:13.721","level":"INFO","component":"filesystem","requestId":"b6135d05-6a9b-464d-9c15-648684858439","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","filesFound":122,"directoriesFound":6,"totalSize":193672,"skippedFiles":0,"duration":"83ms"}}
{"timestamp":"2025-09-15 22:48:13.721","level":"INFO","component":"filesystem","requestId":"ca350938-6dff-4c7d-8007-1a4dc5528733","message":"Performance: directory_traversal","metadata":{"duration":"83ms","path":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","filesCount":122,"directoriesCount":6,"totalSizeBytes":193672}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently      
{"timestamp":"2025-09-15 22:48:13.838","level":"INFO","component":"analysis-engine","requestId":"5cb625af-d613-4b81-a0ca-a2f5012c88e9","message":"Repository discovery completed","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","fileCount":122,"totalSize":193672,"languageCount":2,"duration":"202ms"}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently      
{"timestamp":"2025-09-15 22:48:13.875","level":"INFO","component":"analysis-engine","requestId":"5cb625af-d613-4b81-a0ca-a2f5012c88e9","message":"Repository analysis completed successfully","metadata":{"repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","fileCount":122,"totalSize":193672,"processingTime":"240ms","analysisMode":"standard","cacheHit":false}}
{"timestamp":"2025-09-15 22:48:13.879","level":"INFO","component":"analysis-engine","requestId":"878ff739-797b-430d-819d-78a19e82d8a6","message":"Analysis completed: C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","metadata":{"fileCount":122,"totalSize":193672,"duration":240,"cacheHit":false,"requestId":"5cb625af-d613-4b81-a0ca-a2f5012c88e9"}}
{"timestamp":"2025-09-15 22:48:13.879","level":"INFO","component":"analysis-engine","requestId":"03612f34-d7f4-4343-bda1-00dc9eb46e86","message":"Performance: repository_analysis","metadata":{"duration":"240ms","repositoryPath":"C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\large-test-repo","fileCount":122,"totalSizeBytes":193672,"analysisMode":"standard","languageCount":2}}

stdout | packages/backend/src/__tests__/performance.test.ts > Performance Tests > Large Repository Performance > should handle large repositories efficiently
Large repository analysis completed in: 247.67ms
Files analyzed: 122
Performance: 492.58 files/second

 ✓ packages/backend/src/providers/__tests__/ProviderRegistry.models.test.ts (5 tests) 870ms
   ✓ ProviderRegistry Model Selection > fetchProviderModels > should handle OpenRouter provider  826ms
 ✓ packages/backend/src/__tests__/end-to-end-workflows.test.ts (6 tests) 1578ms
   ✓ End-to-End User Workflow Tests > Complete Repository Analysis Workflow > should handle successful repository analysis from start to finish  332ms
   ✓ End-to-End User Workflow Tests > Analyze Tab Path Input Workflow > should simulate analyze tab repository selection workflow  727ms
 ✓ packages/backend/src/__tests__/performance.test.ts (12 tests) 3720ms
   ✓ Performance Tests > Cache Performance > should respect TTL settings  335ms
   ✓ Performance Tests > Batch Processing Performance > should process multiple repositories efficiently  657ms
   ✓ Performance Tests > Large Repository Performance > should handle large repositories efficiently  1542ms
 ✓ packages/backend/src/__tests__/logging-system-integration.test.ts (14 tests) 3827ms
   ✓ Logging System Integration Tests > Logging Performance Under Load > should handle high-volume logging without blocking  738ms
   ✓ Logging System Integration Tests > Logging Performance Under Load > should handle concurrent logging from multiple components  627ms
   ✓ Logging System Integration Tests > Log Format and Content Validation > should validate log entry structure consistency  592ms
   ✓ Logging System Integration Tests > HTTP Request/Response Logging Integration > should log HTTP requests with proper correlation  647ms
stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should traverse a directory and return files and directories
{"timestamp":"2025-09-15 22:48:14.888","level":"INFO","component":"filesystem","requestId":"02d26976-5d47-4034-ba7f-bbf2895a2933","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994494767","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should traverse a directory and return files and directories
{"timestamp":"2025-09-15 22:48:14.918","level":"INFO","component":"filesystem","requestId":"02d26976-5d47-4034-ba7f-bbf2895a2933","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994494767","filesFound":7,"directoriesFound":6,"totalSize":141,"skippedFiles":0,"duration":"30ms"}}
{"timestamp":"2025-09-15 22:48:14.936","level":"INFO","component":"filesystem","requestId":"2f533db6-c024-41e3-962d-032395570034","message":"Performance: directory_traversal","metadata":{"duration":"30ms","path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994494767","filesCount":7,"directoriesCount":6,"totalSizeBytes":141}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect maxDepth option
{"timestamp":"2025-09-15 22:48:15.171","level":"INFO","component":"filesystem","requestId":"89750908-7c84-47cc-bf94-0c6de12e6020","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495046","options":{"maxDepth":1,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect maxDepth option
{"timestamp":"2025-09-15 22:48:15.199","level":"INFO","component":"filesystem","requestId":"89750908-7c84-47cc-bf94-0c6de12e6020","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495046","filesFound":3,"directoriesFound":4,"totalSize":54,"skippedFiles":0,"duration":"27ms"}}
{"timestamp":"2025-09-15 22:48:15.219","level":"INFO","component":"filesystem","requestId":"fbb37062-76e4-4734-8700-bf84d52051c8","message":"Performance: directory_traversal","metadata":{"duration":"27ms","path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495046","filesCount":3,"directoriesCount":4,"totalSizeBytes":54}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect maxFiles option
{"timestamp":"2025-09-15 22:48:15.318","level":"INFO","component":"filesystem","requestId":"76617aaa-8193-48d2-921d-4756ab9164c3","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495301","options":{"maxDepth":0,"maxFiles":2,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect maxFiles option
{"timestamp":"2025-09-15 22:48:15.327","level":"INFO","component":"filesystem","requestId":"76617aaa-8193-48d2-921d-4756ab9164c3","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495301","filesFound":2,"directoriesFound":2,"totalSize":22,"skippedFiles":0,"duration":"9ms"}}
{"timestamp":"2025-09-15 22:48:15.328","level":"INFO","component":"filesystem","requestId":"752ca52b-8772-4f94-a199-453b3f7feeca","message":"Performance: directory_traversal","metadata":{"duration":"9ms","path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495301","filesCount":2,"directoriesCount":2,"totalSizeBytes":22}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect ignorePatterns option
{"timestamp":"2025-09-15 22:48:15.372","level":"INFO","component":"filesystem","requestId":"1db4ce91-239f-4d73-9732-4d6495115cab","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495337","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":3,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect ignorePatterns option
{"timestamp":"2025-09-15 22:48:15.398","level":"INFO","component":"filesystem","requestId":"1db4ce91-239f-4d73-9732-4d6495115cab","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495337","filesFound":6,"directoriesFound":4,"totalSize":124,"skippedFiles":0,"duration":"26ms"}}
{"timestamp":"2025-09-15 22:48:15.399","level":"INFO","component":"filesystem","requestId":"f2c5553b-6b16-4b0e-804a-1712307993d7","message":"Performance: directory_traversal","metadata":{"duration":"26ms","path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495337","filesCount":6,"directoriesCount":4,"totalSizeBytes":124}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect fileFilter option
{"timestamp":"2025-09-15 22:48:15.433","level":"INFO","component":"filesystem","requestId":"4f460202-202f-4dac-9b09-b59e144f4187","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495414","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":true}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should respect fileFilter option
{"timestamp":"2025-09-15 22:48:15.442","level":"INFO","component":"filesystem","requestId":"4f460202-202f-4dac-9b09-b59e144f4187","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495414","filesFound":4,"directoriesFound":6,"totalSize":87,"skippedFiles":0,"duration":"9ms"}}
{"timestamp":"2025-09-15 22:48:15.443","level":"INFO","component":"filesystem","requestId":"19998bb3-ba7e-42cd-b482-1d93ce44ad49","message":"Performance: directory_traversal","metadata":{"duration":"9ms","path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495414","filesCount":4,"directoriesCount":6,"totalSizeBytes":87}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for non-existent directory 
{"timestamp":"2025-09-15 22:48:15.549","level":"INFO","component":"filesystem","requestId":"b326ca6f-1f78-4d64-bf7a-c1b09c1535af","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for non-existent directory
{"timestamp":"2025-09-15 22:48:15.612","level":"ERROR","component":"filesystem","requestId":"b326ca6f-1f78-4d64-bf7a-c1b09c1535af","message":"Directory traversal failed - directory not found","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent","errorId":"3d06e28d-d297-40fb-9d4b-31229583b5df"},"error":{"name":"FileSystemError","message":"Directory not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent","stack":"FileSystemError: Directory not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent\n    at traverseDirectory (C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\fileSystem.ts:199:23)\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\__tests__\\utils\\fileSystem.test.ts:121:7\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for non-existent directory 
{"timestamp":"2025-09-15 22:48:15.617","level":"INFO","component":"filesystem","requestId":"97450f33-d351-44e8-b6f3-657173d5f077","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for non-existent directory 
{"timestamp":"2025-09-15 22:48:15.621","level":"ERROR","component":"filesystem","requestId":"97450f33-d351-44e8-b6f3-657173d5f077","message":"Directory traversal failed - directory not found","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent","errorId":"1216650a-fb26-47ad-af90-229fbb51d1fd"},"error":{"name":"FileSystemError","message":"Directory not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent","stack":"FileSystemError: Directory not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495457\\non-existent\n    at traverseDirectory (C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\fileSystem.ts:199:23)\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\__tests__\\utils\\fileSystem.test.ts:122:7\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for invalid path
{"timestamp":"2025-09-15 22:48:15.657","level":"INFO","component":"filesystem","requestId":"4c91a835-3a1e-4a67-a656-119b94beda5f","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for invalid path
{"timestamp":"2025-09-15 22:48:15.661","level":"ERROR","component":"filesystem","requestId":"4c91a835-3a1e-4a67-a656-119b94beda5f","message":"Directory traversal failed - not a directory","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json","errorId":"93381e3a-8560-4dbd-896e-772d66b2c696"},"error":{"name":"FileSystemError","message":"Path is not a directory: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json","stack":"FileSystemError: Path is not a directory: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json\n    at traverseDirectory (C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\fileSystem.ts:154:21)\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\__tests__\\utils\\fileSystem.test.ts:130:7\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}      

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for invalid path
{"timestamp":"2025-09-15 22:48:15.662","level":"INFO","component":"filesystem","requestId":"0975dc6d-98af-405f-8ece-400b0e38d3bb","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > traverseDirectory > should throw FileSystemError for invalid path
{"timestamp":"2025-09-15 22:48:15.664","level":"ERROR","component":"filesystem","requestId":"0975dc6d-98af-405f-8ece-400b0e38d3bb","message":"Directory traversal failed - not a directory","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json","errorId":"e1c98b8c-c741-43dd-bfc2-47a5ce871173"},"error":{"name":"FileSystemError","message":"Path is not a directory: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json","stack":"FileSystemError: Path is not a directory: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495642\\package.json\n    at traverseDirectory (C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\fileSystem.ts:154:21)\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\__tests__\\utils\\fileSystem.test.ts:131:7\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}      

 ✓ packages/backend/__tests__/utils/languageDetection.test.ts (13 tests) 517ms
stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > readFileWithErrorHandling > should throw FileSystemError for non-existent file
{"timestamp":"2025-09-15 22:48:16.133","level":"ERROR","component":"filesystem","requestId":"ef02a02c-87bb-434f-9410-739e58df90dd","message":"File read failed - file not found","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495847\\non-existent.txt","errorId":"82dd6f26-8090-4ca9-8879-4dbca4509168","duration":"2ms"},"error":{"name":"FileSystemError","message":"File not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495847\\non-existent.txt","stack":"FileSystemError: File not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495847\\non-existent.txt\n    at readFileWithErrorHandling (C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\fileSystem.ts:474:23)\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\__tests__\\utils\\fileSystem.test.ts:148:7\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > readFileWithErrorHandling > should throw FileSystemError for non-existent file
{"timestamp":"2025-09-15 22:48:16.136","level":"ERROR","component":"filesystem","requestId":"a98d6902-a994-4f92-a87f-d0d8667db146","message":"File read failed - file not found","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495847\\non-existent.txt","errorId":"018e89c2-2775-4903-a918-b0c3c07f4002","duration":"1ms"},"error":{"name":"FileSystemError","message":"File not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495847\\non-existent.txt","stack":"FileSystemError: File not found: C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994495847\\non-existent.txt\n    at readFileWithErrorHandling (C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\fileSystem.ts:474:23)\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\__tests__\\utils\\fileSystem.test.ts:149:7\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:20"}}

stdout | packages/backend/src/api/__tests__/websocket.test.ts > WebSocket Tests
Client connected: RE9vG-ZcCPS3P2aLAAAB

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > extractDirectoryInfo > should extract directory information from traversal result
{"timestamp":"2025-09-15 22:48:16.530","level":"INFO","component":"filesystem","requestId":"60cb9f85-783b-4b3f-832d-5a72ccb4b01f","message":"Starting directory traversal","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994496484","options":{"maxDepth":0,"maxFiles":0,"ignorePatterns":0,"hasFileFilter":false}}}

stdout | packages/backend/__tests__/utils/fileSystem.test.ts > File System Utilities > extractDirectoryInfo > should extract directory information from traversal result
{"timestamp":"2025-09-15 22:48:16.566","level":"INFO","component":"filesystem","requestId":"60cb9f85-783b-4b3f-832d-5a72ccb4b01f","message":"Directory traversal completed","metadata":{"path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994496484","filesFound":7,"directoriesFound":6,"totalSize":141,"skippedFiles":0,"duration":"36ms"}}
{"timestamp":"2025-09-15 22:48:16.566","level":"INFO","component":"filesystem","requestId":"d5beec15-1cfb-42a1-82aa-778909a20899","message":"Performance: directory_traversal","metadata":{"duration":"36ms","path":"C:\\Users\\AlexJ\\AppData\\Local\\Temp\\repo-analyzer-test-1757994496484","filesCount":7,"directoriesCount":6,"totalSizeBytes":141}}

stdout | packages/backend/src/api/__tests__/websocket.test.ts > WebSocket Tests > should register for analysis updates
Client RE9vG-ZcCPS3P2aLAAAB registered for analysis test-analysis

 ✓ packages/backend/__tests__/utils/fileSystem.test.ts (14 tests) 1831ms
   ✓ File System Utilities > readFileWithErrorHandling > should throw FileSystemError for non-existent file  404ms
stdout | packages/backend/src/api/__tests__/websocket.test.ts > WebSocket Tests > should receive analysis progress updates
Client RE9vG-ZcCPS3P2aLAAAB registered for analysis test-analysis

stdout | packages/backend/src/api/__tests__/websocket.test.ts > WebSocket Tests > should receive analysis completion notification
Client RE9vG-ZcCPS3P2aLAAAB registered for analysis test-analysis

stdout | packages/backend/src/api/__tests__/websocket.test.ts > WebSocket Tests
Client disconnected: RE9vG-ZcCPS3P2aLAAAB

 ✓ packages/backend/src/core/__tests__/IndexSystem.relationship.test.ts (13 tests) 516ms
   ✓ IndexSystem Relationship Functionality > suggestCombinations > should limit suggestions to top 10  448ms
 ✓ packages/backend/src/api/__tests__/websocket.test.ts (4 tests) 777ms
 ✓ packages/backend/src/services/__tests__/path-handler.service.test.ts (55 tests) 500ms
 ✓ packages/backend/src/api/__tests__/path-integration.test.ts (26 tests) 719ms
 ✓ packages/backend/src/providers/__tests__/ProviderRegistry.test.ts (23 tests) 380ms
 ✓ packages/backend/src/api/routes/__tests__/providers.models.test.ts (11 tests) 361ms
stdout | packages/backend/src/core/__tests__/IndexSystem.test.ts > IndexSystem > searchRepositories > should search repositories by language
[DEBUG] Starting search with query: {
  "languages": [
    "TypeScript"
  ]
}
[DEBUG] Total repositories in index: 4
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'JavaScript', 'TypeScript' ],
  frameworks: [ 'React', 'Redux' ],
  tags: [
    'lang:JavaScript',
    'lang:TypeScript',
    'framework:React',
    'framework:Redux',
    'complexity:high'
  ]
}

stdout | packages/backend/src/core/__tests__/IndexSystem.test.ts > IndexSystem > searchRepositories > should search repositories by framework
[DEBUG] Starting search with query: {
  "frameworks": [
    "React"
  ]
}
[DEBUG] Total repositories in index: 4
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'JavaScript', 'TypeScript' ],
  frameworks: [ 'React', 'Redux' ],
  tags: [
    'lang:JavaScript',
    'lang:TypeScript',
    'framework:React',
    'framework:Redux',
    'complexity:high'
  ]
}

stdout | packages/backend/src/core/__tests__/IndexSystem.test.ts > IndexSystem > searchRepositories > should search repositories by keyword
[DEBUG] Starting search with query: {
  "keywords": [
    "api"
  ]
}
[DEBUG] Total repositories in index: 4
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'JavaScript', 'TypeScript' ],
  frameworks: [ 'React', 'Redux' ],
  tags: [
    'lang:JavaScript',
    'lang:TypeScript',
    'framework:React',
    'framework:Redux',
    'complexity:high'
  ]
}

stdout | packages/backend/src/core/__tests__/IndexSystem.test.ts > IndexSystem > searchRepositories > should combine multiple search criteria
[DEBUG] Starting search with query: {
  "languages": [
    "JavaScript"
  ],
  "frameworks": [
    "Express"
  ]
}
[DEBUG] Total repositories in index: 4
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'JavaScript', 'TypeScript' ],
  frameworks: [ 'React', 'Redux' ],
  tags: [
    'lang:JavaScript',
    'lang:TypeScript',
    'framework:React',
    'framework:Redux',
    'complexity:high'
  ]
}

 ✓ packages/backend/src/core/__tests__/IndexSystem.test.ts (17 tests) 197ms
 ✓ packages/backend/src/services/__tests__/logger-http.service.test.ts (11 tests) 73ms
 ✓ packages/backend/src/providers/__tests__/MockProvider.test.ts (11 tests) 140ms
 ✓ packages/backend/src/providers/__tests__/ProviderRegistry.enhanced.test.ts (21 tests) 258ms
stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Configuration > should initialize with default cache configuration
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.807Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Configuration > should allow custom cache configuration  
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.825Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Configuration > should disable caching when configured   
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.830Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Configuration > should disable caching when configured   
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.831Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Operations > should cache path validations for existing paths
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.862Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Operations > should not cache failed validations
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.864Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Operations > should generate different cache keys for different paths
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.870Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Operations > should generate same cache key for same path with same options
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.874Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Invalidation > should clear all cache entries
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.880Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Invalidation > should clear all cache entries
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.881Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Invalidation > should invalidate specific path
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.885Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Invalidation > should invalidate paths by pattern        
info: Invalidated 3 cache entries matching pattern: .* {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.892Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Invalidation > should invalidate paths by pattern        
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.893Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Performance Monitoring > should track hit rate correctly 
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.897Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Performance Monitoring > should track average validation time
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.932Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Performance Monitoring > should perform cache maintenance
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.936Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Warm-up > should warm up cache with provided paths       
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.942Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Warm-up > should handle warm-up failures gracefully      
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.948Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Warm-up > should skip warm-up when caching is disabled   
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.950Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Warm-up > should skip warm-up when caching is disabled   
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.950Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Memory Management > should estimate memory usage
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.953Z"}

stdout | packages/backend/src/services/__tests__/path-handler-cache.test.ts > PathHandler Caching > Cache Memory Management > should respect maximum cache size    
info: Cache cleared {"service":"unified-repo-analyzer-backend","timestamp":"2025-09-16T03:48:20.969Z"}

 ✓ packages/backend/src/services/__tests__/path-handler-cache.test.ts (18 tests) 184ms
 ✓ packages/backend/src/api/routes/__tests__/openrouter-integration.test.ts (7 tests) 259ms
 ✓ packages/backend/src/services/__tests__/relationship.service.test.ts (11 tests) 123ms
 ✓ packages/shared/__tests__/configuration-manager.test.ts (29 tests) 83ms
stdout | packages/backend/src/services/__tests__/logger.service.test.ts > Logger Service > Logging Methods > should log debug messages with structured format      
{"timestamp":"2025-09-15 22:48:22.194","level":"DEBUG","component":"test-component","requestId":"test-request-id","message":"Debug message","metadata":{"key":"value"}}

stdout | packages/backend/src/services/__tests__/logger.service.test.ts > Logger Service > Logging Methods > should log info messages with metadata
{"timestamp":"2025-09-15 22:48:22.200","level":"INFO","component":"test-component","requestId":"test-request-123","message":"Info message","metadata":{"operation":"test","duration":100}}

stdout | packages/backend/src/services/__tests__/logger.service.test.ts > Logger Service > Logging Methods > should log warning messages
{"timestamp":"2025-09-15 22:48:22.204","level":"WARN","component":"test-component","requestId":"test-request-123","message":"Warning message","metadata":{"warning":"test warning"}}

stdout | packages/backend/src/services/__tests__/logger.service.test.ts > Logger Service > Logging Methods > should log error messages with error objects
{"timestamp":"2025-09-15 22:48:22.224","level":"ERROR","component":"test-component","requestId":"test-request-123","message":"Error message","metadata":{"context":"test"},"error":{"name":"Error","message":"Test error","stack":"Error: Test error\n    at C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\logger.service.test.ts:114:21\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26\n    at file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20\n    at new Promise (<anonymous>)\n    at runWithTimeout (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)\n    at runTest (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)\n    at runSuite (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)\n    at runSuite (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)\n    at runSuite (file:///C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)"}}

stdout | packages/backend/src/services/__tests__/logger.service.test.ts > Logger Service > Data Sanitization > should redact sensitive data when enabled
{"timestamp":"2025-09-15 22:48:22.232","level":"INFO","component":"unified-repo-analyzer","requestId":"test-request-123","message":"Test message","metadata":{"username":"testuser","password":"[REDACTED]","apiKey":"[REDACTED]","token":"[REDACTED]","normalData":"normal-value"}}

stdout | packages/backend/src/services/__tests__/logger.service.test.ts > Logger Service > Data Sanitization > should not redact data when disabled
{"timestamp":"2025-09-15 22:48:22.237","level":"INFO","component":"unified-repo-analyzer","requestId":"test-request-123","message":"Test message","metadata":{"password":"secret123","normalData":"normal-value"}}

(node:3040) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added to [process]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3040) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unhandledRejection listeners added to [process]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
 ✓ packages/backend/src/services/__tests__/logger.service.test.ts (13 tests) 117ms
 ✓ packages/backend/src/core/__tests__/AnalysisEngine.batch.fixed.test.ts (17 tests) 156ms
 ✓ packages/backend/src/core/__tests__/advancedAnalyzer.test.ts (20 tests) 104ms
stdout | packages/backend/src/services/__tests__/logger-outputs.service.test.ts > Logger Output Destinations > Multiple Outputs > should log to multiple destinations
{"timestamp":"2025-09-15 22:48:22.505","level":"INFO","component":"unified-repo-analyzer","requestId":"5141ef48-2cfb-4a03-a180-f215fa82026a","message":"Test message for multiple outputs","metadata":{"test":"data"}}
{"timestamp":"2025-09-15 22:48:22.507","level":"\u001b[32MINFO\u001b[39M","component":"unified-repo-analyzer","requestId":"93ecb39a-b022-44f1-9d3d-58af80dd7ac3","message":"Test message for multiple outputs","metadata":{"test":"data"}}

stdout | packages/backend/src/services/__tests__/logger-outputs.service.test.ts > Logger Output Destinations > Format Configuration > should log in different formats
{"timestamp":"2025-09-15 22:48:22.528","level":"INFO","component":"unified-repo-analyzer","requestId":"fbe9af92-3bc0-421f-b67f-b082ad00cf62","message":"JSON format test"}
2025-09-15 22:48:22.529 [INFO] [unified-repo-analyzer] [72321a79-3f09-4860-9e5f-64700c104c9e]: TEXT format test

stdout | packages/backend/src/services/__tests__/logger-outputs.service.test.ts > Logger Output Destinations > Log Level Configuration > should log at appropriate levels
{"timestamp":"2025-09-15 22:48:22.537","level":"WARN","component":"unified-repo-analyzer","requestId":"4c26b7b4-e2e3-4720-b3c9-d32c569f4186","message":"Warning message"}
{"timestamp":"2025-09-15 22:48:22.537","level":"ERROR","component":"unified-repo-analyzer","requestId":"52075fb6-049d-43fa-b347-03b6cb1eb03f","message":"Error message"}

(node:3040) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 uncaughtException listeners added to [process]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
(Use `node --trace-warnings ...` to show where the warning was created)
(node:3040) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unhandledRejection listeners added to [process]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
 ✓ packages/backend/src/services/__tests__/logger-outputs.service.test.ts (14 tests) 85ms
 ✓ packages/backend/src/core/__tests__/codeStructureAnalyzer.test.ts (10 tests) 71ms
 ✓ packages/cli/src/__tests__/cli-integration.test.ts (4 tests) 21ms
 ✓ packages/frontend/src/services/__tests__/errorMessages.test.ts (33 tests) 75ms
 ✓ packages/backend/src/services/__tests__/export.service.test.ts (12 tests) 101ms
 ✓ packages/backend/src/services/__tests__/error-message.service.test.ts (33 tests) 104ms
 ✓ packages/backend/src/services/__tests__/config.service.basic.test.ts (5 tests) 42ms
stderr | packages/cli/src/__tests__/utils.test.ts > CLI Utilities Tests > Mock Function Behavior > should create and use mock functions
Promise returned by `expect(actual).resolves.toBe(expected)` was not awaited. Vitest currently auto-awaits hanging assertions at the end of the test, but this will cause the test to fail in Vitest 3. Please remember to await the assertion.
    at C:/Users/AlexJ/Documents/Coding/Repos/my-repos/myRepoAnalyzer/unified-repo-analyzer/packages/cli/src/__tests__/utils.test.ts:71:31

 ✓ packages/cli/src/__tests__/utils.test.ts (7 tests) 69ms
 ✓ packages/backend/src/core/__tests__/analysisEngine.advanced.fixed.test.ts (22 tests) 57ms
 ✓ packages/frontend/src/utils/__tests__/errorHandling.test.ts (27 tests) 36ms
 ✓ packages/backend/__tests__/utils/fileImportance.test.ts (15 tests) 33ms
 ✓ packages/shared/__tests__/validation/schemas.test.ts (9 tests) 37ms
 ✓ packages/backend/src/services/__tests__/error-message.service.fixed.test.ts (11 tests) 46ms
stdout | packages/backend/src/__tests__/file-type-filtering.test.ts > File Type Filtering > should find repositories with .js files
[DEBUG] Starting search with query: {
  "fileTypes": [
    ".js"
  ]
}
[DEBUG] Total repositories in index: 3
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'javascript', 'typescript' ],
  frameworks: [ 'react' ],
  tags: [ 'react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx' ]
}
[DEBUG] Filtering by file types: [ '.js' ]
[DEBUG] Available repositories: 3
[DEBUG] No file type match for repo python-api. Languages: [ 'python' ]
[DEBUG] Repositories after file type filter: 2
[DEBUG] Adding file type matches for react-app: [ '.js' ]
[DEBUG] Adding file type matches for node-server: [ '.js' ]

stdout | packages/backend/src/__tests__/file-type-filtering.test.ts > File Type Filtering > should find repositories with .ts files
[DEBUG] Starting search with query: {
  "fileTypes": [
    ".ts"
  ]
}
[DEBUG] Total repositories in index: 3
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'javascript', 'typescript' ],
  frameworks: [ 'react' ],
  tags: [ 'react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx' ]
}
[DEBUG] Filtering by file types: [ '.ts' ]
[DEBUG] Available repositories: 3
[DEBUG] No file type match for repo python-api. Languages: [ 'python' ]
[DEBUG] No file type match for repo node-server. Languages: [ 'javascript' ]
[DEBUG] Repositories after file type filter: 1
[DEBUG] Adding file type matches for react-app: [ '.ts' ]

stdout | packages/backend/src/__tests__/file-type-filtering.test.ts > File Type Filtering > should find repositories with .py files
[DEBUG] Starting search with query: {
  "fileTypes": [
    ".py"
  ]
}
[DEBUG] Total repositories in index: 3
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'javascript', 'typescript' ],
  frameworks: [ 'react' ],
  tags: [ 'react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx' ]
}
[DEBUG] Filtering by file types: [ '.py' ]
[DEBUG] Available repositories: 3
[DEBUG] No file type match for repo react-app. Languages: [ 'javascript', 'typescript' ]
[DEBUG] No file type match for repo node-server. Languages: [ 'javascript' ]
[DEBUG] Repositories after file type filter: 1
[DEBUG] Adding file type matches for python-api: [ '.py' ]

stdout | packages/backend/src/__tests__/file-type-filtering.test.ts > File Type Filtering > should find repositories with .jsx files
[DEBUG] Starting search with query: {
  "fileTypes": [
    ".jsx"
  ]
}
[DEBUG] Total repositories in index: 3
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'javascript', 'typescript' ],
  frameworks: [ 'react' ],
  tags: [ 'react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx' ]
}
[DEBUG] Filtering by file types: [ '.jsx' ]
[DEBUG] Available repositories: 3
[DEBUG] No file type match for repo python-api. Languages: [ 'python' ]
[DEBUG] Repositories after file type filter: 2
[DEBUG] Adding file type matches for react-app: [ '.jsx' ]
[DEBUG] Adding file type matches for node-server: [ '.jsx' ]

stdout | packages/backend/src/__tests__/file-type-filtering.test.ts > File Type Filtering > should find repositories with multiple file types
[DEBUG] Starting search with query: {
  "fileTypes": [
    ".js",
    ".ts"
  ]
}
[DEBUG] Total repositories in index: 3
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'javascript', 'typescript' ],
  frameworks: [ 'react' ],
  tags: [ 'react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx' ]
}
[DEBUG] Filtering by file types: [ '.js', '.ts' ]
[DEBUG] Available repositories: 3
[DEBUG] No file type match for repo python-api. Languages: [ 'python' ]
[DEBUG] Repositories after file type filter: 2
[DEBUG] Adding file type matches for react-app: [ '.js', '.ts' ]
[DEBUG] Adding file type matches for node-server: [ '.js' ]

stdout | packages/backend/src/__tests__/file-type-filtering.test.ts > File Type Filtering > should assign correct scores for file type matches
[DEBUG] Starting search with query: {
  "fileTypes": [
    ".js",
    ".ts"
  ]
}
[DEBUG] Total repositories in index: 3
[DEBUG] Sample repository structure: {
  name: 'react-app',
  languages: [ 'javascript', 'typescript' ],
  frameworks: [ 'react' ],
  tags: [ 'react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx' ]
}
[DEBUG] Filtering by file types: [ '.js', '.ts' ]
[DEBUG] Available repositories: 3
[DEBUG] No file type match for repo python-api. Languages: [ 'python' ]
[DEBUG] Repositories after file type filter: 2
[DEBUG] Adding file type matches for react-app: [ '.js', '.ts' ]
[DEBUG] Adding file type matches for node-server: [ '.js' ]

 ✓ packages/backend/src/__tests__/file-type-filtering.test.ts (6 tests) 87ms
 ✓ packages/shared/__tests__/validation/validators.test.ts (7 tests) 47ms
 ✓ packages/backend/src/core/__tests__/advancedAnalyzer.fixed.test.ts (14 tests) 48ms
 ✓ packages/backend/src/providers/__tests__/GeminiProvider.test.ts (11 tests) 41ms
 ✓ packages/backend/src/core/__tests__/tokenAnalyzer.test.ts (10 tests) 37ms
 ✓ packages/backend/src/services/__tests__/config.service.simple.test.ts (5 tests) 50ms
 ✓ packages/backend/src/providers/__tests__/LLMProvider.test.ts (7 tests) 20ms
 ✓ packages/cli/src/utils/__tests__/config.test.ts (5 tests) 31ms
 ✓ packages/backend/src/__tests__/test-simple.test.ts (1 test) 10ms
stdout | packages/frontend/src/components/analysis/__tests__/environment.test.ts > Environment Test > should show current environment
Environment check:
typeof document: undefined
typeof window: undefined
typeof globalThis: object
process.env.NODE_ENV: test
document is NOT available
window is NOT available

 ✓ packages/frontend/src/components/analysis/__tests__/environment.test.ts (1 test) 13ms
 ✓ packages/backend/src/core/__tests__/AnalysisEngine.fixed.test.ts (13 tests) 42ms
 ✓ packages/backend/src/__tests__/simple-test.test.ts (1 test) 9ms
 ✓ packages/backend/src/api/routes/__tests__/providers-integration.test.ts (6 tests) 19ms
 ✓ packages/frontend/src/components/analysis/__tests__/simple.test.ts (2 tests) 10ms
stdout | packages/frontend/src/components/analysis/__tests__/setup-test.test.ts > Setup Test > should have JSDOM globals after setup
After setup import:
typeof document: object
typeof window: object

 ✓ packages/frontend/src/components/analysis/__tests__/setup-test.test.ts (1 test) 8ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 142 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  packages/shared/__tests__/error-classification.test.ts > Error Classification System > ErrorClassifier > classifyError > should generate unique IDs and correlation IDs
TypeError: Cannot read properties of undefined (reading 'correlationId')
 ❯ ErrorClassifier.classifyError packages/shared/src/utils/error-classifier.ts:55:31
     53|       const originalError = typeof error === 'string' ? undefined : error;
     54|
     55|       // Generate unique identifiers
       |                               ^
     56|       const errorId = randomUUID();
     57|       const correlationId = context.correlationId || context.requestId || randomUUID();
 ❯ packages/shared/__tests__/error-classification.test.ts:132:40

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/142]⎯

 FAIL  packages/shared/__tests__/error-classification.test.ts > Error Classification System > ErrorClassifier > classifyError > should link parent and child errors
TypeError: Cannot read properties of undefined (reading 'correlationId')
 ❯ ErrorClassifier.classifyError packages/shared/src/utils/error-classifier.ts:55:31
     53|       const originalError = typeof error === 'string' ? undefined : error;
     54|
     55|       // Generate unique identifiers
       |                               ^
     56|       const errorId = randomUUID();
     57|       const correlationId = context.correlationId || context.requestId || randomUUID();
 ❯ packages/shared/__tests__/error-classification.test.ts:150:45

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/142]⎯

 FAIL  packages/shared/__tests__/error-classification.test.ts > Error Classification System > ErrorClassifier > getErrorStatistics > should filter statistics by time range
TypeError: Cannot read properties of undefined (reading 'correlationId')
 ❯ ErrorClassifier.classifyError packages/shared/src/utils/error-classifier.ts:55:31
     53|       const originalError = typeof error === 'string' ? undefined : error;
     54|
     55|       // Generate unique identifiers
       |                               ^
     56|       const errorId = randomUUID();
     57|       const correlationId = context.correlationId || context.requestId || randomUUID();
 ❯ packages/shared/__tests__/error-classification.test.ts:220:25

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/142]⎯

 FAIL  packages/shared/__tests__/error-classification.test.ts > Error Classification System > ErrorClassifier > resolveError > should mark error as resolved       
TypeError: Cannot read properties of undefined (reading 'correlationId')
 ❯ ErrorClassifier.classifyError packages/shared/src/utils/error-classifier.ts:55:31
     53|       const originalError = typeof error === 'string' ? undefined : error;
     54|
     55|       // Generate unique identifiers
       |                               ^
     56|       const errorId = randomUUID();
     57|       const correlationId = context.correlationId || context.requestId || randomUUID();
 ❯ packages/shared/__tests__/error-classification.test.ts:277:44

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/142]⎯

 FAIL  packages/shared/__tests__/error-classification.test.ts > Error Classification System > ErrorFormatter > createUserFriendlyMessage > should fall back to original message for unknown errors
TypeError: Cannot read properties of undefined (reading 'correlationId')
 ❯ ErrorClassifier.classifyError packages/shared/src/utils/error-classifier.ts:55:31
     53|       const originalError = typeof error === 'string' ? undefined : error;
     54|
     55|       // Generate unique identifiers
       |                               ^
     56|       const errorId = randomUUID();
     57|       const correlationId = context.correlationId || context.requestId || randomUUID();
 ❯ packages/shared/__tests__/error-classification.test.ts:428:46

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/142]⎯

 FAIL  packages/backend/src/__tests__/logging-integration.test.ts > Logging Integration Tests > LLM Provider Logging > should log LLM provider interactions        
AssertionError: expected "info" to be called with arguments: [ Array(4) ]

Number of calls: 0

 ❯ packages/backend/src/__tests__/logging-integration.test.ts:353:22
    351| 
    352|       // Verify LLM start logging
    353|       expect(logSpy).toHaveBeenCalledWith(
       |                      ^
    354|         'Starting Claude LLM analysis',
    355|         expect.objectContaining({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/142]⎯

 FAIL  packages/backend/src/__tests__/logging-integration.test.ts > Logging Integration Tests > LLM Provider Logging > should log LLM provider errors with classification
AssertionError: expected "error" to be called with arguments: [ …(5) ]

Number of calls: 0

 ❯ packages/backend/src/__tests__/logging-integration.test.ts:426:24
    424|
    425|       // Verify error logging occurred
    426|       expect(errorSpy).toHaveBeenCalledWith(
       |                        ^
    427|         'Claude API authentication failed',
    428|         expect.objectContaining({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/142]⎯

 FAIL  packages/backend/src/__tests__/platform-integration.test.ts > Platform-Specific Integration Tests > Windows Path Handling > should handle Windows backslash paths correctly
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ packages/backend/src/__tests__/platform-integration.test.ts:49:30
     47|
     48|       expect(result.normalizedPath).toBe('C:\\Users\\TestUser\\Documents\\Project');
     49|       expect(result.isValid).toBe(false); // Path doesn't exist, but format should be valid
       |                              ^
     50|       expect(result.errors.length).toBe(0); // No format errors
     51|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/142]⎯

 FAIL  packages/backend/src/__tests__/platform-integration.test.ts > Platform-Specific Integration Tests > Windows Path Handling > should validate Windows drive letters correctly
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ packages/backend/src/__tests__/platform-integration.test.ts:74:78
     72|       for (const invalidPath of invalidPaths) {
     73|         const result = await pathHandler.validatePath(invalidPath);
     74|         expect(result.errors.some((e) => e.code === 'INVALID_DRIVE_LETTER')).toBe(true);
       |                                                                              ^
     75|       }
     76|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/142]⎯

 FAIL  packages/backend/src/__tests__/platform-integration.test.ts > Platform-Specific Integration Tests > Windows Path Handling > should validate UNC paths correctly
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ packages/backend/src/__tests__/platform-integration.test.ts:98:5
     96|     });
     97|
     98|     it('should validate UNC paths correctly', async () => {
       |     ^
     99|       const validUNCPaths = ['\\\\server\\share\\folder', '\\\\192.168.1.100\\shared\\documents'];
    100|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/142]⎯

 FAIL  packages/backend/src/__tests__/platform-integration.test.ts > Platform-Specific Integration Tests > End-to-End User Workflow Tests > should handle network path scenarios
AssertionError: expected undefined to be defined
 ❯ packages/backend/src/__tests__/platform-integration.test.ts:460:39
    458|           console.log(`Path: ${networkPath}, Errors:`, result.errors);
    459|         }
    460|         expect(result.normalizedPath).toBeDefined();
       |                                       ^
    461|
    462|         // Should not have UNC format errors for valid UNC paths

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Performance Service > should collect navigation timing correctly
ReferenceError: window is not defined
 ❯ packages/frontend/src/test/performance.test.ts:43:7
     41|     it('should collect navigation timing correctly', () => {
     42|       // Ensure window.performance exists and has timing data
     43|       if (!window.performance) {
       |       ^
     44|         Object.defineProperty(window, 'performance', {
     45|           value: {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Performance Service > should track component render performance
AssertionError: expected 0 to be greater than 0
 ❯ packages/frontend/src/test/performance.test.ts:88:40
     86|
     87|       const stats = performanceService.getStats();
     88|       expect(stats.interactions.total).toBeGreaterThan(0);
       |                                        ^
     89|     });
     90|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Lazy Loading Performance > should handle large datasets efficiently
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/test/performance.test.ts:113:26
    111|       });
    112|
    113|       const { result } = renderHook(() =>
       |                          ^
    114|         useLazyLoading(mockLoadFunction, { pageSize, initialLoad: true })
    115|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Lazy Loading Performance > should handle virtual scrolling efficiently        
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/test/performance.test.ts:147:26
    145|       }));
    146|
    147|       const { result } = renderHook(() => useVirtualScrolling(items, 50, 500, 5));
       |                          ^
    148|
    149|       const startTime = performance.now();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Performance Optimization Hooks > should debounce function calls effectively   
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/test/performance.test.ts:172:26
    170|       });
    171|
    172|       const { result } = renderHook(() => useDebounce(mockFunction, 100));
       |                          ^
    173|
    174|       // Call multiple times rapidly

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Performance Optimization Hooks > should throttle function calls effectively   
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/test/performance.test.ts:202:26
    200|       });
    201|
    202|       const { result } = renderHook(() => useThrottle(mockFunction, 100));
       |                          ^
    203|
    204|       const startTime = performance.now();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Performance Optimization Hooks > should measure render performance accurately 
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/test/performance.test.ts:227:26
    225|       const props = { test: true };
    226|
    227|       const { result } = renderHook(() => useRenderPerformance(componentName, props));
       |                          ^
    228|
    229|       const startTime = performance.now();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/142]⎯

 FAIL  packages/frontend/src/test/performance.test.ts > Frontend Performance Tests > Memory Usage > should not leak memory during repeated operations
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ packages/frontend/src/test/performance.test.ts:296:5
    294|
    295|   describe('Memory Usage', () => {
    296|     it('should not leak memory during repeated operations', () => {
       |     ^
    297|       const initialMemory =
    298|         (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Windows Path Format Analysis > should analyze repository with Windows backslash path
AssertionError: expected { …(17) } to have property "files"
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:122:31
    120|         expect(response.body).toHaveProperty('name');
    121|         expect(response.body).toHaveProperty('path');
    122|         expect(response.body).toHaveProperty('files');
       |                               ^
    123|         expect(response.body.files).toBeInstanceOf(Array);
    124|         expect(response.body.files.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Windows Path Format Analysis > should analyze repository with Windows forward slash path
AssertionError: expected { …(17) } to have property "files"
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:155:31
    153|       if (response.status === 200) {
    154|         expect(response.body).toHaveProperty('id');
    155|         expect(response.body).toHaveProperty('files');
       |                               ^
    156|
    157|         // Should detect JavaScript files

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Batch Analysis with Mixed Path Formats > should handle batch analysis with mixed valid and invalid paths
Error: expected 200 "OK", got 500 "Internal Server Error"
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:335:10
    333|           },
    334|         })
    335|         .expect(200);
       |          ^
    336|
    337|       expect(response.body).toHaveProperty('pathValidation');
 ❯ Test._assertStatus node_modules/supertest/lib/test.js:309:14
 ❯ node_modules/supertest/lib/test.js:365:13
 ❯ Test._assertFunction node_modules/supertest/lib/test.js:342:13
 ❯ Test.assert node_modules/supertest/lib/test.js:195:23
 ❯ localAssert node_modules/supertest/lib/test.js:138:14
 ❯ Server.<anonymous> node_modules/supertest/lib/test.js:152:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Batch Analysis with Mixed Path Formats > should normalize paths consistently in batch analysis
Error: expected 200 "OK", got 500 "Internal Server Error"
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:373:10
    371|           },
    372|         })
    373|         .expect(200);
       |          ^
    374|
    375|       expect(response.body).toHaveProperty('pathValidation');
 ❯ Test._assertStatus node_modules/supertest/lib/test.js:309:14
 ❯ node_modules/supertest/lib/test.js:365:13
 ❯ Test._assertFunction node_modules/supertest/lib/test.js:342:13
 ❯ Test.assert node_modules/supertest/lib/test.js:195:23
 ❯ localAssert node_modules/supertest/lib/test.js:138:14
 ❯ Server.<anonymous> node_modules/supertest/lib/test.js:152:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Performance and Reliability > should complete analysis within reasonable time
AssertionError: expected { analysisMode: 'quick', …(3) } to have property "analysisTime"
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:415:40
    413|       if (response.status === 200) {
    414|         expect(response.body).toHaveProperty('metadata');
    415|         expect(response.body.metadata).toHaveProperty('analysisTime');
       |                                        ^
    416|         expect(response.body.metadata.analysisTime).toBeGreaterThan(0);
    417|       }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Performance and Reliability > should provide consistent results for same repository
TypeError: Cannot read properties of undefined (reading 'length')
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:470:36
    468|       if (request1.status === 200 && request2.status === 200) {
    469|         // Should have same number of files
    470|         expect(request1.body.files.length).toBe(request2.body.files.length);
       |                                    ^
    471|
    472|         // Should have same languages detected

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Path Validation Integration > should validate path before starting analysis
AssertionError: expected { …(17) } to have property "files"
 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:511:39
    509|         // Analysis should succeed since validation passed
    510|         expect(analysisResponse.body).toHaveProperty('id');
    511|         expect(analysisResponse.body).toHaveProperty('files');
       |                                       ^
    512|       }
    513|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[26/142]⎯

 FAIL  packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts > Complete Analysis Workflow Integration Tests > Path Validation Integration > should provide consistent error messages between validation and analysis
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ packages/backend/src/api/__tests__/analyze-workflow.integration.test.ts:524:47
    522|         .expect(200);
    523|
    524|       expect(validationResponse.body.isValid).toBe(false);
       |                                               ^
    525|
    526|       // Try to analyze the same invalid path

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[27/142]⎯

 FAIL  packages/backend/src/api/__tests__/api-fixed.test.ts > Fixed API Integration Tests > Health Check > should return status ok
AssertionError: expected 503 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 503

 ❯ packages/backend/src/api/__tests__/api-fixed.test.ts:160:31
    158|     it('should return status ok', async () => {
    159|       const response = await request(app).get('/health');
    160|       expect(response.status).toBe(200);
       |                               ^
    161|       expect(response.body).toHaveProperty('status');
    162|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[28/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.simple.test.ts > API Simple Integration Tests > Health Check > should return health status
Error: expected 200 "OK", got 503 "Service Unavailable"
 ❯ packages/backend/src/api/__tests__/api.simple.test.ts:21:58
     19|     it('should return health status', async () => {
     20|       const app = getTestApp();
     21|       const response = await request(app).get('/health').expect(200);
       |                                                          ^
     22|
     23|       expect(response.body).toHaveProperty('status');
 ❯ Test._assertStatus node_modules/supertest/lib/test.js:309:14
 ❯ node_modules/supertest/lib/test.js:365:13
 ❯ Test._assertFunction node_modules/supertest/lib/test.js:342:13
 ❯ Test.assert node_modules/supertest/lib/test.js:195:23
 ❯ localAssert node_modules/supertest/lib/test.js:138:14
 ❯ Server.<anonymous> node_modules/supertest/lib/test.js:152:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[29/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Health Check > should return status ok
TypeError: vi.mocked(...).mockResolvedValue is not a function
 ❯ packages/backend/src/api/__tests__/api.test.ts:113:31
    111|     it('should return status ok', async () => {
    112|       // Mock fs.writeFile to succeed for health check
    113|       vi.mocked(fs.writeFile).mockResolvedValue(undefined as any);
       |                               ^
    114|       vi.mocked(fs.unlink).mockResolvedValue(undefined as any);
    115|       vi.mocked(fs.stat).mockResolvedValue({} as any);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[30/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Analysis > should analyze a repository
AssertionError: expected 404 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 404

 ❯ packages/backend/src/api/__tests__/api.test.ts:185:31
    183|         });
    184|
    185|       expect(response.status).toBe(200);
       |                               ^
    186|       expect(response.body).toEqual(mockAnalysis);
    187|       expect(mockAnalysisEngine.analyzeRepository).toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[31/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Analysis > should analyze multiple repositories
AssertionError: expected 400 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 400

 ❯ packages/backend/src/api/__tests__/api.test.ts:321:31
    319|         });
    320|
    321|       expect(response.status).toBe(200);
       |                               ^
    322|       expect(response.body).toEqual(mockBatchResult);
    323|       expect(mockAnalysisEngine.analyzeMultipleRepositories).toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[32/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Management > should get all repositories
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ packages/backend/src/api/__tests__/api.test.ts:372:31
    370|       const response = await request(app).get('/api/repositories');
    371|
    372|       expect(response.status).toBe(200);
       |                               ^
    373|       expect(response.body).toEqual(mockRepositories);
    374|       expect(mockIndexSystem.getIndex).toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[33/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Management > should get a repository by ID
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ packages/backend/src/api/__tests__/api.test.ts:402:31
    400|       const response = await request(app).get('/api/repositories/123');
    401|
    402|       expect(response.status).toBe(200);
       |                               ^
    403|       expect(response.body).toEqual(mockRepository);
    404|       expect(mockIndexSystem.getIndex).toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[34/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Management > should return 404 for non-existent repository
AssertionError: expected 500 to be 404 // Object.is equality

- Expected
+ Received

- 404
+ 500

 ❯ packages/backend/src/api/__tests__/api.test.ts:418:31
    416|       const response = await request(app).get('/api/repositories/999');
    417|
    418|       expect(response.status).toBe(404);
       |                               ^
    419|       expect(response.body).toHaveProperty('error');
    420|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[35/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Management > should search repositories
AssertionError: expected 400 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 400

 ❯ packages/backend/src/api/__tests__/api.test.ts:464:31
    462|         });
    463|
    464|       expect(response.status).toBe(200);
       |                               ^
    465|       expect(response.body).toEqual(mockSearchResults);
    466|       expect(mockAnalysisEngine.searchRepositories).toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[36/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Management > should find similar repositories
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ packages/backend/src/api/__tests__/api.test.ts:500:31
    498|       const response = await request(app).get('/api/repositories/123/similar');
    499|
    500|       expect(response.status).toBe(200);
       |                               ^
    501|       expect(response.body).toEqual(mockSimilarRepositories);
    502|       expect(mockAnalysisEngine.findSimilarRepositories).toHaveBeenCalledWith('123');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[37/142]⎯

 FAIL  packages/backend/src/api/__tests__/api.test.ts > API Integration Tests > Repository Management > should suggest combinations
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ packages/backend/src/api/__tests__/api.test.ts:525:31
    523|         });
    524|
    525|       expect(response.status).toBe(200);
       |                               ^
    526|       expect(response.body).toEqual(mockCombinations);
    527|       expect(mockAnalysisEngine.suggestCombinations).toHaveBeenCalledWith(['123', '124']);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[38/142]⎯

 FAIL  packages/backend/src/api/__tests__/batch-analyze.test.ts > Batch Analysis API > should return 400 for invalid request
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ packages/backend/src/api/__tests__/batch-analyze.test.ts:179:3
    177|   });
    178|
    179|   test('should return 400 for invalid request', async () => {
       |   ^
    180|     const response = await request(app)
    181|       .post('/api/analyze/batch')

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39/142]⎯

 FAIL  packages/backend/src/api/__tests__/batch-analyze.test.ts > Batch Analysis API > should analyze multiple repositories
AssertionError: expected 400 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 400

 ❯ packages/backend/src/api/__tests__/batch-analyze.test.ts:207:29
    205|       });
    206|
    207|     expect(response.status).toBe(200);
       |                             ^
    208|     expect(response.body).toBeDefined();
    209|     expect(response.body.repositories).toHaveLength(3);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[40/142]⎯

 FAIL  packages/backend/src/api/__tests__/batch-analyze.test.ts > Batch Analysis API > should handle errors during batch analysis
TypeError: Cannot read properties of undefined (reading 'mockRejectedValueOnce')
 ❯ packages/backend/src/api/__tests__/batch-analyze.test.ts:234:7
    232|         typeof vi.fn
    233|       >
    234|     ).mockRejectedValueOnce(new Error('Batch analysis failed'));
       |       ^
    235|
    236|     const response = await request(app)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[41/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Comprehensive Mode Analysis > should perform advanced analysis in comprehensive mode
TypeError: Cannot read properties of undefined (reading 'metadata')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:341:21
    339|
    340|       // Verify that advanced analysis was performed
    341|       expect(result.metadata.analysisMode).toBe('comprehensive');
       |                     ^
    342|
    343|       // Verify that security recommendations were added

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[42/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Comprehensive Mode Analysis > should not perform advanced analysis in quick mode
TypeError: Cannot read properties of undefined (reading 'metadata')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:367:21
    365|       const result = await engine.analyzeRepository('/test/repo', quickOptions);
    366|
    367|       expect(result.metadata.analysisMode).toBe('quick');
       |                     ^
    368|
    369|       // Should have fewer recommendations since advanced analysis is skipped

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[43/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Comprehensive Mode Analysis > should not perform advanced analysis in standard mode
TypeError: Cannot read properties of undefined (reading 'metadata')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:383:21
    381|       const result = await engine.analyzeRepository('/test/repo', standardOptions);
    382|
    383|       expect(result.metadata.analysisMode).toBe('standard');
       |                     ^
    384|
    385|       // Should have fewer recommendations since advanced analysis is skipped

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[44/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Security Integration > should add high-severity security issues to potential issues
TypeError: Cannot read properties of undefined (reading 'insights')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:402:37
    400|       const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
    401|
    402|       const securityIssues = result.insights.potentialIssues.filter((issue: string) =>
       |                                     ^
    403|         issue.startsWith('Security:')
    404|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[45/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Security Integration > should add security recommendations
TypeError: Cannot read properties of undefined (reading 'insights')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:427:38
    425|       const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
    426|
    427|       const recommendations = result.insights.recommendations;
       |                                      ^
    428|       expect(recommendations.some((rec: string) => rec.includes('helmet.js'))).toBe(true);
    429|       expect(recommendations.some((rec: string) => rec.includes('rate limiting'))).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[46/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Code Quality Integration > should add high-severity quality issues to potential issues
TypeError: Cannot read properties of undefined (reading 'insights')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:452:36
    450|       const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
    451|
    452|       const qualityIssues = result.insights.potentialIssues.filter((issue: string) =>
       |                                    ^
    453|         issue.startsWith('Quality:')
    454|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[47/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Code Quality Integration > should update complexity metrics
TypeError: Cannot read properties of undefined (reading 'codeAnalysis')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:494:21
    492| 
    493|       // The complexity should be updated by the advanced analyzer
    494|       expect(result.codeAnalysis.complexity.cyclomaticComplexity).toBeGreaterThan(1);
       |                     ^
    495|       expect(result.codeAnalysis.complexity.codeQuality).toBeDefined();
    496|       expect(['excellent', 'good', 'fair', 'poor']).toContain(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[48/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Architectural Pattern Integration > should detect and add architectural patterns
TypeError: Cannot read properties of undefined (reading 'codeAnalysis')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:570:21
    568|       const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
    569|
    570|       expect(result.codeAnalysis.patterns.length).toBeGreaterThan(0);
       |                     ^
    571|       const patternNames = result.codeAnalysis.patterns.map((p: { name: string }) => p.name);
    572|       expect(patternNames).toContain('Model-View-Controller (MVC)');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[49/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Architectural Pattern Integration > should add architectural recommendations
TypeError: Cannot read properties of undefined (reading 'insights')
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:638:38
    636|       const result = await engine.analyzeRepository('/test/repo', mockAnalysisOptions);
    637|
    638|       const recommendations = result.insights.recommendations;
       |                                      ^
    639|       expect(
    640|         recommendations.some(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[50/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Performance and Error Handling > should handle file read errors gracefully
AssertionError: expected undefined to be defined
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:654:22
    652|
    653|       // Should complete successfully despite file read errors
    654|       expect(result).toBeDefined();
       |                      ^
    655|       expect(result.metadata.analysisMode).toBe('comprehensive');
    656|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[51/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Performance and Error Handling > should handle malformed JSON in package.json
AssertionError: expected undefined to be defined
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:669:22
    667|
    668|       // Should complete successfully despite malformed package.json
    669|       expect(result).toBeDefined();
       |                      ^
    670|       expect(result.metadata.analysisMode).toBe('comprehensive');
    671|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[52/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Performance and Error Handling > should maintain performance with large repositories
AssertionError: expected undefined to be defined
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:746:22
    744|       // Should complete in reasonable time (less than 10 seconds for this test)
    745|       expect(endTime - startTime).toBeLessThan(10000);
    746|       expect(result).toBeDefined();
       |                      ^
    747|       expect(result.metadata.processingTime).toBeGreaterThan(0);
    748|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[53/142]⎯

 FAIL  packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts > AnalysisEngine Advanced Features Integration > Batch Analysis with Advanced Features >
 should perform advanced analysis on multiple repositories
TypeError: Cannot read properties of undefined (reading 'languages')
 ❯ packages/backend/src/core/AnalysisEngine.ts:610:66
    608|   }> {
    609|     // Find common languages
    610|     const languageSets = repositories.map((repo) => new Set(repo.languages));
       |                                                                  ^
    611|     let commonLanguages: string[] = [];
    612|     if (languageSets.length > 0) {
 ❯ AnalysisEngine.generateCombinedInsights packages/backend/src/core/AnalysisEngine.ts:610:39
 ❯ AnalysisEngine.analyzeMultipleRepositories packages/backend/src/core/AnalysisEngine.ts:463:49
 ❯ packages/backend/src/core/__tests__/analysisEngine.advanced.test.ts:764:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[54/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts > AnalysisEngine - Batch Processing > should analyze multiple repositories
AssertionError: expected [] to have a length of 3 but got +0

- Expected
+ Received

- 3
+ 0

 ❯ packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts:109:33
    107|
    108|     expect(result).toBeDefined();
    109|     expect(result.repositories).toHaveLength(3);
       |                                 ^
    110|     expect(result.repositories[0].path).toBe('/path/to/repo1');
    111|     expect(result.repositories[1].path).toBe('/path/to/repo2');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[55/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts > AnalysisEngine - Batch Processing > should handle errors in repository analysis
AssertionError: expected [] to have a length of 2 but got +0

- Expected
+ Received

- 2
+ 0

 ❯ packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts:224:33
    222| 
    223|     expect(result).toBeDefined();
    224|     expect(result.repositories).toHaveLength(2);
       |                                 ^
    225|     expect(result.repositories[0].path).toBe('/path/to/repo1');
    226|     expect(result.repositories[1].path).toBe('/path/to/repo3');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[56/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts > AnalysisEngine - Batch Processing > should generate combined insights for multiple repositories
AssertionError: expected [] to have a length of 2 but got +0

- Expected
+ Received

- 2
+ 0

 ❯ packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts:336:33
    334|
    335|     expect(result).toBeDefined();
    336|     expect(result.repositories).toHaveLength(2);
       |                                 ^
    337|     expect(result.combinedInsights).toBeDefined();
    338|     expect(result.combinedInsights?.commonalities).toContain(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[57/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts > AnalysisEngine - Batch Processing > should analyze multiple repositories with queue      
AssertionError: expected [] to have a length of 3 but got +0

- Expected
+ Received

- 3
+ 0

 ❯ packages/backend/src/core/__tests__/AnalysisEngine.batch.test.ts:361:33
    359|
    360|     expect(result).toBeDefined();
    361|     expect(result.repositories).toHaveLength(3);
       |                                 ^
    362|     expect(progressCallback).toHaveBeenCalled();
    363|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[58/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > analyzeRepository > should analyze a repository
FileSystemError: Repository not found: C:\test\repo
 ❯ discoverRepository packages/backend/src/utils/repositoryDiscovery.ts:93:13
     91|   } catch (error) {
     92|     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
     93|       throw new FileSystemError(
       |             ^
     94|         `Repository not found: ${normalizedPath}`,
     95|         FileSystemErrorType.NOT_FOUND,
 ❯ packages/backend/src/core/AnalysisEngine.ts:179:26
 ❯ AnalysisEngine.analyzeRepository packages/backend/src/core/AnalysisEngine.ts:86:14
 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:138:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[59/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > analyzeMultipleRepositories > should analyze multiple repositories
AssertionError: expected [] to have a length of 2 but got +0

- Expected
+ Received

- 2
+ 0

 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:168:35
    166|
    167|       expect(result).toBeDefined();
    168|       expect(result.repositories).toHaveLength(2);
       |                                   ^
    169|       expect(result.repositories[0].name).toBe('test-repo');
    170|       expect(result.repositories[1].name).toBe('test-repo');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[60/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > analyzeMultipleRepositories > should handle errors in individual repositories
TypeError: mockDiscoverRepository2.mockClear is not a function
 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:180:30
    178|
    179|       // Reset the mock and set up different behaviors
    180|       mockDiscoverRepository.mockClear();
       |                              ^
    181|
    182|       // Make the second repository analysis fail

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[61/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > generateSynopsis > should generate JSON synopsis
FileSystemError: Repository not found: C:\test\repo
 ❯ discoverRepository packages/backend/src/utils/repositoryDiscovery.ts:93:13
     91|   } catch (error) {
     92|     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
     93|       throw new FileSystemError(
       |             ^
     94|         `Repository not found: ${normalizedPath}`,
     95|         FileSystemErrorType.NOT_FOUND,
 ❯ packages/backend/src/core/AnalysisEngine.ts:179:26
 ❯ AnalysisEngine.analyzeRepository packages/backend/src/core/AnalysisEngine.ts:86:14
 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:252:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[62/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > generateSynopsis > should generate Markdown synopsis
FileSystemError: Repository not found: C:\test\repo
 ❯ discoverRepository packages/backend/src/utils/repositoryDiscovery.ts:93:13
     91|   } catch (error) {
     92|     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
     93|       throw new FileSystemError(
       |             ^
     94|         `Repository not found: ${normalizedPath}`,
     95|         FileSystemErrorType.NOT_FOUND,
 ❯ packages/backend/src/core/AnalysisEngine.ts:179:26
 ❯ AnalysisEngine.analyzeRepository packages/backend/src/core/AnalysisEngine.ts:86:14
 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:273:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[63/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > generateSynopsis > should generate HTML synopsis
FileSystemError: Repository not found: C:\test\repo
 ❯ discoverRepository packages/backend/src/utils/repositoryDiscovery.ts:93:13
     91|   } catch (error) {
     92|     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
     93|       throw new FileSystemError(
       |             ^
     94|         `Repository not found: ${normalizedPath}`,
     95|         FileSystemErrorType.NOT_FOUND,
 ❯ packages/backend/src/core/AnalysisEngine.ts:179:26
 ❯ AnalysisEngine.analyzeRepository packages/backend/src/core/AnalysisEngine.ts:86:14
 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:292:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[64/142]⎯

 FAIL  packages/backend/src/core/__tests__/AnalysisEngine.test.ts > Analysis Engine > generateSynopsis > should throw error for unsupported format
FileSystemError: Repository not found: C:\test\repo
 ❯ discoverRepository packages/backend/src/utils/repositoryDiscovery.ts:93:13
     91|   } catch (error) {
     92|     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
     93|       throw new FileSystemError(
       |             ^
     94|         `Repository not found: ${normalizedPath}`,
     95|         FileSystemErrorType.NOT_FOUND,
 ❯ packages/backend/src/core/AnalysisEngine.ts:179:26
 ❯ AnalysisEngine.analyzeRepository packages/backend/src/core/AnalysisEngine.ts:86:14
 ❯ packages/backend/src/core/__tests__/AnalysisEngine.test.ts:311:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[65/142]⎯

 FAIL  packages/backend/src/core/__tests__/IndexSystem.comprehensive.test.ts > IndexSystem Comprehensive Tests > Persistence and File Operations > should handle file system errors during save
TypeError: Cannot spy on export "writeFileSync". Module namespace is not configurable in ESM. See: https://vitest.dev/guide/browser/#limitations
 ❯ packages/backend/src/core/__tests__/IndexSystem.comprehensive.test.ts:411:27
    409|     it('should handle file system errors during save', async () => {
    410|       // Mock fs.writeFileSync to throw an error
    411|       const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
       |                           ^
    412|         throw new Error('File system error');
    413|       });

Caused by: TypeError: Cannot redefine property: writeFileSync
 ❯ packages/backend/src/core/__tests__/IndexSystem.comprehensive.test.ts:411:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[66/142]⎯

 FAIL  packages/backend/src/providers/__tests__/ClaudeProvider.test.ts > ClaudeProvider > analyze > should call Claude API and return formatted response
AssertionError: expected "wrap" to be called with arguments: [ …(3) ]

Received:

  1st wrap call:

@@ -14,7 +14,8 @@
      "headers": {
        "Anthropic-Version": "2023-06-01",
        "Content-Type": "application/json",
        "X-API-Key": "test-key",
      },
+     "timeout": 60000,
    },
  ]


Number of calls: 1

 ❯ packages/backend/src/providers/__tests__/ClaudeProvider.test.ts:147:32
    145|       const response = await provider.analyze('Test prompt');
    146|
    147|       expect(mockedAxios.post).toHaveBeenCalledWith(
       |                                ^
    148|         'https://api.anthropic.com/v1/complete',
    149|         {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[67/142]⎯

 FAIL  packages/backend/src/providers/__tests__/OpenRouterProvider.test.ts > OpenRouterProvider Model Selection > fetchModels > should handle API errors gracefully
AssertionError: expected [Function] to throw error including 'OpenRouter Models API error: 401' but got 'OpenRouter Models API error: [object …'

Expected: "OpenRouter Models API error: 401"
Received: "OpenRouter Models API error: [object Object]"

 ❯ packages/backend/src/providers/__tests__/OpenRouterProvider.test.ts:80:7
     78|       });
     79|
     80|       await expect(provider.fetchModels('invalid-key')).rejects.toThrow(
       |       ^
     81|         'OpenRouter Models API error: 401'
     82|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[68/142]⎯

 FAIL  packages/backend/src/providers/__tests__/OpenRouterProvider.test.ts > OpenRouterProvider Model Selection > validateModel > should handle API errors during validation
AssertionError: expected 'OpenRouter Models API error: Network …' to be 'Network error' // Object.is equality

Expected: "Network error"
Received: "OpenRouter Models API error: Network error"

 ❯ packages/backend/src/providers/__tests__/OpenRouterProvider.test.ts:168:28
    166|
    167|       expect(result.valid).toBe(false);
    168|       expect(result.error).toBe('Network error');
       |                            ^
    169|     });
    170|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[69/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > initialize > should create configuration directory and default files
TypeError: configService.initialize is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:399:27
    397|       mockFs.access.mockRejectedValue(new Error('File not found'));
    398|
    399|       await configService.initialize();
       |                           ^
    400|
    401|       expect(mockFs.mkdir).toHaveBeenCalledWith(mockConfigDir, {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[70/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > initialize > should not overwrite existing files
TypeError: configService.initialize is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:416:27
    414|       mockFs.access.mockResolvedValue(undefined); // Files exist
    415|
    416|       await configService.initialize();
       |                           ^
    417|
    418|       expect(mockFs.writeFile).not.toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[71/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > getUserPreferences > should return user preferences from file       
TypeError: configService.getUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:430:42
    428|       mockFs.readFile.mockResolvedValue(JSON.stringify(mockPreferences));
    429|
    430|       const result = await configService.getUserPreferences();
       |                                          ^
    431|
    432|       expect(result).toEqual(mockPreferences);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[72/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > getUserPreferences > should return defaults if file read fails      
TypeError: configService.getUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:442:42
    440|       mockFs.readFile.mockRejectedValue(new Error('File not found'));
    441|
    442|       const result = await configService.getUserPreferences();
       |                                          ^
    443|
    444|       expect(result).toEqual(DEFAULT_USER_PREFERENCES);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[73/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > getUserPreferences > should merge with defaults for missing fields  
TypeError: configService.getUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:453:42
    451|       mockFs.readFile.mockResolvedValue(JSON.stringify(partialPreferences));
    452|
    453|       const result = await configService.getUserPreferences();
       |                                          ^
    454|
    455|       expect(result.general.theme).toBe('dark');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[74/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > saveUserPreferences > should save valid preferences
TypeError: configService.saveUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:465:27
    463|       mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
    464|
    465|       await configService.saveUserPreferences(DEFAULT_USER_PREFERENCES);
       |                           ^
    466|
    467|       expect(mockFs.writeFile).toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[75/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > saveUserPreferences > should create backup before saving
TypeError: configService.saveUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:476:27
    474|       mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
    475|
    476|       await configService.saveUserPreferences(DEFAULT_USER_PREFERENCES);
       |                           ^
    477|
    478|       // Should create backup (writeFile called twice - once for backup, once for preferences)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[76/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > saveUserPreferences > should throw error for invalid preferences    
TypeError: configService.saveUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:491:34
    489|       };
    490|
    491|       await expect(configService.saveUserPreferences(invalidPreferences)).rejects.toThrow();
       |                                  ^
    492|     });
    493|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[77/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > updatePreferences > should update specific preference section       
TypeError: configService.updatePreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:501:42
    499|
    500|       const updates = { theme: 'dark' as const };
    501|       const result = await configService.updatePreferences('general', updates);
       |                                          ^
    502|
    503|       expect(result.general.theme).toBe('dark');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[78/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > validateUserPreferences > should validate correct preferences       
TypeError: configService.validateUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:510:36
    508|   describe('validateUserPreferences', () => {
    509|     it('should validate correct preferences', () => {
    510|       const result = configService.validateUserPreferences(DEFAULT_USER_PREFERENCES);
       |                                    ^
    511|
    512|       expect(result.isValid).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[79/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > validateUserPreferences > should return errors for invalid preferences
TypeError: configService.validateUserPreferences is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:525:36
    523|       };
    524|
    525|       const result = configService.validateUserPreferences(invalidPreferences);
       |                                    ^
    526|
    527|       expect(result.isValid).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[80/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > workspace management > should save workspace configuration
TypeError: configService.saveWorkspaceConfiguration is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:543:42
    541|       };
    542|
    543|       const result = await configService.saveWorkspaceConfiguration(workspace);
       |                                          ^
    544|
    545|       expect(result.name).toBe(workspace.name);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[81/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > workspace management > should update workspace configuration        
TypeError: configService.updateWorkspaceConfiguration is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:565:42
    563|
    564|       const updates = { name: 'Updated Workspace' };
    565|       const result = await configService.updateWorkspaceConfiguration('test-id', updates);
       |                                          ^
    566|
    567|       expect(result.name).toBe('Updated Workspace');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[82/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > workspace management > should delete workspace configuration        
TypeError: configService.deleteWorkspaceConfiguration is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:583:27
    581|       mockFs.writeFile.mockResolvedValue(undefined);
    582|
    583|       await configService.deleteWorkspaceConfiguration('test-id');
       |                           ^
    584|
    585|       expect(mockFs.writeFile).toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[83/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > backup and restore > should create configuration backup
TypeError: configService.createBackup is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:597:42
    595|       mockFs.writeFile.mockResolvedValue(undefined);
    596|
    597|       const backup = await configService.createBackup('manual');
       |                                          ^
    598|
    599|       expect(backup.id).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[84/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > backup and restore > should restore from backup
TypeError: configService.restoreFromBackup is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:621:42
    619|       mockFs.writeFile.mockResolvedValue(undefined);
    620|
    621|       const result = await configService.restoreFromBackup('backup-id');
       |                                          ^
    622|
    623|       expect(result).toEqual(DEFAULT_USER_PREFERENCES);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[85/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > import and export > should export configuration
TypeError: configService.exportConfiguration is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:632:42
    630|       mockFs.readFile.mockResolvedValue(JSON.stringify(DEFAULT_USER_PREFERENCES));
    631|
    632|       const result = await configService.exportConfiguration();
       |                                          ^
    633|
    634|       const exported = JSON.parse(result);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[86/142]⎯

 FAIL  packages/backend/src/services/__tests__/config.service.test.ts > ConfigurationService > import and export > should import configuration
TypeError: configService.importConfiguration is not a function
 ❯ packages/backend/src/services/__tests__/config.service.test.ts:649:27
    647|       mockFs.writeFile.mockResolvedValue(undefined);
    648|
    649|       await configService.importConfiguration(configData);
       |                           ^
    650|
    651|       expect(mockFs.writeFile).toHaveBeenCalledWith(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[87/142]⎯

 FAIL  packages/backend/src/services/__tests__/logger-http-simple.service.test.ts > HTTP Request/Response Logging - Simplified > Middleware Functionality > should add request ID to request object
AssertionError: expected undefined to be defined
 ❯ packages/backend/src/services/__tests__/logger-http-simple.service.test.ts:62:33
     60|       requestLogger(mockReq, mockRes, mockNext);
     61|
     62|       expect(mockReq.requestId).toBeDefined();
       |                                 ^
     63|       expect(typeof mockReq.requestId).toBe('string');
     64|       expect(mockReq.requestId.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[88/142]⎯

 FAIL  packages/backend/src/services/__tests__/logger-http-simple.service.test.ts > HTTP Request/Response Logging - Simplified > Request ID Generation > should generate unique request IDs
AssertionError: expected undefined not to be undefined // Object.is equality
 ❯ packages/backend/src/services/__tests__/logger-http-simple.service.test.ts:111:27
    109|       const secondId = mockReq.requestId;
    110|
    111|       expect(firstId).not.toBe(secondId);
       |                           ^
    112|     });
    113|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[89/142]⎯

 FAIL  packages/backend/src/services/__tests__/logger-http-simple.service.test.ts > HTTP Request/Response Logging - Simplified > Request ID Generation > should generate UUID format request IDs
TypeError: .toMatch() expects to receive a string, but got undefined
 ❯ packages/backend/src/services/__tests__/logger-http-simple.service.test.ts:119:33
    117|       // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    118|       const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    119|       expect(mockReq.requestId).toMatch(uuidRegex);
       |                                 ^
    120|     });
    121|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[90/142]⎯

 FAIL  packages/backend/src/services/__tests__/path-handler-performance.test.ts > PathHandler Performance > Single Path Validation Performance > should handle timeout scenarios gracefully
AssertionError: expected 108 to be less than 100
 ❯ packages/backend/src/services/__tests__/path-handler-performance.test.ts:137:24
    135|
    136|       const duration = Date.now() - startTime;
    137|       expect(duration).toBeLessThan(shortTimeout + 50); // Allow some margin
       |                        ^
    138|     });
    139|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[91/142]⎯

 FAIL  packages/backend/src/services/__tests__/path-handler-performance.test.ts > PathHandler Performance > Concurrent Path Validation Performance > should handle concurrent validations efficiently
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ packages/backend/src/services/__tests__/path-handler-performance.test.ts:168:33
    166|       const stats = performanceMonitor.getOperationStats('path-validation');
    167|       expect(stats.count).toBe(paths.length);
    168|       expect(stats.successRate).toBe(1.0);
       |                                 ^
    169|     });
    170|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[92/142]⎯

 FAIL  packages/backend/src/services/__tests__/path-handler-performance.test.ts > PathHandler Performance > Performance Regression Detection > should detect performance regressions in path validation
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ packages/backend/src/services/__tests__/path-handler-performance.test.ts:349:34
    347|       await new Promise((resolve) => setTimeout(resolve, 50));
    348|
    349|       expect(regressionDetected).toBe(true);
       |                                  ^
    350|     });
    351|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[93/142]⎯

 FAIL  packages/backend/src/services/__tests__/performance-monitor.test.ts > PerformanceMonitor > Performance Baselines > should create and update baselines       
AssertionError: expected 30.085900000000002 to be less than 30
 ❯ packages/backend/src/services/__tests__/performance-monitor.test.ts:179:41
    177|       expect(baseline?.sampleCount).toBe(5);
    178|       expect(baseline?.averageDuration).toBeGreaterThan(15);
    179|       expect(baseline?.averageDuration).toBeLessThan(30);
       |                                         ^
    180|     });
    181|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[94/142]⎯

 FAIL  packages/backend/src/utils/__tests__/queue.test.ts > TaskQueue > should process tasks sequentially with concurrency 1
AssertionError: expected undefined to be 2 // Object.is equality

- Expected:
2

+ Received:
undefined

 ❯ packages/backend/src/utils/__tests__/queue.test.ts:45:27
     43|
     44|     expect(task1?.status).toBe(TaskStatus.COMPLETED);
     45|     expect(task1?.result).toBe(2);
       |                           ^
     46|
     47|     expect(task2?.status).toBe(TaskStatus.COMPLETED);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[95/142]⎯

 FAIL  packages/backend/src/utils/__tests__/queue.test.ts > TaskQueue > should process tasks concurrently with concurrency > 1
AssertionError: expected undefined to be 2 // Object.is equality

- Expected:
2

+ Received:
undefined

 ❯ packages/backend/src/utils/__tests__/queue.test.ts:77:27
     75|
     76|     expect(task1?.status).toBe(TaskStatus.COMPLETED);
     77|     expect(task1?.result).toBe(2);
       |                           ^
     78|
     79|     expect(task2?.status).toBe(TaskStatus.COMPLETED);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[96/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts > useAnalysisRequests > should fetch requests and stats on mount
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts:77:24
     75|     });
     76|
     77|     const { result } = renderHook(() => useAnalysisRequests());
       |                        ^
     78|
     79|     expect(result.current.loading).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[97/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts > useAnalysisRequests > should handle fetch errors
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts:97:24
     95|     mockGetAnalysisRequestStats.mockRejectedValue(new Error('Failed to fetch'));
     96|
     97|     const { result } = renderHook(() => useAnalysisRequests());
       |                        ^
     98|
     99|     // Wait for the async operations to complete

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[98/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts > useAnalysisRequests > should refresh requests
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts:121:24
    119|     });
    120|
    121|     const { result } = renderHook(() => useAnalysisRequests());
       |                        ^
    122|
    123|     // Wait for initial fetch

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[99/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts > useAnalysisRequests > should fetch a specific request
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useAnalysisRequests.test.ts:145:24
    143|     });
    144|
    145|     const { result } = renderHook(() => useAnalysisRequests());
       |                        ^
    146|
    147|     let request: any;

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[100/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > fetchProviderModels > should fetch models for OpenRouter provider
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:56:26
     54|       } as any);
     55|
     56|       const { result } = renderHook(() => useProviders());
       |                          ^
     57|
     58|       const models = await result.current.fetchProviderModels('openrouter');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[101/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > fetchProviderModels > should return empty array when API call fails
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:67:26
     65|       mockedApiService.getProviderModels.mockRejectedValueOnce(new Error('API Error'));
     66|
     67|       const { result } = renderHook(() => useProviders());
       |                          ^
     68|
     69|       const models = await result.current.fetchProviderModels('openrouter');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[102/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > fetchProviderModels > should return empty array when response is null
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:77:26
     75|       mockedApiService.getProviderModels.mockResolvedValueOnce(null as any);
     76|
     77|       const { result } = renderHook(() => useProviders());
       |                          ^
     78|
     79|       const models = await result.current.fetchProviderModels('openrouter');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[103/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > validateProviderModel > should validate model successfully
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:102:26
    100|       } as any);
    101|
    102|       const { result } = renderHook(() => useProviders());
       |                          ^
    103|
    104|       const validation = await result.current.validateProviderModel('openrouter', 'openai/gpt-4');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[104/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > validateProviderModel > should handle validation failure 
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:129:26
    127|       } as any);
    128|
    129|       const { result } = renderHook(() => useProviders());
       |                          ^
    130|
    131|       const validation = await result.current.validateProviderModel('openrouter', 'invalid/model');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[105/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > validateProviderModel > should handle API errors gracefully
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:143:26
    141|       mockedApiService.validateProviderModel.mockRejectedValueOnce(new Error('Network error'));
    142|
    143|       const { result } = renderHook(() => useProviders());
       |                          ^
    144|
    145|       const validation = await result.current.validateProviderModel('openrouter', 'openai/gpt-4');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[106/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > validateProviderModel > should handle null response      
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:154:26
    152|       mockedApiService.validateProviderModel.mockResolvedValueOnce(null as any);
    153|
    154|       const { result } = renderHook(() => useProviders());
       |                          ^
    155|
    156|       const validation = await result.current.validateProviderModel('openrouter', 'openai/gpt-4');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[107/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > getModelRecommendations > should get model recommendations successfully
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:180:26
    178|       } as any);
    179|
    180|       const { result } = renderHook(() => useProviders());
       |                          ^
    181|
    182|       const recommendations = await result.current.getModelRecommendations(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[108/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > getModelRecommendations > should return empty object when API call fails
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:197:26
    195|       mockedApiService.getModelRecommendations.mockRejectedValueOnce(new Error('API Error'));
    196|
    197|       const { result } = renderHook(() => useProviders());
       |                          ^
    198|
    199|       const recommendations = await result.current.getModelRecommendations(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[109/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > getModelRecommendations > should return empty object when response is null
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:210:26
    208|       mockedApiService.getModelRecommendations.mockResolvedValueOnce(null as any);
    209|
    210|       const { result } = renderHook(() => useProviders());
       |                          ^
    211|
    212|       const recommendations = await result.current.getModelRecommendations(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[110/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > loading states > should include model validation loading in overall loading state
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:225:26
    223|       // This would require mocking the useApi hook to return loading: true
    224|       // for the validateProviderModel API call
    225|       const { result } = renderHook(() => useProviders());
       |                          ^
    226|
    227|       // The loading state should aggregate all API loading states

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[111/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.models.test.ts > useProviders Model Selection > error handling > should aggregate errors from all API calls
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ Proxy.renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.models.test.ts:234:26
    232|   describe('error handling', () => {
    233|     it('should aggregate errors from all API calls', () => {
    234|       const { result } = renderHook(() => useProviders());
       |                          ^
    235|
    236|       // The error state should aggregate all API errors

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[112/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should initialize with empty providers and no loading/error state
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:22:24
     20| 
     21|   test('should initialize with empty providers and no loading/error state', () => {
     22|     const { result } = renderHook(() => useProviders());
       |                        ^
     23|
     24|     expect(result.current.providers).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[113/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should fetch providers successfully
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:61:24
     59|     mockGetProviders.mockResolvedValue(mockResponse);
     60|
     61|     const { result } = renderHook(() => useProviders());
       |                        ^
     62|
     63|     await act(async () => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[114/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should handle fetch providers error
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:76:24
     74|     mockGetProviders.mockRejectedValue(new Error('Network error'));
     75|
     76|     const { result } = renderHook(() => useProviders());
       |                        ^
     77|
     78|     await act(async () => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[115/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should test provider successfully
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:118:24
    116|     mockTestProvider.mockResolvedValue(mockTestResponse);
    117|
    118|     const { result } = renderHook(() => useProviders());
       |                        ^
    119|
    120|     // First fetch providers

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[116/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should handle test provider error
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:158:24
    156|     mockTestProvider.mockRejectedValue(new Error('Test failed'));
    157|
    158|     const { result } = renderHook(() => useProviders());
       |                        ^
    159|
    160|     // First fetch providers

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[117/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should fetch provider models successfully
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:218:24
    216|     });
    217|
    218|     const { result } = renderHook(() => useProviders());
       |                        ^
    219|
    220|     // First fetch providers

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[118/142]⎯

 FAIL  packages/frontend/src/hooks/__tests__/useProviders.test.ts > useProviders > should handle fetch provider models error
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:239:5
 ❯ renderHook node_modules/@testing-library/react/dist/pure.js:318:7
 ❯ packages/frontend/src/hooks/__tests__/useProviders.test.ts:256:24
    254|     mockGetProviderModels.mockRejectedValue(new Error('Models fetch failed'));
    255|
    256|     const { result } = renderHook(() => useProviders());
       |                        ^
    257|
    258|     // First fetch providers

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[119/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should disconnect from WebSocket server
AssertionError: expected "spy" to be called at least once
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:70:35
     68|     websocketService.disconnect();
     69|
     70|     expect(mockSocket.disconnect).toHaveBeenCalled();
       |                                   ^
     71|     expect((websocketService as any).socket).toBeNull();
     72|     expect((websocketService as any).connected).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[120/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should subscribe to analysis progress
AssertionError: expected "spy" to be called with arguments: [ 'register-analysis', …(1) ]

Number of calls: 0

 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:79:29
     77|     websocketService.subscribeToAnalysis('test-analysis-id');
     78|
     79|     expect(mockSocket.emit).toHaveBeenCalledWith('register-analysis', 'test-analysis-id');
       |                             ^
     80|   });
     81|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[121/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should handle connect event
TypeError: Cannot read properties of undefined (reading '1')
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:86:89
     84|
     85|     // Simulate connect event
     86|     const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')[1];
       |                                                                                         ^
     87|     connectHandler();
     88|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[122/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should handle disconnect event
TypeError: Cannot read properties of undefined (reading '1')
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:100:95
     98|
     99|     // Simulate disconnect event
    100|     const disconnectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'disconnect')[1];
       |                                                                                               ^
    101|     disconnectHandler('test-reason');
    102|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[123/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should handle analysis progress event
TypeError: Cannot read properties of undefined (reading '1')
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:115:5
    113|     const progressHandler = mockSocket.on.mock.calls.find(
    114|       (call) => call[0] === 'analysis-progress'
    115|     )[1];
       |     ^
    116|     progressHandler({
    117|       status: 'processing',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[124/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should handle analysis complete event
TypeError: Cannot read properties of undefined (reading '1')
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:149:5
    147|     const completeHandler = mockSocket.on.mock.calls.find(
    148|       (call) => call[0] === 'analysis-complete'
    149|     )[1];
       |     ^
    150|     const testData = { id: 'test-id', name: 'test-repo' };
    151|     completeHandler(testData);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[125/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should handle batch analysis progress event
TypeError: Cannot read properties of undefined (reading '1')
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:168:5
    166|     const progressHandler = mockSocket.on.mock.calls.find(
    167|       (call) => call[0] === 'batch-analysis-progress'
    168|     )[1];
       |     ^
    169|     progressHandler({
    170|       status: 'processing',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[126/142]⎯

 FAIL  packages/frontend/src/services/__tests__/websocket.test.ts > WebSocketService > should handle batch analysis complete event
TypeError: Cannot read properties of undefined (reading '1')
 ❯ packages/frontend/src/services/__tests__/websocket.test.ts:199:5
    197|     const completeHandler = mockSocket.on.mock.calls.find(
    198|       (call) => call[0] === 'batch-analysis-complete'
    199|     )[1];
       |     ^
    200|     const testData = {
    201|       repositories: [

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[127/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > Component Rendering Performance > should handle rapid state updates efficiently
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:117:25
    115|       // Total time should be reasonable
    116|       const totalTime = performanceMeasures['rapid-updates'];
    117|       expect(totalTime).toBeLessThan(1000); // 1 second total
       |                         ^
    118|     });
    119|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[128/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > API Performance > should handle concurrent API requests efficiently    
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:177:25
    175|
    176|       // Should complete all requests within reasonable time
    177|       expect(totalTime).toBeLessThan(500); // 500ms
       |                         ^
    178|       expect(results).toHaveLength(concurrentRequests);
    179|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[129/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > API Performance > should implement effective caching strategy
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:203:49
    201|
    202|       expect(firstResult.cached).toBe(false);
    203|       expect(performanceMeasures['first-call']).toBeGreaterThan(90);
       |                                                 ^
    204|
    205|       // Second call - should use cache

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[130/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > Memory Management > should handle large file processing efficiently    
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:268:30
    266|
    267|       // Should process large files within reasonable time
    268|       expect(processingTime).toBeLessThan(1000); // 1 second
       |                              ^
    269|       expect(processedContent).toBeDefined();
    270|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[131/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > User Interaction Performance > should respond to user interactions within 16ms (60fps)
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:295:22
    293|       // All interactions should be under 16ms for 60fps
    294|       Object.entries(interactionTimes).forEach(([_interaction, time]) => {
    295|         expect(time).toBeLessThan(16);
       |                      ^
    296|       });
    297|     });
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:294:40

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[132/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > User Interaction Performance > should implement smooth scrolling and virtualization
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:323:31
    321|
    322|       // Virtualization calculation should be very fast
    323|       expect(calculationTime).toBeLessThan(1);
       |                               ^
    324|       expect(visibleItemsArray.length).toBeLessThanOrEqual(visibleItems);
    325|       expect(visibleItemsArray.length).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[133/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > Network Performance > should implement request deduplication
TypeError: actual value must be number or bigint, received "undefined"
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:365:25
    363|
    364|       // Should complete in roughly the same time as a single request
    365|       expect(totalTime).toBeLessThan(150); // Slightly more than 100ms for overhead
       |                         ^
    366|       expect(results).toHaveLength(3);
    367|       expect(results[0]).toEqual(results[1]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[134/142]⎯

 FAIL  packages/frontend/src/test/performance/benchmarks.test.ts > Performance Benchmarks > Network Performance > should handle request timeouts gracefully        
Error: Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ packages/frontend/src/test/performance/benchmarks.test.ts:371:5
    369|     });
    370|
    371|     it('should handle request timeouts gracefully', async () => {
       |     ^
    372|       const timeoutDuration = 5000; // 5 seconds
    373|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[135/142]⎯

 FAIL  packages/backend/src/api/controllers/__tests__/export.controller.test.ts > Export Controller > downloadExport > downloads existing export file
AssertionError: expected "spy" to be called with arguments: [ 'Content-Type', 'application/json' ]

Number of calls: 0

 ❯ packages/backend/src/api/controllers/__tests__/export.controller.test.ts:283:38
    281|       await downloadExport(mockRequest as Request, mockResponse as Response);
    282|
    283|       expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
       |                                      ^
    284|       expect(mockResponse.setHeader).toHaveBeenCalledWith(
    285|         'Content-Disposition',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[136/142]⎯

 FAIL  packages/backend/src/api/controllers/__tests__/export.controller.test.ts > Export Controller > downloadExport > returns 404 when export file not found      
AssertionError: expected "spy" to be called with arguments: [ { error: 'Export file not found' } ]

Received:

  1st spy call:

  [
    {
-     "error": "Export file not found",
+     "error": "Export not found",
    },
  ]


Number of calls: 1

 ❯ packages/backend/src/api/controllers/__tests__/export.controller.test.ts:299:33
    297|
    298|       expect(mockResponse.status).toHaveBeenCalledWith(404);
    299|       expect(mockResponse.json).toHaveBeenCalledWith({
       |                                 ^
    300|         error: 'Export file not found',
    301|       });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[137/142]⎯

 FAIL  packages/backend/src/api/controllers/__tests__/export.controller.test.ts > Export Controller > deleteExport > deletes existing export
AssertionError: expected "spy" to be called with arguments: [ 200 ]

Received:

  1st spy call:

  [
-   200,
+   404,
  ]


Number of calls: 1

 ❯ packages/backend/src/api/controllers/__tests__/export.controller.test.ts:341:35
    339|       await deleteExport(mockRequest as Request, mockResponse as Response);
    340|
    341|       expect(mockResponse.status).toHaveBeenCalledWith(200);
       |                                   ^
    342|       expect(mockResponse.json).toHaveBeenCalledWith({
    343|         message: 'Export deleted successfully',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[138/142]⎯

 FAIL  packages/backend/src/api/controllers/__tests__/export.controller.test.ts > Export Controller > deleteExport > handles file deletion errors gracefully       
AssertionError: expected "spy" to be called with arguments: [ 200 ]

Received:

  1st spy call:

  [
-   200,
+   404,
  ]


Number of calls: 1

 ❯ packages/backend/src/api/controllers/__tests__/export.controller.test.ts:407:35
    405|       await deleteExport(mockRequest as Request, mockResponse as Response);
    406|
    407|       expect(mockResponse.status).toHaveBeenCalledWith(200);
       |                                   ^
    408|       expect(mockResponse.json).toHaveBeenCalledWith({
    409|         message: 'Export deleted successfully',

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[139/142]⎯

 FAIL  packages/backend/src/api/routes/__tests__/analysis-requests.test.ts > analysis requests routes > should define GET routes
Error: Cannot find module '../analysis-requests'
Require stack:
- C:\Users\AlexJ\Documents\Coding\Repos\my-repos\myRepoAnalyzer\unified-repo-analyzer\packages\backend\src\api\routes\__tests__\analysis-requests.test.ts
 ❯ packages/backend/src/api/routes/__tests__/analysis-requests.test.ts:36:5
     34|   test('should define GET routes', () => {
     35|     // Import the routes file which should register the routes
     36|     require('../analysis-requests');
       |     ^
     37|
     38|     expect(mockRouter.get).toHaveBeenCalledWith('/', expect.any(Function));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[140/142]⎯

 FAIL  packages/backend/src/api/routes/__tests__/providers.test.ts > providers routes > GET /api/providers > should return all registered providers with their status
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ packages/backend/src/api/routes/__tests__/providers.test.ts:70:41
     68|
     69|       expect(claudeProvider).toBeDefined();
     70|       expect(claudeProvider.configured).toBe(true);
       |                                         ^
     71|       expect(claudeProvider.model).toBe('claude-3-haiku-20240307');
     72|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[141/142]⎯

 FAIL  packages/backend/src/api/routes/__tests__/providers.test.ts > providers routes > GET /api/providers > should handle errors gracefully
AssertionError: expected "spy" to be called with arguments: [ 500 ]

Number of calls: 0

 ❯ packages/backend/src/api/routes/__tests__/providers.test.ts:106:26
    104|
    105|       // Verify error response
    106|       expect(res.status).toHaveBeenCalledWith(500);
       |                          ^
    107|       expect(res.json).toHaveBeenCalled();
    108|       const errorResponse = res.json.mock.calls[0][0];

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[142/142]⎯                                                                     
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[142/142]⎯                                    


 Test Files  28 failed | 53 passed (81)
      Tests  142 failed | 898 passed (1040)
   Start at  22:47:47
   Duration  83.46s (transform 16.54s, setup 8.60s, collect 79.01s, tests 90.41s, environment 77ms, prepare 47.46s)
```