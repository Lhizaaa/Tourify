-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 29 Des 2025 pada 17.50
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tourify`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `admin`
--

INSERT INTO `admin` (`admin_id`, `name`, `email`, `password`, `profile_picture`, `created_at`) VALUES
(1, 'admin', 'admin@tourify.local', 'admin123', NULL, '2025-12-28 11:12:53');

-- --------------------------------------------------------

--
-- Struktur dari tabel `adminactivitylog`
--

CREATE TABLE `adminactivitylog` (
  `log_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `adminactivitylog`
--

INSERT INTO `adminactivitylog` (`log_id`, `admin_id`, `action`, `timestamp`) VALUES
(5, 1, 'Created new tour guide: hah', '2025-12-28 11:15:55'),
(6, 1, 'Created new destination: kk', '2025-12-28 11:58:48'),
(7, 1, 'Created new destination: sd', '2025-12-28 12:06:15'),
(8, 1, 'Deleted destination: sd', '2025-12-28 12:07:34'),
(9, 1, 'Created new destination: sd', '2025-12-28 12:07:53'),
(10, 1, 'Created new destination: hh', '2025-12-28 12:32:21'),
(11, 1, 'Created new destination: sd', '2025-12-28 12:42:01'),
(12, 1, 'Deleted destination: sd', '2025-12-28 17:26:25'),
(13, 1, 'Created new destination: ahh', '2025-12-28 17:31:40'),
(14, 1, 'Created new destination: jsjd', '2025-12-28 17:53:13'),
(15, 1, 'Created new destination: sd', '2025-12-29 11:22:43'),
(16, 1, 'Updated tour guide: hah', '2025-12-29 11:36:37'),
(17, 1, 'Updated tour guide: hah', '2025-12-29 11:37:16'),
(18, 1, 'Updated tour guide: Budi Santoso', '2025-12-29 11:40:39'),
(19, 1, 'Updated tour guide: Ratna Dewi', '2025-12-29 11:45:32'),
(20, 1, 'Updated tour guide: Eka Putri', '2025-12-29 11:46:15'),
(21, 1, 'Updated tour guide: Budi Santoso', '2025-12-29 11:46:26'),
(22, 1, 'Updated tour guide: Siti Nurhaliza', '2025-12-29 11:52:03'),
(23, 1, 'Updated tour guide: Siti Nurhaliza', '2025-12-29 11:52:39'),
(24, 1, 'Created new tour guide: ygghg', '2025-12-29 11:53:10'),
(25, 1, 'Updated tour guide: Bambang Wijaya', '2025-12-29 11:58:23'),
(26, 1, 'Updated tour guide: Budi Santoso', '2025-12-29 11:58:43'),
(27, 1, 'Updated tour guide: Eka Putri', '2025-12-29 11:59:38'),
(28, 1, 'Updated tour guide: ygghg', '2025-12-29 11:59:52'),
(29, 1, 'Updated tour guide: Ahmad Hermawan', '2025-12-29 12:44:07'),
(30, 1, 'Updated tour guide: Ahmad Hermawan', '2025-12-29 13:22:38'),
(31, 1, 'Updated destination: sd', '2025-12-29 13:23:16'),
(32, 1, 'Updated destination: sd', '2025-12-29 13:59:16'),
(33, 1, 'Updated destination: sd', '2025-12-29 14:21:23'),
(34, 1, 'Updated destination: sd', '2025-12-29 14:29:36'),
(35, 1, 'Updated destination: sd', '2025-12-29 18:53:36'),
(36, 1, 'Updated destination: Test Upload Destination', '2025-12-29 18:58:23'),
(37, 1, 'Updated destination: Test Upload Destination', '2025-12-29 19:33:52'),
(38, 1, 'Updated destination: Test Upload Destination', '2025-12-29 19:34:08'),
(39, 1, 'Updated destination: Test Upload Destination', '2025-12-29 19:39:37'),
(40, 1, 'Updated destination: Test Upload Destination', '2025-12-29 19:40:20'),
(41, 1, 'Updated destination: Test Upload Destination', '2025-12-29 19:56:18'),
(42, 1, 'Updated destination: Test Upload Destination', '2025-12-29 19:57:11'),
(43, 1, 'Updated destination: Test Upload Destination', '2025-12-29 20:32:17'),
(44, 1, 'Updated destination: jsjd', '2025-12-29 21:01:45'),
(45, 1, 'Updated destination: sd', '2025-12-29 21:07:18'),
(46, 1, 'Updated destination: sd', '2025-12-29 21:10:45'),
(47, 1, 'Updated destination: Test Upload Destination', '2025-12-29 21:11:55'),
(48, 1, 'Updated destination: Test Upload Destination', '2025-12-29 21:15:17'),
(49, 1, 'Updated destination: Test Upload Destination', '2025-12-29 21:15:51'),
(50, 1, 'Updated destination: jsjd', '2025-12-29 21:21:27'),
(51, 1, 'Updated destination: Test Upload Destination', '2025-12-29 21:34:42'),
(52, 1, 'Updated destination: Test Upload Destination', '2025-12-29 21:37:20'),
(53, 1, 'Updated destination: sd', '2025-12-29 21:37:25'),
(54, 1, 'Updated destination: ahh', '2025-12-29 21:37:39'),
(55, 1, 'Deleted destination: Dieng Plateau', '2025-12-29 21:38:10'),
(56, 1, 'Updated destination: Test Upload Destination', '2025-12-29 21:53:03'),
(57, 1, 'Updated destination: Telaga Warna', '2025-12-29 21:54:17'),
(58, 1, 'Updated destination: Telaga Warna', '2025-12-29 21:55:44'),
(59, 1, 'Updated destination: Telaga Warna', '2025-12-29 21:56:36'),
(60, 1, 'Updated destination: Air Terjun Pekasaran', '2025-12-29 21:57:22'),
(61, 1, 'Updated destination: Air Terjun Pekasaran', '2025-12-29 22:00:34'),
(62, 1, 'Updated destination: Candi Arjuna', '2025-12-29 22:01:52'),
(63, 1, 'Deleted destination: ahh', '2025-12-29 22:02:27'),
(64, 1, 'Deleted destination: jsjd', '2025-12-29 22:02:30'),
(65, 1, 'Deleted destination: Test Upload Destination', '2025-12-29 22:02:34'),
(66, 1, 'Created new destination: yggf', '2025-12-29 22:06:58'),
(67, 1, 'Deleted destination: yggf', '2025-12-29 22:07:13'),
(68, 1, 'Soft-deleted destination: sd (has 1 bookings, 1 reviews, 0 itinerary items)', '2025-12-29 22:09:18'),
(69, 1, 'Created new destination: jhjh', '2025-12-29 22:09:40'),
(70, 1, 'Deleted destination: jhjh', '2025-12-29 22:20:10'),
(71, 1, 'Created new destination: cccgf', '2025-12-29 22:34:59'),
(72, 1, 'Deleted destination: cccgf', '2025-12-29 22:35:42'),
(73, 1, 'Created new destination: dasda', '2025-12-29 22:36:03'),
(74, 1, 'Deleted destination: dasda', '2025-12-29 22:39:16'),
(75, 1, 'Created new destination: bghvv', '2025-12-29 22:39:38'),
(76, 1, 'Updated destination: bghvv', '2025-12-29 22:40:00'),
(77, 1, 'Soft-deleted destination: bghvv (has 0 bookings, 1 reviews, 0 itinerary items)', '2025-12-29 22:58:42');

-- --------------------------------------------------------

--
-- Struktur dari tabel `booking`
--

CREATE TABLE `booking` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `guide_id` int(11) DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `ticket_quantity` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `booking`
--

INSERT INTO `booking` (`booking_id`, `user_id`, `destination_id`, `guide_id`, `booking_date`, `ticket_quantity`, `total_price`, `status`) VALUES
(4, 3, 21, 4, '2025-12-31', 1, 110000.00, 'confirmed'),
(5, 3, 8, 6, '2025-12-31', 1, 475000.00, 'confirmed');

-- --------------------------------------------------------

--
-- Struktur dari tabel `category`
--

CREATE TABLE `category` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `category`
--

INSERT INTO `category` (`category_id`, `name`, `description`) VALUES
(1, 'Pegunungan', 'Destinasi wisata dengan pemandangan pegunungan'),
(2, 'Danau', 'Destinasi wisata dengan danau indah'),
(3, 'Air Terjun', 'Destinasi wisata dengan air terjun'),
(4, 'Candi Bersejarah', 'Situs candi dan warisan budaya'),
(5, 'Pantai', 'Destinasi wisata pantai'),
(6, 'Goa Alam', 'Goa dan tebing alami'),
(7, 'Perkebunan', 'Destinasi agro-wisata'),
(8, 'Taman Nasional', 'Taman nasional dan cagar alam');

-- --------------------------------------------------------

--
-- Struktur dari tabel `destination`
--

CREATE TABLE `destination` (
  `destination_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `views` int(11) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image` varchar(255) DEFAULT NULL,
  `maps_link` varchar(500) DEFAULT NULL,
  `facilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`facilities`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `destination`
--

INSERT INTO `destination` (`destination_id`, `name`, `description`, `location`, `price`, `category_id`, `admin_id`, `status`, `views`, `updated_at`, `image`, `maps_link`, `facilities`, `created_at`) VALUES
(8, 'Dieng Plateau', 'Dataran tinggi vulkanik yang menakjubkan dengan pemandangan alam spektakuler di ketinggian 2.000 meter. Diarsa tinggi vulkanik yang menakjubkan dengan pemandangan pegunungan, danau berwarna, dan candi-candi kuno. Dieng Plateau...', 'Dieng, Banjarnegara', 25000.00, 1, NULL, 'active', 0, '2025-12-29 22:05:04', 'hero-dieng-plateau.jpg', NULL, '[]', '2025-12-28 12:02:42'),
(9, 'Telaga Warna', 'Danau vulkanik yang terkenal dengan airnya yang berubah warna dari hijau menjadi biru tergantung pantuan cahaya matahari. Danau vulkanik yang terkenal dengan keindahan alamnya yang memukau...', 'Dieng, Banjarnegara', 15000.00, 2, NULL, 'active', 0, '2025-12-29 21:55:44', 'destination-telaga-warna.jpg', 'https://maps.app.goo.gl/JWhxYwVjHPWP8GD28', '[\"Parkir\",\"Toilet\",\"Warung\",\"Spot Foto\",\"Viewing Deck\"]', '2025-12-28 12:02:42'),
(10, 'Kawah Sikidang', 'Kawah vulkanik aktif dengan fumarol dan kolam lumpur mendidih yang mengeluarkan gas beracun. Kawah vulkanik aktif dengan fumarol dan kolam lumppur mendidih yang mengeluarkan gas belerang. Kawah Sikidang terkenal ka...', 'Dieng, Banjarnegara', 20000.00, 1, NULL, 'active', 0, '2025-12-29 22:05:04', 'destination-kawah-sikidang.jpg', NULL, '[]', '2025-12-28 12:02:42'),
(11, 'Candi Arjuna', 'Kompleks candi Hindu tertua di Indonesia yang dibangun pada abad ke-8. Candi Arjuna terdiri dari lima candi yang menghad akan candi utama yang megah dengan arsitektur yang indah...', 'Dieng, Banjarnegara', 10000.00, 4, NULL, 'active', 0, '2025-12-29 22:01:52', 'destination-candi-arjuna.jpg', 'https://maps.app.goo.gl/1fnr9mShDcpxpZdi9', '[\"Parkir\",\"Toilet\",\"Pemandu Wisata\",\"Museum\",\"Area Istirahat\"]', '2025-12-28 12:02:42'),
(12, 'Bukit Sikunir', 'Spot terbaik untuk menyaksikan golden sunrise di kawasan Dieng. Bukit Sikunir menawarkan pemandangan matahari terbit yang terbit yan spektakuler dengan awan yang membentang luas di bawah...', 'Dieng, Banjarnegara', 15000.00, 1, NULL, 'active', 0, '2025-12-29 22:05:04', 'destination-bukit-sikunir.jpg', NULL, '[]', '2025-12-28 12:02:42'),
(13, 'Air Terjun Pekasaran', 'Air terjun alami yang tersembunyi di tengah hutan dengan ketinggian sekitar 30 meter. Air Terjun Pekasaran menawarkan ke...', 'Pekasaran, Banjarnegara', 5000.00, 3, NULL, 'active', 0, '2025-12-29 22:00:34', 'destination-air-terjun-pekasiran.jpg', 'https://maps.app.goo.gl/DQ2Yv9PhLcshTa7m6', '[\"Parkir\",\"Toilet\",\"Warung\",\"Area Berenang\",\"Gazebo\"]', '2025-12-28 12:02:42'),
(21, 'sd', 'sdafaf', 'kload', 40000.00, 1, NULL, 'deleted', 0, '2025-12-29 22:09:18', 'destination-1767017445-RobloxScreenShot20250709_214326360.png', 'https://maps.app.goo.gl/vrTmjmCM3wFSorEn7', '[]', '2025-12-29 11:22:43'),
(27, 'bghvv', 'jbhjhb', 'hjjvg', 80000.00, 2, NULL, 'deleted', 0, '2025-12-29 22:58:42', 'destination-1767022800-RobloxScreenShot20250711_212731519.png', NULL, '[\"Parkir\"]', '2025-12-29 22:39:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `itinerary`
--

CREATE TABLE `itinerary` (
  `itinerary_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `itinerary`
--

INSERT INTO `itinerary` (`itinerary_id`, `user_id`, `title`, `start_date`, `end_date`, `created_at`) VALUES
(1, 3, 'Perjalanan Saya', '2025-12-28', '2025-12-29', '2025-12-28 17:48:29'),
(2, 3, 'Perjalanan Saya', '2025-12-28', '2025-12-29', '2025-12-28 17:49:03');

-- --------------------------------------------------------

--
-- Struktur dari tabel `itinerarydetail`
--

CREATE TABLE `itinerarydetail` (
  `itinerary_detail_id` int(11) NOT NULL,
  `itinerary_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `day` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `itinerarydetail`
--

INSERT INTO `itinerarydetail` (`itinerary_detail_id`, `itinerary_id`, `destination_id`, `day`, `notes`) VALUES
(3, 2, 11, 1, '');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payment`
--

CREATE TABLE `payment` (
  `payment_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `payment`
--

INSERT INTO `payment` (`payment_id`, `booking_id`, `payment_date`, `payment_method`, `payment_status`, `amount`) VALUES
(1, 4, '2025-12-29', 'bank-transfer', 'pending', 110000.00),
(2, 5, '2025-12-29', 'bank-transfer', 'pending', 475000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `review`
--

CREATE TABLE `review` (
  `review_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `destination_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `review_text` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `review`
--

INSERT INTO `review` (`review_id`, `user_id`, `destination_id`, `rating`, `review_text`, `created_at`) VALUES
(56, 1, 13, 4, 'Worth it untuk dikunjungi bersama keluarga.', '2025-12-01 12:02:42'),
(57, 2, 13, 4, 'Destinasi favorit saya sekarang!', '2025-10-31 12:02:42'),
(58, 1, 13, 4, 'Destinasi favorit saya sekarang!', '2025-11-30 12:02:42'),
(59, 2, 13, 4, 'Saya sangat suka dengan keindahan alam di sini.', '2025-11-02 12:02:42'),
(60, 1, 13, 4, 'Destinasi favorit saya sekarang!', '2025-12-12 12:02:42'),
(65, 3, 21, 5, 'sdasasdasasd', '2025-12-29 11:23:38'),
(66, 3, 12, 5, 'dgsasasxasc', '2025-12-29 11:25:40'),
(67, 3, 27, 5, 'hsaggerelotfer', '2025-12-29 22:40:52'),
(68, 3, 8, 5, 'sdadahjhags', '2025-12-29 23:07:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tourguide`
--

CREATE TABLE `tourguide` (
  `guide_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tourguide`
--

INSERT INTO `tourguide` (`guide_id`, `name`, `bio`, `contact`, `rating`, `profile_picture`, `price`) VALUES
(4, 'Budi Santoso', 'ffgfxdf', '08123456789', 0.0, NULL, 70000.00),
(5, 'Siti Nurhaliza', '', '08234567890', 0.0, NULL, 80000.00),
(6, 'Ahmad Hermawan', 'Spesialis petualangan outdoor dan hiking', '08345678901', 4.7, 'guide-1766989358-Logo-UII-Asli.webp', 450000.00),
(7, 'Ratna Dewi', '', '08456789012', 0.0, NULL, 0.00),
(8, 'Bambang Wijaya', 'ffgfxdf', '08567890123', 0.0, NULL, 80000.00),
(9, 'Eka Putri', '', '08678901234', 0.0, NULL, 70000.00),
(10, 'hah', '', '34', 0.0, NULL, 0.00),
(11, 'ygghg', 'ffgfxdf', '8889897', 0.0, NULL, 90000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `profile_picture`, `phone`, `created_at`) VALUES
(1, 'Fajar', 'fajar@example.com', 'hashedpass1', 'fajar.jpg', '08123456789', '2025-12-27 17:25:17'),
(2, 'Sinta', 'sinta@example.com', 'hashedpass2', 'sinta.jpg', '08234567890', '2025-12-27 17:25:17'),
(3, 'hh', 'g@gmail.com', '$2y$10$OdmCC8I.AoaqFmk1LR5wmOiUzxfetwcMmScKdSGnhu6QnYoBrt1va', NULL, '081234592912', '2025-12-28 12:20:16');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `adminactivitylog`
--
ALTER TABLE `adminactivitylog`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indeks untuk tabel `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `destination_id` (`destination_id`),
  ADD KEY `guide_id` (`guide_id`);

--
-- Indeks untuk tabel `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`category_id`);

--
-- Indeks untuk tabel `destination`
--
ALTER TABLE `destination`
  ADD PRIMARY KEY (`destination_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indeks untuk tabel `itinerary`
--
ALTER TABLE `itinerary`
  ADD PRIMARY KEY (`itinerary_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `itinerarydetail`
--
ALTER TABLE `itinerarydetail`
  ADD PRIMARY KEY (`itinerary_detail_id`),
  ADD KEY `itinerary_id` (`itinerary_id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indeks untuk tabel `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indeks untuk tabel `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `destination_id` (`destination_id`);

--
-- Indeks untuk tabel `tourguide`
--
ALTER TABLE `tourguide`
  ADD PRIMARY KEY (`guide_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `adminactivitylog`
--
ALTER TABLE `adminactivitylog`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT untuk tabel `booking`
--
ALTER TABLE `booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `category`
--
ALTER TABLE `category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `destination`
--
ALTER TABLE `destination`
  MODIFY `destination_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT untuk tabel `itinerary`
--
ALTER TABLE `itinerary`
  MODIFY `itinerary_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `itinerarydetail`
--
ALTER TABLE `itinerarydetail`
  MODIFY `itinerary_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `review`
--
ALTER TABLE `review`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT untuk tabel `tourguide`
--
ALTER TABLE `tourguide`
  MODIFY `guide_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `adminactivitylog`
--
ALTER TABLE `adminactivitylog`
  ADD CONSTRAINT `adminactivitylog_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`);

--
-- Ketidakleluasaan untuk tabel `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`destination_id`),
  ADD CONSTRAINT `booking_ibfk_3` FOREIGN KEY (`guide_id`) REFERENCES `tourguide` (`guide_id`);

--
-- Ketidakleluasaan untuk tabel `destination`
--
ALTER TABLE `destination`
  ADD CONSTRAINT `destination_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`),
  ADD CONSTRAINT `destination_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`);

--
-- Ketidakleluasaan untuk tabel `itinerary`
--
ALTER TABLE `itinerary`
  ADD CONSTRAINT `itinerary_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Ketidakleluasaan untuk tabel `itinerarydetail`
--
ALTER TABLE `itinerarydetail`
  ADD CONSTRAINT `itinerarydetail_ibfk_1` FOREIGN KEY (`itinerary_id`) REFERENCES `itinerary` (`itinerary_id`),
  ADD CONSTRAINT `itinerarydetail_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`destination_id`);

--
-- Ketidakleluasaan untuk tabel `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

--
-- Ketidakleluasaan untuk tabel `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `review_ibfk_2` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`destination_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
