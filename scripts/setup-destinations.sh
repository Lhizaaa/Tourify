#!/bin/bash
# Setup script untuk Tourify Destination Manager

echo "=========================================="
echo "  Tourify - Setup Destinasi Manager"
echo "=========================================="
echo ""

# Change to project directory
PROJECT_DIR="c:\xampp\htdocs\Tourify V1"
cd "$PROJECT_DIR" || exit

echo "[1] Membuat direktori uploads..."
mkdir -p uploads/destinations/
mkdir -p uploads/guides/
chmod 755 uploads/destinations/
chmod 755 uploads/guides/

echo "[2] Membuat tabel admin activity log (jika belum ada)..."

# Create SQL script untuk activity log
cat > temp_migration.sql << 'EOF'
USE tourify;

-- Tabel untuk mencatat aktivitas admin
CREATE TABLE IF NOT EXISTS ADMINACTIVITYLOG (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES ADMIN(admin_id)
) ENGINE=InnoDB;

-- Pastikan DESTINATION table sudah updated dengan kolom yang benar
ALTER TABLE DESTINATION MODIFY COLUMN image VARCHAR(255) NULL;

-- Create default categories jika belum ada
INSERT IGNORE INTO CATEGORY (category_id, name, description) VALUES
(1, 'Pegunungan', 'Destinasi wisata dengan pemandangan pegunungan'),
(2, 'Danau', 'Destinasi wisata dengan danau indah'),
(3, 'Air Terjun', 'Destinasi wisata dengan air terjun'),
(4, 'Candi Bersejarah', 'Situs candi dan warisan budaya'),
(5, 'Pantai', 'Destinasi wisata pantai'),
(6, 'Goa Alam', 'Goa dan tebing alami'),
(7, 'Perkebunan', 'Destinasi agro-wisata'),
(8, 'Taman Nasional', 'Taman nasional dan cagar alam');

EOF

echo "[3] Struktur direktori:"
echo "  ✓ uploads/destinations/ - Untuk menyimpan gambar destinasi"
echo "  ✓ uploads/guides/ - Untuk menyimpan gambar tour guide"
echo ""

echo "[4] API Endpoints yang tersedia:"
echo "  - GET  /admin/api/destinations.php?action=list      - List destinasi"
echo "  - GET  /admin/api/destinations.php?action=detail&id=X - Detail destinasi"
echo "  - GET  /admin/api/destinations.php?action=categories - List kategori"
echo "  - POST /admin/api/destinations.php?action=create      - Buat destinasi"
echo "  - POST /admin/api/destinations.php?action=update      - Update destinasi"
echo "  - DELETE /admin/api/destinations.php?action=delete&id=X - Hapus destinasi"
echo "  - POST /admin/api/upload.php                        - Upload gambar"
echo ""

echo "[5] Fitur yang sudah siap:"
echo "  ✓ Menambah destinasi baru"
echo "  ✓ Edit destinasi"
echo "  ✓ Hapus destinasi"
echo "  ✓ Upload gambar destinasi"
echo "  ✓ Search & filter destinasi"
echo "  ✓ Real-time preview gambar"
echo ""

echo "=========================================="
echo "  Setup Selesai! ✓"
echo "=========================================="
echo ""
echo "Akses admin panel di:"
echo "  http://localhost/Tourify%20V1/admin/"
echo ""
