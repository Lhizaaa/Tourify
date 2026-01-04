<?php
require_once __DIR__ . '/../../config/database.php';

// Handle server-side booking save
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_booking') {
    $pdo = get_db();
    $userId = $_POST['user_id'] ?? null;
    $destinationId = intval($_POST['destination_id'] ?? 0); // Convert to int
    $bookingDate = $_POST['booking_date'] ?? null;
    $tickets = intval($_POST['tickets'] ?? 0);
    $guideId = $_POST['guide_id'] ?? null;
    if ($guideId) {
        $guideId = intval($guideId);
    }
    $totalPrice = floatval($_POST['total_price'] ?? 0);
    $status = 'confirmed';

    try {
        // Validate required fields
        if (!$userId || !$destinationId || !$bookingDate || $tickets <= 0) {
            throw new Exception('Missing required fields: user_id=' . $userId . ', destination_id=' . $destinationId . ', booking_date=' . $bookingDate . ', tickets=' . $tickets);
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO BOOKING (user_id, destination_id, guide_id, booking_date, ticket_quantity, total_price, status) VALUES (:user_id, :destination_id, :guide_id, :booking_date, :ticket_quantity, :total_price, :status)');
        $stmt->execute([
            ':user_id' => $userId,
            ':destination_id' => $destinationId,
            ':guide_id' => $guideId ?: null,
            ':booking_date' => $bookingDate,
            ':ticket_quantity' => $tickets,
            ':total_price' => $totalPrice,
            ':status' => $status
        ]);

        $bookingId = $pdo->lastInsertId();

        if (isset($_POST['payment_method'])) {
            $paymentMethod = $_POST['payment_method'];
            $amount = $totalPrice;
            $stmt = $pdo->prepare('INSERT INTO PAYMENT (booking_id, payment_date, payment_method, payment_status, amount) VALUES (:booking_id, :payment_date, :payment_method, :payment_status, :amount)');
            $stmt->execute([
                ':booking_id' => $bookingId,
                ':payment_date' => date('Y-m-d'),
                ':payment_method' => $paymentMethod,
                ':payment_status' => 'pending',
                ':amount' => $amount
            ]);
        }

        $pdo->commit();
        header('Location: booking.php?booking=success&id=' . $bookingId);
        exit;
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('Booking save error: ' . $e->getMessage());
        header('Location: booking.php?booking=error&msg=' . urlencode($e->getMessage()));
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
    <title>Pemesanan Tiket - Banjarnegara E-Tourism</title>
    <link rel="stylesheet" href="./style.css">
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
                <li><a href="profile.php" id="profileLink" style="display:none;">Profil</a></li>
                <li><a href="auth.php" id="authLink" class="btn-primary">Masuk</a></li>
                <li><a href="#" id="logoutLink" style="display:none;" class="btn-secondary">Keluar</a></li>
            </ul>
        </div>
    </nav>

    <!-- Page Header -->
    <section class="page-header">
        <div class="container">
            <h1>Pemesanan Tiket Wisata</h1>
            <p>Lengkapi informasi pemesanan Anda</p>
        </div>
    </section>

    <!-- Booking Form -->
    <section class="booking-section">
        <div class="container">
            <div class="booking-container">
                <div class="booking-steps">
                    <div class="step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-label">Detail Tiket</div>
                    </div>
                    <div class="step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-label">Data Pengunjung</div>
                    </div>
                    <div class="step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-label">Pembayaran</div>
                    </div>
                    <div class="step" data-step="4">
                        <div class="step-number">4</div>
                        <div class="step-label">Konfirmasi</div>
                    </div>
                </div>

                <form id="bookingForm">
                    <!-- Step 1: Ticket Details -->
                    <div class="form-step active" data-step="1">
                        <h2>Detail Tiket</h2>
                        <div class="form-group">
                            <label><i class="fas fa-map-marker-alt"></i> Destinasi Wisata</label>
                            <select id="bookingDestination" required>
                                <option value="">Pilih Destinasi</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-calendar"></i> Tanggal Kunjungan</label>
                                <input type="date" id="bookingDate" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-users"></i> Jumlah Tiket</label>
                                <input type="number" id="bookingTickets" min="1" max="20" value="1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-user-tie"></i> Tambah Tour Guide (Opsional)</label>
                            <select id="bookingTourGuide">
                                <option value="">Tidak Perlu Tour Guide</option>
                            </select>
                        </div>
                        <div class="price-summary">
                            <div class="price-row">
                                <span>Harga Tiket</span>
                                <span id="ticketPrice">Rp 0</span>
                            </div>
                            <div class="price-row">
                                <span>Tour Guide</span>
                                <span id="guidePrice">Rp 0</span>
                            </div>
                            <div class="price-row total">
                                <span>Total</span>
                                <span id="totalPrice">Rp 0</span>
                            </div>
                        </div>
                        <button type="button" class="btn-primary btn-next">Lanjutkan</button>
                    </div>

                    <!-- Step 2: Visitor Data -->
                    <div class="form-step" data-step="2">
                        <h2>Data Pengunjung</h2>
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Nama Lengkap</label>
                            <input type="text" id="visitorName" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-envelope"></i> Email</label>
                            <input type="email" id="visitorEmail" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-phone"></i> Nomor Telepon</label>
                            <input type="tel" id="visitorPhone" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-id-card"></i> Nomor Identitas (KTP/Paspor)</label>
                            <input type="text" id="visitorId" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary btn-prev">Kembali</button>
                            <button type="button" class="btn-primary btn-next">Lanjutkan</button>
                        </div>
                    </div>

                    <!-- Step 3: Payment Method Selection -->
                    <div class="form-step" data-step="3">
                        <h2>Pilih Metode Pembayaran</h2>
                        <div class="payment-methods">
                            <!-- Bank Transfer Category -->
                            <div class="payment-category">
                                <h3 style="margin-bottom: 1rem; color: var(--text-dark);">Transfer Bank</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="bank-mandiri" required>
                                        <div class="method-card">
                                            <i class="fas fa-university"></i>
                                            <span>Bank Mandiri</span>
                                        </div>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="bank-bca" required>
                                        <div class="method-card">
                                            <i class="fas fa-university"></i>
                                            <span>Bank BCA</span>
                                        </div>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="bank-bri" required>
                                        <div class="method-card">
                                            <i class="fas fa-university"></i>
                                            <span>Bank BRI</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- E-Wallet Category -->
                            <div class="payment-category">
                                <h3 style="margin-bottom: 1rem; color: var(--text-dark);">E-Wallet</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="gopay" required>
                                        <div class="method-card">
                                            <i class="fas fa-wallet"></i>
                                            <span>GoPay</span>
                                        </div>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="shopeepay" required>
                                        <div class="method-card">
                                            <i class="fas fa-wallet"></i>
                                            <span>ShopeePay</span>
                                        </div>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="dana" required>
                                        <div class="method-card">
                                            <i class="fas fa-wallet"></i>
                                            <span>DANA</span>
                                        </div>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="ovo" required>
                                        <div class="method-card">
                                            <i class="fas fa-wallet"></i>
                                            <span>OVO</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Credit Card Category -->
                            <div class="payment-category">
                                <h3 style="margin-bottom: 1rem; color: var(--text-dark);">Kartu Kredit</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                                    <label class="payment-method">
                                        <input type="radio" name="paymentMethod" value="credit-card" required>
                                        <div class="method-card">
                                            <i class="fas fa-credit-card"></i>
                                            <span>Kartu Kredit</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div id="paymentDetails" style="display:none;">
                            <!-- Payment details will be shown based on selected method -->
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary btn-prev">Kembali</button>
                            <button type="button" class="btn-primary btn-next">Lanjutkan ke Pembayaran</button>
                        </div>
                    </div>

                    <!-- Step 4: Confirmation -->
                    <div class="form-step" data-step="4">
                        <h2>Konfirmasi Pemesanan</h2>
                        <div class="confirmation-success">
                            <i class="fas fa-check-circle"></i>
                            <h3>Pemesanan Berhasil!</h3>
                            <p>E-Tiket Anda telah dikirim ke email</p>
                        </div>
                        <div class="booking-summary" id="bookingSummary">
                            <!-- Booking summary will be displayed here -->
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-primary" id="downloadTicket">
                                <i class="fas fa-download"></i> Download E-Tiket
                            </button>
                            <a href="index.php" class="btn-secondary">Kembali ke Beranda</a>
                        </div>
                    </div>
                </form>
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
                                data-cfemail="4f262129200f2d21253d2a3b203a3d263c22612c2022">[email&#160;protected]</a>
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
    <script type="module" src="./booking.js"></script>
    <script type="module" src="./payment.js"></script>
</body>

</html>