param(
  [Parameter(Mandatory=$true)][string]$Folder,
  [switch]$Write,
  [switch]$Unsafe,
  [int]$MaxDiagnostics = 500
)
$ErrorActionPreference = "Stop"

# Timestamp and logs directory
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$repoRoot = Split-Path -Parent $PSScriptRoot
$logsRoot = Join-Path $repoRoot "logs"
New-Item -ItemType Directory -Force -Path $logsRoot | Out-Null

# Flags (PowerShell 5 compatible, avoid ternary)
$flagWrite = ""
if ($Write.IsPresent) { $flagWrite = "--write" }
$flagUnsafe = ""
if ($Unsafe.IsPresent) { $flagUnsafe = "--unsafe" }

# Normalize folder to forward slashes for Biome; store safe version for filename
$folderArg = $Folder
$folderSafe = $Folder.Replace('/','-').Replace('\','-')

# Compose log path
$log = Join-Path $logsRoot ("biome-$folderSafe-$stamp.txt")

# Build command
$cmd = "bunx biome check `"$folderArg`" $flagWrite $flagUnsafe --reporter summary --max-diagnostics $MaxDiagnostics"

Write-Host "Running: $cmd"

# Precreate log to avoid timing races and ensure file exists
"Biome folder run ($Folder) started at $stamp`n" | Out-File -FilePath $log -Encoding UTF8 -Force

# Capture output and tee to log
$proc = Invoke-Expression $cmd 2>&1 | Tee-Object -FilePath $log

# Show only the last 200 lines to keep console noise low
if (Test-Path $log) {
  $tail = Get-Content $log -Tail 200
  $tail | Write-Output
} else {
  Write-Warning "Expected log not found at $log"
}

# Exit non-zero if Errors found in summary or any ERROR text appears
# Biome summary typically includes lines like 'errors: N'
$hasErrors = $false
if (Test-Path $log) {
  $tailText = Get-Content $log -Tail 200 | Out-String
  if ($tailText -match 'Errors?:\s*[1-9]\d*') { $hasErrors = $true }
}
# Also check process stream text
$procText = ($proc | Out-String)
if ($procText -match 'ERROR') { $hasErrors = $true }

if ($hasErrors) {
  Write-Error "Biome reported errors. See log: $log"
  exit 1
}

Write-Host "Biome run completed successfully. Log: $log"