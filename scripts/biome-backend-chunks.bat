@echo off
REM Script to process backend package in manageable chunks

setlocal enabledelayedexpansion

set "WRITE_MODE=%1"
set "UNSAFE_MODE=%2"

echo 🔧 Processing Backend Package in Chunks
echo Write mode: %WRITE_MODE% ^| Unsafe: %UNSAFE_MODE%
echo.

set chunks=packages/backend/src/config packages/backend/src/types packages/backend/src/utils packages/backend/src/providers packages/backend/src/services packages/backend/src/core packages/backend/src/api packages/backend/src/scripts packages/backend/src/__tests__ packages/backend/src/index.ts

for %%c in (%chunks%) do (
    echo 📁 Processing: %%c
    
    if "%WRITE_MODE%"=="--write" (
        if "%UNSAFE_MODE%"=="--unsafe" (
            bun biome check "%%c" --write --unsafe --max-diagnostics=20
        ) else (
            bun biome check "%%c" --write --max-diagnostics=20
        )
    ) else (
        bun biome check "%%c" --max-diagnostics=20
    )
    
    echo.
)

echo 📊 All chunks processed!
echo 💡 Usage: biome-backend-chunks.bat [--write] [--unsafe]