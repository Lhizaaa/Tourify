/**
 * Destinations Manager
 * Mengelola CRUD operations untuk destinasi wisata
 */

class DestinationsManager {
  constructor() {
    // Get the base path dynamically
    const basePath = window.location.pathname.split("/admin/")[0] + "/admin";
    this.apiUrl = basePath + "/api/destinations.php";
    this.destinations = [];
    this.currentPage = 1;
    this.searchQuery = "";
    this.categories = [];
    this.editingId = null;
    this.initialized = false;

    console.log("DestinationsManager created with API URL:", this.apiUrl);

    // Delay initialization to allow DOM to be fully loaded and module visible
    this.waitForInit();
  }

  waitForInit() {
    // Check if DOM elements exist
    if (document.getElementById("destinationGrid")) {
      console.log("✓ DestinationsManager: DOM elements found, initializing...");
      this.initElements();
      this.attachEventListeners();
      this.loadCategories();
      this.loadDestinations();
      this.initialized = true;
      console.log("✓ DestinationsManager fully initialized");
    } else {
      // Retry after a short delay (max 10 retries = 1 second)
      if (!this.retryCount) this.retryCount = 0;
      if (this.retryCount < 10) {
        this.retryCount++;
        console.log(
          `DestinationsManager: Waiting for DOM elements... (retry ${this.retryCount})`
        );
        setTimeout(() => this.waitForInit(), 100);
      } else {
        console.error(
          "DestinationsManager: Failed to find DOM elements after 10 retries"
        );
        console.error(
          "destinationGrid element not found. Check if destinations-module is in HTML"
        );
      }
    }
  }

  initElements() {
    // Grid and List elements
    this.destinationGrid = document.getElementById("destinationGrid");
    this.addDestinationBtn = document.getElementById("addDestinationBtn");

    // Modal elements
    this.destinationModal = document.getElementById("destinationModal");
    this.destinationForm = document.getElementById("destinationForm");
    this.modalTitle = document.querySelector(".modal-header h2");
    this.closeModalBtn = document.querySelector(".modal-close");

    // Form fields
    this.formFields = {
      name: document.getElementById("destName"),
      description: document.getElementById("destDescription"),
      location: document.getElementById("destLocation"),
      price: document.getElementById("destPrice"),
      category: document.getElementById("destCategory"),
      image: document.getElementById("destImage"),
      imagePreview: document.getElementById("imagePreview"),
      mapsLink: document.getElementById("destMapsLink"),
    };

    // Search and filter
    this.searchInput =
      document.querySelector(".destination-search") ||
      document.createElement("input");
    if (!document.querySelector(".destination-search")) {
      this.createSearchBar();
    }
  }

  createSearchBar() {
    const header = document.querySelector(".module-header");
    if (header) {
      const searchDiv = document.createElement("div");
      searchDiv.className = "destination-search-bar";
      searchDiv.innerHTML = `
        <input type="text" class="destination-search" placeholder="Cari destinasi..." />
        <button class="btn-icon" id="refreshDestinations" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>
      `;
      header.appendChild(searchDiv);
      this.searchInput = searchDiv.querySelector(".destination-search");
    }
  }

  attachEventListeners() {
    // Add button
    if (this.addDestinationBtn) {
      this.addDestinationBtn.addEventListener("click", () => this.openModal());
    }

    // Modal close
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => this.closeModal());
    }

    // Form submit
    if (this.destinationForm) {
      this.destinationForm.addEventListener("submit", (e) =>
        this.handleFormSubmit(e)
      );
    }

    // Image preview
    if (this.formFields.image) {
      this.formFields.image.addEventListener("change", (e) =>
        this.previewImage(e)
      );
    }

    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }

    // Refresh button
    const refreshBtn = document.getElementById("refreshDestinations");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.loadDestinations());
    }

    // Listen for when destinations module becomes active
    const destLink = document.querySelector('[data-module="destinations"]');
    if (destLink) {
      destLink.addEventListener("click", () => {
        console.log("Destinations module activated, reloading data...");
        setTimeout(() => {
          this.currentPage = 1;
          this.searchQuery = "";
          this.loadDestinations();
        }, 100);
      });
    }

    // Close modal when clicking outside
    if (this.destinationModal) {
      this.destinationModal.addEventListener("click", (e) => {
        if (e.target === this.destinationModal) {
          this.closeModal();
        }
      });
    }
  }

  /**
   * Load categories from API
   */
  loadCategories() {
    const url = `${this.apiUrl}?action=categories&t=${Date.now()}`;
    console.log("Loading categories from:", url);

    fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error(`HTTP ${res.status}: Failed to load categories`);
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          this.categories = data.data;
          this.populateCategorySelect();
          console.log("✓ Categories loaded:", this.categories.length);
        } else {
          console.warn("No categories data received", data);
          this.showNotification(
            "Kategori kosong, silakan tambah kategori terlebih dahulu",
            "warning"
          );
        }
      })
      .catch((err) => {
        console.error("Error loading categories:", err);
        this.showNotification("Gagal memuat kategori: " + err.message, "error");

        // Retry after 2 seconds
        setTimeout(() => {
          console.log("Retrying to load categories...");
          this.loadCategories();
        }, 2000);
      });
  }

  /**
   * Populate category dropdown
   */
  populateCategorySelect() {
    if (!this.formFields.category) return;

    this.formFields.category.innerHTML =
      '<option value="">Pilih Kategori</option>';
    this.categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.category_id;
      option.textContent = cat.name;
      this.formFields.category.appendChild(option);
    });
  }

  /**
   * Load all destinations
   */
  loadDestinations(page = 1) {
    let url = `${this.apiUrl}?action=list&page=${page}`;
    if (this.searchQuery) {
      url += `&search=${encodeURIComponent(this.searchQuery)}`;
    }

    // Add cache busting parameter
    url += `&t=${Date.now()}`;

    console.log("Loading destinations from:", url);
    this.showLoading();

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          this.destinations = data.data || [];
          this.renderDestinations();
          this.currentPage = page;
          console.log("✓ Destinations loaded:", this.destinations.length);
        } else {
          throw new Error(data.error || "Gagal memuat destinasi");
        }
      })
      .catch((err) => {
        console.error("Error loading destinations:", err);
        this.showError("Terjadi kesalahan saat memuat data: " + err.message);

        // Show retry UI
        if (this.destinationGrid) {
          this.destinationGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 40px; text-align: center;">
              <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #f44336; margin-bottom: 20px; display: block;"></i>
              <p style="color: #666;">Gagal memuat destinasi</p>
              <p style="color: #999; font-size: 14px;">${err.message}</p>
              <button class="btn-primary" onclick="destinationsManager.loadDestinations()" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> Coba Lagi
              </button>
            </div>
          `;
        }

        // Auto retry after 3 seconds
        if (!this.destLoadRetries) this.destLoadRetries = 0;
        if (this.destLoadRetries < 3) {
          this.destLoadRetries++;
          console.log(
            `Auto-retrying to load destinations (attempt ${this.destLoadRetries}/3)...`
          );
          setTimeout(() => {
            this.loadDestinations(page);
          }, 3000);
        }
      });
  }

  /**
   * Render destination cards
   */
  renderDestinations() {
    if (!this.destinationGrid) return;

    if (this.destinations.length === 0) {
      this.destinationGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 40px; text-align: center;">
          <i class="fas fa-inbox" style="font-size: 48px; color: #999; margin-bottom: 20px; display: block;"></i>
          <p style="color: #666;">Tidak ada destinasi ditemukan</p>
          <button class="btn-primary" onclick="destinationsManager.openModal()" style="margin-top: 15px;">
            <i class="fas fa-plus"></i> Tambah Destinasi
          </button>
        </div>
      `;
      return;
    }

    this.destinationGrid.innerHTML = this.destinations
      .map(
        (dest) => `
      <div class="destination-card" data-id="${dest.destination_id}">
        <div class="destination-image">
          <img src="${
            dest.image && dest.image.length > 0
              ? "/TourifyV1/public/assets/uploads/destinations/" + dest.image
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23cccccc' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%23666' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
          }" 
               alt="${dest.name || "Destinasi"}"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23cccccc%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2216%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage Failed%3C/text%3E%3C/svg%3E'">
          <span class="badge badge-active">Aktif</span>
        </div>
        <div class="destination-info">
          <h3>${this.escapeHtml(dest.name || "Tanpa Nama")}</h3>
          <p class="destination-category">${dest.category_name || "Umum"}</p>
          <p class="destination-location">
            <i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(
              dest.location || "Lokasi tidak tersedia"
            )}
          </p>
          <p class="destination-desc">${this.escapeHtml(
            dest.description && dest.description.length > 0
              ? dest.description.substring(0, 100) +
                  (dest.description.length > 100 ? "..." : "")
              : "Tidak ada deskripsi"
          )}</p>
          <div class="destination-meta">
            <div class="destination-price">Rp ${this.formatPrice(
              dest.price || 0
            )}</div>
            <div class="destination-rating" title="Rating">
              <i class="fas fa-star"></i> ${parseFloat(
                dest.avg_rating || 0
              ).toFixed(1)} 
              <small>(${parseInt(dest.review_count) || 0})</small>
            </div>
          </div>
          <div class="destination-actions">
            <button class="btn-action edit" onclick="destinationsManager.editDestination(${
              dest.destination_id
            })" 
                    title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action delete" onclick="destinationsManager.deleteDestination(${
              dest.destination_id
            })" 
                    title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  /**
   * Open modal for creating new destination
   */
  openModal(destinationId = null) {
    this.editingId = destinationId;

    if (destinationId) {
      this.loadDestinationDetail(destinationId);
    } else {
      this.resetForm();
      this.modalTitle.textContent = "Tambah Destinasi Baru";
    }

    if (this.destinationModal) {
      this.destinationModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  /**
   * Load destination detail for editing
   */
  loadDestinationDetail(id) {
    const url = `${this.apiUrl}?action=detail&id=${id}&t=${Date.now()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const dest = data.data;
          this.populateForm(dest);
          if (this.modalTitle) {
            this.modalTitle.textContent = "Edit Destinasi";
          }
        } else {
          this.showError(data.error || "Gagal memuat detail destinasi");
        }
      })
      .catch((err) => {
        console.error("Error loading destination:", err);
        this.showError("Gagal memuat detail destinasi: " + err.message);
      });
  }

  /**
   * Populate form with destination data
   */
  populateForm(dest) {
    // Reset file input first (IMPORTANT - prevent mixing files from different destinations)
    if (this.formFields.image) {
      this.formFields.image.value = ""; // Clear file input
    }

    this.formFields.name.value = dest.name;
    this.formFields.description.value = dest.description;
    this.formFields.location.value = dest.location;
    this.formFields.price.value = dest.price;
    this.formFields.category.value = dest.category_id;
    if (this.formFields.mapsLink) {
      this.formFields.mapsLink.value = dest.maps_link || "";
    }

    // Load facilities
    const facilitiesCheckboxes = document.querySelectorAll(
      'input[name="facilities"]'
    );
    facilitiesCheckboxes.forEach((checkbox) => {
      checkbox.checked = false; // Uncheck all first
    });

    if (dest.facilities) {
      // Parse facilities if it's a JSON string
      const facilitiesList =
        typeof dest.facilities === "string"
          ? JSON.parse(dest.facilities)
          : dest.facilities;

      facilitiesCheckboxes.forEach((checkbox) => {
        if (facilitiesList.includes(checkbox.value)) {
          checkbox.checked = true;
        }
      });
    }

    // IMPORTANT: When editing, do NOT show old image preview
    // This prevents accidentally keeping the same photo when multiple destinations share it
    // User must upload a new photo when editing
    if (this.formFields.imagePreview) {
      this.formFields.imagePreview.style.display = "none";
      this.formFields.imagePreview.src = "";
    }
  }

  /**
   * Reset form
   */
  resetForm() {
    if (this.destinationForm) {
      this.destinationForm.reset();
    }
    if (this.formFields.imagePreview) {
      this.formFields.imagePreview.style.display = "none";
      this.formFields.imagePreview.src = ""; // Clear image src completely
    }
    if (this.formFields.image) {
      this.formFields.image.value = ""; // Clear file input
    }
    this.editingId = null;
  }

  /**
   * Close modal
   */
  closeModal() {
    this.resetForm();
    if (this.destinationModal) {
      this.destinationModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showError("Silakan isi semua field yang diperlukan");
      return;
    }

    // Handle image upload first if new image selected
    if (
      this.formFields.image &&
      this.formFields.image.files &&
      this.formFields.image.files.length > 0
    ) {
      this.uploadImageAndSubmitForm();
      return;
    }

    // Otherwise submit form
    const action = this.editingId ? "update" : "create";

    // Get selected facilities
    const facilitiesCheckboxes = document.querySelectorAll(
      'input[name="facilities"]:checked'
    );
    const facilities = Array.from(facilitiesCheckboxes).map((cb) => cb.value);

    const payload = {
      name: this.formFields.name.value,
      description: this.formFields.description.value,
      location: this.formFields.location.value,
      price: this.formFields.price.value,
      category_id: this.formFields.category.value,
      maps_link: this.formFields.mapsLink?.value || null,
      facilities: facilities.length > 0 ? facilities : [],
    };

    // IMPORTANT: When editing and NOT changing image, don't include image field
    // This prevents updating image to same filename when other destinations share it
    if (action === "create") {
      // For create, include image only if we have one
      const imageFilename = this.extractImageFilename();
      if (imageFilename) {
        payload.image = imageFilename;
      }
    }
    // For update: Don't include image field - API will preserve existing image

    if (this.editingId) {
      payload.destination_id = this.editingId;
    }

    console.log("Submitting destination with payload:", payload);
    this.submitForm(action, payload);
  }

  /**
   * Extract filename from imagePreview src
   */
  extractImageFilename() {
    if (!this.formFields.imagePreview || !this.formFields.imagePreview.src) {
      return null;
    }

    const src = this.formFields.imagePreview.src;

    // If it's a data URI, skip it
    if (src.startsWith("data:")) {
      return null;
    }

    // Extract just the filename from the path
    return src.split("/").pop();
  }

  /**
   * Upload image and then submit form
   */
  async uploadImageAndSubmitForm() {
    const imageFile = this.formFields.image.files[0];
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("type", "destination");

    try {
      const uploadRes = await fetch("/TourifyV1/api/upload-image.php", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Upload response status:", uploadRes.status);
        console.error("Upload response:", errorText);

        try {
          const uploadData = JSON.parse(errorText);
          throw new Error(uploadData.error || "Upload failed");
        } catch (e) {
          throw new Error(
            `Upload failed (${uploadRes.status}): ${errorText.substring(
              0,
              100
            )}`
          );
        }
      }

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Get selected facilities
      const facilitiesCheckboxes = document.querySelectorAll(
        'input[name="facilities"]:checked'
      );
      const facilities = Array.from(facilitiesCheckboxes).map((cb) => cb.value);

      // Now submit form with uploaded image filename
      const action = this.editingId ? "update" : "create";
      const payload = {
        name: this.formFields.name.value,
        description: this.formFields.description.value,
        location: this.formFields.location.value,
        price: this.formFields.price.value,
        category_id: this.formFields.category.value,
        image: uploadData.filename, // Use the filename from upload response
        maps_link: this.formFields.mapsLink?.value || null,
        facilities: facilities.length > 0 ? facilities : null,
      };

      if (this.editingId) {
        payload.destination_id = this.editingId;
      }

      this.submitForm(action, payload);
    } catch (err) {
      this.showError("Error uploading image: " + err.message);
    }
  }

  /**
   * Submit form to API
   */
  submitForm(action, payload) {
    const url = `${this.apiUrl}?action=${action}`;

    this.showLoading();

    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        if (data.success) {
          this.showSuccess(
            action === "create"
              ? "Destinasi berhasil ditambahkan"
              : "Destinasi berhasil diperbarui"
          );
          this.closeModal();
          this.loadDestinations(this.currentPage);

          // Emit event for syncing
          window.dispatchEvent(
            new CustomEvent("destinationSaved", {
              detail: payload,
            })
          );
        } else {
          this.showError(data.error || "Gagal menyimpan destinasi");
        }
      })
      .catch((err) => {
        console.error("Error submitting form:", err);
        this.showError("Terjadi kesalahan saat menyimpan data: " + err.message);
      });
  }

  /**
   * Edit destination
   */
  editDestination(id) {
    this.openModal(id);
  }

  /**
   * Delete destination
   */
  deleteDestination(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus destinasi ini?")) {
      return;
    }

    if (!id) {
      this.showError("ID destinasi tidak valid");
      return;
    }

    const url = `${this.apiUrl}?action=delete&id=${id}`;

    this.showLoading();

    fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          this.showSuccess("Destinasi berhasil dihapus");
          this.loadDestinations(this.currentPage);
        } else {
          this.showError(data.error || "Gagal menghapus destinasi");
        }

        // Clear destination cache on delete (success or not)
        localStorage.removeItem("destinationsData");
        localStorage.removeItem("destinationsDataTime");

        // Emit event to clear cache on user pages
        window.dispatchEvent(new CustomEvent("destinationDeleted"));
      })
      .catch((err) => {
        console.error("Error deleting destination:", err);
        this.showError("Terjadi kesalahan saat menghapus data: " + err.message);

        // Clear cache anyway
        localStorage.removeItem("destinationsData");
        localStorage.removeItem("destinationsDataTime");
        window.dispatchEvent(new CustomEvent("destinationDeleted"));
      });
  }

  /**
   * Handle search
   */
  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.currentPage = 1;
    this.loadDestinations(1);
  }

  /**
   * Preview image
   */
  previewImage(e) {
    const file = e.target.files[0];
    if (file && this.formFields.imagePreview) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.formFields.imagePreview.src = event.target.result;
        this.formFields.imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Validate form
   */
  validateForm() {
    return (
      this.formFields.name.value.trim() !== "" &&
      this.formFields.description.value.trim() !== "" &&
      this.formFields.location.value.trim() !== "" &&
      this.formFields.price.value !== "" &&
      this.formFields.category.value !== ""
    );
  }

  /**
   * Show loading state
   */
  showLoading() {
    // You can add loading animation here
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log("Success:", message);
    // Show toast notification
    this.showNotification(message, "success");
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error("Error:", message);
    // Show toast notification
    this.showNotification(message, "error");
  }

  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    // Create and show toast notification
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    let bgColor = "#2196F3"; // info
    if (type === "success") bgColor = "#4caf50";
    if (type === "error") bgColor = "#f44336";
    if (type === "warning") bgColor = "#ff9800";

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format price
   */
  formatPrice(price) {
    return new Intl.NumberFormat("id-ID").format(price);
  }
}

// Initialize when DOM is ready
let destinationsManager;

// Handle both DOMContentLoaded and if script loads after DOM is ready
function initDestinationsManager() {
  try {
    // Check if we're on the destinations module
    const destinationModule = document.getElementById("destinations-module");
    const destinationForm = document.getElementById("destinationForm");

    if (destinationModule && destinationForm && !destinationsManager) {
      console.log("Initializing DestinationsManager...");
      destinationsManager = new DestinationsManager();
      console.log("✓ Destinations Manager initialized successfully");
    } else {
      if (!destinationModule)
        console.warn("destinations-module element not found");
      if (!destinationForm) console.warn("destinationForm element not found");
    }
  } catch (error) {
    console.error("❌ Error initializing Destinations Manager:", error);
  }
}

// Try to initialize immediately if DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initDestinationsManager, 100);
  });
} else {
  // DOM is already loaded
  setTimeout(initDestinationsManager, 100);
}
