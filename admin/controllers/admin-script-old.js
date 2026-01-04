/**
 * Admin CMS Script
 * Handles all admin interface interactions and API calls
 */

class AdminCMS {
    constructor() {
        this.currentModule = 'dashboard';
        this.apiBaseUrl = './api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupModalListeners();
        this.loadDashboard();
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = link.dataset.module;
                this.switchModule(module);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('adminLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Menu toggle for mobile
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('active');
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('minimized');
            });
        }
    }

    switchModule(module) {
        // Hide all modules
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected module
        const moduleSection = document.getElementById(`${module}-module`);
        if (moduleSection) {
            moduleSection.classList.add('active');
        }

        // Update nav link active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            bookings: 'Kelola Pemesanan',
            destinations: 'Kelola Destinasi',
            users: 'Kelola User',
            guides: 'Kelola Tour Guide',
            reviews: 'Kelola Rating & Ulasan'
        };
        document.getElementById('pageTitle').textContent = titles[module] || 'Dashboard';

        this.currentModule = module;

        // Load module data
        switch (module) {
            case 'bookings':
                this.loadBookings();
                break;
            case 'destinations':
                this.loadDestinations();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'guides':
                this.loadGuides();
                break;
            case 'reviews':
                this.loadReviews();
                break;
            case 'dashboard':
                this.loadDashboard();
                break;
        }
    }

    // ===== API Methods =====

    async apiCall(endpoint, action, method = 'GET', data = null) {
        try {
            const url = `${this.apiBaseUrl}/${endpoint}?action=${action}`;
            const options = {
                method: method,
                headers: {}
            };

            if (method === 'POST' && data) {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                options.body = new URLSearchParams(data);
            }

            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok && result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            this.showError(`API Error: ${error.message}`);
            throw error;
        }
    }

    // ===== Dashboard Methods =====

    async loadDashboard() {
        try {
            const bookingStats = await this.apiCall('bookings.php', 'stats');
            const userStats = await this.apiCall('users.php', 'stats');
            const guideStats = await this.apiCall('guides.php', 'stats');
            const destResult = await this.apiCall('destinations.php', 'list');

            // Update stats
            if (bookingStats.data) {
                document.getElementById('todayBookings').textContent = bookingStats.data.pending || '0';
            }
            if (userStats.data) {
                document.getElementById('totalUsers').textContent = userStats.data.total_users || '0';
            }
            if (guideStats.data) {
                document.getElementById('availableGuides').textContent = guideStats.data.total_guides || '0';
            }
            if (destResult.data) {
                document.getElementById('activeDestinations').textContent = destResult.data.length;
            }

            this.showSuccess('Dashboard updated');
        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    }

    // ===== Bookings Methods =====

    async loadBookings() {
        try {
            const result = await this.apiCall('bookings.php', 'list');
            this.renderBookingsTable(result.data || []);
        } catch (error) {
            console.error('Load bookings error:', error);
        }
    }

    renderBookingsTable(bookings) {
        const container = document.getElementById('bookings-table-container');
        if (!container) return;

        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>User</th><th>Destinasi</th><th>Tour Guide</th>
            <th>Tanggal</th><th>Jumlah</th><th>Total</th><th>Status</th><th>Aksi</th>
        </tr></thead><tbody>`;

        bookings.forEach(booking => {
            html += `<tr>
                <td>${booking.booking_id}</td>
                <td>${booking.user_name || '-'}</td>
                <td>${booking.destination_name || '-'}</td>
                <td>${booking.guide_name || '-'}</td>
                <td>${booking.booking_date}</td>
                <td>${booking.ticket_quantity}</td>
                <td>Rp ${(booking.total_price || 0).toLocaleString('id-ID')}</td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="adminCMS.editBooking(${booking.booking_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminCMS.deleteBooking(${booking.booking_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    async deleteBooking(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) return;
        try {
            await this.apiCall('bookings.php', 'delete', 'POST', { id });
            this.showSuccess('Pemesanan berhasil dihapus');
            this.loadBookings();
        } catch (error) {
            console.error('Delete booking error:', error);
        }
    }

    async editBooking(id) {
        try {
            const result = await this.apiCall('bookings.php', 'detail', 'GET', { id });
            console.log('Edit booking:', result.data);
        } catch (error) {
            console.error('Edit booking error:', error);
        }
    }

    // ===== Destinations Methods =====

    async loadDestinations() {
        try {
            const result = await this.apiCall('destinations.php', 'list');
            this.renderDestinationsTable(result.data || []);
        } catch (error) {
            console.error('Load destinations error:', error);
        }
    }

    renderDestinationsTable(destinations) {
        const container = document.getElementById('destinations-table-container');
        if (!container) return;

        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>Nama</th><th>Lokasi</th><th>Kategori</th>
            <th>Harga</th><th>Rating</th><th>Pemesanan</th><th>Aksi</th>
        </tr></thead><tbody>`;

        destinations.forEach(dest => {
            html += `<tr>
                <td>${dest.destination_id}</td>
                <td>${dest.name}</td>
                <td>${dest.location}</td>
                <td>${dest.category_name || '-'}</td>
                <td>Rp ${(dest.price || 0).toLocaleString('id-ID')}</td>
                <td>${dest.avg_rating ? dest.avg_rating.toFixed(1) : '-'}</td>
                <td>${dest.booking_count || 0}</td>
                <td>
                    <button class="btn-icon" onclick="adminCMS.editDestination(${dest.destination_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminCMS.deleteDestination(${dest.destination_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    async deleteDestination(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus destinasi ini?')) return;
        try {
            await this.apiCall('destinations.php', 'delete', 'POST', { id });
            this.showSuccess('Destinasi berhasil dihapus');
            this.loadDestinations();
        } catch (error) {
            console.error('Delete destination error:', error);
        }
    }

    async editDestination(id) {
        try {
            const result = await this.apiCall('destinations.php', 'detail', 'GET', { id });
            console.log('Edit destination:', result.data);
        } catch (error) {
            console.error('Edit destination error:', error);
        }
    }

    // ===== Users Methods =====

    async loadUsers() {
        try {
            const result = await this.apiCall('users.php', 'list');
            this.renderUsersTable(result.data || []);
        } catch (error) {
            console.error('Load users error:', error);
        }
    }

    renderUsersTable(users) {
        const container = document.getElementById('users-table-container');
        if (!container) return;

        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>Nama</th><th>Email</th><th>Phone</th>
            <th>Pemesanan</th><th>Review</th><th>Terdaftar</th><th>Aksi</th>
        </tr></thead><tbody>`;

        users.forEach(user => {
            html += `<tr>
                <td>${user.user_id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${user.booking_count || 0}</td>
                <td>${user.review_count || 0}</td>
                <td>${user.created_at.split(' ')[0]}</td>
                <td>
                    <button class="btn-icon" onclick="adminCMS.editUser(${user.user_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminCMS.deleteUser(${user.user_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    async deleteUser(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
        try {
            await this.apiCall('users.php', 'delete', 'POST', { id });
            this.showSuccess('User berhasil dihapus');
            this.loadUsers();
        } catch (error) {
            console.error('Delete user error:', error);
        }
    }

    async editUser(id) {
        try {
            const result = await this.apiCall('users.php', 'detail', 'GET', { id });
            console.log('Edit user:', result.data);
        } catch (error) {
            console.error('Edit user error:', error);
        }
    }

    // ===== Guides Methods =====

    async loadGuides() {
        try {
            const result = await this.apiCall('guides.php', 'list');
            this.renderGuidesTable(result.data || []);
        } catch (error) {
            console.error('Load guides error:', error);
        }
    }

    renderGuidesTable(guides) {
        const container = document.getElementById('guides-table-container');
        if (!container) return;

        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>Nama</th><th>Kontak</th><th>Rating</th><th>Pemesanan</th><th>Aksi</th>
        </tr></thead><tbody>`;

        guides.forEach(guide => {
            html += `<tr>
                <td>${guide.guide_id}</td>
                <td>${guide.name}</td>
                <td>${guide.contact}</td>
                <td><span class="rating-badge"><i class="fas fa-star"></i> ${guide.rating.toFixed(1)}</span></td>
                <td>${guide.booking_count || 0}</td>
                <td>
                    <button class="btn-icon" onclick="adminCMS.editGuide(${guide.guide_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminCMS.deleteGuide(${guide.guide_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    async deleteGuide(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus tour guide ini?')) return;
        try {
            await this.apiCall('guides.php', 'delete', 'POST', { id });
            this.showSuccess('Tour guide berhasil dihapus');
            this.loadGuides();
        } catch (error) {
            console.error('Delete guide error:', error);
        }
    }

    async editGuide(id) {
        try {
            const result = await this.apiCall('guides.php', 'detail', 'GET', { id });
            console.log('Edit guide:', result.data);
        } catch (error) {
            console.error('Edit guide error:', error);
        }
    }

    // ===== Reviews Methods =====

    async loadReviews() {
        try {
            const result = await this.apiCall('reviews.php', 'list');
            this.renderReviewsTable(result.data || []);
        } catch (error) {
            console.error('Load reviews error:', error);
        }
    }

    renderReviewsTable(reviews) {
        const container = document.getElementById('reviews-table-container');
        if (!container) return;

        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>User</th><th>Destinasi</th><th>Rating</th><th>Review</th><th>Tanggal</th><th>Aksi</th>
        </tr></thead><tbody>`;

        reviews.forEach(review => {
            const stars = '<i class="fas fa-star"></i>'.repeat(review.rating) + 
                         '<i class="fas fa-star" style="opacity: 0.3;"></i>'.repeat(5 - review.rating);
            
            html += `<tr>
                <td>${review.review_id}</td>
                <td>${review.user_name || '-'}</td>
                <td>${review.destination_name || '-'}</td>
                <td><div class="stars">${stars}</div></td>
                <td>${(review.review_text || '').substring(0, 50)}...</td>
                <td>${review.created_at.split(' ')[0]}</td>
                <td>
                    <button class="btn-icon btn-danger" onclick="adminCMS.deleteReview(${review.review_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    async deleteReview(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus review ini?')) return;
        try {
            await this.apiCall('reviews.php', 'delete', 'POST', { id });
            this.showSuccess('Review berhasil dihapus');
            this.loadReviews();
        } catch (error) {
            console.error('Delete review error:', error);
        }
    }

    // ===== Helper Methods =====

    showSuccess(message) {
        console.log('✓', message);
        this.createToast(message, 'success');
    }

    showError(message) {
        console.error('✗', message);
        this.createToast(message, 'error');
    }

    createToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => {
            if (new Date() - toast.dataset.created > 3000) {
                toast.remove();
            }
        });

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.dataset.created = new Date();
        
        // Add styles if not already in CSS
        if (!document.querySelector('style[data-toast-styles]')) {
            const styleEl = document.createElement('style');
            styleEl.setAttribute('data-toast-styles', 'true');
            styleEl.textContent = `
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 4px;
                    color: white;
                    font-size: 14px;
                    animation: slideIn 0.3s ease-out;
                    z-index: 10000;
                    max-width: 400px;
                }
                .toast-success {
                    background-color: #28a745;
                }
                .toast-error {
                    background-color: #dc3545;
                }
                .toast-info {
                    background-color: #17a2b8;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }

        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== Modal Methods =====

    openDestinationModal(destinationId = null) {
        const modal = document.getElementById('destinationModal');
        const form = document.getElementById('destinationForm');
        const title = document.getElementById('modalTitle');

        if (destinationId) {
            title.textContent = 'Edit Destinasi';
            // Populate form with existing data
            this.apiCall('destinations.php', 'detail', 'GET', { id: destinationId }).then(result => {
                if (result.data) {
                    const dest = result.data;
                    document.getElementById('destName').value = dest.name || '';
                    document.getElementById('destDesc').value = dest.description || '';
                    document.getElementById('destPrice').value = dest.price || '';
                    document.getElementById('destStatus').value = dest.status || 'active';
                    form.dataset.destinationId = destinationId;
                }
            });
        } else {
            title.textContent = 'Tambah Destinasi';
            form.reset();
            delete form.dataset.destinationId;
        }

        if (modal) modal.classList.add('active');
    }

    closeDestinationModal() {
        const modal = document.getElementById('destinationModal');
        if (modal) modal.classList.remove('active');
    }

    openGuideModal(guideId = null) {
        const modal = document.getElementById('guideModal');
        const form = document.getElementById('guideForm') || document.querySelector('#guideModal form');
        const title = document.querySelector('#guideModal .modal-header h2') || document.getElementById('guideModalTitle');

        if (guideId) {
            if (title) title.textContent = 'Edit Tour Guide';
            // Populate form with existing data
            this.apiCall('guides.php', 'detail', 'GET', { id: guideId }).then(result => {
                if (result.data && form) {
                    const guide = result.data;
                    const nameInput = form.querySelector('[name="guideName"]') || form.querySelector('input[type="text"]');
                    if (nameInput) nameInput.value = guide.name || '';
                    form.dataset.guideId = guideId;
                }
            });
        } else {
            if (title) title.textContent = 'Tambah Tour Guide';
            if (form) {
                form.reset();
                delete form.dataset.guideId;
            }
        }

        if (modal) modal.classList.add('active');
    }

    closeGuideModal() {
        const modal = document.getElementById('guideModal');
        if (modal) modal.classList.remove('active');
    }

    // Setup modal event listeners
    setupModalListeners() {
        // Destination Modal
        const closeDestBtn = document.getElementById('closeDestinationModal');
        if (closeDestBtn) {
            closeDestBtn.addEventListener('click', () => this.closeDestinationModal());
        }

        const destForm = document.getElementById('destinationForm');
        if (destForm) {
            destForm.addEventListener('submit', (e) => this.handleDestinationFormSubmit(e));
        }

        const cancelDestBtn = document.getElementById('cancelDestination');
        if (cancelDestBtn) {
            cancelDestBtn.addEventListener('click', () => this.closeDestinationModal());
        }

        // Add Destination Button
        const addDestBtn = document.getElementById('addDestinationBtn');
        if (addDestBtn) {
            addDestBtn.addEventListener('click', () => this.openDestinationModal());
        }

        // Guide Modal
        const closeGuideBtn = document.getElementById('closeGuideModal');
        if (closeGuideBtn) {
            closeGuideBtn.addEventListener('click', () => this.closeGuideModal());
        }

        const addGuideBtn = document.getElementById('addGuideBtn');
        if (addGuideBtn) {
            addGuideBtn.addEventListener('click', () => this.openGuideModal());
        }

        // Close modal on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    async handleDestinationFormSubmit(e) {
        e.preventDefault();
        const form = document.getElementById('destinationForm');
        const destinationId = form.dataset.destinationId;

        const data = {
            name: document.getElementById('destName').value,
            description: document.getElementById('destDesc').value,
            price: parseFloat(document.getElementById('destPrice').value),
            location: document.getElementById('destLocation')?.value || 'Banjarnegara',
            category_id: document.getElementById('destCategory').value || 1,
            status: document.getElementById('destStatus').value
        };

        try {
            if (destinationId) {
                // Edit
                data.id = destinationId;
                await this.apiCall('destinations.php', 'update', 'POST', data);
                this.showSuccess('Destinasi berhasil diperbarui');
            } else {
                // Add
                await this.apiCall('destinations.php', 'add', 'POST', data);
                this.showSuccess('Destinasi berhasil ditambahkan');
            }
            this.closeDestinationModal();
            this.loadDestinations();
        } catch (error) {
            this.showError('Gagal menyimpan destinasi: ' + error.message);
        }
    }

    async logout() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            window.location.href = './logout.php';
        }
    }
}

// Initialize CMS on page load
let adminCMS;
document.addEventListener('DOMContentLoaded', () => {
    adminCMS = new AdminCMS();
});

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================

function initializeLogout() {
  const logoutBtn = document.getElementById("adminLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Apakah Anda yakin ingin keluar dari admin panel?")) {
        adminAuth.logout();
        // Perform server-side session destroy as well
        window.location.href = "logout.php";
      }
    });
  }
}

// ============================================
// DATA SYNCHRONIZATION
// ============================================

function initializeDataSync() {
  // Listen for data sync events from other tabs
  dataSync.listenForSyncEvents((eventType, data) => {
    console.log("Data sync received:", eventType, data);
    // Update UI based on sync events if needed
    showSyncNotification(eventType);
  });

  // Sync destinations when saved
  window.addEventListener("destinationSaved", function (e) {
    const destination = e.detail;
    dataSync.saveDestination(destination);
    console.log("Destination synced:", destination);
  });

  // Sync guides when saved
  window.addEventListener("guideSaved", function (e) {
    const guide = e.detail;
    dataSync.saveGuide(guide);
    console.log("Guide synced:", guide);
  });

  // Sync reviews when saved
  window.addEventListener("reviewSaved", function (e) {
    const review = e.detail;
    dataSync.saveReview(review);
    console.log("Review synced:", review);
  });
}

/**
 * Show sync notification
 */
function showSyncNotification(eventType) {
  const notificationBadge = document.querySelector(".notification-badge");
  if (notificationBadge) {
    let currentCount = parseInt(notificationBadge.textContent) || 0;
    notificationBadge.textContent = currentCount + 1;

    setTimeout(() => {
      notificationBadge.textContent = Math.max(0, currentCount);
    }, 5000);
  }
}

// ============================================
// MODULE SWITCHING AND CORE FUNCTIONALITY
// ============================================

function initializeModuleSwitching() {
  // Module Switching
  const navLinks = document.querySelectorAll(".nav-link");
  const moduleSections = document.querySelectorAll(".module-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const moduleId = link.dataset.module + "-module";

      // Update active nav link
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Update page title
      const pageTitle = document.getElementById("pageTitle");
      pageTitle.textContent = link.textContent.trim();

      // Show active module
      moduleSections.forEach((section) => section.classList.remove("active"));
      document.getElementById(moduleId).classList.add("active");

      // Close sidebar on mobile
      const sidebar = document.querySelector(".admin-sidebar");
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("active");
      }
    });
  });

  // Sidebar Toggle
  const menuToggle = document.getElementById("menuToggle");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".admin-sidebar");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.remove("active");
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
      if (
        !e.target.closest(".admin-sidebar") &&
        !e.target.closest(".menu-toggle")
      ) {
        sidebar.classList.remove("active");
      }
    }
  });
}

// DESTINATION MODAL
const destinationModal = document.getElementById("destinationModal");
const addDestinationBtn = document.getElementById("addDestinationBtn");
const closeDestinationModal = document.getElementById("closeDestinationModal");
const cancelDestination = document.getElementById("cancelDestination");
const destinationForm = document.getElementById("destinationForm");

addDestinationBtn.addEventListener("click", () => {
  document.getElementById("modalTitle").textContent = "Tambah Destinasi";
  destinationForm.reset();
  destinationModal.classList.add("active");
});

closeDestinationModal.addEventListener("click", () => {
  destinationModal.classList.remove("active");
});

cancelDestination.addEventListener("click", () => {
  destinationModal.classList.remove("active");
});

destinationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(destinationForm);
  alert("Destinasi berhasil disimpan!");
  destinationModal.classList.remove("active");
});

// GUIDE MODAL
const guideModal = document.getElementById("guideModal");
const addGuideBtn = document.getElementById("addGuideBtn");
const closeGuideModal = document.getElementById("closeGuideModal");
const cancelGuide = document.getElementById("cancelGuide");
const guideForm = document.getElementById("guideForm");

addGuideBtn.addEventListener("click", () => {
  guideForm.reset();
  guideModal.classList.add("active");
});

closeGuideModal.addEventListener("click", () => {
  guideModal.classList.remove("active");
});

cancelGuide.addEventListener("click", () => {
  guideModal.classList.remove("active");
});

guideForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Tour Guide berhasil ditambahkan!");
  guideModal.classList.remove("active");
});

// REPLY MODAL
const replyModal = document.getElementById("replyModal");
const closeReplyModal = document.getElementById("closeReplyModal");
const cancelReply = document.getElementById("cancelReply");
const replyForm = document.getElementById("replyForm");

closeReplyModal.addEventListener("click", () => {
  replyModal.classList.remove("active");
});

cancelReply.addEventListener("click", () => {
  replyModal.classList.remove("active");
});

replyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Balasan berhasil dikirim!");
  replyModal.classList.remove("active");
});

// NOTIFICATION PANEL
const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");
const closeNotifications = document.getElementById("closeNotifications");

notificationBtn.addEventListener("click", () => {
  notificationPanel.classList.toggle("active");
});

closeNotifications.addEventListener("click", () => {
  notificationPanel.classList.remove("active");
});

// Close notification panel when clicking outside
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".notification-panel") &&
    !e.target.closest(".btn-icon")
  ) {
    notificationPanel.classList.remove("active");
  }
});

// BOOKING TABLE ACTIONS
const bookingsTableBody = document.getElementById("bookingsTableBody");

bookingsTableBody.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  if (button.classList.contains("confirm")) {
    if (confirm("Konfirmasi pembayaran untuk transaksi ini?")) {
      const row = button.closest("tr");
      const statusCell = row.querySelector(".badge");
      statusCell.textContent = "Paid";
      statusCell.className = "badge badge-paid";
      alert("Pembayaran berhasil dikonfirmasi!");
    }
  } else if (button.classList.contains("view")) {
    alert("Detail transaksi ditampilkan. (Implementasi sesuai kebutuhan)");
  } else if (button.classList.contains("delete")) {
    if (confirm("Hapus transaksi ini?")) {
      button.closest("tr").remove();
      alert("Transaksi berhasil dihapus!");
    }
  }
});

// FILTER BOOKINGS
const searchBookings = document.getElementById("searchBookings");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");

function filterBookings() {
  const searchTerm = searchBookings.value.toLowerCase();
  const statusValue = statusFilter.value.toLowerCase();
  const dateValue = dateFilter.value;

  Array.from(bookingsTableBody.rows).forEach((row) => {
    let show = true;

    // Search filter
    if (searchTerm) {
      const text = row.textContent.toLowerCase();
      show = show && text.includes(searchTerm);
    }

    // Status filter
    if (statusValue) {
      const badge = row.querySelector(".badge");
      show = show && badge.textContent.toLowerCase() === statusValue;
    }

    // Date filter
    if (dateValue) {
      const dateCell = row.cells[3].textContent;
      show = show && dateCell.includes(dateValue);
    }

    row.style.display = show ? "" : "none";
  });
}

searchBookings.addEventListener("input", filterBookings);
statusFilter.addEventListener("change", filterBookings);
dateFilter.addEventListener("change", filterBookings);

// EXPORT BOOKINGS
const exportBookingsBtn = document.getElementById("exportBookingsBtn");

exportBookingsBtn.addEventListener("click", () => {
  const table = document.querySelector(".data-table");
  let csv =
    "ID Transaksi,User,Destinasi,Tanggal Booking,Jumlah Tiket,Total Harga,Status\n";

  Array.from(bookingsTableBody.rows).forEach((row) => {
    const cells = Array.from(row.cells)
      .slice(0, 7)
      .map((cell) => {
        let text = cell.textContent.trim();
        if (cell.querySelector(".badge")) {
          text = cell.querySelector(".badge").textContent;
        }
        return `"${text}"`;
      });
    csv += cells.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bookings_" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
});

// DESTINATION ACTIONS
const destinationGrid = document.getElementById("destinationGrid");

destinationGrid.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const card = button.closest(".destination-card");

  if (button.classList.contains("edit")) {
    const destName = card.querySelector("h3").textContent;
    document.getElementById("modalTitle").textContent =
      "Edit Destinasi: " + destName;
    destinationModal.classList.add("active");
  } else if (button.classList.contains("delete")) {
    if (confirm("Hapus destinasi ini?")) {
      card.remove();
      alert("Destinasi berhasil dihapus!");
    }
  }
});

// USER TABLE ACTIONS
const usersTableBody = document.getElementById("usersTableBody");

usersTableBody.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const row = button.closest("tr");

  if (button.classList.contains("view")) {
    const userName = row.cells[0].textContent;
    alert("Detail user: " + userName + " (Implementasi sesuai kebutuhan)");
  } else if (button.classList.contains("deactivate")) {
    if (confirm("Nonaktifkan user ini?")) {
      const statusCell = row.querySelector(".badge");
      statusCell.textContent = "Nonaktif";
      statusCell.className = "badge badge-inactive";
      const newButton = document.createElement("button");
      newButton.className = "btn-action activate";
      newButton.title = "Aktifkan";
      newButton.innerHTML = '<i class="fas fa-check-circle"></i>';
      button.replaceWith(newButton);
      alert("User berhasil dinonaktifkan!");
    }
  } else if (button.classList.contains("activate")) {
    if (confirm("Aktifkan user ini?")) {
      const statusCell = row.querySelector(".badge");
      statusCell.textContent = "Aktif";
      statusCell.className = "badge badge-active";
      const newButton = document.createElement("button");
      newButton.className = "btn-action deactivate";
      newButton.title = "Nonaktifkan";
      newButton.innerHTML = '<i class="fas fa-ban"></i>';
      button.replaceWith(newButton);
      alert("User berhasil diaktifkan!");
    }
  }
});

// FILTER USERS
const searchUsers = document.getElementById("searchUsers");
const statusUserFilter = document.getElementById("statusUserFilter");

function filterUsers() {
  const searchTerm = searchUsers.value.toLowerCase();
  const statusValue = statusUserFilter.value.toLowerCase();

  Array.from(usersTableBody.rows).forEach((row) => {
    let show = true;

    if (searchTerm) {
      const text = row.textContent.toLowerCase();
      show = show && text.includes(searchTerm);
    }

    if (statusValue) {
      const badge = row.querySelector(".badge");
      show = show && badge.textContent.toLowerCase() === statusValue;
    }

    row.style.display = show ? "" : "none";
  });
}

searchUsers.addEventListener("input", filterUsers);
statusUserFilter.addEventListener("change", filterUsers);

// GUIDE ACTIONS
const guidesGrid = document.getElementById("guidesGrid");

guidesGrid.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const card = button.closest(".guide-card");

  if (button.classList.contains("edit")) {
    const guideName = card.querySelector("h3").textContent;
    document.querySelector("#guideModal .modal-header h2").textContent =
      "Edit Tour Guide: " + guideName;
    guideModal.classList.add("active");
  } else if (button.classList.contains("delete")) {
    if (confirm("Hapus tour guide ini?")) {
      card.remove();
      alert("Tour Guide berhasil dihapus!");
    }
  } else if (button.classList.contains("verify")) {
    if (confirm("Verifikasi sertifikasi guide ini?")) {
      const certBadge = card.querySelector(".badge-pending");
      if (certBadge) {
        certBadge.textContent = "Verified";
        certBadge.className = "badge badge-active";
      }
      button.remove();
      alert("Sertifikasi berhasil diverifikasi!");
    }
  }
});

// REVIEW ACTIONS
const reviewsContainer = document.getElementById("reviewsContainer");

reviewsContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const reviewItem = button.closest(".review-item");

  if (button.classList.contains("reply")) {
    replyModal.classList.add("active");
  } else if (button.classList.contains("approve")) {
    reviewItem.classList.remove("flagged");
    button.remove();
    alert("Ulasan disetujui!");
  } else if (button.classList.contains("delete")) {
    if (confirm("Hapus ulasan ini?")) {
      reviewItem.remove();
      alert("Ulasan berhasil dihapus!");
    }
  }
});

// FILTER REVIEWS
const searchReviews = document.getElementById("searchReviews");
const ratingFilter = document.getElementById("ratingFilter");

function filterReviews() {
  const searchTerm = searchReviews.value.toLowerCase();
  const ratingValue = ratingFilter.value;

  Array.from(reviewsContainer.children).forEach((review) => {
    let show = true;

    if (searchTerm) {
      const text = review.textContent.toLowerCase();
      show = show && text.includes(searchTerm);
    }

    if (ratingValue) {
      const starsText = review.querySelector(".stars").textContent;
      const starCount = starsText.match(/⭐/g).length;
      show = show && starCount == ratingValue;
    }

    review.style.display = show ? "" : "none";
  });
}

searchReviews.addEventListener("input", filterReviews);
ratingFilter.addEventListener("change", filterReviews);

// CHART SIMULATION (using Canvas API)
function initializeChart() {
  const canvas = document.getElementById("bookingChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Simple chart rendering
  const data = [12, 19, 8, 15, 22, 18, 25];
  const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const width = canvas.width;
  const height = canvas.height;
  const maxValue = Math.max(...data);
  const barWidth = width / data.length;

  // Clear canvas
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Draw bars
  ctx.fillStyle = "#1E40AF";
  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * (height - 40);
    const x = index * barWidth + barWidth * 0.1;
    const y = height - barHeight - 20;
    ctx.fillRect(x, y, barWidth * 0.8, barHeight);
  });

  // Draw labels
  ctx.fillStyle = "#6B7280";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  labels.forEach((label, index) => {
    const x = index * barWidth + barWidth / 2;
    ctx.fillText(label, x, height - 5);
  });
}

// Initialize chart when page loads
document.addEventListener("DOMContentLoaded", initializeChart);

// Set admin name if logged in
const adminName = document.getElementById("adminName");
if (adminName) {
  const userName = localStorage.getItem("userName") || "Admin";
  adminName.textContent = userName;
}

// Responsive adjustments
window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) {
    sidebar.classList.remove("active");
  }
});

// Initialize with dashboard as active module
document.addEventListener("DOMContentLoaded", () => {
  const dashboardLink = document.querySelector('[data-module="dashboard"]');
  if (dashboardLink) {
    dashboardLink.classList.add("active");
  }
});

// Additional utility functions

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Notification sound (optional)
function playNotification() {
  // You can add sound notification here
  // For example: new Audio('notification.mp3').play();
}

console.log("Admin Dashboard initialized successfully!");

// Initialize AdminCMS when DOM is ready
let adminCMS;
document.addEventListener('DOMContentLoaded', () => {
    adminCMS = new AdminCMS();
});
