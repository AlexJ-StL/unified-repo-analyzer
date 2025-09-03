#!/usr/bin/env bun

/**
 * Fast Feedback Test Runner
 * Runs tests in optimized order for quick feedback
 */

import { execSync } from 'node:child_process';

const plan = {
  "batches": [
    {
      "id": "batch-1",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\simple-test.test.ts",
          "relativePath": "tests\\simple-test.test.ts",
          "size": 152,
          "lastModified": "2025-09-03T04:49:31.835Z",
          "dependencies": [],
          "estimatedDuration": 515,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\TestExecutor-minimal.test.ts",
          "relativePath": "tests\\TestExecutor-minimal.test.ts",
          "size": 1027,
          "lastModified": "2025-09-03T04:49:54.712Z",
          "dependencies": [],
          "estimatedDuration": 600,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\hooks\\__tests__\\useRetry.test.tsx",
          "relativePath": "packages\\frontend\\src\\hooks\\__tests__\\useRetry.test.tsx",
          "size": 1706,
          "lastModified": "2025-09-03T02:01:22.857Z",
          "dependencies": [
            "packages\\frontend\\src\\hooks\\useRetry.ts"
          ],
          "estimatedDuration": 667,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\__tests__\\PathInput.basic.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\__tests__\\PathInput.basic.test.tsx",
          "size": 2689,
          "lastModified": "2025-09-03T01:55:41.538Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\common\\PathInput.tsx"
          ],
          "estimatedDuration": 763,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\cli\\src\\__tests__\\utils.test.ts",
          "relativePath": "packages\\cli\\src\\__tests__\\utils.test.ts",
          "size": 3437,
          "lastModified": "2025-09-03T02:24:11.835Z",
          "dependencies": [
            "packages\\cli\\src\\utils\\error-handler.ts"
          ],
          "estimatedDuration": 836,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\ResourceController.test.ts",
          "relativePath": "tests\\ResourceController.test.ts",
          "size": 3453,
          "lastModified": "2025-09-03T00:24:34.271Z",
          "dependencies": [],
          "estimatedDuration": 837,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\hooks\\__tests__\\useAnalysisRequests.test.ts",
          "relativePath": "packages\\frontend\\src\\hooks\\__tests__\\useAnalysisRequests.test.ts",
          "size": 4232,
          "lastModified": "2025-09-03T02:00:53.255Z",
          "dependencies": [
            "packages\\frontend\\src\\hooks\\useAnalysisRequests.ts"
          ],
          "estimatedDuration": 913,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\cli\\src\\utils\\__tests__\\config.test.ts",
          "relativePath": "packages\\cli\\src\\utils\\__tests__\\config.test.ts",
          "size": 4296,
          "lastModified": "2025-09-03T02:22:34.244Z",
          "dependencies": [],
          "estimatedDuration": 920,
          "priority": 90,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\configuration\\__tests__\\LLMProviderPreferences.models.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\configuration\\__tests__\\LLMProviderPreferences.models.test.tsx",
          "size": 812,
          "lastModified": "2025-09-02T13:29:00.259Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\configuration\\LLMProviderPreferences.tsx"
          ],
          "estimatedDuration": 579,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\routes\\__tests__\\analysis-requests.test.ts",
          "relativePath": "packages\\backend\\src\\api\\routes\\__tests__\\analysis-requests.test.ts",
          "size": 1234,
          "lastModified": "2025-09-02T12:37:15.442Z",
          "dependencies": [
            "packages\\backend\\src\\services\\analysis-request-tracker.service.ts"
          ],
          "estimatedDuration": 621,
          "priority": 80,
          "package": "root"
        }
      ],
      "estimatedDuration": 7251,
      "priority": 88,
      "dependencies": [
        "packages\\frontend\\src\\hooks\\useRetry.ts",
        "packages\\frontend\\src\\components\\common\\PathInput.tsx",
        "packages\\cli\\src\\utils\\error-handler.ts",
        "packages\\frontend\\src\\hooks\\useAnalysisRequests.ts",
        "packages\\frontend\\src\\components\\configuration\\LLMProviderPreferences.tsx",
        "packages\\backend\\src\\services\\analysis-request-tracker.service.ts"
      ]
    },
    {
      "id": "batch-2",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\api.simple.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\api.simple.test.ts",
          "size": 1327,
          "lastModified": "2025-09-02T12:37:15.326Z",
          "dependencies": [],
          "estimatedDuration": 630,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\MockManager.test.ts",
          "relativePath": "tests\\MockManager.test.ts",
          "size": 2225,
          "lastModified": "2025-09-02T18:17:46.992Z",
          "dependencies": [
            "tests\\MockManager.ts"
          ],
          "estimatedDuration": 717,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\ProviderRegistry.models.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\ProviderRegistry.models.test.ts",
          "size": 2428,
          "lastModified": "2025-09-02T13:27:41.256Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts"
          ],
          "estimatedDuration": 737,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\ResultsViewer.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\ResultsViewer.test.tsx",
          "size": 3312,
          "lastModified": "2025-08-30T20:44:36.986Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\analysis\\ResultsViewer.tsx"
          ],
          "estimatedDuration": 823,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\ExecutiveSummary.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\ExecutiveSummary.test.tsx",
          "size": 3671,
          "lastModified": "2025-08-30T20:44:36.973Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\analysis\\results\\ExecutiveSummary.tsx"
          ],
          "estimatedDuration": 858,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\AnalysisRequests.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\AnalysisRequests.test.tsx",
          "size": 3737,
          "lastModified": "2025-09-02T12:37:35.635Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\analysis\\AnalysisRequests.tsx"
          ],
          "estimatedDuration": 865,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\LLMProvider.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\LLMProvider.test.ts",
          "size": 3776,
          "lastModified": "2025-08-31T10:07:25.616Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\LLMProvider.ts"
          ],
          "estimatedDuration": 869,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\config.service.basic.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\config.service.basic.test.ts",
          "size": 4172,
          "lastModified": "2025-08-31T10:05:42.180Z",
          "dependencies": [
            "packages\\backend\\src\\services\\config.service.ts"
          ],
          "estimatedDuration": 907,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\file-type-filtering.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\file-type-filtering.test.ts",
          "size": 4256,
          "lastModified": "2025-08-29T02:16:09.133Z",
          "dependencies": [
            "packages\\backend\\src\\core\\IndexSystem.ts"
          ],
          "estimatedDuration": 916,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\MockProvider.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\MockProvider.test.ts",
          "size": 4512,
          "lastModified": "2025-08-31T10:07:25.674Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\MockProvider.ts"
          ],
          "estimatedDuration": 941,
          "priority": 80,
          "package": "root"
        }
      ],
      "estimatedDuration": 8263,
      "priority": 80,
      "dependencies": [
        "tests\\MockManager.ts",
        "packages\\backend\\src\\providers\\ProviderRegistry.ts",
        "packages\\frontend\\src\\components\\analysis\\ResultsViewer.tsx",
        "packages\\frontend\\src\\components\\analysis\\results\\ExecutiveSummary.tsx",
        "packages\\frontend\\src\\components\\analysis\\AnalysisRequests.tsx",
        "packages\\backend\\src\\providers\\LLMProvider.ts",
        "packages\\backend\\src\\services\\config.service.ts",
        "packages\\backend\\src\\core\\IndexSystem.ts",
        "packages\\backend\\src\\providers\\MockProvider.ts"
      ]
    },
    {
      "id": "batch-3",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\config.service.simple.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\config.service.simple.test.ts",
          "size": 5083,
          "lastModified": "2025-08-31T10:05:42.154Z",
          "dependencies": [
            "packages\\backend\\src\\services\\config.service.ts"
          ],
          "estimatedDuration": 996,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\services\\__tests__\\websocket.test.ts",
          "relativePath": "packages\\frontend\\src\\services\\__tests__\\websocket.test.ts",
          "size": 6084,
          "lastModified": "2025-09-03T01:59:00.193Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\websocket.ts"
          ],
          "estimatedDuration": 1094,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\error-message.service.fixed.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\error-message.service.fixed.test.ts",
          "size": 6188,
          "lastModified": "2025-09-03T01:10:08.756Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\services\\error-message.service.ts",
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 1104,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\TestExecutor.test.ts",
          "relativePath": "tests\\TestExecutor.test.ts",
          "size": 7683,
          "lastModified": "2025-09-03T05:24:22.318Z",
          "dependencies": [
            "tests\\TestExecutor.ts",
            "tests\\SystemResourceMonitor.ts"
          ],
          "estimatedDuration": 1250,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\AnalysisEngine.fixed.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\AnalysisEngine.fixed.test.ts",
          "size": 7926,
          "lastModified": "2025-09-03T01:21:51.920Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 1274,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\test-isolation.test.ts",
          "relativePath": "tests\\test-isolation.test.ts",
          "size": 8858,
          "lastModified": "2025-09-03T00:56:34.677Z",
          "dependencies": [],
          "estimatedDuration": 1365,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\advancedAnalyzer.fixed.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\advancedAnalyzer.fixed.test.ts",
          "size": 9101,
          "lastModified": "2025-09-03T01:30:49.219Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\core\\advancedAnalyzer.ts"
          ],
          "estimatedDuration": 1389,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\logger-http.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\logger-http.service.test.ts",
          "size": 9132,
          "lastModified": "2025-09-03T01:07:15.975Z",
          "dependencies": [
            "tests\\MockManager.ts"
          ],
          "estimatedDuration": 1392,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\AnalysisEngine.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\AnalysisEngine.test.ts",
          "size": 9556,
          "lastModified": "2025-09-03T01:21:02.294Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 1433,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\config.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\config.service.test.ts",
          "size": 12186,
          "lastModified": "2025-09-03T01:05:57.649Z",
          "dependencies": [
            "packages\\backend\\src\\services\\config.service.ts"
          ],
          "estimatedDuration": 1690,
          "priority": 80,
          "package": "root"
        }
      ],
      "estimatedDuration": 12987,
      "priority": 80,
      "dependencies": [
        "packages\\backend\\src\\services\\config.service.ts",
        "packages\\frontend\\src\\services\\websocket.ts",
        "tests\\MockManager.ts",
        "packages\\backend\\src\\services\\error-message.service.ts",
        "packages\\backend\\src\\services\\path-handler.service.ts",
        "tests\\TestExecutor.ts",
        "tests\\SystemResourceMonitor.ts",
        "packages\\backend\\src\\core\\AnalysisEngine.ts",
        "packages\\backend\\src\\core\\advancedAnalyzer.ts"
      ]
    },
    {
      "id": "batch-4",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\AnalysisEngine.batch.fixed.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\AnalysisEngine.batch.fixed.test.ts",
          "size": 13559,
          "lastModified": "2025-09-03T01:33:14.321Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 1824,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\export.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\export.service.test.ts",
          "size": 13877,
          "lastModified": "2025-09-03T01:11:34.395Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\services\\export.service.ts"
          ],
          "estimatedDuration": 1855,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\analysisEngine.advanced.fixed.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\analysisEngine.advanced.fixed.test.ts",
          "size": 18681,
          "lastModified": "2025-09-03T01:35:12.666Z",
          "dependencies": [
            "tests\\MockManager.ts",
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 2324,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\services\\__tests__\\errorMessages.test.ts",
          "relativePath": "packages\\frontend\\src\\services\\__tests__\\errorMessages.test.ts",
          "size": 21583,
          "lastModified": "2025-09-03T01:57:30.399Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\errorMessages.ts",
            "packages\\frontend\\src\\services\\pathValidation.ts"
          ],
          "estimatedDuration": 2608,
          "priority": 80,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\tokenAnalyzer.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\tokenAnalyzer.test.ts",
          "size": 3179,
          "lastModified": "2025-08-24T18:57:54.512Z",
          "dependencies": [
            "packages\\backend\\src\\core\\tokenAnalyzer.ts"
          ],
          "estimatedDuration": 810,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\error\\__tests__\\Toast.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\error\\__tests__\\Toast.test.tsx",
          "size": 3644,
          "lastModified": "2025-08-05T00:48:37.548Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\error\\Toast.tsx"
          ],
          "estimatedDuration": 856,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\Pagination.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\Pagination.test.tsx",
          "size": 3738,
          "lastModified": "2025-08-05T00:48:33.864Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\repository\\Pagination.tsx"
          ],
          "estimatedDuration": 865,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\error\\__tests__\\ErrorBoundary.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\error\\__tests__\\ErrorBoundary.test.tsx",
          "size": 3858,
          "lastModified": "2025-08-05T00:48:37.658Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\error\\ErrorBoundary.tsx"
          ],
          "estimatedDuration": 877,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\RepositoryComparison.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\RepositoryComparison.test.tsx",
          "size": 4489,
          "lastModified": "2025-08-05T00:48:33.699Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\components\\repository\\RepositoryComparison.tsx"
          ],
          "estimatedDuration": 938,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\RepositoryCard.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\RepositoryCard.test.tsx",
          "size": 4602,
          "lastModified": "2025-08-05T00:48:33.749Z",
          "dependencies": [
            "packages\\frontend\\src\\store\\useRepositoryStore.ts",
            "packages\\frontend\\src\\components\\repository\\RepositoryCard.tsx"
          ],
          "estimatedDuration": 949,
          "priority": 70,
          "package": "root"
        }
      ],
      "estimatedDuration": 13906,
      "priority": 74,
      "dependencies": [
        "tests\\MockManager.ts",
        "packages\\backend\\src\\core\\AnalysisEngine.ts",
        "packages\\backend\\src\\services\\export.service.ts",
        "packages\\frontend\\src\\services\\errorMessages.ts",
        "packages\\frontend\\src\\services\\pathValidation.ts",
        "packages\\backend\\src\\core\\tokenAnalyzer.ts",
        "packages\\frontend\\src\\components\\error\\Toast.tsx",
        "packages\\frontend\\src\\components\\repository\\Pagination.tsx",
        "packages\\frontend\\src\\components\\error\\ErrorBoundary.tsx",
        "packages\\frontend\\src\\services\\api.ts",
        "packages\\frontend\\src\\components\\repository\\RepositoryComparison.tsx",
        "packages\\frontend\\src\\store\\useRepositoryStore.ts",
        "packages\\frontend\\src\\components\\repository\\RepositoryCard.tsx"
      ]
    },
    {
      "id": "batch-5",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\migration-validation.test.ts",
          "relativePath": "tests\\migration-validation.test.ts",
          "size": 4931,
          "lastModified": "2025-08-09T17:28:43.467Z",
          "dependencies": [],
          "estimatedDuration": 982,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\ProgressTracker.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\ProgressTracker.test.tsx",
          "size": 5134,
          "lastModified": "2025-08-30T20:44:36.994Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\services\\websocket.ts",
            "packages\\frontend\\src\\store\\useAnalysisStore.ts",
            "packages\\frontend\\src\\components\\analysis\\ProgressTracker.tsx"
          ],
          "estimatedDuration": 1001,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\MobileProgressTracker.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\MobileProgressTracker.test.tsx",
          "size": 5220,
          "lastModified": "2025-08-30T19:57:05.831Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\services\\websocket.ts",
            "packages\\frontend\\src\\store\\useAnalysisStore.ts",
            "packages\\frontend\\src\\components\\analysis\\MobileProgressTracker.tsx"
          ],
          "estimatedDuration": 1010,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\AnalysisConfiguration.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\AnalysisConfiguration.test.tsx",
          "size": 5272,
          "lastModified": "2025-08-30T19:57:05.806Z",
          "dependencies": [
            "packages\\frontend\\src\\store\\useAnalysisStore.ts",
            "packages\\frontend\\src\\store\\useSettingsStore.ts",
            "packages\\frontend\\src\\components\\analysis\\AnalysisConfiguration.tsx"
          ],
          "estimatedDuration": 1015,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\regression-validation.test.ts",
          "relativePath": "tests\\regression-validation.test.ts",
          "size": 5387,
          "lastModified": "2025-08-28T17:32:25.643Z",
          "dependencies": [
            "tests\\assertion-helpers.ts",
            "tests\\regression-prevention.ts"
          ],
          "estimatedDuration": 1026,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\ci-validation.test.ts",
          "relativePath": "tests\\ci-validation.test.ts",
          "size": 6158,
          "lastModified": "2025-09-01T02:05:38.543Z",
          "dependencies": [
            "tests\\runtime-test-helpers.ts"
          ],
          "estimatedDuration": 1101,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\api-fixed.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\api-fixed.test.ts",
          "size": 6196,
          "lastModified": "2025-09-02T18:14:10.874Z",
          "dependencies": [
            "packages\\backend\\src\\index.ts"
          ],
          "estimatedDuration": 1105,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\ClaudeProvider.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\ClaudeProvider.test.ts",
          "size": 6354,
          "lastModified": "2025-08-31T10:07:25.612Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ClaudeProvider.ts"
          ],
          "estimatedDuration": 1121,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\websocket.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\websocket.test.ts",
          "size": 6385,
          "lastModified": "2025-08-31T10:06:39.883Z",
          "dependencies": [],
          "estimatedDuration": 1124,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\configuration\\__tests__\\ConfigurationManager.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\configuration\\__tests__\\ConfigurationManager.test.tsx",
          "size": 6816,
          "lastModified": "2025-08-30T22:10:29.968Z",
          "dependencies": [
            "packages\\frontend\\src\\store\\useSettingsStore.ts",
            "packages\\frontend\\src\\components\\configuration\\ConfigurationManager.tsx"
          ],
          "estimatedDuration": 1166,
          "priority": 70,
          "package": "root"
        }
      ],
      "estimatedDuration": 10651,
      "priority": 70,
      "dependencies": [
        "packages\\frontend\\src\\services\\api.ts",
        "packages\\frontend\\src\\services\\websocket.ts",
        "packages\\frontend\\src\\store\\useAnalysisStore.ts",
        "packages\\frontend\\src\\components\\analysis\\ProgressTracker.tsx",
        "packages\\frontend\\src\\components\\analysis\\MobileProgressTracker.tsx",
        "packages\\frontend\\src\\store\\useSettingsStore.ts",
        "packages\\frontend\\src\\components\\analysis\\AnalysisConfiguration.tsx",
        "tests\\assertion-helpers.ts",
        "tests\\regression-prevention.ts",
        "tests\\runtime-test-helpers.ts",
        "packages\\backend\\src\\index.ts",
        "packages\\backend\\src\\providers\\ClaudeProvider.ts",
        "packages\\frontend\\src\\components\\configuration\\ConfigurationManager.tsx"
      ]
    },
    {
      "id": "batch-6",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\hooks\\__tests__\\useProviders.models.test.ts",
          "relativePath": "packages\\frontend\\src\\hooks\\__tests__\\useProviders.models.test.ts",
          "size": 7353,
          "lastModified": "2025-09-02T12:37:37.062Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\hooks\\useProviders.ts"
          ],
          "estimatedDuration": 1218,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\OpenRouterProvider.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\OpenRouterProvider.test.ts",
          "size": 7584,
          "lastModified": "2025-09-02T12:37:15.931Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\OpenRouterProvider.ts"
          ],
          "estimatedDuration": 1241,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\hooks\\__tests__\\useProviders.test.ts",
          "relativePath": "packages\\frontend\\src\\hooks\\__tests__\\useProviders.test.ts",
          "size": 7610,
          "lastModified": "2025-09-02T12:37:37.028Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\hooks\\useProviders.ts"
          ],
          "estimatedDuration": 1243,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\GeminiProvider.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\GeminiProvider.test.ts",
          "size": 7659,
          "lastModified": "2025-08-31T10:07:25.624Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\GeminiProvider.ts"
          ],
          "estimatedDuration": 1248,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\routes\\__tests__\\providers.models.test.ts",
          "relativePath": "packages\\backend\\src\\api\\routes\\__tests__\\providers.models.test.ts",
          "size": 7941,
          "lastModified": "2025-09-02T12:37:15.474Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts",
            "packages\\backend\\src\\api\\routes\\providers.ts"
          ],
          "estimatedDuration": 1275,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\routes\\__tests__\\providers.test.ts",
          "relativePath": "packages\\backend\\src\\api\\routes\\__tests__\\providers.test.ts",
          "size": 8383,
          "lastModified": "2025-09-02T12:37:15.502Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts"
          ],
          "estimatedDuration": 1319,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\__tests__\\AnalysisConfiguration.error.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\__tests__\\AnalysisConfiguration.error.test.tsx",
          "size": 8843,
          "lastModified": "2025-08-30T19:56:44.917Z",
          "dependencies": [
            "packages\\frontend\\src\\hooks\\useToast.tsx",
            "packages\\frontend\\src\\components\\analysis\\AnalysisConfiguration.tsx"
          ],
          "estimatedDuration": 1364,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\__tests__\\ci-configuration.test.ts",
          "relativePath": "tests\\__tests__\\ci-configuration.test.ts",
          "size": 9020,
          "lastModified": "2025-08-28T17:32:27.593Z",
          "dependencies": [],
          "estimatedDuration": 1381,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\analysis\\results\\__tests__\\ExportButton.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\analysis\\results\\__tests__\\ExportButton.test.tsx",
          "size": 10184,
          "lastModified": "2025-08-30T20:44:37.095Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\components\\analysis\\results\\ExportButton.tsx"
          ],
          "estimatedDuration": 1495,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\batch-analyze.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\batch-analyze.test.ts",
          "size": 10717,
          "lastModified": "2025-09-02T13:25:47.124Z",
          "dependencies": [
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 1547,
          "priority": 70,
          "package": "root"
        }
      ],
      "estimatedDuration": 13331,
      "priority": 70,
      "dependencies": [
        "packages\\frontend\\src\\services\\api.ts",
        "packages\\frontend\\src\\hooks\\useProviders.ts",
        "packages\\backend\\src\\providers\\OpenRouterProvider.ts",
        "packages\\backend\\src\\providers\\GeminiProvider.ts",
        "packages\\backend\\src\\providers\\ProviderRegistry.ts",
        "packages\\backend\\src\\api\\routes\\providers.ts",
        "packages\\frontend\\src\\hooks\\useToast.tsx",
        "packages\\frontend\\src\\components\\analysis\\AnalysisConfiguration.tsx",
        "packages\\frontend\\src\\components\\analysis\\results\\ExportButton.tsx",
        "packages\\backend\\src\\core\\AnalysisEngine.ts"
      ]
    },
    {
      "id": "batch-7",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\AnalysisEngine.batch.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\AnalysisEngine.batch.test.ts",
          "size": 10783,
          "lastModified": "2025-08-28T17:32:25.449Z",
          "dependencies": [
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 1553,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\ProviderRegistry.enhanced.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\ProviderRegistry.enhanced.test.ts",
          "size": 11238,
          "lastModified": "2025-09-02T12:37:16.036Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts"
          ],
          "estimatedDuration": 1597,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\comprehensive-validation.test.ts",
          "relativePath": "tests\\comprehensive-validation.test.ts",
          "size": 11873,
          "lastModified": "2025-09-01T02:05:38.523Z",
          "dependencies": [
            "tests\\ci-test-utils.ts",
            "tests\\runtime-test-helpers.ts"
          ],
          "estimatedDuration": 1659,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\type-checking.test.ts",
          "relativePath": "tests\\type-checking.test.ts",
          "size": 12427,
          "lastModified": "2025-09-01T02:05:38.299Z",
          "dependencies": [],
          "estimatedDuration": 1714,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\IndexSystem.relationship.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\IndexSystem.relationship.test.ts",
          "size": 12490,
          "lastModified": "2025-08-28T17:32:25.465Z",
          "dependencies": [
            "packages\\backend\\src\\core\\IndexSystem.ts"
          ],
          "estimatedDuration": 1720,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\regression-prevention.test.ts",
          "relativePath": "tests\\regression-prevention.test.ts",
          "size": 12628,
          "lastModified": "2025-08-28T17:32:44.674Z",
          "dependencies": [],
          "estimatedDuration": 1733,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\providers\\__tests__\\ProviderRegistry.test.ts",
          "relativePath": "packages\\backend\\src\\providers\\__tests__\\ProviderRegistry.test.ts",
          "size": 12933,
          "lastModified": "2025-09-02T12:37:16.095Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts"
          ],
          "estimatedDuration": 1763,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\relationship.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\relationship.service.test.ts",
          "size": 13611,
          "lastModified": "2025-08-31T10:05:42.186Z",
          "dependencies": [
            "packages\\backend\\src\\core\\IndexSystem.ts",
            "packages\\backend\\src\\services\\relationship.service.ts"
          ],
          "estimatedDuration": 1829,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\log-management.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\log-management.service.test.ts",
          "size": 15239,
          "lastModified": "2025-08-31T10:05:42.158Z",
          "dependencies": [],
          "estimatedDuration": 1988,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\api.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\api.test.ts",
          "size": 15466,
          "lastModified": "2025-09-02T16:41:09.987Z",
          "dependencies": [
            "packages\\backend\\src\\index.ts"
          ],
          "estimatedDuration": 2010,
          "priority": 70,
          "package": "root"
        }
      ],
      "estimatedDuration": 17566,
      "priority": 70,
      "dependencies": [
        "packages\\backend\\src\\core\\AnalysisEngine.ts",
        "packages\\backend\\src\\providers\\ProviderRegistry.ts",
        "tests\\ci-test-utils.ts",
        "tests\\runtime-test-helpers.ts",
        "packages\\backend\\src\\core\\IndexSystem.ts",
        "packages\\backend\\src\\services\\relationship.service.ts",
        "packages\\backend\\src\\index.ts"
      ]
    },
    {
      "id": "batch-8",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\cli\\src\\__tests__\\cli-integration.test.ts",
          "relativePath": "packages\\cli\\src\\__tests__\\cli-integration.test.ts",
          "size": 3574,
          "lastModified": "2025-09-03T02:21:48.617Z",
          "dependencies": [],
          "estimatedDuration": 2547,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\IndexSystem.comprehensive.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\IndexSystem.comprehensive.test.ts",
          "size": 21194,
          "lastModified": "2025-08-31T10:05:42.075Z",
          "dependencies": [
            "packages\\backend\\src\\core\\IndexSystem.ts"
          ],
          "estimatedDuration": 2570,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\analysisEngine.advanced.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\analysisEngine.advanced.test.ts",
          "size": 21259,
          "lastModified": "2025-08-28T17:32:25.521Z",
          "dependencies": [
            "packages\\backend\\src\\core\\AnalysisEngine.ts"
          ],
          "estimatedDuration": 2576,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\end-to-end-workflows.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\end-to-end-workflows.test.ts",
          "size": 28730,
          "lastModified": "2025-09-02T12:37:15.369Z",
          "dependencies": [
            "packages\\backend\\src\\services\\log-management.service.ts",
            "packages\\backend\\src\\services\\logger.service.ts",
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 3306,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\performance.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\performance.test.ts",
          "size": 19880,
          "lastModified": "2025-08-29T02:35:31.226Z",
          "dependencies": [
            "packages\\backend\\src\\core\\AnalysisEngine.ts",
            "packages\\backend\\src\\services\\cache.service.ts",
            "packages\\backend\\src\\services\\deduplication.service.ts",
            "packages\\backend\\src\\services\\metrics.service.ts"
          ],
          "estimatedDuration": 12207,
          "priority": 70,
          "package": "root"
        }
      ],
      "estimatedDuration": 23206,
      "priority": 70,
      "dependencies": [
        "packages\\backend\\src\\core\\IndexSystem.ts",
        "packages\\backend\\src\\core\\AnalysisEngine.ts",
        "packages\\backend\\src\\services\\log-management.service.ts",
        "packages\\backend\\src\\services\\logger.service.ts",
        "packages\\backend\\src\\services\\path-handler.service.ts",
        "packages\\backend\\src\\services\\cache.service.ts",
        "packages\\backend\\src\\services\\deduplication.service.ts",
        "packages\\backend\\src\\services\\metrics.service.ts"
      ]
    },
    {
      "id": "batch-9",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\performance-load.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\performance-load.test.ts",
          "size": 22834,
          "lastModified": "2025-08-29T02:39:34.163Z",
          "dependencies": [
            "packages\\backend\\src\\services\\log-management.service.ts",
            "packages\\backend\\src\\services\\logger.service.ts",
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 13649,
          "priority": 70,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\hooks\\__tests__\\useToast.test.tsx",
          "relativePath": "packages\\frontend\\src\\hooks\\__tests__\\useToast.test.tsx",
          "size": 5262,
          "lastModified": "2025-08-05T00:48:33.013Z",
          "dependencies": [
            "packages\\frontend\\src\\hooks\\useToast.tsx"
          ],
          "estimatedDuration": 1014,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\logger.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\logger.service.test.ts",
          "size": 5600,
          "lastModified": "2025-08-16T00:25:02.180Z",
          "dependencies": [],
          "estimatedDuration": 1047,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\RepositorySelector.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\RepositorySelector.test.tsx",
          "size": 5739,
          "lastModified": "2025-08-05T00:48:33.631Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\fileSystem.ts",
            "packages\\frontend\\src\\store\\useAnalysisStore.ts",
            "packages\\frontend\\src\\components\\repository\\RepositorySelector.tsx"
          ],
          "estimatedDuration": 1060,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\RelationshipGraph.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\RelationshipGraph.test.tsx",
          "size": 5863,
          "lastModified": "2025-08-05T01:09:10.486Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\repository\\RelationshipGraph.tsx"
          ],
          "estimatedDuration": 1073,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\utils\\__tests__\\queue.test.ts",
          "relativePath": "packages\\backend\\src\\utils\\__tests__\\queue.test.ts",
          "size": 6093,
          "lastModified": "2025-08-13T01:36:02.644Z",
          "dependencies": [
            "packages\\backend\\src\\utils\\queue.ts"
          ],
          "estimatedDuration": 1095,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\codeStructureAnalyzer.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\codeStructureAnalyzer.test.ts",
          "size": 6515,
          "lastModified": "2025-08-25T17:39:41.778Z",
          "dependencies": [
            "packages\\backend\\src\\core\\codeStructureAnalyzer.ts"
          ],
          "estimatedDuration": 1136,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\SearchInterface.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\SearchInterface.test.tsx",
          "size": 6957,
          "lastModified": "2025-08-05T00:48:33.558Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\api.ts",
            "packages\\frontend\\src\\store\\useRepositoryStore.ts",
            "packages\\frontend\\src\\components\\repository\\SearchInterface.tsx"
          ],
          "estimatedDuration": 1179,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\logger-outputs.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\logger-outputs.service.test.ts",
          "size": 6982,
          "lastModified": "2025-08-16T01:14:23.799Z",
          "dependencies": [],
          "estimatedDuration": 1182,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\logger-http-simple.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\logger-http-simple.service.test.ts",
          "size": 8403,
          "lastModified": "2025-08-16T00:25:02.133Z",
          "dependencies": [],
          "estimatedDuration": 1321,
          "priority": 60,
          "package": "root"
        }
      ],
      "estimatedDuration": 23756,
      "priority": 61,
      "dependencies": [
        "packages\\backend\\src\\services\\log-management.service.ts",
        "packages\\backend\\src\\services\\logger.service.ts",
        "packages\\backend\\src\\services\\path-handler.service.ts",
        "packages\\frontend\\src\\hooks\\useToast.tsx",
        "packages\\frontend\\src\\services\\fileSystem.ts",
        "packages\\frontend\\src\\store\\useAnalysisStore.ts",
        "packages\\frontend\\src\\components\\repository\\RepositorySelector.tsx",
        "packages\\frontend\\src\\components\\repository\\RelationshipGraph.tsx",
        "packages\\backend\\src\\utils\\queue.ts",
        "packages\\backend\\src\\core\\codeStructureAnalyzer.ts",
        "packages\\frontend\\src\\services\\api.ts",
        "packages\\frontend\\src\\store\\useRepositoryStore.ts",
        "packages\\frontend\\src\\components\\repository\\SearchInterface.tsx"
      ]
    },
    {
      "id": "batch-10",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\repository\\__tests__\\IntegrationOpportunities.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\repository\\__tests__\\IntegrationOpportunities.test.tsx",
          "size": 8970,
          "lastModified": "2025-08-07T10:04:58.642Z",
          "dependencies": [
            "packages\\frontend\\src\\components\\repository\\IntegrationOpportunities.tsx"
          ],
          "estimatedDuration": 1376,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\path-handler-cache.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\path-handler-cache.test.ts",
          "size": 10014,
          "lastModified": "2025-08-16T00:25:02.212Z",
          "dependencies": [],
          "estimatedDuration": 1478,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\utils\\__tests__\\errorHandling.test.ts",
          "relativePath": "packages\\frontend\\src\\utils\\__tests__\\errorHandling.test.ts",
          "size": 10022,
          "lastModified": "2025-08-09T17:28:46.134Z",
          "dependencies": [],
          "estimatedDuration": 1479,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\config-compilation.test.ts",
          "relativePath": "tests\\config-compilation.test.ts",
          "size": 10762,
          "lastModified": "2025-08-09T17:28:43.814Z",
          "dependencies": [],
          "estimatedDuration": 1551,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\IndexSystem.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\IndexSystem.test.ts",
          "size": 11475,
          "lastModified": "2025-08-24T18:57:54.473Z",
          "dependencies": [
            "packages\\backend\\src\\core\\IndexSystem.ts"
          ],
          "estimatedDuration": 1621,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\error\\__tests__\\EnhancedErrorDisplay.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\error\\__tests__\\EnhancedErrorDisplay.test.tsx",
          "size": 12196,
          "lastModified": "2025-08-16T01:15:31.285Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\errorMessages.ts",
            "packages\\frontend\\src\\services\\pathValidation.ts",
            "packages\\frontend\\src\\components\\error\\EnhancedErrorDisplay.tsx"
          ],
          "estimatedDuration": 1691,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\test\\accessibility\\a11y.test.tsx",
          "relativePath": "packages\\frontend\\src\\test\\accessibility\\a11y.test.tsx",
          "size": 12819,
          "lastModified": "2025-08-19T02:11:23.859Z",
          "dependencies": [
            "packages\\frontend\\src\\App.tsx"
          ],
          "estimatedDuration": 1752,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\bun-compatibility.test.ts",
          "relativePath": "tests\\bun-compatibility.test.ts",
          "size": 14628,
          "lastModified": "2025-08-09T17:28:43.883Z",
          "dependencies": [],
          "estimatedDuration": 1929,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\controllers\\__tests__\\export.controller.test.ts",
          "relativePath": "packages\\backend\\src\\api\\controllers\\__tests__\\export.controller.test.ts",
          "size": 15061,
          "lastModified": "2025-08-25T17:39:41.717Z",
          "dependencies": [
            "packages\\backend\\src\\services\\export.service.ts"
          ],
          "estimatedDuration": 1971,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\biome-rules-validation.test.ts",
          "relativePath": "tests\\biome-rules-validation.test.ts",
          "size": 18996,
          "lastModified": "2025-08-26T01:12:53.559Z",
          "dependencies": [
            "types\\config.ts"
          ],
          "estimatedDuration": 2355,
          "priority": 60,
          "package": "root"
        }
      ],
      "estimatedDuration": 17203,
      "priority": 60,
      "dependencies": [
        "packages\\frontend\\src\\components\\repository\\IntegrationOpportunities.tsx",
        "packages\\backend\\src\\core\\IndexSystem.ts",
        "packages\\frontend\\src\\services\\errorMessages.ts",
        "packages\\frontend\\src\\services\\pathValidation.ts",
        "packages\\frontend\\src\\components\\error\\EnhancedErrorDisplay.tsx",
        "packages\\frontend\\src\\App.tsx",
        "packages\\backend\\src\\services\\export.service.ts",
        "types\\config.ts"
      ]
    },
    {
      "id": "batch-11",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\core\\__tests__\\advancedAnalyzer.test.ts",
          "relativePath": "packages\\backend\\src\\core\\__tests__\\advancedAnalyzer.test.ts",
          "size": 20694,
          "lastModified": "2025-08-24T18:58:38.221Z",
          "dependencies": [
            "packages\\backend\\src\\core\\advancedAnalyzer.ts"
          ],
          "estimatedDuration": 2521,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\routes\\__tests__\\providers-integration.test.ts",
          "relativePath": "packages\\backend\\src\\api\\routes\\__tests__\\providers-integration.test.ts",
          "size": 3877,
          "lastModified": "2025-09-02T12:37:15.480Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts"
          ],
          "estimatedDuration": 2636,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\test\\user-acceptance\\real-world.test.tsx",
          "relativePath": "packages\\frontend\\src\\test\\user-acceptance\\real-world.test.tsx",
          "size": 22309,
          "lastModified": "2025-08-08T02:28:38.447Z",
          "dependencies": [
            "packages\\frontend\\src\\App.tsx"
          ],
          "estimatedDuration": 2679,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\error-message.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\error-message.service.test.ts",
          "size": 23420,
          "lastModified": "2025-08-16T01:14:23.779Z",
          "dependencies": [
            "packages\\backend\\src\\services\\error-message.service.ts",
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 2787,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\path-handler.service.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\path-handler.service.test.ts",
          "size": 24643,
          "lastModified": "2025-08-16T01:14:24.252Z",
          "dependencies": [],
          "estimatedDuration": 2907,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\e2e\\mock-integration.test.ts",
          "relativePath": "tests\\e2e\\mock-integration.test.ts",
          "size": 10776,
          "lastModified": "2025-09-03T02:30:11.177Z",
          "dependencies": [
            "tests\\MockManager.ts"
          ],
          "estimatedDuration": 4657,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\integration\\core-functionality.test.ts",
          "relativePath": "tests\\integration\\core-functionality.test.ts",
          "size": 14034,
          "lastModified": "2025-09-03T02:28:53.604Z",
          "dependencies": [
            "tests\\MockManager.ts"
          ],
          "estimatedDuration": 5612,
          "priority": 60,
          "package": "root"
        }
      ],
      "estimatedDuration": 23799,
      "priority": 60,
      "dependencies": [
        "packages\\backend\\src\\core\\advancedAnalyzer.ts",
        "packages\\backend\\src\\providers\\ProviderRegistry.ts",
        "packages\\frontend\\src\\App.tsx",
        "packages\\backend\\src\\services\\error-message.service.ts",
        "packages\\backend\\src\\services\\path-handler.service.ts",
        "tests\\MockManager.ts"
      ]
    },
    {
      "id": "batch-12",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\test\\performance.test.ts",
          "relativePath": "packages\\frontend\\src\\test\\performance.test.ts",
          "size": 10062,
          "lastModified": "2025-08-09T17:28:46.453Z",
          "dependencies": [
            "packages\\frontend\\src\\hooks\\useLazyLoading.ts",
            "packages\\frontend\\src\\services\\performance.service.ts"
          ],
          "estimatedDuration": 7413,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\performance-monitor.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\performance-monitor.test.ts",
          "size": 10343,
          "lastModified": "2025-08-16T01:14:23.974Z",
          "dependencies": [],
          "estimatedDuration": 7550,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\components\\__tests__\\PathInput.integration.test.tsx",
          "relativePath": "packages\\frontend\\src\\components\\__tests__\\PathInput.integration.test.tsx",
          "size": 21283,
          "lastModified": "2025-09-03T01:53:00.614Z",
          "dependencies": [
            "packages\\frontend\\src\\services\\pathValidation.ts",
            "packages\\frontend\\src\\components\\common\\PathInput.tsx"
          ],
          "estimatedDuration": 7735,
          "priority": 60,
          "package": "root"
        }
      ],
      "estimatedDuration": 22698,
      "priority": 60,
      "dependencies": [
        "packages\\frontend\\src\\hooks\\useLazyLoading.ts",
        "packages\\frontend\\src\\services\\performance.service.ts",
        "packages\\frontend\\src\\services\\pathValidation.ts",
        "packages\\frontend\\src\\components\\common\\PathInput.tsx"
      ]
    },
    {
      "id": "batch-13",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\services\\__tests__\\path-handler-performance.test.ts",
          "relativePath": "packages\\backend\\src\\services\\__tests__\\path-handler-performance.test.ts",
          "size": 13029,
          "lastModified": "2025-08-16T00:25:02.221Z",
          "dependencies": [],
          "estimatedDuration": 8862,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\test\\performance\\benchmarks.test.ts",
          "relativePath": "packages\\frontend\\src\\test\\performance\\benchmarks.test.ts",
          "size": 13539,
          "lastModified": "2025-08-09T17:28:46.584Z",
          "dependencies": [],
          "estimatedDuration": 9111,
          "priority": 60,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\routes\\__tests__\\openrouter-integration.test.ts",
          "relativePath": "packages\\backend\\src\\api\\routes\\__tests__\\openrouter-integration.test.ts",
          "size": 5825,
          "lastModified": "2025-09-02T12:37:15.472Z",
          "dependencies": [
            "packages\\backend\\src\\providers\\ProviderRegistry.ts",
            "packages\\backend\\src\\api\\routes\\providers.ts"
          ],
          "estimatedDuration": 3207,
          "priority": 50,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\analyze-workflow.integration.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\analyze-workflow.integration.test.ts",
          "size": 17057,
          "lastModified": "2025-08-29T02:39:34.160Z",
          "dependencies": [
            "packages\\backend\\src\\api\\routes\\index.ts"
          ],
          "estimatedDuration": 6497,
          "priority": 50,
          "package": "root"
        }
      ],
      "estimatedDuration": 27677,
      "priority": 55,
      "dependencies": [
        "packages\\backend\\src\\providers\\ProviderRegistry.ts",
        "packages\\backend\\src\\api\\routes\\providers.ts",
        "packages\\backend\\src\\api\\routes\\index.ts"
      ]
    },
    {
      "id": "batch-14",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\platform-integration.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\platform-integration.test.ts",
          "size": 17856,
          "lastModified": "2025-09-02T12:37:15.346Z",
          "dependencies": [
            "packages\\backend\\src\\services\\logger.service.ts",
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 6731,
          "priority": 50,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\logging-integration.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\logging-integration.test.ts",
          "size": 17878,
          "lastModified": "2025-08-29T02:16:09.196Z",
          "dependencies": [],
          "estimatedDuration": 6738,
          "priority": 50,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\api\\__tests__\\path-integration.test.ts",
          "relativePath": "packages\\backend\\src\\api\\__tests__\\path-integration.test.ts",
          "size": 22372,
          "lastModified": "2025-09-02T12:37:15.442Z",
          "dependencies": [
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 8054,
          "priority": 50,
          "package": "root"
        }
      ],
      "estimatedDuration": 21523,
      "priority": 50,
      "dependencies": [
        "packages\\backend\\src\\services\\logger.service.ts",
        "packages\\backend\\src\\services\\path-handler.service.ts"
      ]
    },
    {
      "id": "batch-15",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\backend\\src\\__tests__\\logging-system-integration.test.ts",
          "relativePath": "packages\\backend\\src\\__tests__\\logging-system-integration.test.ts",
          "size": 24024,
          "lastModified": "2025-09-02T12:37:15.360Z",
          "dependencies": [
            "packages\\backend\\src\\services\\log-management.service.ts",
            "packages\\backend\\src\\services\\logger.service.ts",
            "packages\\backend\\src\\services\\path-handler.service.ts"
          ],
          "estimatedDuration": 8538,
          "priority": 50,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\e2e\\cli.test.ts",
          "relativePath": "tests\\e2e\\cli.test.ts",
          "size": 12196,
          "lastModified": "2025-08-09T17:28:43.658Z",
          "dependencies": [
            "tests\\e2e\\types.ts"
          ],
          "estimatedDuration": 5073,
          "priority": 40,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\packages\\frontend\\src\\test\\e2e\\integration.test.tsx",
          "relativePath": "packages\\frontend\\src\\test\\e2e\\integration.test.tsx",
          "size": 15230,
          "lastModified": "2025-08-08T02:37:21.502Z",
          "dependencies": [
            "packages\\frontend\\src\\App.tsx"
          ],
          "estimatedDuration": 5962,
          "priority": 40,
          "package": "root"
        },
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\e2e\\analysis.test.ts",
          "relativePath": "tests\\e2e\\analysis.test.ts",
          "size": 16242,
          "lastModified": "2025-08-09T17:28:43.751Z",
          "dependencies": [
            "tests\\e2e\\types.ts"
          ],
          "estimatedDuration": 6258,
          "priority": 40,
          "package": "root"
        }
      ],
      "estimatedDuration": 25831,
      "priority": 43,
      "dependencies": [
        "packages\\backend\\src\\services\\log-management.service.ts",
        "packages\\backend\\src\\services\\logger.service.ts",
        "packages\\backend\\src\\services\\path-handler.service.ts",
        "tests\\e2e\\types.ts",
        "packages\\frontend\\src\\App.tsx"
      ]
    },
    {
      "id": "batch-16",
      "files": [
        {
          "path": "C:\\Users\\AlexJ\\Documents\\Coding\\Repos\\my-repos\\myRepoAnalyzer\\unified-repo-analyzer\\tests\\e2e\\performance.test.ts",
          "relativePath": "tests\\e2e\\performance.test.ts",
          "size": 16447,
          "lastModified": "2025-08-26T01:04:03.964Z",
          "dependencies": [
            "tests\\e2e\\types.ts"
          ],
          "estimatedDuration": 31592,
          "priority": 40,
          "package": "root"
        }
      ],
      "estimatedDuration": 31592,
      "priority": 40,
      "dependencies": [
        "tests\\e2e\\types.ts"
      ]
    }
  ],
  "totalEstimatedDuration": 301240,
  "strategy": "parallel",
  "maxConcurrency": 4
};

async function runFastFeedback() {
  console.log('⚡ Running fast feedback tests...');
  
  const startTime = Date.now();
  let failedBatches = 0;
  
  try {
    if (plan.strategy === 'sequential') {
      // Run batches sequentially
      for (const batch of plan.batches) {
        console.log(`🧪 Running ${batch.id} (${batch.files.length} tests)...`);
        
        const testPaths = batch.files.map(f => f.relativePath).join(' ');
        
        try {
          execSync(`vitest run ${testPaths} --reporter=basic --run`, {
            stdio: 'inherit',
            timeout: batch.estimatedDuration + 10000, // Add 10s buffer
          });
          console.log(`✅ ${batch.id} completed`);
        } catch (error) {
          console.error(`❌ ${batch.id} failed`);
          failedBatches++;
          
          // Fast fail for critical failures
          if (batch.priority > 80) {
            console.log('🚨 High priority batch failed, stopping execution');
            break;
          }
        }
      }
    } else {
      // Run high-priority batch first for fast feedback
      const highPriorityBatch = plan.batches
        .filter(b => b.priority > 70)
        .sort((a, b) => b.priority - a.priority)[0];
      
      if (highPriorityBatch) {
        console.log(`🚀 Running high-priority batch first: ${highPriorityBatch.id}`);
        
        const testPaths = highPriorityBatch.files.map(f => f.relativePath).join(' ');
        
        try {
          execSync(`vitest run ${testPaths} --reporter=basic --run`, {
            stdio: 'inherit',
            timeout: highPriorityBatch.estimatedDuration + 10000,
          });
          console.log('✅ High-priority tests passed, continuing with remaining tests...');
        } catch (error) {
          console.error('❌ High-priority tests failed, check critical functionality');
          failedBatches++;
        }
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`\n📊 Fast feedback completed in ${(duration / 1000).toFixed(1)}s`);
    console.log(`Batches: ${plan.batches.length - failedBatches}/${plan.batches.length} passed`);
    
    if (failedBatches === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️ ${failedBatches} batch(es) failed`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fast feedback execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runFastFeedback();
}
