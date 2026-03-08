#!/usr/bin/env bash
# Build the React app (served by Django — no separate dev server needed)
set -e
cd "$(dirname "$0")/frontend"
npm run build
echo "Build complete. The Django server serves the frontend at http://localhost:8000"
