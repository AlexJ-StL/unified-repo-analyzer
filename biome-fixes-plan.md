# Biome Linting Fixes Plan

## Overview
This document outlines the workflow for fixing Biome linting errors and warnings across the codebase. The fixes are grouped by category, prioritized to maintain test coverage and functionality.

## Workflow Diagram
```mermaid
flowchart TD
    A[Start: Priority Test Fixes] --> B[Static-Only Classes: Convert to functions in tests/regression-prevention.ts, runtime-test-helpers.ts]
    B --> C[Non-Null Assertions: Add null checks in runtime-test-helpers.ts, test-isolation.ts]
    C --> D[Remove Unused Suppressions: Clean console comments in test-isolation.ts]
    D --> E[Backend Fixes]
    E --> F[forEach to for...of: Update loops in IndexSystem.ts, codeStructureAnalyzer.ts, relationship.service.ts]
    F --> G[Parameter Assignments: Use local vars in languageDetection.ts]
    G --> H[While Loop Regex: Declare match separately in codeStructureAnalyzer.ts, error-handling.ts]
    H --> I[Frontend Fixes]
    I --> J[Nested Components: Move definitions in AnalysisConfiguration.tsx]
    J --> K[Unique IDs: Implement useId() in AnalysisConfiguration.tsx, preferences, SettingsPage.tsx]
    K --> L[Stable Keys: Fix array indices in PathInput.tsx, EnhancedErrorDisplay.tsx, IntegrationOpportunities.tsx]
    L --> M[Accessibility: Add roles/handlers in FileTreeViewer.tsx, AnalysisPreferences.tsx, PathInput.tsx]
    M --> N[Hook Dependencies: Fix useEffect/useCallback in usePerformanceOptimization.ts, useRetry.ts]
    N --> O[Script Fixes]
    O --> P[forEach to for...of: Update in migrate-config.ts, test-execution-optimizer.ts, test-cleanup-helpers.ts]
    P --> Q[Parameter Mutations: Use local vars in feature-rollout.ts, migrate-config.ts]
    Q --> R[While Loops & Assignments: Fix regex and += in test-execution-optimizer.ts, deployment-verification.ts]
    R --> S[Duplicate Hooks: Consolidate afterAll in e2e tests]
    S --> T[Verification]
    T --> U[Run bun biome check --apply to validate fixes]
    U --> V[Run vitest to confirm coverage & functionality]
    V --> W[End: All issues resolved, no breaking changes]
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style O fill:#fff3e0
    style T fill:#fce4ec
```

## Detailed Steps
Refer to the todo list for actionable items. Fixes will use `apply_diff` for targeted changes to preserve existing code and test coverage.

## Requirements
- Use only Bun, Biome, Vitest
- Maintain TypeScript strict mode
- No breaking changes to APIs/props
- Ensure accessibility and performance