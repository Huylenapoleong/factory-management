# Check-all script for Factory Management Platform (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Running Full Repository CI Validation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$root = Split-Path -Parent $PSScriptRoot

# 1. Frontend Validation
Write-Host "`n[1/2] Checking Frontend (Typecheck, Lint, Prettier, Build)..." -ForegroundColor Yellow
Push-Location "$root/frontend"
try {
    npm run validate
    if ($LASTEXITCODE -ne 0) { throw "Frontend validation failed." }
    Write-Host "✅ Frontend validation PASSED." -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend validation FAILED: $_" -ForegroundColor Red
    Pop-Location
    exit 1
} finally {
    Pop-Location
}

# 2. Backend Validation
Write-Host "`n[2/2] Checking Backend (Maven Compile & All Unit/Integration Tests)..." -ForegroundColor Yellow
Push-Location "$root/backend"
try {
    mvn test
    if ($LASTEXITCODE -ne 0) { throw "Backend test suite failed." }
    Write-Host "✅ Backend test suite PASSED." -ForegroundColor Green
} catch {
    Write-Host "❌ Backend test suite FAILED: $_" -ForegroundColor Red
    Pop-Location
    exit 1
} finally {
    Pop-Location
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "🎉 ALL CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
exit 0
