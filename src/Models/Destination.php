<?php
require_once __DIR__ . '/../../config/database.php';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public-frontend-cos.metadl.com/mgx/img/favicon.png" type="image/png">
    <title>Detail Destinasi - Banjarnegara E-Tourism</title>
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
                <li><a href="destinations.php" class="active">Destinasi</a></li>
                <li><a href="tour-guides.php">Tour Guide</a></li>
                <li><a href="itinerary.php">Itinerary</a></li>
                <li><a href="profile.php" id="profileLink" style="display:none;">Profil</a></li>
                <li><a href="auth.php" id="authLink" class="btn-primary">Masuk</a></li>
                <li><a href="#" id="logoutLink" style="display:none;" class="btn-secondary">Keluar</a></li>
            </ul>
        </div>
    </nav>

    <!-- Destination Detail -->
    <section class="destination-detail">
        <div class="container">
            <div class="detail-header">
                <img id="detailImage" src="" alt="" class="detail-image">
                <div class="detail-overlay">
                    <h1 id="detailName"></h1>
                    <div class="detail-rating">
                        <span class="stars" id="detailStars"></span>
                        <span id="detailRating"></span>
                        <span>(<span id="detailReviews"></span> ulasan)</span>
                    </div>
                </div>
            </div>

            <div class="detail-content">
                <div class="detail-main">
                    <div class="detail-section">
                        <h2><i class="fas fa-info-circle"></i> Deskripsi</h2>
                        <p id="detailDescription"></p>
                    </div>

                    <div class="detail-section">
                        <h2><i class="fas fa-map-marker-alt"></i> Lokasi</h2>
                        <p id="detailLocation"></p>
                        <div class="map-container" id="mapContainer" style="margin-top: 15px; position: relative;">
                            <iframe id="detailMap" width="100%" height="400" frameborder="0"
                                style="border-radius: 8px; border:1px solid #ddd; display: none;"
                                allow="geolocation; fullscreen" loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h2><i class="fas fa-concierge-bell"></i> Fasilitas</h2>
                        <div class="facilities-grid" id="detailFacilities"></div>
                    </div>

                    <div class="detail-section">
                        <h2><i class="fas fa-star"></i> Ulasan Pengunjung</h2>
                        <div id="reviewsList"></div>
                        <button class="btn-primary" id="addReviewBtn">Tulis Ulasan</button>
                    </div>
                </div>

                <div class="detail-sidebar">
                    <div class="booking-widget">
                        <h3>Informasi Tiket</h3>
                        <div class="info-row">
                            <span><i class="fas fa-ticket-alt"></i> Harga Tiket</span>
                            <strong id="detailPrice"></strong>
                        </div>
                        <div class="info-row">
                            <span><i class="fas fa-clock"></i> Jam Operasional</span>
                            <strong id="detailHours"></strong>
                        </div>
                        <div class="info-row">
                            <span><i class="fas fa-tag"></i> Kategori</span>
                            <strong id="detailCategory"></strong>
                        </div>
                        <button class="btn-primary btn-block" id="bookNowBtn">Pesan Tiket</button>
                        <button class="btn-secondary btn-block" id="addToItineraryBtn">Tambah ke Itinerary</button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Review Modal -->
    <div id="reviewModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Tulis Ulasan</h2>
            <form id="reviewForm">
                <div class="form-group">
                    <label>Rating</label>
                    <div class="star-rating">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <input type="hidden" id="ratingValue" required>
                </div>
                <div class="form-group">
                    <label>Ulasan Anda</label>
                    <textarea id="reviewText" rows="5" required placeholder="Ceritakan pengalaman Anda..."></textarea>
                </div>
                <button type="submit" class="btn-primary">Kirim Ulasan</button>
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
                                data-cfemail="731a1d151c33111d190116071c06011a001e5d101c1e">[email&#160;protected]</a>
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
    <script type="module" src="./destinations.js"></script>
</body>

</html>