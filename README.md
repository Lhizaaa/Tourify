# TourifyV1

**Tourism Booking & Management System - Advanced Web Application**

Sistem manajemen pariwisata terpadu dengan fitur booking destinasi, manajemen tour guide, sistem pembayaran, dan panel admin yang komprehensif. Platform ini dirancang untuk memudahkan wisatawan dalam menemukan dan memesan tour packages, serta membantu operator pariwisata mengelola destinasi, guide, dan booking dengan efisien.

TourifyV2 adalah refactoring lengkap dari TourifyV1 dengan arsitektur yang lebih terstruktur, mengikuti best practices PSR-4, dan peningkatan signifikan dalam kualitas kode, keamanan, dan performa.

## 🌟 Fitur Utama

- **Destinasi Wisata** - Katalog lengkap destinasi dengan detail, harga, rating, dan foto
- **Tour Guide Management** - Sistem manajemen pemandu wisata dengan profil dan rating
- **Booking System** - Reservasi tour packages dengan sistem pembayaran terintegrasi
- **Itinerary Planning** - Perencanaan jadwal perjalanan detail dengan breakdown aktivitas
- **Review & Rating System** - Sistem rating bintang 5 dengan komentar dan foto dari pengunjung
- **Admin Dashboard** - Panel kontrol lengkap untuk management konten dan transaksi
- **Payment Gateway** - Integrasi dengan Stripe untuk pembayaran online aman
- **Authentication System** - Login/register dengan OAuth Google dan email password
- **Activity Logging** - Pencatatan aktivitas admin untuk audit trail
- **Responsive Design** - Interface mobile-friendly untuk semua perangkat

## 📋 Requirements

- PHP 8.0+
- MySQL 5.7+ / MariaDB
- Apache Web Server (dengan mod_rewrite)
- Composer (untuk autoloading dan dependencies)
- Extensions: PDO, curl, json, gd

## 🚀 Installation

### 1. Clone atau Download Repository

```bash
git clone https://github.com/yourusername/TourifyV2.git
cd TourifyV2
```

### 2. Database Setup

Buat database baru:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE tourify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Atau melalui phpMyAdmin:
- Buat database baru dengan nama `tourify`
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

Import schema database:

```bash
mysql -u root -p tourify < database/exports/tourify.sql
```

### 3. Environment Configuration

Buat file `.env` di root directory dengan menyalin dari `.env.example`:

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tourify
DB_PORT=3306

# Application
APP_NAME=TourifyV2
APP_URL=http://localhost:8000
APP_ENV=development

# Google OAuth (opsional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/google-oauth-callback.php

# Stripe Payment (opsional)
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Configuration (opsional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Logging
LOG_LEVEL=debug
LOG_PATH=/storage/logs
```

### 4. Setup Directory Permissions

Pastikan direktori tertentu writable:

**Linux/Mac:**
```bash
chmod -R 755 storage/
chmod -R 755 storage/uploads/
chmod -R 755 storage/logs/
chmod -R 755 storage/cache/
chmod -R 755 public/assets/uploads/
```

**Windows (XAMPP):**
- Folder akan auto-create dengan permission yang sesuai
- Pastikan antivirus tidak memblok akses

### 5. Configure Web Server

#### Untuk Apache:
Pastikan `mod_rewrite` enabled. File `.htaccess` sudah dikonfigurasi untuk URL rewriting clean URLs.

```apache
RewriteBase /TourifyV2/
```

Jika project di root directory:
```apache
RewriteBase /
```

#### Untuk PHP Development Server:
```bash
cd TourifyV2
php -S localhost:8000 -t public/
```

### 6. Verify Installation

Test database connection:
```bash
php test-database.php
```

Expected output:
```
=== TourifyV2 Database Connection Test ===

1. Testing PDO Connection...
   ✓ PDO connection successful

2. Testing Simple Query...
   ✓ Simple query executed

...

=== ✓ All Database Tests Passed! ===
```

## 🌐 Accessing the Application

### User Frontend
```
http://localhost:8000
```

Features:
- View destinations, tour guides, dan reviews
- Login/register account
- Browse dan book tour packages
- Upload review dan rating
- Manage bookings dan itinerary

### Admin Panel
```
http://localhost:8000/admin
```

Default credentials (buat di database):
- Email: `admin@tourify.local`
- Password: `admin123` (change setelah login)

Features:
- Destination management (CRUD)
- Tour guide management
- Booking management
- Review moderation
- Payment tracking
- User management
- Analytics dashboard
- Activity logging

### API Endpoints
```
http://localhost:8000/api/v1/
```

Available endpoints:
- `GET /destinations-public.php` - List all destinations
- `GET /tour-guides.php` - List all guides
- `GET /get-reviews.php?id=X` - Get reviews for destination
- `POST /bookings.php` - Create booking
- `POST /save-review.php` - Save review
- Dll (lihat API documentation)

## 📁 Project Structure

```
TourifyV2/
├── public/                          # Web root
│   ├── index.php                    # Main entry point & router
│   ├── test.php                     # Simple test file
│   ├── .htaccess                    # URL rewriting rules
│   ├── assets/
│   │   ├── css/                     # Stylesheets
│   │   │   ├── style.css
│   │   │   ├── admin-style.css
│   │   │   └── animations.css
│   │   ├── js/                      # JavaScript files
│   │   │   ├── auth.js
│   │   │   ├── booking.js
│   │   │   ├── destinations.js
│   │   │   ├── tour-guide.js
│   │   │   ├── itinerary.js
│   │   │   └── script.js
│   │   ├── images/                  # Static images
│   │   └── uploads/                 # User uploads (junction/symlink)
│   └── views/                       # View templates
│       ├── auth/
│       │   ├── login.php
│       │   └── register.php
│       ├── admin/
│       │   ├── admin.php
│       │   ├── bookings.php
│       │   └── dashboard.php
│       └── quick-start/
│           └── index.html
├── src/                             # Source code (PSR-4)
│   ├── Controllers/                 # Controllers
│   │   ├── Auth.php
│   │   ├── BookingController.php
│   │   ├── DestinationsController.php
│   │   ├── GuidesController.php
│   │   └── ProfileController.php
│   ├── Models/                      # Data models
│   │   ├── Destination.php
│   │   ├── Booking.php
│   │   └── Review.php
│   ├── Services/                    # Business logic
│   │   ├── DestinationImageService.php
│   │   ├── BookingService.php
│   │   └── ImageValidator.php
│   └── Middleware/                  # Middleware
│       ├── AuthMiddleware.php
│       └── ValidateMiddleware.php
├── api/                             # API endpoints
│   └── v1/                          # API version 1
│       ├── bookings.php
│       ├── destinations-public.php
│       ├── tour-guides.php
│       ├── get-reviews.php
│       ├── save-review.php
│       ├── get-user-bookings.php
│       ├── get-user-reviews.php
│       ├── itinerary.php
│       ├── google-oauth-callback.php
│       └── check-session.php
├── config/                          # Configuration
│   └── database.php                 # PDO database connection
├── database/                        # Database files
│   ├── migrations/                  # Database setup scripts
│   │   ├── setup-database.php
│   │   ├── setup-categories.php
│   │   ├── setup-map-support.php
│   │   └── cleanup-destinations.php
│   ├── seeds/                       # Sample data
│   │   └── DestinationSeeder.php
│   ├── exports/                     # Database backups
│   │   ├── tourify.sql
│   │   └── schema.sql
│   └── docker/                      # Docker configuration
│       └── docker-compose.yml
├── storage/                         # Runtime data
│   ├── uploads/                     # All user uploads
│   ├── logs/                        # Error logs
│   ├── cache/                       # Cache files
│   └── sessions/                    # Session files
├── vendor/                          # Composer dependencies
├── composer.json                    # Project metadata & dependencies
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── test-database.php                # Database test script
└── README.md                        # This file
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | PHP 8.0+ (Native) |
| **Database** | MySQL 5.7+ / MariaDB |
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Security** | Session management, CSRF protection, prepared statements |
| **Autoloading** | Composer PSR-4 |
| **Database Access** | PDO (PHP Data Objects) |
| **API Integration** | Google OAuth, Stripe Payment |
| **File Storage** | Local filesystem with symlink/junction |

## 🔐 Security Features

- **Prepared Statements** - Prevent SQL injection
- **Session Management** - PHP native sessions dengan HTTPS recommended
- **CSRF Protection** - Token validation untuk form submissions
- **Password Hashing** - bcrypt hashing untuk password
- **Input Validation** - Client & server-side validation
- **Error Handling** - Safe error messages tanpa expose sensitive info
- **OAuth Integration** - Secure Google authentication
- **File Upload Validation** - MIME type & size checking

## 📊 Database Schema

### Core Tables (11 tables)

| Table | Purpose |
|-------|---------|
| `users` | User accounts dengan role & profile |
| `destination` | Destinasi wisata dengan detail & pricing |
| `tourguide` | Pemandu wisata dengan rating & availability |
| `booking` | Reservasi tour dengan status tracking |
| `payment` | Transaksi pembayaran dengan Stripe |
| `review` | Rating & komentar dari pengunjung |
| `itinerary` | Jadwal perjalanan detail |
| `itinerarydetail` | Breakdown aktivitas per itinerary |
| `category` | Kategori destinasi |
| `admin` | Admin accounts dengan roles |
| `adminactivitylog` | Audit trail aktivitas admin |

Lihat `database/exports/schema.sql` untuk detail lengkap.

## 🎯 Getting Started

### 1. Verify Database Connection

```bash
php test-database.php
```

### 2. Start Development Server

```bash
cd TourifyV2
php -S localhost:8000 -t public/
```

### 3. Access Application

- **User Home:** http://localhost:8000
- **Login Page:** http://localhost:8000/login
- **Admin Panel:** http://localhost:8000/admin

### 4. Test Features

**Browse Destinations:**
- Visit http://localhost:8000
- View destination list
- Check detail & reviews

**Create Booking:**
- Login dengan akun Anda
- Pilih destinasi
- Isi form booking
- Proceed to payment

**Admin Panel:**
- Login http://localhost:8000/admin
- Manage destinations, guides, bookings
- View analytics

## 🔧 Development Notes

### Local Development Setup

**XAMPP:**
```bash
# Pastikan Apache & MySQL running
# Place project di htdocs/TourifyV2
http://localhost/TourifyV2
```

**WAMP:**
```bash
# Place project di www/TourifyV2
http://localhost/TourifyV2
```

**Laravel Valet (macOS):**
```bash
cd TourifyV2
valet link tourifyv2
# Akses di http://tourifyv2.local
```

### Database Migrations

Run migrations secara manual:
```bash
php database/migrations/setup-database.php
php database/migrations/setup-categories.php
php database/migrations/setup-map-support.php
```

### Testing API

Gunakan Postman atau curl:

```bash
# Get all destinations
curl http://localhost:8000/api/v1/destinations-public.php

# Get destination reviews
curl http://localhost:8000/api/v1/get-reviews.php?id=1

# Create booking (dengan authentication)
curl -X POST http://localhost:8000/api/v1/bookings.php \
  -H "Content-Type: application/json" \
  -d '{"destination_id":1,"guide_id":1,"date":"2024-01-15","...": "..."}'
```

### Enable Error Debugging

Edit `public/index.php` dan set error reporting:

```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

### File Upload Limits

Di `php.ini`:
```ini
upload_max_filesize = 10M
post_max_size = 10M
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: SQLSTATE[HY000]: General error
```
**Solution:**
- Cek `.env` credentials
- Pastikan MySQL service running
- Verify database `tourify` sudah created
- Test dengan: `php test-database.php`

### 404 Error pada Assets
```
GET /assets/css/style.css 404 Not Found
```
**Solution:**
- Verify `public/assets/` directory exists
- Check `.htaccess` RewriteBase configuration
- Restart Apache
- Clear browser cache

### URL Rewrite Not Working
```
Routing tidak berjalan, langsung error
```
**Solution:**
- Verify Apache `mod_rewrite` enabled
- Check `AllowOverride All` di vhost config
- Ensure `.htaccess` di root project
- Restart Apache: `httpd -k restart` (Windows)

### Upload Gagal
```
Upload failed / file tidak tersimpan
```
**Solution:**
- Check `storage/uploads/` permission (755)
- Verify `upload_max_filesize` di php.ini
- Check disk space
- Verify symlink created: `public/assets/uploads` → `storage/uploads`

### Session Not Persisting
```
Login session hilang setelah refresh
```
**Solution:**
- Verify `storage/sessions/` writable
- Check `session.save_path` di php.ini
- Ensure cookies enabled di browser
- Verify session_start() di index.php

### Class Not Found Error
```
Class App\Controllers\SomeClass not found
```
**Solution:**
- Run `composer dump-autoload`
- Check namespace sesuai file structure
- Verify PSR-4 mapping di composer.json
- Check class definition di src/ directory

## 📚 API Documentation

### Endpoints

#### Destinations
- `GET /api/v1/destinations-public.php` - List destinations
- `POST /api/v1/destinations-public.php` - Add destination (admin)
- `PUT /api/v1/destinations-public.php?id=X` - Update destination
- `DELETE /api/v1/destinations-public.php?id=X` - Delete destination

#### Tour Guides
- `GET /api/v1/tour-guides.php` - List guides
- `POST /api/v1/tour-guides.php` - Add guide (admin)

#### Reviews
- `GET /api/v1/get-reviews.php?id=X` - Get reviews untuk item
- `POST /api/v1/save-review.php` - Submit review (authenticated)

#### Bookings
- `POST /api/v1/bookings.php` - Create booking
- `GET /api/v1/get-user-bookings.php` - Get user's bookings (authenticated)

#### Itinerary
- `GET /api/v1/itinerary.php` - Get itinerary
- `POST /api/v1/itinerary.php` - Create itinerary

Lihat masing-masing file di `api/v1/` untuk detail parameter & response.

## 📝 Project Information

**Project Type:** Web Application (Tourism Booking System)  
**PHP Version:** 8.0+  
**Database:** MySQL 5.7+  
**Development Period:** 2025-2026  

### Key Improvements (V2 vs V1)

| Aspek | V1 | V2 |
|-------|-----|------|
| Code Structure | Root-level chaos | PSR-4 organized |
| Architecture | Procedural | MVC-inspired |
| Database | MySQLi | PDO |
| API Versioning | None | /api/v1/ |
| Error Handling | Basic | Comprehensive |
| Documentation | Minimal | Extensive |
| Testing | None | 87-test checklist |
| Code Quality | Low | High |

### Goals & Achievements

✅ **Complete Restructuring** - Transformasi dari chaos ke organized structure  
✅ **Better Security** - Prepared statements, session management, CSRF protection  
✅ **Scalability** - PSR-4 compliance, modular architecture  
✅ **Maintainability** - Clear separation of concerns, comprehensive documentation  
✅ **Testability** - API testing checklist, database tests  
✅ **Developer Experience** - Clean code, consistent naming, easy setup  

## 🤝 Contributing

Kontribusi sangat welcome! Silakan:

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📞 Support & Troubleshooting

Untuk pertanyaan atau issues:
- Buka GitHub Issues untuk bug report
- Cek Troubleshooting section di atas
- Review documentation di `docs/` folder
- Test dengan: `php test-database.php`

## 📄 License

Project ini tersedia di bawah lisensi MIT. Lihat LICENSE file untuk detail.

## 📖 Additional Resources

- [Database Schema](database/exports/schema.sql) - Complete database structure
- [API Endpoints](api/v1/) - All API files
- [Testing Checklist](TESTING_CHECKLIST.md) - 87 test cases
- [Migration Report](MIGRATION_REPORT.md) - Refactoring details
- [Project Status](PROJECT_STATUS_FINAL.md) - Current status & metrics

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core functionality
- ✅ Database setup
- ✅ User authentication
- ✅ Booking system

### Phase 2 (Planned)
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] SMS notifications

### Phase 3 (Future)
- [ ] Mobile app (Flutter)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Machine learning recommendations

---

**TourifyV2** - Bringing Tourism Booking to the Next Level 🚀

**Dikembangkan dengan ❤️ untuk pariwisata Indonesia**

*Last Updated: January 2026*

