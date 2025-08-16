# Simple script to process backend package in chunks
param([switch]$Write)

$chunks = @(
    "packages/backend/src/config",
    "packages/backend/src/types", 
    "packages/backend/src/utils",
    "packages/backend/src/providers",
    "packages/backend/src/services",
    "packages/backend/src/core",
    "packages/backend/src/api",
    "packages/backend/src/scripts",
    "packages/backend/src/__tests__",
    "packages/backend/src/index.ts"
)

Write-Host "Processing Backend in Chunks..." -ForegroundColor Cyan

foreach ($chunk in $chunks) {
    Write-Host "Processing: $chunk" -ForegroundColor Green
    
    if ($Write) {
        & bun biome check $chunk --write --max-diagnostics=20
    } else {
        & bun biome check $chunk --max-diagnostics=20
    }
    
    Write-Host ""
}

Write-Host "Done!" -ForegroundColor Green