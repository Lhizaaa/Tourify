<?php
require_once __DIR__ . '/../../config/database.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php?login=required');
    exit;
}

$user_id = $_SESSION['user_id'];
$pdo = get_db();

// Fetch user data
$stmt = $pdo->prepare('SELECT * FROM USERS WHERE user_id = :user_id');
$stmt->execute([':user_id' => $user_id]);
$user = $stmt->fetch();

if (!$user) {
    session_destroy();
    header('Location: auth.php?login=invalid');
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public-frontend-cos.metadl.com/mgx/img/favicon.png" type="image/png">
    <title>Profil - Banjarnegara E-Tourism</title>
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="./animations.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container nav-container">
            <div class="nav-brand">
                <img src="./public/assets/logo-banjarnegara-etourism.png" alt="Logo" class="logo">
                <span class="brand-name">Tourify</span>
            </div>
            <button class="nav-toggle" id="navToggle">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="nav-menu" id="navMenu">
                <li><a href="index.php">Beranda</a></li>
                <li><a href="destinations.php">Destinasi</a></li>
                <li><a href="tour-guides.php">Tour Guide</a></li>
                <li><a href="itinerary.php">Itinerary</a></li>
                <li><a href="profile.php" id="profileLink" class="active">Profil</a></li>
                <li><a href="#" id="logoutLink" class="btn-secondary">Keluar</a></li>
            </ul>
        </div>
    </nav>

    <!-- Page Header -->
    <section class="page-header">
        <div class="container">
            <h1>Profil Saya</h1>
            <p>Kelola informasi dan riwayat pemesanan Anda</p>
        </div>
    </section>

    <!-- Profile Content -->
    <section class="profile-section">
        <div class="container">
            <div class="profile-container">
                <div class="profile-sidebar">
                    <div class="profile-card">
                        <div class="profile-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <h3 id="profileName">User</h3>
                        <p id="profileEmail"><a href="/cdn-cgi/l/email-protection" class="__cf_email__"
                                data-cfemail="661315031426030b070f0a4805090b">[email&#160;protected]</a></p>
                    </div>
                    <nav class="profile-nav">
                        <a href="#bookings" class="profile-nav-item active" data-tab="bookings">
                            <i class="fas fa-ticket-alt"></i> Pemesanan Saya
                        </a>
                        <a href="#itineraries" class="profile-nav-item" data-tab="itineraries">
                            <i class="fas fa-route"></i> Itinerary Saya
                        </a>
                        <a href="#reviews" class="profile-nav-item" data-tab="reviews">
                            <i class="fas fa-star"></i> Ulasan Saya
                        </a>
                        <a href="#settings" class="profile-nav-item" data-tab="settings">
                            <i class="fas fa-cog"></i> Pengaturan
                        </a>
                    </nav>
                </div>

                <div class="profile-main">
                    <!-- Bookings Tab -->
                    <div class="profile-tab active" id="bookings">
                        <h2>Riwayat Pemesanan</h2>
                        <div class="bookings-list" id="bookingsList">
                            <!-- Bookings will be loaded here -->
                        </div>
                    </div>

                    <!-- Itineraries Tab -->
                    <div class="profile-tab" id="itineraries">
                        <h2>Itinerary Tersimpan</h2>
                        <div class="itineraries-list" id="itinerariesList">
                            <!-- Itineraries will be loaded here -->
                        </div>
                    </div>

                    <!-- Reviews Tab -->
                    <div class="profile-tab" id="reviews">
                        <h2>Ulasan Saya</h2>
                        <div class="reviews-list" id="reviewsList">
                            <p style="text-align: center; padding: 2rem; color: #999;">Belum ada ulasan</p>
                        </div>
                    </div>

                    <!-- Settings Tab -->
                    <div class="profile-tab" id="settings">
                        <h2>Pengaturan Akun</h2>
                        <form id="settingsForm">
                            <div class="form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" id="settingsName" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="settingsEmail" required>
                            </div>
                            <div class="form-group">
                                <label>Nomor Telepon</label>
                                <input type="tel" id="settingsPhone">
                            </div>
                            <div class="form-group">
                                <label>Alamat</label>
                                <textarea id="settingsAddress" rows="3"></textarea>
                            </div>
                            <button type="submit" class="btn-primary">Simpan Perubahan</button>
                        </form>

                        <hr style="margin: 2rem 0;">

                        <h3>Ubah Password</h3>
                        <form id="passwordForm">
                            <div class="form-group">
                                <label>Password Lama</label>
                                <input type="password" id="oldPassword" required>
                            </div>
                            <div class="form-group">
                                <label>Password Baru</label>
                                <input type="password" id="newPassword" required>
                            </div>
                            <div class="form-group">
                                <label>Konfirmasi Password Baru</label>
                                <input type="password" id="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn-primary">Ubah Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>Tentang Kami</h4>
                    <p>Platform e-tourism terpercaya untuk menjelajahi keindahan Banjarnegara, Jawa Tengah.</p>
                </div>
                <div class="footer-col">
                    <h4>Link Cepat</h4>
                    <ul>
                        <li><a href="destinations.php">Destinasi</a></li>
                        <li><a href="tour-guides.php">Tour Guide</a></li>
                        <li><a href="itinerary.php">Itinerary</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Kontak</h4>
                    <ul>
                        <li><i class="fas fa-phone"></i> +62 812-3456-7890</li>
                        <li><i class="fas fa-envelope"></i> <a href="/cdn-cgi/l/email-protection" class="__cf_email__"
                                data-cfemail="bcd5d2dad3fcded2d6ced9c8d3c9ced5cfd192dfd3d1">[email&#160;protected]</a>
                        </li>
                        <li><i class="fas fa-map-marker-alt"></i> Banjarnegara, Jawa Tengah</li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Ikuti Kami</h4>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Tourify. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
    <script type="module" src="./script.js"></script>
    <script type="module" src="./auth.js"></script>
</body>

</html>