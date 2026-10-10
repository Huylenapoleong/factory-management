#!/usr/bin/env bash
# Check-all script for Factory Management Platform (Bash)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=========================================="
echo "🚀 Running Full Repository CI Validation"
echo "=========================================="

# 1. Frontend Validation
echo -e "\n[1/2] Checking Frontend (Typecheck, Lint, Prettier, Build)..."
cd "${ROOT_DIR}/frontend"
npm run validate
echo "✅ Frontend validation PASSED."

# 2. Backend Validation
echo -e "\n[2/2] Checking Backend (Maven Compile & All Unit/Integration Tests)..."
cd "${ROOT_DIR}/backend"
mvn test
echo "✅ Backend test suite PASSED."

echo -e "\n=========================================="
echo "🎉 ALL CHECKS PASSED SUCCESSFULLY!"
echo "=========================================="
exit 0
