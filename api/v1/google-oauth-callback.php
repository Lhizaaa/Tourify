<?php
/**
 * Google OAuth Callback Handler
 * 
 * This file handles the callback from Google after user authentication.
 * Google redirects here with authorization code.
 */

require_once __DIR__ . '/../config/google-oauth.php';
require_once __DIR__ . '/../../config/database.php';

session_start();

try {
    // Validate configuration
    validate_google_oauth_config();

    // Check if we have authorization code
    if (empty($_GET['code'])) {
        throw new Exception('No authorization code received from Google');
    }

    $code = $_GET['code'];
    $state = $_GET['state'] ?? '';

    // Optional: Validate state parameter (CSRF protection)
    if (!empty($state)) {
        if ($state !== ($_SESSION['google_oauth_state'] ?? '')) {
            throw new Exception('Invalid state parameter - possible CSRF attack');
        }
        unset($_SESSION['google_oauth_state']);
    }

    // Exchange code for tokens
    $token_data = exchange_code_for_token($code);
    
    if (empty($token_data['access_token'])) {
        throw new Exception('Failed to get access token');
    }

    // Get user info from Google
    $google_user = get_google_user_info($token_data['access_token']);

    if (empty($google_user['id']) || empty($google_user['email'])) {
        throw new Exception('Invalid user data from Google');
    }

    // Extract user information
    $google_id = $google_user['id'];
    $email = $google_user['email'];
    $name = $google_user['name'] ?? '';
    $picture = $google_user['picture'] ?? null;

    // Get database connection
    $pdo = get_db();

    // Check if user exists by google_id
    $stmt = $pdo->prepare('SELECT * FROM USERS WHERE google_id = :google_id LIMIT 1');
    $stmt->execute([':google_id' => $google_id]);
    $user = $stmt->fetch();

    // If not found by google_id, check by email
    if (!$user) {
        $stmt = $pdo->prepare('SELECT * FROM USERS WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        // If user exists with this email, update with google_id
        if ($user) {
            $stmt = $pdo->prepare(
                'UPDATE USERS SET google_id = :google_id, oauth_provider = :oauth_provider 
                 WHERE user_id = :user_id'
            );
            $stmt->execute([
                ':google_id' => $google_id,
                ':oauth_provider' => 'google',
                ':user_id' => $user['user_id']
            ]);
        }
    }

    // If user doesn't exist, create new account
    if (!$user) {
        try {
            $stmt = $pdo->prepare(
                'INSERT INTO USERS (name, email, google_id, profile_picture, oauth_provider) 
                 VALUES (:name, :email, :google_id, :profile_picture, :oauth_provider)'
            );
            $stmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':google_id' => $google_id,
                ':profile_picture' => $picture,
                ':oauth_provider' => 'google'
            ]);

            $user_id = $pdo->lastInsertId();
            
            // Fetch the newly created user
            $stmt = $pdo->prepare('SELECT * FROM USERS WHERE user_id = :user_id');
            $stmt->execute([':user_id' => $user_id]);
            $user = $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception('Failed to create user account: ' . $e->getMessage());
        }
    }

    // Set session variables for authenticated user
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_phone'] = $user['phone'] ?? '';
    $_SESSION['authenticated'] = true;
    $_SESSION['oauth_provider'] = 'google';

    // Set persistent cookie
    setcookie('user_id', $user['user_id'], time() + (7 * 24 * 60 * 60), '/');

    // Log successful OAuth login
    error_log("Google OAuth login successful for user: {$email}");

    // Redirect to profile or home page
    header('Location: ../index.php');
    exit;

} catch (Exception $e) {
    // Log error
    error_log('Google OAuth error: ' . $e->getMessage());

    // Redirect to login with error
    header('Location: ../auth.php?login=oauth_error&message=' . urlencode($e->getMessage()));
    exit;
}
?>
