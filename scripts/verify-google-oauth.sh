#!/bin/bash
# Google OAuth Implementation Verification Checklist
# Usage: bash verify-google-oauth.sh

echo "=== Google OAuth Implementation Verification ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0
warnings=0

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((passed++))
    else
        echo -e "${RED}❌${NC} $1"
        ((failed++))
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 (directory)"
        ((passed++))
    else
        echo -e "${RED}❌${NC} $1 (directory)"
        ((failed++))
    fi
}

echo "📁 Checking File Structure..."
echo ""

# Core files
check_file "config/google-oauth.php"
check_file "api/google-oauth-callback.php"
check_file "api/get-google-oauth-url.php"
check_file "api/test-google-oauth.php"

echo ""
echo "📝 Checking Documentation..."
echo ""

check_file "GOOGLE_OAUTH_SETUP.md"
check_file "GOOGLE_OAUTH_QUICK_START.md"
check_file "IMPLEMENTATION_SUMMARY_GOOGLE_OAUTH.md"
check_file "README_GOOGLE_OAUTH.md"

echo ""
echo "🗄️  Checking Migrations..."
echo ""

check_dir "migrations"
check_file "migrations/001_add_oauth_columns.sql"

echo ""
echo "🛠️  Checking Scripts..."
echo ""

check_dir "scripts"
check_file "scripts/run-migration.php"
check_file "scripts/setup-oauth-env.sh"
check_file "scripts/setup-oauth-env.ps1"

echo ""
echo "📦 Checking Updated Files..."
echo ""

# Check if auth.js has been updated
if grep -q "loginWithGoogle" auth.js; then
    echo -e "${GREEN}✅${NC} auth.js updated with OAuth integration"
    ((passed++))
else
    echo -e "${YELLOW}⚠️${NC} auth.js might not have OAuth integration"
    ((warnings++))
fi

# Check if auth.php has error display
if grep -q "oauth_error" auth.php; then
    echo -e "${GREEN}✅${NC} auth.php has OAuth error display"
    ((passed++))
else
    echo -e "${YELLOW}⚠️${NC} auth.php might not display OAuth errors"
    ((warnings++))
fi

echo ""
echo "🔍 Checking Content..."
echo ""

# Check if config has functions
if grep -q "function get_google_oauth_url" config/google-oauth.php; then
    echo -e "${GREEN}✅${NC} Google OAuth config has get_google_oauth_url function"
    ((passed++))
else
    echo -e "${RED}❌${NC} get_google_oauth_url function not found"
    ((failed++))
fi

if grep -q "function exchange_code_for_token" config/google-oauth.php; then
    echo -e "${GREEN}✅${NC} Google OAuth config has exchange_code_for_token function"
    ((passed++))
else
    echo -e "${RED}❌${NC} exchange_code_for_token function not found"
    ((failed++))
fi

if grep -q "function get_google_user_info" config/google-oauth.php; then
    echo -e "${GREEN}✅${NC} Google OAuth config has get_google_user_info function"
    ((passed++))
else
    echo -e "${RED}❌${NC} get_google_user_info function not found"
    ((failed++))
fi

echo ""
echo "=== Verification Summary ==="
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${YELLOW}Warnings: $warnings${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Setup Google Cloud OAuth credentials"
    echo "2. Configure environment variables"
    echo "3. Run database migration"
    echo "4. Test the implementation"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please verify the implementation.${NC}"
    echo ""
    exit 1
fi
