# Unified Repository Analyzer API

This directory contains the REST API server implementation for the Unified Repository Analyzer.

## API Endpoints

### Analysis

- `POST /api/analyze` - Analyze a single repository
  - Request body: `{ path: string, options?: AnalysisOptions }`
  - Response: `RepositoryAnalysis`

- `POST /api/analyze/batch` - Analyze multiple repositories
  - Request body: `{ paths: string[], options?: AnalysisOptions }`
  - Response: `BatchAnalysisResult`

### Repositories

- `GET /api/repositories` - Get all indexed repositories
  - Response: `IndexedRepository[]`

- `GET /api/repositories/:id` - Get a specific repository by ID
  - Response: `IndexedRepository`

- `GET /api/repositories/search` - Search repositories based on query parameters
  - Query parameters:
    - `languages`: string[] - Filter by programming languages
    - `frameworks`: string[] - Filter by frameworks
    - `keywords`: string[] - Search by keywords
    - `fileTypes`: string[] - Filter by file types
    - `dateRange.start`: ISO date string - Filter by analysis date range start
    - `dateRange.end`: ISO date string - Filter by analysis date range end
  - Response: `SearchResult[]`

- `GET /api/repositories/:id/similar` - Find similar repositories to the specified repository
  - Response: `RepositoryMatch[]`

- `POST /api/repositories/combinations` - Suggest combinations of repositories
  - Request body: `{ repoIds: string[] }`
  - Response: `CombinationSuggestion[]`

## WebSocket Events

### Client to Server

- `register-analysis` - Register for updates about a specific analysis
  - Payload: `analysisId: string`

### Server to Client

- `analysis-progress` - Real-time progress updates for repository analysis
  - Payload: `{ total: number, processed: number, currentFile: string, status: string }`

- `batch-analysis-progress` - Real-time progress updates for batch repository analysis
  - Payload: `{ total: number, processed: number, currentRepository: string, status: string }`

- `analysis-complete` - Notification when analysis is complete
  - Payload: `{ id: string, status: string }`

## Error Handling

The API uses a standardized error response format:

```json
{
  "status": 400,
  "message": "Validation error",
  "errors": [
    {
      "param": "path",
      "msg": "Repository path is required"
    }
  ]
}
```

## Authentication

Authentication is not implemented in this version of the API. All endpoints are publicly accessible.