// Admin CMS Management System
// Comprehensive JavaScript for all data management operations

class AdminCMS {
  constructor() {
    this.baseUrl = "./api/";
    this.currentModule = "dashboard";
    this.init();
  }

  // Helper function to construct image URL
  getImageUrl(filename, type = "destination") {
    if (!filename) return "";
    if (filename.startsWith("http") || filename.startsWith("data:")) {
      return filename; // Already a full URL or data URI
    }
    if (filename.startsWith("./public/") || filename.startsWith("/")) {
      return filename; // Already has path
    }
    // Return path relative to document root with proper subfolder
    const subfolder = type === "guide" ? "guides" : "destinations";
    return `/TourifyV1/public/assets/uploads/${subfolder}/${filename}`;
  }
  init() {
    this.attachEventListeners();
    this.loadDashboard();
  }

  attachEventListeners() {
    // Module navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const module = link.dataset.module;
        this.switchModule(module);
      });
    });

    // Menu toggle
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".admin-sidebar");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
      });
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.remove("active");
      });
    }

    // Logout
    const logoutBtn = document.getElementById("adminLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("Apakah Anda yakin ingin keluar?")) {
          window.location.href = "./logout.php";
        }
      });
    }
  }

  switchModule(module) {
    this.currentModule = module;

    // Update nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    document.querySelector(`[data-module="${module}"]`).classList.add("active");

    // Update page title
    const titles = {
      dashboard: "Dashboard",
      bookings: "Kelola Pemesanan Tiket",
      destinations: "Kelola Destinasi Wisata",
      users: "Kelola User",
      guides: "Kelola Tour Guide",
      reviews: "Kelola Rating & Ulasan",
    };
    document.getElementById("pageTitle").textContent = titles[module];

    // Hide all modules
    document.querySelectorAll(".module-section").forEach((section) => {
      section.classList.remove("active");
    });

    // Show selected module
    document.getElementById(`${module}-module`).classList.add("active");

    // Load module data
    this.loadModuleData(module);
  }

  loadModuleData(module) {
    switch (module) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "bookings":
        this.loadBookings();
        break;
      case "destinations":
        this.loadDestinations();
        break;
      case "users":
        this.loadUsers();
        break;
      case "guides":
        this.loadGuides();
        break;
      case "reviews":
        this.loadReviews();
        break;
    }
  }

  // ============ DASHBOARD ============
  loadDashboard() {
    this.fetchAPI("dashboard.php?action=stats").then((data) => {
      if (!data || !data.success || !data.data) return;
      document.getElementById("totalUsers").textContent = this.formatNumber(
        data.data.total_users
      );
      document.getElementById("todayBookings").textContent =
        data.data.today_bookings;
      document.getElementById("activeDestinations").textContent =
        data.data.active_destinations;
      document.getElementById("availableGuides").textContent =
        data.data.available_guides;
    });

    this.fetchAPI("dashboard.php?action=booking_chart&days=7").then((data) => {
      if (data && data.success && data.data) this.drawBookingChart(data.data);
    });

    this.fetchAPI("dashboard.php?action=payment_status").then((data) => {
      if (data && data.success && data.data)
        this.updatePaymentStatus(data.data);
    });
  }

  drawBookingChart(data) {
    const canvas = document.getElementById("bookingChart");
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    const labels = data.map((d) => d.date);
    const counts = data.map((d) => d.count);

    // Simple bar chart using canvas
    const maxCount = Math.max(...counts, 1);
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = (width / data.length) * 0.8;
    const barSpacing = width / data.length;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#667eea";

    counts.forEach((count, index) => {
      const x = index * barSpacing + barSpacing * 0.1;
      const barHeight = (count / maxCount) * (height - 40);
      const y = height - barHeight - 20;

      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(labels[index], x + barWidth / 2, height - 5);
      ctx.fillText(count, x + barWidth / 2, y - 5);
      ctx.fillStyle = "#667eea";
    });
  }

  updatePaymentStatus(statuses) {
    const container = document.querySelector(".status-distribution");
    if (!container || !statuses || statuses.length === 0) return;

    container.innerHTML = "";
    const statusMap = {
      pending: "Pending",
      paid: "Paid",
      cancelled: "Cancelled",
    };

    statuses.forEach((status) => {
      const item = document.createElement("div");
      item.className = "status-item";
      item.innerHTML = `
                <span class="status-badge ${status.status}">${
        statusMap[status.status]
      }</span>
                <span class="status-count">${status.count}</span>
            `;
      container.appendChild(item);
    });
  }

  // ============ BOOKINGS ============
  loadBookings() {
    const searchInput = document.getElementById("searchBookings");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) {
      searchInput.addEventListener("input", () =>
        this.fetchAndRenderBookings()
      );
    }
    if (statusFilter) {
      statusFilter.addEventListener("change", () =>
        this.fetchAndRenderBookings()
      );
    }

    this.fetchAndRenderBookings();
  }

  fetchAndRenderBookings() {
    const search = document.getElementById("searchBookings")?.value || "";
    const status = document.getElementById("statusFilter")?.value || "";

    let url = `bookings.php?action=list`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;

    this.fetchAPI(url).then((data) => {
      const tbody = document.getElementById("bookingsTableBody");
      tbody.innerHTML = "";

      if (!data || !data.success || !data.data || data.data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="8" class="text-center">Tidak ada data</td></tr>';
        return;
      }

      data.data.forEach((booking) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                        <td>#${booking.booking_id}</td>
                        <td>${booking.user_name || "-"}</td>
                        <td>${booking.destination_name || "-"}</td>
                        <td>${new Date(booking.booking_date).toLocaleDateString(
                          "id-ID"
                        )}</td>
                        <td>${booking.ticket_quantity}</td>
                        <td>Rp ${this.formatNumber(booking.total_price)}</td>
                        <td><span class="badge badge-${
                          booking.status
                        }">${this.capitalizeFirst(booking.status)}</span></td>
                        <td>
                            <button class="btn-action view" onclick="adminCMS.viewBooking(${
                              booking.booking_id
                            })" title="Lihat Detail">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${
                              booking.status === "pending"
                                ? `
                                <button class="btn-action confirm" onclick="adminCMS.updateBookingStatus(${booking.booking_id}, 'paid')" title="Konfirmasi">
                                    <i class="fas fa-check"></i>
                                </button>
                            `
                                : ""
                            }
                            <button class="btn-action delete" onclick="adminCMS.deleteBooking(${
                              booking.booking_id
                            })" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
        tbody.appendChild(row);
      });
    });
  }

  viewBooking(id) {
    this.fetchAPI(`bookings.php?action=detail&id=${id}`).then((data) => {
      if (!data || !data.success || !data.data) {
        alert("Gagal memuat detail pemesanan");
        return;
      }
      const booking = data.data;
      alert(`
                    Booking ID: #${booking.booking_id}
                    User: ${booking.user_name}
                    Email: ${booking.email}
                    Phone: ${booking.phone}
                    Destinasi: ${booking.destination_name}
                    Harga: Rp ${this.formatNumber(booking.price)}
                    Jumlah Tiket: ${booking.ticket_quantity}
                    Total: Rp ${this.formatNumber(booking.total_price)}
                    Status: ${this.capitalizeFirst(booking.status)}
                    Tanggal Booking: ${new Date(
                      booking.booking_date
                    ).toLocaleDateString("id-ID")}
                    Tour Guide: ${booking.guide_name || "Belum ditentukan"}
                    Status Pembayaran: ${
                      booking.payment_status || "Belum dibayar"
                    }
                `);
    });
  }

  updateBookingStatus(id, status) {
    this.postAPI("bookings.php?action=update", {
      booking_id: id,
      status: status,
    }).then((data) => {
      alert("Status pemesanan berhasil diperbarui");
      this.fetchAndRenderBookings();
    });
  }

  deleteBooking(id) {
    if (confirm("Apakah Anda yakin ingin menghapus pemesanan ini?")) {
      this.deleteAPI(`bookings.php?action=delete&id=${id}`).then((data) => {
        alert("Pemesanan berhasil dihapus");
        this.fetchAndRenderBookings();
      });
    }
  }

  // ============ DESTINATIONS ============
  loadDestinations() {
    const addBtn = document.getElementById("addDestinationBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openDestinationModal());
    }

    this.fetchAndRenderDestinations();
  }

  fetchAndRenderDestinations() {
    this.fetchAPI("destinations.php?action=list")
      .then((data) => {
        console.log(
          "fetchAndRenderDestinations - API Response received:",
          data
        );
        const grid = document.getElementById("destinationGrid");
        if (!grid) {
          console.error("destinationGrid element not found");
          return;
        }
        grid.innerHTML = "";

        console.log("Destination API Response:", data); // Debug log

        if (!data || !data.success) {
          let message = "Tidak ada destinasi";
          if (data && data.error) {
            message = `Error: ${data.error}`;
          } else if (!data) {
            message = "Tidak ada response dari server";
          }
          grid.innerHTML = `<p class="text-center" style="color: red; padding: 20px;">${message}</p>`;
          return;
        }

        if (!data.data || data.data.length === 0) {
          grid.innerHTML = `<p class="text-center">Tidak ada destinasi</p>`;
          return;
        }

        data.data.forEach((destination) => {
          try {
            if (!destination) return; // Skip null destinations

            const card = document.createElement("div");
            card.className = "destination-card";
            const description =
              destination.description && destination.description.length > 0
                ? destination.description.substring(0, 80)
                : "Tidak ada deskripsi";
            const imageUrl =
              this.getImageUrl(destination.image, "destination") ||
              "https://via.placeholder.com/300x200";
            const categoryName = destination.category_name
              ? destination.category_name
              : "-";
            const avgRating = destination.avg_rating
              ? parseFloat(destination.avg_rating).toFixed(1)
              : "-";
            const reviewCount = destination.review_count
              ? destination.review_count
              : 0;
            const destinationName = destination.name
              ? destination.name
              : "Tanpa Nama";
            const price = destination.price ? destination.price : 0;
            const destId = destination.destination_id || 0;

            card.innerHTML = `
                          <div class="destination-image">
                              <img src="${imageUrl}" alt="${destinationName}">
                              <span class="badge badge-active">Aktif</span>
                          </div>
                          <div class="destination-info">
                              <h3>${destinationName}</h3>
                              <p class="destination-category">${categoryName}</p>
                              <p class="destination-desc">${description}...</p>
                              <div class="destination-price">Rp ${this.formatNumber(
                                price
                              )} / tiket</div>
                              <div class="destination-rating">Rating: ${avgRating} (${reviewCount} ulasan)</div>
                              <div class="destination-actions">
                                  <button class="btn-action edit" onclick="adminCMS.editDestination(${destId})" title="Edit">
                                      <i class="fas fa-edit"></i>
                                  </button>
                                  <button class="btn-action delete" onclick="adminCMS.deleteDestination(${destId})" title="Hapus">
                                      <i class="fas fa-trash"></i>
                                  </button>
                              </div>
                          </div>
                      `;
            grid.appendChild(card);
          } catch (err) {
            console.error("Error rendering destination:", err, destination);
          }
        });
        console.log("Finished rendering destinations");
      })
      .catch((err) => {
        console.error("fetchAndRenderDestinations error:", err);
        const grid = document.getElementById("destinationGrid");
        if (grid) {
          grid.innerHTML = `<p class="text-center" style="color: red; padding: 20px;">Error loading destinations: ${err.message}</p>`;
        }
      });
  }

  openDestinationModal(destinationId = null) {
    const modal = document.getElementById("destinationModal");
    const form = document.getElementById("destinationForm");
    const title = document.getElementById("modalTitle");

    if (destinationId) {
      title.textContent = "Edit Destinasi";
      this.fetchAPI(`destinations.php?action=detail&id=${destinationId}`).then(
        (data) => {
          if (!data || !data.success || !data.data) return;
          document.getElementById("destName").value = data.data.name || "";
          document.getElementById("destCategory").value =
            data.data.category_id || "";
          document.getElementById("destPrice").value = data.data.price || 0;
          document.getElementById("destDesc").value =
            data.data.description || "";
          document.getElementById("destStatus").value =
            data.data.status || "active";
          form.dataset.id = destinationId;

          // Show current image preview if exists
          if (data.data.image) {
            const preview = document.getElementById("destImagePreview");
            if (preview) {
              preview.innerHTML = `<img src="${this.getImageUrl(
                data.data.image,
                "destination"
              )}" alt="${
                data.data.name
              }" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">`;
              preview.style.display = "block";
            }
          }
        }
      );
    } else {
      title.textContent = "Tambah Destinasi";
      form.reset();
      delete form.dataset.id;
      // Hide image preview for new destination
      const preview = document.getElementById("destImagePreview");
      if (preview) preview.style.display = "none";
    }

    modal.style.display = "block";

    // Load categories
    this.fetchAPI("destinations.php?action=categories").then((data) => {
      const select = document.getElementById("destCategory");
      select.innerHTML = '<option value="">Pilih Kategori</option>';
      if (data && data.success && data.data && Array.isArray(data.data)) {
        data.data.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.category_id;
          option.textContent = cat.name;
          select.appendChild(option);
        });
      }
    });
  }

  editDestination(id) {
    this.openDestinationModal(id);
  }

  deleteDestination(id) {
    if (confirm("Apakah Anda yakin ingin menghapus destinasi ini?")) {
      this.deleteAPI(`destinations.php?action=delete&id=${id}`).then((data) => {
        alert("Destinasi berhasil dihapus");
        this.fetchAndRenderDestinations();
      });
    }
  }

  // ============ USERS ============
  loadUsers() {
    const searchInput = document.getElementById("searchUsers");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.fetchAndRenderUsers());
    }

    this.fetchAndRenderUsers();
  }

  fetchAndRenderUsers() {
    const search = document.getElementById("searchUsers")?.value || "";
    let url = `users.php?action=list`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    this.fetchAPI(url).then((data) => {
      const tbody = document.getElementById("usersTableBody");
      tbody.innerHTML = "";

      if (!data || !data.success || !data.data || data.data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center">Tidak ada data user</td></tr>';
        return;
      }

      data.data.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || "-"}</td>
                        <td>${new Date(user.created_at).toLocaleDateString(
                          "id-ID"
                        )}</td>
                        <td>${user.total_bookings || 0}</td>
                        <td><span class="badge badge-active">Aktif</span></td>
                        <td>
                            <button class="btn-action view" onclick="adminCMS.viewUser(${
                              user.user_id
                            })" title="Lihat Detail">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action delete" onclick="adminCMS.deleteUser(${
                              user.user_id
                            })" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
        tbody.appendChild(row);
      });
    });
  }

  viewUser(id) {
    this.fetchAPI(`users.php?action=detail&id=${id}`).then((data) => {
      if (!data || !data.success || !data.data) {
        alert("Gagal memuat detail user");
        return;
      }
      const user = data.data;
      alert(`
                    User: ${user.name}
                    Email: ${user.email}
                    Phone: ${user.phone}
                    Terdaftar: ${new Date(user.created_at).toLocaleDateString(
                      "id-ID"
                    )}
                    Total Booking: ${user.total_bookings || 0}
                    Total Pengeluaran: Rp ${this.formatNumber(
                      user.total_spent || 0
                    )}
                    Total Review: ${user.total_reviews || 0}
                `);
    });
  }

  deleteUser(id) {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus user ini? Semua data user akan dihapus."
      )
    ) {
      this.deleteAPI(`users.php?action=delete&id=${id}`).then((data) => {
        alert("User berhasil dihapus");
        this.fetchAndRenderUsers();
      });
    }
  }

  // ============ GUIDES ============
  loadGuides() {
    const addBtn = document.getElementById("addGuideBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openGuideModal());
    }

    this.fetchAndRenderGuides();
  }

  fetchAndRenderGuides() {
    this.fetchAPI("guides.php?action=list").then((data) => {
      const grid = document.getElementById("guidesGrid");
      grid.innerHTML = "";

      if (!data || !data.success || !data.data || data.data.length === 0) {
        grid.innerHTML = '<p class="text-center">Tidak ada tour guide</p>';
        return;
      }

      data.data.forEach((guide) => {
        const card = document.createElement("div");
        card.className = "guide-card";
        card.innerHTML = `
                        <div class="guide-header">
                            <img src="${
                              this.getImageUrl(
                                guide.profile_picture,
                                "guide"
                              ) || "https://via.placeholder.com/100"
                            }" alt="${guide.name}" class="guide-avatar">
                            <div class="guide-basic">
                                <h3>${guide.name}</h3>
                                <p class="guide-location">Banjarnegara</p>
                            </div>
                        </div>
                        <div class="guide-details">
                            <p><strong>Contact:</strong> ${guide.contact}</p>
                            <p><strong>Bio:</strong> ${guide.bio || "-"}</p>
                        </div>
                        <div class="guide-actions">
                            <button class="btn-action edit" onclick="adminCMS.editGuide(${
                              guide.guide_id
                            })" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" onclick="adminCMS.deleteGuide(${
                              guide.guide_id
                            })" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
        grid.appendChild(card);
      });
    });
  }

  openGuideModal(guideId = null) {
    const modal = document.getElementById("guideModal");
    const form = document.getElementById("guideForm");

    if (guideId) {
      this.fetchAPI(`guides.php?action=detail&id=${guideId}`).then((data) => {
        if (!data || !data.success || !data.data) return;
        document.getElementById("guideName").value = data.data.name || "";
        document.getElementById("guidePhone").value = data.data.contact || "";
        document.getElementById("guidePrice").value = data.data.price || 0;
        document.getElementById("guideBio").value = data.data.bio || "";
        form.dataset.id = guideId;

        // Show current image preview if exists
        if (data.data.profile_picture) {
          const preview = document.getElementById("guideImagePreview");
          if (preview) {
            preview.innerHTML = `<img src="${this.getImageUrl(
              data.data.profile_picture,
              "guide"
            )}" alt="${
              data.data.name
            }" style="max-width: 150px; max-height: 150px; border-radius: 50%; border: 2px solid #ddd;">`;
            preview.style.display = "block";
          }
        }
      });
    } else {
      form.reset();
      delete form.dataset.id;
      // Hide image preview for new guide
      const preview = document.getElementById("guideImagePreview");
      if (preview) preview.style.display = "none";
    }

    modal.style.display = "block";
  }

  editGuide(id) {
    this.openGuideModal(id);
  }

  deleteGuide(id) {
    if (confirm("Apakah Anda yakin ingin menghapus tour guide ini?")) {
      this.deleteAPI(`guides.php?action=delete&id=${id}`).then((data) => {
        alert("Tour guide berhasil dihapus");
        this.fetchAndRenderGuides();
      });
    }
  }

  // ============ REVIEWS ============
  loadReviews() {
    const searchInput = document.getElementById("searchReviews");
    const ratingFilter = document.getElementById("ratingFilter");

    if (searchInput) {
      searchInput.addEventListener("input", () => this.fetchAndRenderReviews());
    }
    if (ratingFilter) {
      ratingFilter.addEventListener("change", () =>
        this.fetchAndRenderReviews()
      );
    }

    this.fetchAndRenderReviews();
  }

  fetchAndRenderReviews() {
    const search = document.getElementById("searchReviews")?.value || "";
    const rating = document.getElementById("ratingFilter")?.value || "";

    let url = `reviews.php?action=list`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (rating) url += `&rating=${rating}`;

    this.fetchAPI(url).then((data) => {
      const container = document.getElementById("reviewsContainer");
      container.innerHTML = "";

      if (!data || !data.success || !data.data || data.data.length === 0) {
        container.innerHTML = '<p class="text-center">Tidak ada ulasan</p>';
        return;
      }

      data.data.forEach((review) => {
        const stars = "⭐".repeat(review.rating);
        const item = document.createElement("div");
        item.className = "review-item";
        item.innerHTML = `
                        <div class="review-header">
                            <div class="reviewer-info">
                                <h4>${review.user_name || "Anonymous"}</h4>
                                <small>${review.destination_name} • ${new Date(
          review.created_at
        ).toLocaleDateString("id-ID")}</small>
                            </div>
                            <div class="review-rating">
                                <span class="stars">${stars}</span>
                            </div>
                        </div>
                        <p class="review-content">${review.review_text}</p>
                        <div class="review-actions">
                            <button class="btn-action delete" onclick="adminCMS.deleteReview(${
                              review.review_id
                            })" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
        container.appendChild(item);
      });
    });
  }

  deleteReview(id) {
    if (confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
      this.deleteAPI(`reviews.php?action=delete&id=${id}`).then((data) => {
        alert("Ulasan berhasil dihapus");
        this.fetchAndRenderReviews();
      });
    }
  }

  // ============ UTILITY FUNCTIONS ============
  fetchAPI(endpoint) {
    return fetch(this.baseUrl + endpoint, {
      credentials: "include", // Send cookies with request
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // If API returns error or not success, still return structured response
        if (!data) {
          return {
            success: false,
            error: "No response from server",
            data: null,
          };
        }
        return data;
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Silently fail without alert on initial load
        return { success: false, error: error.message, data: null };
      });
  }

  postAPI(endpoint, data) {
    return fetch(this.baseUrl + endpoint, {
      method: "POST",
      credentials: "include", // Send cookies with request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Post error:", error);
        console.error("Terjadi kesalahan");
        return { success: false, error: error.message };
      });
  }

  deleteAPI(endpoint) {
    return fetch(this.baseUrl + endpoint, {
      method: "DELETE",
      credentials: "include", // Send cookies with request
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Delete error:", error);
        console.error("Terjadi kesalahan saat menghapus");
        return { success: false, error: error.message };
      });
  }

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize when DOM is ready
let adminCMS;
document.addEventListener("DOMContentLoaded", () => {
  adminCMS = new AdminCMS();
});
