# Setup script untuk Tourify Destination Manager (PowerShell)

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Tourify - Setup Destinasi Manager" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Project path
$ProjectDir = "c:\xampp\htdocs\Tourify V1"
Set-Location $ProjectDir

# [1] Buat direktori
Write-Host "[1] Membuat direktori uploads..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "uploads\destinations" -Force | Out-Null
New-Item -ItemType Directory -Path "uploads\guides" -Force | Out-Null
Write-Host "     ✓ Direktori berhasil dibuat" -ForegroundColor Green

# [2] Setup database
Write-Host ""
Write-Host "[2] Informasi Database Setup..." -ForegroundColor Yellow
Write-Host "     - Database: tourify" -ForegroundColor White
Write-Host "     - Table DESTINATION sudah ada" -ForegroundColor White
Write-Host "     - Table CATEGORY untuk kategori destinasi" -ForegroundColor White
Write-Host "     - Table ADMINACTIVITYLOG untuk logging" -ForegroundColor White

# [3] Show struktur direktori
Write-Host ""
Write-Host "[3] Struktur Direktori:" -ForegroundColor Yellow
Write-Host "     uploads/" -ForegroundColor White
Write-Host "     ├── destinations/ - Gambar destinasi wisata" -ForegroundColor White
Write-Host "     └── guides/       - Gambar tour guide" -ForegroundColor White

# [4] Show API endpoints
Write-Host ""
Write-Host "[4] API Endpoints yang Tersedia:" -ForegroundColor Yellow
Write-Host ""
Write-Host "     Destinasi:" -ForegroundColor Cyan
Write-Host "     GET  /admin/api/destinations.php?action=list" -ForegroundColor Gray
Write-Host "          → Mengambil list semua destinasi" -ForegroundColor Gray
Write-Host ""
Write-Host "     GET  /admin/api/destinations.php?action=detail&id=X" -ForegroundColor Gray
Write-Host "          → Mengambil detail destinasi spesifik" -ForegroundColor Gray
Write-Host ""
Write-Host "     GET  /admin/api/destinations.php?action=categories" -ForegroundColor Gray
Write-Host "          → Mengambil list kategori destinasi" -ForegroundColor Gray
Write-Host ""
Write-Host "     Operasi CRUD:" -ForegroundColor Cyan
Write-Host "     POST   /admin/api/destinations.php?action=create" -ForegroundColor Gray
Write-Host "            → Membuat destinasi baru" -ForegroundColor Gray
Write-Host ""
Write-Host "     POST   /admin/api/destinations.php?action=update" -ForegroundColor Gray
Write-Host "            → Mengupdate destinasi" -ForegroundColor Gray
Write-Host ""
Write-Host "     DELETE /admin/api/destinations.php?action=delete&id=X" -ForegroundColor Gray
Write-Host "            → Menghapus destinasi" -ForegroundColor Gray
Write-Host ""
Write-Host "     Upload:" -ForegroundColor Cyan
Write-Host "     POST   /admin/api/upload.php" -ForegroundColor Gray
Write-Host "            → Upload gambar destinasi" -ForegroundColor Gray

# [5] Show fitur
Write-Host ""
Write-Host "[5] Fitur Admin Panel - Kelola Destinasi:" -ForegroundColor Yellow
Write-Host ""
Write-Host "     ✓ Tambah destinasi baru dengan form lengkap" -ForegroundColor Green
Write-Host "     ✓ Edit destinasi yang sudah ada" -ForegroundColor Green
Write-Host "     ✓ Hapus destinasi dengan konfirmasi" -ForegroundColor Green
Write-Host "     ✓ Upload gambar dengan preview real-time" -ForegroundColor Green
Write-Host "     ✓ Search dan filter destinasi" -ForegroundColor Green
Write-Host "     ✓ Validasi form otomatis" -ForegroundColor Green
Write-Host "     ✓ Data syncing antar tab browser" -ForegroundColor Green
Write-Host "     ✓ Activity logging untuk admin" -ForegroundColor Green

# [6] Show file yang dibuat
Write-Host ""
Write-Host "[6] File yang Dibuat/Diupdate:" -ForegroundColor Yellow
Write-Host "     ✓ /admin/destinations-manager.js - Manager utama" -ForegroundColor Green
Write-Host "     ✓ /admin/api/upload.php - Upload handler" -ForegroundColor Green
Write-Host "     ✓ /admin/admin.php - Updated modal" -ForegroundColor Green

# [7] Show cara akses
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Setup Selesai! ✓" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Akses Admin Panel:" -ForegroundColor Yellow
Write-Host "  URL: http://localhost/Tourify%20V1/admin/" -ForegroundColor White
Write-Host "  atau http://localhost/Tourify%20V1/admin/admin.php" -ForegroundColor White
Write-Host ""
Write-Host "Login dengan akun admin, lalu:" -ForegroundColor Yellow
Write-Host "  1. Klik menu 'Kelola Destinasi' di sidebar" -ForegroundColor White
Write-Host "  2. Gunakan tombol 'Tambah Destinasi' untuk menambah data" -ForegroundColor White
Write-Host "  3. Klik tombol Edit/Hapus di setiap kartu destinasi" -ForegroundColor White
Write-Host ""
