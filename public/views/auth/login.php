<?php
require_once __DIR__ . '/../../config/database.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        header('Location: auth.php?login=error');
        exit;
    }

    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT * FROM USERS WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // successful login - store all session data
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_phone'] = $user['phone'];
        $_SESSION['authenticated'] = true;
        
        // Set cookie for persistent session
        setcookie('user_id', $user['user_id'], time() + (7 * 24 * 60 * 60), '/');
        
        header('Location: index.php');
        exit;
    }

    header('Location: auth.php?login=invalid');
    exit;
}

header('Location: auth.php');
exit;
?>
