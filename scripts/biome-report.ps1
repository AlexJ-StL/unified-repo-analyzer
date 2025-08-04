param(
  [int]$MaxDiagnostics = 500
)
$ErrorActionPreference = "Stop"

# Timestamp and logs directory
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$repoRoot = Split-Path -Parent $PSScriptRoot
$logsRoot = Join-Path $repoRoot "logs"
New-Item -ItemType Directory -Force -Path $logsRoot | Out-Null

# Log path
$log = Join-Path $logsRoot ("biome-report-$stamp.txt")

# Run biome check with summary and github reporters, tee to log
$cmd = "bunx biome check unified-repo-analyzer --max-diagnostics $MaxDiagnostics --reporter summary,github"
Write-Host "Running: $cmd"

# Ensure the log file exists before tee (precreate)
"Biome report started at $stamp`n" | Out-File -FilePath $log -Encoding UTF8 -Force

# Execute and tee (no Out-Null to avoid timing issues)
Invoke-Expression $cmd 2>&1 | Tee-Object -FilePath $log

# Show last 200 lines for quick local scan, guarding existence
if (Test-Path $log) {
  $tail = Get-Content $log -Tail 200
  $tail | Write-Output
  Write-Host "Report saved to $log"
} else {
  Write-Warning "Expected log not found at $log"
}