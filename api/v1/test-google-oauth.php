<?php
/**
 * Test Google OAuth Configuration
 * 
 * Run this script to verify Google OAuth setup
 * Usage: php api/test-google-oauth.php
 */

require_once __DIR__ . '/../config/google-oauth.php';

echo "=== Google OAuth Configuration Test ===\n\n";

// Test 1: Check credentials
echo "1. Checking credentials...\n";
if (empty(GOOGLE_CLIENT_ID)) {
    echo "   ❌ GOOGLE_CLIENT_ID not set\n";
} else {
    echo "   ✅ GOOGLE_CLIENT_ID: " . substr(GOOGLE_CLIENT_ID, 0, 20) . "...\n";
}

if (empty(GOOGLE_CLIENT_SECRET)) {
    echo "   ❌ GOOGLE_CLIENT_SECRET not set\n";
} else {
    echo "   ✅ GOOGLE_CLIENT_SECRET: " . substr(GOOGLE_CLIENT_SECRET, 0, 20) . "...\n";
}

echo "   📍 GOOGLE_OAUTH_REDIRECT_URI: " . GOOGLE_OAUTH_REDIRECT_URI . "\n";

// Test 2: Validate configuration
echo "\n2. Validating configuration...\n";
try {
    validate_google_oauth_config();
    echo "   ✅ Configuration is valid\n";
} catch (Exception $e) {
    echo "   ❌ Configuration error: " . $e->getMessage() . "\n";
}

// Test 3: Generate OAuth URL
echo "\n3. Generating OAuth URL...\n";
try {
    $url = get_google_oauth_url();
    echo "   ✅ OAuth URL generated successfully\n";
    echo "   📎 " . substr($url, 0, 80) . "...\n";
} catch (Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// Test 4: Check cURL
echo "\n4. Checking cURL extension...\n";
if (extension_loaded('curl')) {
    echo "   ✅ cURL is installed\n";
} else {
    echo "   ❌ cURL is not installed (required for OAuth)\n";
}

// Test 5: Check database
echo "\n5. Checking database...\n";
try {
    require_once __DIR__ . '/../db.php';
    $pdo = get_db();
    
    // Check if USERS table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'USERS'");
    if ($stmt->rowCount() > 0) {
        echo "   ✅ USERS table exists\n";
        
        // Check if OAuth columns exist
        $stmt = $pdo->query("SHOW COLUMNS FROM USERS LIKE 'google_id'");
        if ($stmt->rowCount() > 0) {
            echo "   ✅ google_id column exists\n";
        } else {
            echo "   ⚠️  google_id column NOT found - run migration!\n";
        }
        
        $stmt = $pdo->query("SHOW COLUMNS FROM USERS LIKE 'oauth_provider'");
        if ($stmt->rowCount() > 0) {
            echo "   ✅ oauth_provider column exists\n";
        } else {
            echo "   ⚠️  oauth_provider column NOT found - run migration!\n";
        }
    } else {
        echo "   ❌ USERS table not found\n";
    }
} catch (Exception $e) {
    echo "   ❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
