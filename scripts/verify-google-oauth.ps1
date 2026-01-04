# Google OAuth Implementation Verification Checklist (Windows)
# Usage: powershell -ExecutionPolicy Bypass -File verify-google-oauth.ps1

Write-Host "=== Google OAuth Implementation Verification ===" -ForegroundColor Green
Write-Host ""

# Counters
$passed = 0
$failed = 0
$warnings = 0

# Function to check file
function Check-File {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        Write-Host "✅ $FilePath" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "❌ $FilePath" -ForegroundColor Red
        $script:failed++
    }
}

# Function to check directory
function Check-Directory {
    param([string]$DirPath)
    if (Test-Path $DirPath -PathType Container) {
        Write-Host "✅ $DirPath (directory)" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "❌ $DirPath (directory)" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "📁 Checking File Structure..." -ForegroundColor Cyan
Write-Host ""

# Core files
Check-File "config/google-oauth.php"
Check-File "api/google-oauth-callback.php"
Check-File "api/get-google-oauth-url.php"
Check-File "api/test-google-oauth.php"

Write-Host ""
Write-Host "📝 Checking Documentation..." -ForegroundColor Cyan
Write-Host ""

Check-File "GOOGLE_OAUTH_SETUP.md"
Check-File "GOOGLE_OAUTH_QUICK_START.md"
Check-File "IMPLEMENTATION_SUMMARY_GOOGLE_OAUTH.md"
Check-File "README_GOOGLE_OAUTH.md"

Write-Host ""
Write-Host "🗄️  Checking Migrations..." -ForegroundColor Cyan
Write-Host ""

Check-Directory "migrations"
Check-File "migrations/001_add_oauth_columns.sql"

Write-Host ""
Write-Host "🛠️  Checking Scripts..." -ForegroundColor Cyan
Write-Host ""

Check-Directory "scripts"
Check-File "scripts/run-migration.php"
Check-File "scripts/setup-oauth-env.sh"
Check-File "scripts/setup-oauth-env.ps1"

Write-Host ""
Write-Host "📦 Checking Updated Files..." -ForegroundColor Cyan
Write-Host ""

# Check if auth.js has been updated
$authJsContent = Get-Content "auth.js" -Raw
if ($authJsContent -match "loginWithGoogle") {
    Write-Host "✅ auth.js updated with OAuth integration" -ForegroundColor Green
    $passed++
} else {
    Write-Host "⚠️  auth.js might not have OAuth integration" -ForegroundColor Yellow
    $warnings++
}

# Check if auth.php has error display
$authPhpContent = Get-Content "auth.php" -Raw
if ($authPhpContent -match "oauth_error") {
    Write-Host "✅ auth.php has OAuth error display" -ForegroundColor Green
    $passed++
} else {
    Write-Host "⚠️  auth.php might not display OAuth errors" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""
Write-Host "🔍 Checking Content..." -ForegroundColor Cyan
Write-Host ""

# Check if config has functions
$configContent = Get-Content "config/google-oauth.php" -Raw

if ($configContent -match "function get_google_oauth_url") {
    Write-Host "✅ Google OAuth config has get_google_oauth_url function" -ForegroundColor Green
    $passed++
} else {
    Write-Host "❌ get_google_oauth_url function not found" -ForegroundColor Red
    $failed++
}

if ($configContent -match "function exchange_code_for_token") {
    Write-Host "✅ Google OAuth config has exchange_code_for_token function" -ForegroundColor Green
    $passed++
} else {
    Write-Host "❌ exchange_code_for_token function not found" -ForegroundColor Red
    $failed++
}

if ($configContent -match "function get_google_user_info") {
    Write-Host "✅ Google OAuth config has get_google_user_info function" -ForegroundColor Green
    $passed++
} else {
    Write-Host "❌ get_google_user_info function not found" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "=== Verification Summary ===" -ForegroundColor Green
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Warnings: $warnings" -ForegroundColor Yellow
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Setup Google Cloud OAuth credentials"
    Write-Host "2. Configure environment variables"
    Write-Host "3. Run database migration"
    Write-Host "4. Test the implementation"
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ Some checks failed. Please verify the implementation." -ForegroundColor Red
    Write-Host ""
    exit 1
}
