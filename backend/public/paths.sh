#!/bin/bash

# Output file (optional, default: relative_paths.txt)
OUTPUT_FILE="${1:-relative_paths.txt}"

# Recursively list all files with relative paths and save to output file
find . -type f > "$OUTPUT_FILE"

echo "All relative file paths saved to '$OUTPUT_FILE'"

