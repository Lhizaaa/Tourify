<?php
session_start();
require_once __DIR__ . '/../../config/database.php';

// Check if request is AJAX
$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';
$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($identifier === '' || $password === '') {
        $error = 'Isi username/email dan password.';
    } else {
        try {
            $pdo = get_db();
            $stmt = $pdo->prepare('SELECT * FROM admin WHERE email = ? OR name = ? LIMIT 1');
            $stmt->execute([$identifier, $identifier]);
            $admin = $stmt->fetch();

            if ($admin) {
                $stored = $admin['password'];
                if ((function_exists('password_verify') && password_verify($password, $stored)) || $password === $stored) {
                    $_SESSION['admin_id'] = $admin['admin_id'];
                    $_SESSION['admin_name'] = $admin['name'];
                    $_SESSION['admin_login_success'] = true;
                    $success = true;

                    if ($is_ajax) {
                        header('Content-Type: application/json');
                        echo json_encode(['success' => true, 'redirect' => 'admin.php']);
                        exit;
                    }

                    header('Location: admin.php');
                    exit;
                } else {
                    $error = 'Kredensial salah. Periksa username/email dan password.';
                }
            } else {
                $error = 'Akun admin tidak ditemukan.';
            }
        } catch (Exception $e) {
            $error = 'Terjadi kesalahan: ' . $e->getMessage();
        }
    }

    // Return JSON response for AJAX requests
    if ($is_ajax) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => $success,
            'error' => $error
        ]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public-frontend-cos.metadl.com/mgx/img/favicon.png" type="image/png">
    <title>Admin Login - Tourify</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="./login-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body class="login-body">
    <!-- Background -->
    <div class="login-bg">
        <img src="https://via.placeholder.com/1920x1080?text=Tourify+Admin" alt="Background" class="bg-image">
        <div class="bg-overlay"></div>
    </div>

    <!-- Login Container -->
    <div class="login-container">
        <div class="login-card">
            <!-- Logo Section -->
            <div class="login-header">
                <div class="login-logo">
                    <img src="../public/assets/logo-banjarnegara-etourism.png" alt="Logo" class="logo-img">
                </div>
                <h1>Tourify Admin</h1>
                <p>Panel Administrasi E-Tourism Banjarnegara</p>
            </div>

            <!-- Login Form -->
            <form id="loginForm" class="login-form" method="post" action="">
                <!-- Username/Email Field -->
                <div class="form-group">
                    <label for="username">
                        <i class="fas fa-user"></i> Username atau Email
                    </label>
                    <input type="text" id="username" name="username" placeholder="Masukkan username atau email" required
                        autocomplete="username"
                        value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
                    <span class="error-message" id="usernameError"></span>
                </div>

                <!-- Password Field -->
                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock"></i> Password
                    </label>
                    <div class="password-field">
                        <input type="password" id="password" name="password" placeholder="Masukkan password" required
                            autocomplete="current-password">
                        <button type="button" class="toggle-password" id="togglePassword">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <span class="error-message" id="passwordError"></span>
                </div>

                <!-- Remember Me -->
                <div class="form-group checkbox">
                    <input type="checkbox" id="rememberMe" name="rememberMe">
                    <label for="rememberMe">Ingat saya</label>
                </div>

                <!-- Login Button -->
                <button type="submit" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Masuk Admin
                </button>

                <!-- Error Message -->
                <?php if ($error !== ''): ?>
                    <div class="alert alert-error" id="loginError"><?php echo htmlspecialchars($error); ?></div>
                <?php else: ?>
                    <div class="alert alert-error" id="loginError" style="display: none;"></div>
                <?php endif; ?>

                <!-- Success Message -->
                <div class="alert alert-success" id="loginSuccess" style="display: none;"></div>
            </form>

            <!-- Demo Credentials -->
            <div class="demo-section">
                <p class="demo-title">Demo Credentials</p>
                <div class="demo-info">
                    <div class="demo-item">
                        <strong>Username:</strong> admin
                    </div>
                    <div class="demo-item">
                        <strong>Password:</strong> admin123
                    </div>
                </div>
                <p class="demo-note">Atau gunakan email: admin@tourify.local</p>
            </div>

            <!-- Footer -->
            <div class="login-footer">
                <p>© 2025 Tourify E-Tourism Banjarnegara</p>
                <p><a href="../index.php">Kembali ke Beranda</a></p>
            </div>
        </div>
    </div>

    <!-- Loading Spinner -->
    <div class="loading-spinner" id="loadingSpinner">
        <div class="spinner"></div>
        <p>Memproses login...</p>
    </div>

    <script src="./auth-sync-system.js"></script>
    <script src="./login-script.js"></script>
</body>

</html>