#!/bin/bash

# Setup Review System - Verification Script
# Script ini untuk memverifikasi bahwa semua file review system sudah benar

echo "=========================================="
echo "🔍 Review System Verification"
echo "=========================================="
echo ""

# Check if files exist
echo "1️⃣  Checking Files..."
echo "   Checking api/save-review.php..."
if [ -f "./api/save-review.php" ]; then
    size=$(wc -c < "./api/save-review.php")
    echo "   ✅ save-review.php exists ($size bytes)"
else
    echo "   ❌ save-review.php NOT found!"
fi

echo "   Checking api/get-reviews.php..."
if [ -f "./api/get-reviews.php" ]; then
    size=$(wc -c < "./api/get-reviews.php")
    echo "   ✅ get-reviews.php exists ($size bytes)"
else
    echo "   ❌ get-reviews.php NOT found!"
fi

echo "   Checking destination-detail.php..."
if [ -f "./destination-detail.php" ]; then
    echo "   ✅ destination-detail.php exists"
else
    echo "   ❌ destination-detail.php NOT found!"
fi

echo "   Checking destinations.js..."
if [ -f "./destinations.js" ]; then
    echo "   ✅ destinations.js exists"
else
    echo "   ❌ destinations.js NOT found!"
fi

echo ""
echo "2️⃣  Checking Key Functions in destinations.js..."
if grep -q "setupReviewModal" "./destinations.js"; then
    echo "   ✅ setupReviewModal function found"
else
    echo "   ❌ setupReviewModal function NOT found!"
fi

if grep -q "loadDestinationReviews" "./destinations.js"; then
    echo "   ✅ loadDestinationReviews function found"
else
    echo "   ❌ loadDestinationReviews function NOT found!"
fi

if grep -q "save-review.php" "./destinations.js"; then
    echo "   ✅ save-review.php endpoint referenced"
else
    echo "   ❌ save-review.php endpoint NOT referenced!"
fi

if grep -q "get-reviews.php" "./destinations.js"; then
    echo "   ✅ get-reviews.php endpoint referenced"
else
    echo "   ❌ get-reviews.php endpoint NOT referenced!"
fi

echo ""
echo "3️⃣  Checking PHP Files for Database Connection..."
if grep -q "get_db()" "./api/save-review.php"; then
    echo "   ✅ save-review.php uses database connection"
else
    echo "   ❌ save-review.php NOT using database!"
fi

if grep -q "get_db()" "./api/get-reviews.php"; then
    echo "   ✅ get-reviews.php uses database connection"
else
    echo "   ❌ get-reviews.php NOT using database!"
fi

echo ""
echo "4️⃣  Checking Database Schema..."
if grep -q "CREATE TABLE.*REVIEW" "./schema.sql"; then
    echo "   ✅ REVIEW table exists in schema"
else
    echo "   ❌ REVIEW table NOT in schema!"
fi

echo ""
echo "5️⃣  File Sizes (should not be empty)..."
echo "   save-review.php: $(wc -l < "./api/save-review.php") lines"
echo "   get-reviews.php: $(wc -l < "./api/get-reviews.php") lines"

echo ""
echo "=========================================="
echo "✨ Verification Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Make sure XAMPP MySQL is running"
echo "   2. Import schema.sql to create REVIEW table"
echo "   3. Login and test review submission"
echo "   4. Check database with:"
echo "      SELECT * FROM REVIEW;"
echo ""
echo "🌐 Test URLs:"
echo "   - Test Page: http://localhost/Tourify%20V1/test_review_api.php"
echo "   - Destination Detail: http://localhost/Tourify%20V1/destination-detail.php?id=1"
echo ""
