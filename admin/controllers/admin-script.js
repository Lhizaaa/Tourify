// Admin Dashboard JavaScript

// ============================================
// SESSION VERIFICATION
// ============================================

// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  if (!adminAuth.isAuthenticated()) {
    window.location.href = "login.php";
    return;
  }



  // Initialize module switching and other functionality
  initializeModuleSwitching();
  initializeLogout();
  initializeDataSync();
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
  });

  // NOTE: Sync system hanya untuk internal admin management
  // Data utama disimpan di DATABASE, bukan localStorage
  // User page mengambil data langsung dari API/Database

  // Disable localStorage sync untuk guides dan destinations
  // Karena data master harus berasal dari database saja
  // untuk memastikan admin & user lihat data yang SAMA

  // Sync reviews when saved
  window.addEventListener("reviewSaved", function (e) {
    const review = e.detail;
    dataSync.saveReview(review);
    console.log("Review synced:", review);
  });
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

guideForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const guideName = document.getElementById("guideName").value;
  const guidePhone = document.getElementById("guidePhone").value;
  const guidePrice = document.getElementById("guidePrice").value;
  const guideBio = document.getElementById("guideBio").value;
  const guideExperience = document.getElementById("guideExperience").value;

  if (!guideName || !guidePhone || !guidePrice || !guideExperience) {
    alert("Mohon isi semua field yang diperlukan (Nama, HP, Tarif, Pengalaman)!");
    return;
  }

  try {
    const response = await fetch("./api/guides.php?action=create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: guideName,
        contact: guidePhone,
        price: parseFloat(guidePrice) || 0,
        bio: guideBio,
        years_experience: parseInt(guideExperience) || 0,
        profile_picture: null,
      }),
    });

    const result = await response.json();

    if (result.success) {
      alert("✓ Tour Guide berhasil ditambahkan!");
      guideForm.reset();
      guideModal.classList.remove("active");

      // Dispatch event untuk sync data
      window.dispatchEvent(
        new CustomEvent("guideSaved", {
          detail: { id: result.id, name: guideName },
        })
      );
    } else {
      alert(
        "✗ Gagal menambahkan Tour Guide: " + (result.error || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error:", error);
    alert("✗ Terjadi kesalahan: " + error.message);
  }
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

// Google Maps Link Validator
document.addEventListener("DOMContentLoaded", function () {
  const destMapsLink = document.getElementById("destMapsLink");
  if (destMapsLink) {
    destMapsLink.addEventListener("blur", function () {
      const url = this.value.trim();
      if (url && !url.startsWith("https://")) {
        this.setCustomValidity("URL harus dimulai dengan https://");
      } else if (url && !isValidGoogleMapsLink(url)) {
        this.setCustomValidity(
          "URL harus dari Google Maps (maps.google.com, google.com/maps, maps.app.goo.gl, dll)"
        );
      } else {
        this.setCustomValidity("");
      }
    });

    // Visual feedback for valid/invalid maps link
    destMapsLink.addEventListener("input", function () {
      const url = this.value.trim();
      if (url && isValidGoogleMapsLink(url)) {
        this.style.borderColor = "#4CAF50";
        this.style.backgroundColor = "#f0fff4";
      } else if (url) {
        this.style.borderColor = "#ff9800";
        this.style.backgroundColor = "#fff8f0";
      } else {
        this.style.borderColor = "";
        this.style.backgroundColor = "";
      }
    });
  }
});

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

// Helper: Validate Google Maps URL - Support multiple formats
function isValidGoogleMapsLink(url) {
  if (!url) return true; // Optional field
  // Support berbagai format Google Maps URL:
  // 1. maps.google.com/maps/...
  // 2. google.com/maps/...
  // 3. maps/embed?pb=...
  // 4. maps.app.goo.gl/... (sharing link)
  // 5. goo.gl/maps/... (old format)
  return (
    url.includes("maps.google.com") ||
    url.includes("google.com/maps") ||
    url.includes("maps/embed") ||
    url.includes("maps.app.goo.gl") ||
    url.includes("goo.gl/maps") ||
    url.includes("maps.app.goo.gl")
  );
}

// Helper: Convert any Google Maps link to embeddable format
function convertMapsLinkToEmbed(url) {
  if (!url) return null;

  // If already embed URL, return as-is
  if (url.includes("/embed?")) return url;

  // If sharing link (maps.app.goo.gl or goo.gl), keep as-is
  // Browser will redirect to proper maps view
  if (url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps")) {
    return url; // Will be opened in maps app/website
  }

  // Otherwise return as-is
  return url;
}

console.log("Admin Dashboard initialized successfully!");
console.log("✓ Google Maps integration loaded");
