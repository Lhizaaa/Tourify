<?php
require_once __DIR__ . '/../../config/database.php';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public-frontend-cos.metadl.com/mgx/img/favicon.png" type="image/png">
    <title>Login / Register - Tourify</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="/assets/css/animations.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body class="auth-page">
    <div class="auth-container">
        <div class="auth-left">
            <img src="./public/assets/hero-dieng-plateau.jpg" alt="Banjarnegara" class="auth-bg">
            <div class="auth-overlay">
                <img src="./public/assets/logo-banjarnegara-etourism.png" alt="Logo" class="auth-logo">
                <h1>Tourify</h1>
                <p>Jelajahi keindahan Banjarnegara dengan mudah</p>
            </div>
        </div>

        <div class="auth-right">
            <div class="auth-box">
                <?php
                // Display OAuth error messages if any
                if (!empty($_GET['login']) && $_GET['login'] === 'oauth_error') {
                    $message = isset($_GET['message']) ? htmlspecialchars($_GET['message']) : 'Google login gagal. Silakan coba lagi.';
                    echo '<div style="background-color: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 4px; margin-bottom: 20px;">';
                    echo '<strong>❌ Error:</strong> ' . $message;
                    echo '</div>';
                }
                ?>
                
                <!-- Login Form -->
                <div class="auth-form active" id="loginForm">
                    <h2>Masuk ke Akun Anda</h2>
                    <p class="auth-subtitle">Selamat datang kembali!</p>

                    <form id="loginFormSubmit" action="login.php" method="POST">
                        <div class="form-group">
                            <label><i class="fas fa-envelope"></i> Email</label>
                            <input type="email" name="email" id="loginEmail" placeholder="email@example.com" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-lock"></i> Password</label>
                            <input type="password" name="password" id="loginPassword" placeholder="Password" required>
                        </div>
                        <div class="form-options">
                            <label class="checkbox">
                                <input type="checkbox" name="rememberMe" id="rememberMe">
                                <span>Ingat saya</span>
                            </label>
                            <a href="#" class="forgot-link">Lupa password?</a>
                        </div>
                        <button type="submit" class="btn-primary btn-block">Masuk</button>
                    </form>

                    <div class="divider">
                        <span>atau masuk dengan</span>
                    </div>

                    <button class="btn-social google" id="googleLoginBtn">
                        <i class="fab fa-google"></i>
                        Masuk dengan Google
                    </button>

                    <p class="auth-switch">
                        Belum punya akun? <a href="#" id="showRegister">Daftar sekarang</a>
                    </p>
                </div>

                <!-- Register Form -->
                <div class="auth-form" id="registerForm">
                    <h2>Buat Akun Baru</h2>
                    <p class="auth-subtitle">Bergabunglah dengan kami!</p>

                    <form id="registerFormSubmit" action="register.php" method="POST">
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Nama Lengkap</label>
                            <input type="text" name="name" id="registerName" placeholder="Nama lengkap" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-envelope"></i> Email</label>
                            <input type="email" name="email" id="registerEmail" placeholder="email@example.com"
                                required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-phone"></i> Nomor Telepon</label>
                            <input type="tel" name="phone" id="registerPhone" placeholder="+62 812-3456-7890" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-lock"></i> Password</label>
                            <input type="password" name="password" id="registerPassword"
                                placeholder="Password (min. 6 karakter)" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-lock"></i> Konfirmasi Password</label>
                            <input type="password" name="confirm_password" id="registerConfirmPassword"
                                placeholder="Konfirmasi password" required>
                        </div>
                        <div class="form-options">
                            <label class="checkbox">
                                <input type="checkbox" id="agreeTerms" required>
                                <span>Saya setuju dengan <a href="#">syarat dan ketentuan</a></span>
                            </label>
                        </div>
                        <button type="submit" class="btn-primary btn-block">Daftar</button>
                    </form>

                    <div class="divider">
                        <span>atau daftar dengan</span>
                    </div>

                    <button class="btn-social google" id="googleRegisterBtn">
                        <i class="fab fa-google"></i>
                        Daftar dengan Google
                    </button>

                    <p class="auth-switch">
                        Sudah punya akun? <a href="#" id="showLogin">Masuk</a>
                    </p>
                </div>
            </div>

            <div class="auth-footer">
                <a href="index.php"><i class="fas fa-arrow-left"></i> Kembali ke Beranda</a>
            </div>
        </div>
    </div>

    <script type="module" src="./auth.js"></script>
</body>

</html>