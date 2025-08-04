# Unified Repository Analyzer API

This directory contains the REST API server implementation for the Unified Repository Analyzer.

Base URL
- Local default: http://localhost:3000
- Kubernetes (ClusterIP + Ingress): depends on your ingress host. See docs/DEPLOYMENT.md.

Version
- Backend package: 0.1.0
- Root: 1.0.0

API Endpoints

Analysis
- POST /api/analyze — Analyze a single repository
  Request
  ```json
  {
    "path": "/absolute/or/relative/path/to/repo",
    "options": {
      "includeDevDependencies": false,
      "maxFiles": 10000,
      "timeoutMs": 300000
    }
  }
  ```
  cURL
  ```bash
  curl -s -X POST http://localhost:3000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"path":"./my-repo","options":{"maxFiles":5000}}'
  ```
  Response (200)
  ```json
  {
    "id": "a1b2c3",
    "status": "queued",
    "summary": {
      "files": 1234,
      "languages": ["ts","js","md"],
      "sizeBytes": 4567890
    },
    "startedAt": "2025-08-04T06:50:00.000Z"
  }
  ```

- POST /api/analyze/batch — Analyze multiple repositories
  Request
  ```json
  {
    "paths": ["./repoA","./repoB"],
    "options": {
      "maxFiles": 8000
    }
  }
  ```
  cURL
  ```bash
  curl -s -X POST http://localhost:3000/api/analyze/batch \
    -H "Content-Type: application/json" \
    -d '{"paths":["./repoA","./repoB"],"options":{"maxFiles":8000}}'
  ```
  Response (200)
  ```json
  {
    "batchId": "b1c2d3",
    "status": "queued",
    "submitted": 2
  }
  ```

Repositories
- GET /api/repositories — Get all indexed repositories
  cURL
  ```bash
  curl -s http://localhost:3000/api/repositories
  ```
  Response (200)
  ```json
  [
    {
      "id": "repo-123",
      "name": "my-repo",
      "path": "/data/index/my-repo",
      "languages": ["ts","md"],
      "analyzedAt": "2025-08-03T12:00:00.000Z"
    }
  ]
  ```

- GET /api/repositories/:id — Get a specific repository by ID
  cURL
  ```bash
  curl -s http://localhost:3000/api/repositories/repo-123
  ```
  Response (200)
  ```json
  {
    "id": "repo-123",
    "name": "my-repo",
    "path": "/data/index/my-repo",
    "languages": ["ts","md"],
    "stats": {
      "files": 1234,
      "sizeBytes": 4567890
    }
  }
  ```

- GET /api/repositories/search — Search repositories by query
  Query parameters
  - languages: string[] (comma-separated)
  - frameworks: string[] (comma-separated)
  - keywords: string[] (comma-separated)
  - fileTypes: string[] (comma-separated)
  - dateRange.start: ISO date string
  - dateRange.end: ISO date string

  Examples
  ```bash
  curl -s "http://localhost:3000/api/repositories/search?languages=ts,js&keywords=express,react"
  ```
  Response (200)
  ```json
  [
    {"id":"r1","name":"repoA"},
    {"id":"r2","name":"repoB"}
  ]
  ```

- GET /api/repositories/:id/similar — Find similar repositories
  cURL
  ```bash
  curl -s http://localhost:3000/api/repositories/repo-123/similar
  ```
  Response (200)
  ```json
  [
    {"id":"r9","name":"similar-repo"}
  ]
  ```

- POST /api/repositories/combinations — Suggest combinations of repositories
  Request
  ```json
  { "repoIds": ["repo-123","repo-456"] }
  ```
  cURL
  ```bash
  curl -s -X POST http://localhost:3000/api/repositories/combinations \
    -H "Content-Type: application/json" \
    -d '{"repoIds":["repo-123","repo-456"]}'
  ```
  Response (200)
  ```json
  [
    { "combo": ["repo-123","repo-456"], "score": 0.82 }
  ]
  ```

WebSocket Events

Client to Server
- register-analysis — Register for updates about a specific analysis
  Payload
  ```json
  { "analysisId": "a1b2c3" }
  ```

Server to Client
- analysis-progress — Real-time progress updates for repository analysis
  Payload
  ```json
  { "total": 1000, "processed": 250, "currentFile": "src/app.ts", "status": "processing" }
  ```
- batch-analysis-progress — Real-time updates for batch analysis
  Payload
  ```json
  { "total": 2, "processed": 1, "currentRepository": "repoA", "status": "processing" }
  ```
- analysis-complete — Notification when analysis is complete
  Payload
  ```json
  { "id": "a1b2c3", "status": "complete" }
  ```

Error Handling

Standard error response format
```json
{
  "status": 400,
  "message": "Validation error",
  "errors": [
    { "param": "path", "msg": "Repository path is required" }
  ]
}
```

Authentication

Authentication is not implemented in this version of the API. All endpoints are publicly accessible.

Notes
- Ports: backend 3000, metrics 9090 (see k8s/services.yaml)
- Related docs: docs/USER_GUIDE.md, docs/DEPLOYMENT.md, docs/RELEASE_NOTES.md