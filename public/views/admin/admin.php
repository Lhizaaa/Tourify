<?php
session_start();
require_once __DIR__ . '/../../config/database.php';

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

// Clear login success flag
$show_welcome = isset($_SESSION['admin_login_success']) && $_SESSION['admin_login_success'];
if ($show_welcome) {
    unset($_SESSION['admin_login_success']);
}

// Get admin info from database
$pdo = get_db();
$stmt = $pdo->prepare('SELECT name FROM admin WHERE admin_id = ?');
$stmt->execute([$_SESSION['admin_id']]);
$row = $stmt->fetch();
$admin_name = $row ? $row['name'] : ($_SESSION['admin_name'] ?? 'Admin');

?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://public-frontend-cos.metadl.com/mgx/img/favicon.png" type="image/png">
    <title>Admin Dashboard - Tourify</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="./admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body class="admin-layout">
    <!-- Admin Sidebar Navigation -->
    <aside class="admin-sidebar">
        <div class="sidebar-header">
            <div class="sidebar-brand">
                <img src="../public/assets/logo-banjarnegara-etourism.png" alt="Logo" class="sidebar-logo">
                <span>Tourify Admin</span>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <nav class="sidebar-nav">
            <ul class="nav-list">
                <li>
                    <a href="#dashboard" class="nav-link active" data-module="dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="#bookings" class="nav-link" data-module="bookings">
                        <i class="fas fa-ticket-alt"></i>
                        <span>Kelola Pemesanan</span>
                    </a>
                </li>
                <li>
                    <a href="#destinations" class="nav-link" data-module="destinations">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Kelola Destinasi</span>
                    </a>
                </li>
                <li>
                    <a href="#users" class="nav-link" data-module="users">
                        <i class="fas fa-users"></i>
                        <span>Kelola User</span>
                    </a>
                </li>
                <li>
                    <a href="#guides" class="nav-link" data-module="guides">
                        <i class="fas fa-person-hiking"></i>
                        <span>Kelola Tour Guide</span>
                    </a>
                </li>
                <li>
                    <a href="#reviews" class="nav-link" data-module="reviews">
                        <i class="fas fa-star"></i>
                        <span>Kelola Rating & Ulasan</span>
                    </a>
                </li>
            </ul>
        </nav>

        <div class="sidebar-footer">
            <button class="btn-logout" id="adminLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Keluar</span>
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
        <!-- Top Bar -->
        <header class="admin-topbar">
            <button class="menu-toggle" id="menuToggle">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title" id="pageTitle">Dashboard</h1>
            <div class="topbar-right"></div>
        </header>

        <!-- Content Area -->
        <div class="admin-content">

            <!-- DASHBOARD MODULE -->
            <section id="dashboard-module" class="module-section active">
                <div class="dashboard-header">
                    <h2>Dashboard Overview</h2>
                </div>

                <!-- Statistics Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Total User</h3>
                            <p class="stat-number" id="totalUsers">1,245</p>
                            <small>Pengguna terdaftar</small>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Pemesanan Hari Ini</h3>
                            <p class="stat-number" id="todayBookings">42</p>
                            <small>Transaksi hari ini</small>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Destinasi Aktif</h3>
                            <p class="stat-number" id="activeDestinations">18</p>
                            <small>Destinasi wisata</small>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                            <i class="fas fa-person-hiking"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Guide Tersedia</h3>
                            <p class="stat-number" id="availableGuides">12</p>
                            <small>Tour guide aktif</small>
                        </div>
                    </div>
                </div>

                <!-- Charts & Analytics -->
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3>Grafik Pemesanan 7 Hari Terakhir</h3>
                        <canvas id="bookingChart" class="chart"></canvas>
                    </div>

                    <div class="dashboard-card">
                        <h3>Status Pembayaran</h3>
                        <div class="status-distribution">
                            <div class="status-item">
                                <span class="status-badge pending">Pending</span>
                                <span class="status-count">24</span>
                            </div>
                            <div class="status-item">
                                <span class="status-badge paid">Paid</span>
                                <span class="status-count">156</span>
                            </div>
                            <div class="status-item">
                                <span class="status-badge cancelled">Cancelled</span>
                                <span class="status-count">8</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- KELOLA PEMESANAN TIKET MODULE -->
            <section id="bookings-module" class="module-section">
                <div class="module-header">
                    <h2>Kelola Pemesanan Tiket</h2>
                    <button class="btn-export" id="exportBookingsBtn">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                </div>

                <!-- Filters -->
                <div class="filter-section">
                    <input type="text" id="searchBookings" placeholder="Cari transaksi..." class="filter-input">
                    <select id="statusFilter" class="filter-select">
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <input type="date" id="dateFilter" class="filter-input">
                </div>

                <!-- Bookings Table -->
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>User</th>
                                <th>Destinasi</th>
                                <th>Tanggal Booking</th>
                                <th>Jumlah Tiket</th>
                                <th>Total Harga</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="bookingsTableBody">
                            <tr>
                                <td>#TRX001</td>
                                <td>Ahmad Wijaya</td>
                                <td>Dieng Plateau</td>
                                <td>10 Dec 2025</td>
                                <td>2</td>
                                <td>Rp 400.000</td>
                                <td><span class="badge badge-pending">Pending</span></td>
                                <td>
                                    <button class="btn-action confirm" title="Konfirmasi">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn-action view" title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action delete" title="Hapus">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>#TRX002</td>
                                <td>Siti Nurhaliza</td>
                                <td>Telaga Menjer</td>
                                <td>09 Dec 2025</td>
                                <td>4</td>
                                <td>Rp 800.000</td>
                                <td><span class="badge badge-paid">Paid</span></td>
                                <td>
                                    <button class="btn-action view" title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action delete" title="Hapus">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>#TRX003</td>
                                <td>Budi Santoso</td>
                                <td>Baturaden</td>
                                <td>08 Dec 2025</td>
                                <td>1</td>
                                <td>Rp 200.000</td>
                                <td><span class="badge badge-cancelled">Cancelled</span></td>
                                <td>
                                    <button class="btn-action view" title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- KELOLA DESTINASI WISATA MODULE -->
            <section id="destinations-module" class="module-section">
                <div class="module-header">
                    <h2>Kelola Destinasi Wisata</h2>
                    <button class="btn-primary" id="addDestinationBtn">
                        <i class="fas fa-plus"></i> Tambah Destinasi
                    </button>
                </div>

                <!-- Destination Cards -->
                <div class="destination-grid" id="destinationGrid">
                    <div class="destination-card">
                        <div class="destination-image">
                            <img src="https://via.placeholder.com/300x200" alt="Dieng Plateau">
                            <span class="badge badge-active">Aktif</span>
                        </div>
                        <div class="destination-info">
                            <h3>Dieng Plateau</h3>
                            <p class="destination-category">Pegunungan</p>
                            <p class="destination-desc">Pemandangan alam spektakuler di ketinggian 2.000 meter</p>
                            <div class="destination-price">Rp 150.000 / tiket</div>
                            <div class="destination-actions">
                                <button class="btn-action edit" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action delete" title="Hapus">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="destination-card">
                        <div class="destination-image">
                            <img src="https://via.placeholder.com/300x200" alt="Telaga Menjer">
                            <span class="badge badge-active">Aktif</span>
                        </div>
                        <div class="destination-info">
                            <h3>Telaga Menjer</h3>
                            <p class="destination-category">Danau</p>
                            <p class="destination-desc">Danau berwarna biru muda dengan pemandangan alam menawan</p>
                            <div class="destination-price">Rp 100.000 / tiket</div>
                            <div class="destination-actions">
                                <button class="btn-action edit" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action delete" title="Hapus">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="destination-card">
                        <div class="destination-image">
                            <img src="https://via.placeholder.com/300x200" alt="Baturaden">
                            <span class="badge badge-inactive">Inactive</span>
                        </div>
                        <div class="destination-info">
                            <h3>Baturaden</h3>
                            <p class="destination-category">Air Terjun</p>
                            <p class="destination-desc">Kawasan wisata dengan air terjun yang indah</p>
                            <div class="destination-price">Rp 80.000 / tiket</div>
                            <div class="destination-actions">
                                <button class="btn-action edit" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action delete" title="Hapus">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- KELOLA USER MODULE -->
            <section id="users-module" class="module-section">
                <div class="module-header">
                    <h2>Kelola User</h2>
                </div>

                <!-- Filters -->
                <div class="filter-section">
                    <input type="text" id="searchUsers" placeholder="Cari user..." class="filter-input">
                    <select id="statusUserFilter" class="filter-select">
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>

                <!-- Users Table -->
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nama User</th>
                                <th>Email</th>
                                <th>Nomor HP</th>
                                <th>Tanggal Daftar</th>
                                <th>Total Booking</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="usersTableBody">
                            <tr>
                                <td>Ahmad Wijaya</td>
                                <td>ahmad@email.com</td>
                                <td>+62 812-3456-7890</td>
                                <td>05 Nov 2025</td>
                                <td>5</td>
                                <td><span class="badge badge-active">Aktif</span></td>
                                <td>
                                    <button class="btn-action view" title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action deactivate" title="Nonaktifkan">
                                        <i class="fas fa-ban"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>Siti Nurhaliza</td>
                                <td>siti@email.com</td>
                                <td>+62 812-9876-5432</td>
                                <td>15 Oct 2025</td>
                                <td>12</td>
                                <td><span class="badge badge-active">Aktif</span></td>
                                <td>
                                    <button class="btn-action view" title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action deactivate" title="Nonaktifkan">
                                        <i class="fas fa-ban"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>Budi Santoso</td>
                                <td>budi@email.com</td>
                                <td>+62 812-5555-5555</td>
                                <td>20 Sep 2025</td>
                                <td>3</td>
                                <td><span class="badge badge-inactive">Nonaktif</span></td>
                                <td>
                                    <button class="btn-action view" title="Lihat Detail">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-action activate" title="Aktifkan">
                                        <i class="fas fa-check-circle"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- KELOLA TOUR GUIDE MODULE -->
            <section id="guides-module" class="module-section">
                <div class="module-header">
                    <h2>Kelola Tour Guide</h2>
                    <button class="btn-primary" id="addGuideBtn">
                        <i class="fas fa-plus"></i> Tambah Guide
                    </button>
                </div>

                <!-- Guides Grid -->
                <div class="guides-grid" id="guidesGrid">
                    <div class="guide-card">
                        <div class="guide-header">
                            <img src="https://via.placeholder.com/100" alt="Guide" class="guide-avatar">
                            <div class="guide-basic">
                                <h3>Hadi Sutrisno</h3>
                                <p class="guide-location">Banjarnegara</p>
                            </div>
                        </div>
                        <div class="guide-details">
                            <p><strong>Pengalaman:</strong> 8 tahun</p>
                            <p><strong>Tarif:</strong> Rp 500.000 / hari</p>
                            <p><strong>Sertifikasi:</strong> <span class="badge badge-active">Verified</span></p>
                            <p><strong>Jadwal:</strong> Senin - Sabtu</p>
                        </div>
                        <div class="guide-actions">
                            <button class="btn-action edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="guide-card">
                        <div class="guide-header">
                            <img src="https://via.placeholder.com/100" alt="Guide" class="guide-avatar">
                            <div class="guide-basic">
                                <h3>Dwi Retno</h3>
                                <p class="guide-location">Banjarnegara</p>
                            </div>
                        </div>
                        <div class="guide-details">
                            <p><strong>Pengalaman:</strong> 5 tahun</p>
                            <p><strong>Tarif:</strong> Rp 400.000 / hari</p>
                            <p><strong>Sertifikasi:</strong> <span class="badge badge-active">Verified</span></p>
                            <p><strong>Jadwal:</strong> Setiap hari</p>
                        </div>
                        <div class="guide-actions">
                            <button class="btn-action edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="guide-card">
                        <div class="guide-header">
                            <img src="https://via.placeholder.com/100" alt="Guide" class="guide-avatar">
                            <div class="guide-basic">
                                <h3>Sukri Handoko</h3>
                                <p class="guide-location">Banjarnegara</p>
                            </div>
                        </div>
                        <div class="guide-details">
                            <p><strong>Pengalaman:</strong> 6 tahun</p>
                            <p><strong>Tarif:</strong> Rp 450.000 / hari</p>
                            <p><strong>Sertifikasi:</strong> <span class="badge badge-pending">Pending</span></p>
                            <p><strong>Jadwal:</strong> Senin - Jumat</p>
                        </div>
                        <div class="guide-actions">
                            <button class="btn-action verify" title="Verifikasi">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- KELOLA RATING & ULASAN MODULE -->
            <section id="reviews-module" class="module-section">
                <div class="module-header">
                    <h2>Kelola Rating & Ulasan</h2>
                </div>

                <!-- Filters -->
                <div class="filter-section">
                    <input type="text" id="searchReviews" placeholder="Cari ulasan..." class="filter-input">
                    <select id="ratingFilter" class="filter-select">
                        <option value="">Semua Rating</option>
                        <option value="5">⭐⭐⭐⭐⭐</option>
                        <option value="4">⭐⭐⭐⭐</option>
                        <option value="3">⭐⭐⭐</option>
                        <option value="2">⭐⭐</option>
                        <option value="1">⭐</option>
                    </select>
                </div>

                <!-- Reviews List -->
                <div class="reviews-container" id="reviewsContainer">
                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <h4>Ahmad Wijaya</h4>
                                <small>Dieng Plateau • 5 Dec 2025</small>
                            </div>
                            <div class="review-rating">
                                <span class="stars">⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>
                        <p class="review-content">Pemandangan yang sangat indah dan layanan yang memuaskan. Highly
                            recommended!</p>
                        <div class="review-actions">
                            <button class="btn-action reply" title="Balas">
                                <i class="fas fa-reply"></i> Balas
                            </button>
                            <button class="btn-action delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="review-item flagged">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <h4>Budi Santoso</h4>
                                <small>Baturaden • 3 Dec 2025</small>
                            </div>
                            <div class="review-rating">
                                <span class="stars">⭐⭐</span>
                                <span class="flag-badge">⚠️ Dilaporkan</span>
                            </div>
                        </div>
                        <p class="review-content">Tempat ini jelek banget, tidak sesuai dengan foto. Sarana jelek.</p>
                        <div class="review-actions">
                            <button class="btn-action approve" title="Setujui">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="review-item">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <h4>Siti Nurhaliza</h4>
                                <small>Telaga Menjer • 1 Dec 2025</small>
                            </div>
                            <div class="review-rating">
                                <span class="stars">⭐⭐⭐⭐</span>
                            </div>
                        </div>
                        <p class="review-content">Destinasi yang bagus, air danau sangat jernih. Tour guide profesional
                            dan ramah.</p>
                        <div class="review-actions">
                            <button class="btn-action reply" title="Balas">
                                <i class="fas fa-reply"></i> Balas
                            </button>
                            <button class="btn-action delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </main>

    <!-- Modal for Add/Edit Destination -->
    <div id="destinationModal" class="modal">
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h2>Tambah Destinasi</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="destinationForm">
                    <div class="form-group">
                        <label for="destName">Nama Destinasi <span style="color: red;">*</span></label>
                        <input type="text" id="destName" name="name" required placeholder="Contoh: Dieng Plateau">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="destCategory">Kategori <span style="color: red;">*</span></label>
                            <select id="destCategory" name="category_id" required>
                                <option value="">Pilih Kategori</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="destPrice">Harga Tiket (Rp) <span style="color: red;">*</span></label>
                            <input type="number" id="destPrice" name="price" required min="0"
                                placeholder="Contoh: 25000">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="destLocation">Lokasi <span style="color: red;">*</span></label>
                        <input type="text" id="destLocation" name="location" required
                            placeholder="Contoh: Dieng, Banjarnegara">
                    </div>

                    <div class="form-group">
                        <label for="destDescription">Deskripsi <span style="color: red;">*</span></label>
                        <textarea id="destDescription" name="description" rows="5" required
                            placeholder="Jelaskan detail destinasi wisata..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="destMapsLink">Link Google Maps <span style="color: #666;">(Opsional)</span></label>
                        <input type="url" id="destMapsLink" name="maps_link"
                            placeholder="https://www.google.com/maps/embed?pb=..." pattern="https://.*"
                            title="Masukkan URL Google Maps yang valid (harus HTTPS)">
                        <small>
                            📍 <strong>⭐ CARA TERBAIK - GUNAKAN EMBED LINK:</strong><br>
                            1. Buka Google Maps<br>
                            2. Cari lokasi destinasi<br>
                            3. Klik tombol "Share"<br>
                            4. <strong>Pilih tab "Embed a map"</strong><br>
                            5. Copy URL dari <code
                                style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">src="..."</code><br>
                            6. Paste ke field ini<br><br>
                            💡 <strong>Format yang benar:</strong> https://www.google.com/maps/embed?pb=...<br>
                            ⚠️ Jangan gunakan: Share link (https://maps.app.goo.gl/...) - lebih rumit!
                        </small>
                    </div>

                    <div class="form-group">
                        <label for="destImage">Upload Foto Destinasi</label>
                        <div class="image-upload-wrapper">
                            <input type="file" id="destImage" name="image" accept="image/*">
                            <small>Format: JPG, PNG (Max 5MB)</small>
                            <div id="destImagePreview" style="margin-top: 15px; display: none;"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="destFacilities">Fasilitas</label>
                        <div id="facilitiesContainer"
                            style="display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; background: #f9f9f9; border-radius: 4px; margin-bottom: 10px;">
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Parkir"> Parkir
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Toilet"> Toilet
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Warung"> Warung
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Warung Makan"> Warung Makan
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Mushola"> Mushola
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Area Foto"> Area Foto
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Pemandu Wisata"> Pemandu Wisata
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Spot Foto"> Spot Foto
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Viewing Deck"> Viewing Deck
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Jalur Tracking"> Jalur Tracking
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Papan Informasi"> Papan Informasi
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Museum"> Museum
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Pos Pendakian"> Pos Pendakian
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Area Berenang"> Area Berenang
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Gazebo"> Gazebo
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Area Istirahat"> Area Istirahat
                            </label>
                            <label style="display: flex; align-items: center; gap: 5px; margin: 0; cursor: pointer;">
                                <input type="checkbox" name="facilities" value="Area Piknik"> Area Piknik
                            </label>
                        </div>
                        <small>Pilih fasilitas yang tersedia di destinasi ini</small>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Simpan Destinasi
                        </button>
                        <button type="button" class="btn-secondary" onclick="destinationsManager.closeModal()">
                            <i class="fas fa-times"></i> Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal for Add/Edit Guide -->
    <div id="guideModal" class="modal">
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h2>Tambah Tour Guide</h2>
                <button class="modal-close" id="closeGuideModal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="guideForm" onsubmit="handleGuideSubmit(event)">
                    <div class="form-group">
                        <label for="guideName">Nama Guide <span style="color: red;">*</span></label>
                        <input type="text" id="guideName" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="guidePhone">Nomor HP <span style="color: red;">*</span></label>
                            <input type="tel" id="guidePhone" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="guidePrice">Tarif Jasa (Rp) <span style="color: red;">*</span></label>
                            <input type="number" id="guidePrice" required min="0" placeholder="Contoh: 500000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="guideBio">Bio</label>
                        <textarea id="guideBio" rows="3" placeholder="Deskripsi singkat tentang guide..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="guideImage">Upload Foto Profile</label>
                        <div class="image-upload-wrapper">
                            <input type="file" id="guideImage" name="image" accept="image/*">
                            <small>Format: JPG, PNG (Max 5MB)</small>
                            <div id="guideImagePreview" style="margin-top: 15px; display: none;"></div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Simpan</button>
                        <button type="button" class="btn-secondary" id="cancelGuide">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal for Review Reply -->
    <div id="replyModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Balas Ulasan</h2>
                <button class="modal-close" id="closeReplyModal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="replyForm">
                    <div class="form-group">
                        <label for="replyText">Balasan Anda</label>
                        <textarea id="replyText" rows="4" required placeholder="Tulis balasan..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Kirim Balasan</button>
                        <button type="button" class="btn-secondary" id="cancelReply">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    </div>



    <script src="./auth-sync-system.js"></script>
    <script src="./config.js"></script>
    <script src="./cms-manager.js"></script>
    <script src="./modal-manager.js"></script>
    <script src="./destinations-manager.js"></script>
    <script src="./admin-script.js"></script>
</body>

</html>