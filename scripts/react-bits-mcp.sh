#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="/home/nightbreeze/Documents/website-portfolio-mifdlal"
cd "$PROJECT_DIR"
exec npx --yes shadcn@latest mcp
