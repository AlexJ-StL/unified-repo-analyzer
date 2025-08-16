#!/usr/bin/env pwsh
# Script to process backend package in manageable chunks

param(
    [switch]$Write = $false,
    [switch]$Unsafe = $false,
    [int]$MaxDiagnostics = 50
)

$ErrorActionPreference = "Continue"

# Define backend subdirectories to process
$backendChunks = @(
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

Write-Host "🔧 Processing Backend Package in Chunks" -ForegroundColor Cyan
Write-Host "Write mode: $Write | Unsafe: $Unsafe | Max diagnostics: $MaxDiagnostics" -ForegroundColor Yellow
Write-Host ""

$totalErrors = 0
$totalWarnings = 0
$processedChunks = 0

foreach ($chunk in $backendChunks) {
    Write-Host "📁 Processing: $chunk" -ForegroundColor Green
    
    # Build biome command
    $biomeArgs = @("check", $chunk, "--max-diagnostics=$MaxDiagnostics")
    
    if ($Write) {
        $biomeArgs += "--write"
    }
    
    if ($Unsafe) {
        $biomeArgs += "--unsafe"
    }
    
    try {
        # Run biome on this chunk
        $result = & bun biome @biomeArgs 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $chunk - No issues found" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $chunk - Issues found (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
            
            # Extract error/warning counts from output if possible
            $errorMatch = $result | Select-String "Found (\d+) errors"
            $warningMatch = $result | Select-String "Found (\d+) warnings"
            
            if ($errorMatch) {
                $chunkErrors = [int]$errorMatch.Matches[0].Groups[1].Value
                $totalErrors += $chunkErrors
                Write-Host "   Errors: $chunkErrors" -ForegroundColor Red
            }
            
            if ($warningMatch) {
                $chunkWarnings = [int]$warningMatch.Matches[0].Groups[1].Value
                $totalWarnings += $chunkWarnings
                Write-Host "   Warnings: $chunkWarnings" -ForegroundColor Yellow
            }
        }
        
        $processedChunks++
        
    } catch {
        Write-Host "❌ Failed to process $chunk : $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "Processed chunks: $processedChunks/$($backendChunks.Count)" -ForegroundColor White
Write-Host "Total errors: $totalErrors" -ForegroundColor Red
Write-Host "Total warnings: $totalWarnings" -ForegroundColor Yellow

if ($totalErrors -eq 0 -and $totalWarnings -eq 0) {
    Write-Host "🎉 All backend chunks processed successfully!" -ForegroundColor Green
} else {
    Write-Host "🔧 Consider running with -Write to auto-fix issues" -ForegroundColor Cyan
    Write-Host "⚠️  Use -Unsafe for additional fixes (review changes carefully)" -ForegroundColor Yellow
}