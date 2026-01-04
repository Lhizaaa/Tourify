# Verify Review System - PowerShell Script for Windows
# Usage: powershell -ExecutionPolicy Bypass -File verify_review_system.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 Review System Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$basePath = Get-Location
Write-Host "📂 Working Directory: $basePath" -ForegroundColor Yellow
Write-Host ""

# 1. Check if files exist
Write-Host "1️⃣  Checking Files..." -ForegroundColor Green
Write-Host ""

$files = @(
    "api\save-review.php",
    "api\get-reviews.php",
    "destination-detail.php",
    "destinations.js",
    "db.php",
    "schema.sql"
)

foreach ($file in $files) {
    $path = Join-Path $basePath $file
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Write-Host "   ✅ $file exists ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file NOT found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2️⃣  Checking Key Functions..." -ForegroundColor Green
Write-Host ""

$destJs = Join-Path $basePath "destinations.js"
if (Test-Path $destJs) {
    $content = Get-Content $destJs -Raw
    
    $functions = @(
        "setupReviewModal",
        "loadDestinationReviews",
        "displayReviews",
        "save-review.php",
        "get-reviews.php"
    )
    
    foreach ($func in $functions) {
        if ($content -match $func) {
            Write-Host "   ✅ '$func' found" -ForegroundColor Green
        } else {
            Write-Host "   ❌ '$func' NOT found!" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "3️⃣  Checking PHP Database Connection..." -ForegroundColor Green
Write-Host ""

$phpFiles = @(
    "api\save-review.php",
    "api\get-reviews.php"
)

foreach ($file in $phpFiles) {
    $path = Join-Path $basePath $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -match "get_db\(\)|PDO|pdo") {
            Write-Host "   ✅ $file uses database connection" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $file might not use database properly" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "4️⃣  Checking Database Schema..." -ForegroundColor Green
Write-Host ""

$schema = Join-Path $basePath "schema.sql"
if (Test-Path $schema) {
    $content = Get-Content $schema -Raw
    if ($content -match "CREATE TABLE.*REVIEW") {
        Write-Host "   ✅ REVIEW table exists in schema" -ForegroundColor Green
    } else {
        Write-Host "   ❌ REVIEW table NOT in schema!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5️⃣  File Statistics..." -ForegroundColor Green
Write-Host ""

$savePath = Join-Path $basePath "api\save-review.php"
$getPath = Join-Path $basePath "api\get-reviews.php"

if (Test-Path $savePath) {
    $lines = @(Get-Content $savePath).Count
    Write-Host "   save-review.php: $lines lines" -ForegroundColor Gray
}

if (Test-Path $getPath) {
    $lines = @(Get-Content $getPath).Count
    Write-Host "   get-reviews.php: $lines lines" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✨ Verification Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. ✅ Make sure XAMPP is running"
Write-Host "   2. ✅ Check MySQL is running (port 3306)"
Write-Host "   3. ✅ Import schema.sql to create tables"
Write-Host "   4. ✅ Test with: http://localhost/Tourify%20V1/test_review_api.php"
Write-Host ""

Write-Host "🌐 Important URLs:" -ForegroundColor Yellow
Write-Host "   📋 Test Page:"
Write-Host "      http://localhost/Tourify%20V1/test_review_api.php"
Write-Host "   📍 Destination Detail:"
Write-Host "      http://localhost/Tourify%20V1/destination-detail.php?id=1"
Write-Host "   📚 Documentation:"
Write-Host "      REVIEW_SYSTEM_COMPLETE.md"
Write-Host ""

Write-Host "🔧 MySQL Commands to Verify:" -ForegroundColor Yellow
Write-Host "   Run these in phpMyAdmin or MySQL client:"
Write-Host "   1. Check all reviews"
Write-Host "   2. Count reviews by destination" 
Write-Host "   3. View review details"
Write-Host ""
