#!/bin/bash
# Script to process backend package in manageable chunks

WRITE_MODE=""
UNSAFE_MODE=""
MAX_DIAGNOSTICS=20

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --write)
            WRITE_MODE="--write"
            shift
            ;;
        --unsafe)
            UNSAFE_MODE="--unsafe"
            shift
            ;;
        --max-diagnostics)
            MAX_DIAGNOSTICS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Define backend chunks
chunks=(
    "packages/backend/src/config"
    "packages/backend/src/types"
    "packages/backend/src/utils"
    "packages/backend/src/providers"
    "packages/backend/src/services"
    "packages/backend/src/core"
    "packages/backend/src/api"
    "packages/backend/src/scripts"
    "packages/backend/src/__tests__"
    "packages/backend/src/index.ts"
)

echo "🔧 Processing Backend Package in Chunks"
echo "Write mode: $WRITE_MODE | Unsafe: $UNSAFE_MODE | Max diagnostics: $MAX_DIAGNOSTICS"
echo ""

total_errors=0
total_warnings=0
processed_chunks=0

for chunk in "${chunks[@]}"; do
    echo "📁 Processing: $chunk"
    
    # Build command
    cmd="bun biome check \"$chunk\" --max-diagnostics=$MAX_DIAGNOSTICS"
    
    if [[ -n "$WRITE_MODE" ]]; then
        cmd="$cmd $WRITE_MODE"
    fi
    
    if [[ -n "$UNSAFE_MODE" ]]; then
        cmd="$cmd $UNSAFE_MODE"
    fi
    
    # Execute command
    if eval $cmd; then
        echo "✅ $chunk - No issues found"
    else
        echo "⚠️  $chunk - Issues found"
    fi
    
    ((processed_chunks++))
    echo ""
done

echo "📊 Summary"
echo "Processed chunks: $processed_chunks/${#chunks[@]}"
echo ""
echo "💡 Usage: ./biome-backend-chunks.sh [--write] [--unsafe] [--max-diagnostics N]"