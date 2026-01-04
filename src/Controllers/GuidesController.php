<?php
require_once __DIR__ . '/../../config/database.php';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public-frontend-cos.metadl.com/mgx/img/favicon.png" type="image/png">
    <title>Tour Guide - Tourify</title>
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
                <li><a href="tour-guides.php" class="active">Tour Guide</a></li>
                <li><a href="itinerary.php">Itinerary</a></li>
                <li><a href="profile.php" id="profileLink" style="display:none;">Profil</a></li>
                <li><a href="auth.php" id="authLink" class="btn-primary">Masuk</a></li>
                <li><a href="#" id="logoutLink" style="display:none;" class="btn-secondary">Keluar</a></li>
            </ul>
        </div>
    </nav>

    <!-- Page Header -->
    <section class="page-header">
        <div class="container">
            <h1>Tour Guide Profesional</h1>
            <p>Temukan pemandu wisata berpengalaman untuk perjalanan Anda</p>
        </div>
    </section>

    <!-- Filters -->
    <section class="filters-section">
        <div class="container">
            <div class="filters">
                <div class="filter-group">
                    <label><i class="fas fa-language"></i> Bahasa</label>
                    <select id="filterLanguage">
                        <option value="">Semua Bahasa</option>
                        <option value="indonesia">Indonesia</option>
                        <option value="english">English</option>
                        <option value="mandarin">Mandarin</option>
                        <option value="jawa">Jawa</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label><i class="fas fa-money-bill"></i> Harga Tarif</label>
                    <select id="filterPrice">
                        <option value="">Semua Harga</option>
                        <option value="100000-500000">100rb - 500rb</option>
                        <option value="500000-1000000">500rb - 1jt</option>
                        <option value="1000000-2000000">1jt - 2jt</option>
                        <option value="2000000">Diatas 2jt</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label><i class="fas fa-briefcase"></i> Pengalaman</label>
                    <select id="filterExperience">
                        <option value="">Semua</option>
                        <option value="1-3">1-3 Tahun</option>
                        <option value="3-5">3-5 Tahun</option>
                        <option value="5+">5+ Tahun</option>
                    </select>
                </div>
                <button class="btn-primary" id="applyGuideFilters">Terapkan Filter</button>
            </div>
        </div>
    </section>

    <!-- Tour Guides List -->
    <section class="guides-section">
        <div class="container">
            <div class="guides-grid" id="guidesList">
                <!-- Tour guides will be loaded by JavaScript -->
            </div>
        </div>
    </section>

    <!-- Booking Modal -->
    <div id="guideBookingModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Pesan Tour Guide</h2>
            <div id="guideDetails"></div>
            <form id="guideBookingForm">
                <div class="form-group">
                    <label><i class="fas fa-calendar"></i> Tanggal</label>
                    <input type="date" id="guideDate" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-clock"></i> Durasi</label>
                    <select id="guideDuration" required>
                        <option value="">Pilih Durasi</option>
                        <option value="half-day">Setengah Hari (4 jam)</option>
                        <option value="full-day">Satu Hari (8 jam)</option>
                        <option value="multi-day">Multi Hari</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Destinasi</label>
                    <select id="guideDestination" required>
                        <option value="">Pilih Destinasi</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-users"></i> Jumlah Peserta</label>
                    <input type="number" id="guideParticipants" min="1" max="20" value="1" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-comment"></i> Catatan Khusus (Opsional)</label>
                    <textarea id="guideNotes" rows="3"
                        placeholder="Permintaan khusus atau informasi tambahan..."></textarea>
                </div>
                <div class="price-summary">
                    <div class="price-row total">
                        <span>Estimasi Harga</span>
                        <span id="guideEstimatedPrice">Rp 0</span>
                    </div>
                </div>
                <button type="submit" class="btn-primary btn-block">Konfirmasi Pemesanan</button>
            </form>
        </div>
    </div>

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
                        <li><i class="fas fa-phone"></i> +62 852-2909-2731</li>
                        <li><i class="fas fa-envelope"></i> <a href="/cdn-cgi/l/email-protection" class="__cf_email__"
                                data-cfemail="0b62656d644b696561796e7f647e7962786625686466">[email&#160;protected]</a>
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
    <script type="module" src="./tour-guide.js"></script>
</body>

</html>