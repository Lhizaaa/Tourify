// Modal Management and Form Handlers for CMS

// ============ MODAL CONTROLS ============

// Destination Modal
const destinationModal = document.getElementById("destinationModal");
const closeDestinationModal = document.getElementById("closeDestinationModal");
const cancelDestination = document.getElementById("cancelDestination");

if (closeDestinationModal) {
  closeDestinationModal.addEventListener("click", () => {
    destinationModal.style.display = "none";
  });
}

if (cancelDestination) {
  cancelDestination.addEventListener("click", () => {
    destinationModal.style.display = "none";
  });
}

// Guide Modal
const guideModal = document.getElementById("guideModal");
const closeGuideModal = document.getElementById("closeGuideModal");
const cancelGuide = document.getElementById("cancelGuide");

if (closeGuideModal) {
  closeGuideModal.addEventListener("click", () => {
    guideModal.style.display = "none";
  });
}

if (cancelGuide) {
  cancelGuide.addEventListener("click", () => {
    guideModal.style.display = "none";
  });
}

// ============ IMAGE PREVIEW ============

// Image preview listener untuk destination image input
const destImageInput = document.getElementById("destImage");
if (destImageInput) {
  destImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = document.getElementById("destImagePreview");
        if (preview) {
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">
                              <p style="color: #666; margin-top: 5px; font-size: 12px;">File: ${file.name}</p>`;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// Image preview listener untuk guide image input
const guideImageInput = document.getElementById("guideImage");
if (guideImageInput) {
  guideImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = document.getElementById("guideImagePreview");
        if (preview) {
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">
                              <p style="color: #666; margin-top: 5px; font-size: 12px;">File: ${file.name}</p>`;
          preview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// ============ FORM HANDLERS ============

// Reply Modal
const replyModal = document.getElementById("replyModal");
const closeReplyModal = document.getElementById("closeReplyModal");
const cancelReply = document.getElementById("cancelReply");

if (closeReplyModal) {
  closeReplyModal.addEventListener("click", () => {
    replyModal.style.display = "none";
  });
}

if (cancelReply) {
  cancelReply.addEventListener("click", () => {
    replyModal.style.display = "none";
  });
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === destinationModal) destinationModal.style.display = "none";
  if (e.target === guideModal) guideModal.style.display = "none";
  if (e.target === replyModal) replyModal.style.display = "none";
});

// ============ FORM HANDLERS ============

async function handleDestinationSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("destinationForm");
  const id = form.dataset.id;

  const formData = {
    name: document.getElementById("destName").value,
    location: document.getElementById("destLocation").value,
    category_id: document.getElementById("destCategory").value,
    price: parseFloat(document.getElementById("destPrice").value),
    description: document.getElementById("destDesc").value,
    status: document.getElementById("destStatus").value,
  };

  // Handle image upload - upload file first, then store filename
  const imageInput = document.getElementById("destImage");
  if (imageInput && imageInput.files && imageInput.files[0]) {
    try {
      console.log("Uploading destination image:", imageInput.files[0].name);

      const uploadFormData = new FormData();
      uploadFormData.append("file", imageInput.files[0]);
      uploadFormData.append("type", "destination");

      console.log("Uploading destination image:", imageInput.files[0].name);

      const uploadResponse = await fetch("/TourifyV1/api/upload-image.php", {
        method: "POST",
        credentials: "include", // Send cookies with request
        body: uploadFormData,
      });

      const responseText = await uploadResponse.text();
      console.log("Upload response:", responseText);

      let uploadResult;
      try {
        uploadResult = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          "Invalid server response: " +
            (responseText ? responseText.substring(0, 150) : "Empty response")
        );
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "File upload failed");
      }

      // Store only filename in database
      formData.image = uploadResult.filename;

      // Show upload success preview
      const preview = document.getElementById("destImagePreview");
      if (preview) {
        preview.innerHTML = `<img src="${uploadResult.path}" alt="Preview" style="max-width: 150px; max-height: 150px; border: 2px solid green; border-radius: 4px;">
                            <p style="color: green; margin-top: 5px;">✓ Gambar berhasil di-upload</p>`;
        preview.style.display = "block";
      }
    } catch (uploadError) {
      alert("Error uploading image: " + uploadError.message);
      return;
    }
  }

  try {
    const action = id ? "update" : "create";
    if (id) formData.destination_id = id;

    const response = await fetch(
      "/Tourify V1/admin/api/destinations.php?action=" + action,
      {
        method: "POST",
        credentials: "include", // Send cookies with request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (result.success) {
      alert(result.message);
      destinationModal.style.display = "none";
      adminCMS.fetchAndRenderDestinations();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menyimpan destinasi");
  }
}

async function handleGuideSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("guideForm");
  const id = form.dataset.id;

  const guideName = document.getElementById("guideName").value;
  const guidePhone = document.getElementById("guidePhone").value;
  const guidePrice = document.getElementById("guidePrice").value;

  // Validasi: Tarif wajib diisi
  if (!guideName || !guidePhone || !guidePrice) {
    alert("Mohon isi semua field yang diperlukan (Nama, HP, Tarif)!");
    return;
  }

  const formData = {
    name: guideName,
    contact: guidePhone,
    price: parseFloat(guidePrice) || 0,
    bio: document.getElementById("guideBio").value,
  };

  // Handle image upload - upload file first, then store filename
  const imageInput = document.getElementById("guideImage");
  if (imageInput && imageInput.files && imageInput.files[0]) {
    try {
      // Upload file to server
      const uploadFormData = new FormData();
      uploadFormData.append("file", imageInput.files[0]);
      uploadFormData.append("type", "guide");

      console.log("Uploading guide image:", imageInput.files[0].name);

      const uploadResponse = await fetch("/TourifyV1/api/upload-image.php", {
        method: "POST",
        credentials: "include", // Send cookies with request
        body: uploadFormData,
      });

      const responseText = await uploadResponse.text();
      console.log("Upload response:", responseText);

      let uploadResult;
      try {
        uploadResult = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          "Invalid server response: " +
            (responseText ? responseText.substring(0, 150) : "Empty response")
        );
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "File upload failed");
      }

      // Store only filename in database
      formData.profile_picture = uploadResult.filename;

      // Show upload success preview
      const preview = document.getElementById("guideImagePreview");
      if (preview) {
        preview.innerHTML = `<img src="${uploadResult.path}" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 50%; border: 2px solid green;">
                            <p style="color: green; margin-top: 5px;">✓ Gambar berhasil di-upload</p>`;
        preview.style.display = "block";
      }
    } catch (uploadError) {
      alert("Error uploading image: " + uploadError.message);
      return;
    }
  }

  try {
    const action = id ? "update" : "create";
    if (id) formData.guide_id = id;

    const response = await fetch(
      "/TourifyV1/admin/api/guides.php?action=" + action,
      {
        method: "POST",
        credentials: "include", // Send cookies with request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();

    if (result.success) {
      alert(result.message);
      guideModal.style.display = "none";
      adminCMS.fetchAndRenderGuides();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menyimpan tour guide");
  }
}

// ============ EXPORT FUNCTIONS ============

function exportBookingsToCSV() {
  const table = document.querySelector("#bookingsTableBody").parentElement;
  let csv =
    "ID Transaksi,User,Destinasi,Tanggal Booking,Jumlah Tiket,Total Harga,Status\n";

  document.querySelectorAll("#bookingsTableBody tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    const rowData = Array.from(cells)
      .map((cell) => {
        const text = cell.textContent.trim();
        return `"${text}"`;
      })
      .join(",");
    csv += rowData + "\n";
  });

  downloadCSV(csv, "bookings.csv");
}

function downloadCSV(csv, filename) {
  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export button listener
const exportBtn = document.getElementById("exportBookingsBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", exportBookingsToCSV);
}

// ============ PRINT FUNCTIONS ============

function printBooking(id) {
  adminCMS.fetchAPI(`bookings.php?action=detail&id=${id}`).then((data) => {
    const booking = data.data;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
                <html>
                <head>
                    <title>Detail Booking #${booking.booking_id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        .label { font-weight: bold; width: 150px; display: inline-block; }
                        .divider { border-bottom: 1px solid #ccc; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Detail Booking</h2>
                        <p>#${booking.booking_id}</p>
                    </div>
                    <div class="section">
                        <p><span class="label">User:</span> ${
                          booking.user_name
                        }</p>
                        <p><span class="label">Email:</span> ${
                          booking.email
                        }</p>
                        <p><span class="label">Phone:</span> ${
                          booking.phone
                        }</p>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <p><span class="label">Destinasi:</span> ${
                          booking.destination_name
                        }</p>
                        <p><span class="label">Harga:</span> Rp ${adminCMS.formatNumber(
                          booking.price
                        )}</p>
                        <p><span class="label">Jumlah Tiket:</span> ${
                          booking.ticket_quantity
                        }</p>
                        <p><span class="label">Total:</span> Rp ${adminCMS.formatNumber(
                          booking.total_price
                        )}</p>
                    </div>
                    <div class="divider"></div>
                    <div class="section">
                        <p><span class="label">Status:</span> ${
                          booking.status
                        }</p>
                        <p><span class="label">Tanggal:</span> ${new Date(
                          booking.booking_date
                        ).toLocaleDateString("id-ID")}</p>
                        <p><span class="label">Tour Guide:</span> ${
                          booking.guide_name || "Belum ditentukan"
                        }</p>
                    </div>
                </body>
                </html>
            `);
    printWindow.document.close();
    printWindow.print();
  });
}

// ============ SEARCH & FILTER ============

// Real-time search for bookings
const searchBookings = document.getElementById("searchBookings");
if (searchBookings) {
  searchBookings.addEventListener("keyup", () => {
    clearTimeout(window.bookingsSearchTimeout);
    window.bookingsSearchTimeout = setTimeout(() => {
      adminCMS.fetchAndRenderBookings();
    }, 300);
  });
}

// Real-time search for users
const searchUsers = document.getElementById("searchUsers");
if (searchUsers) {
  searchUsers.addEventListener("keyup", () => {
    clearTimeout(window.usersSearchTimeout);
    window.usersSearchTimeout = setTimeout(() => {
      adminCMS.fetchAndRenderUsers();
    }, 300);
  });
}

// Real-time search for reviews
const searchReviews = document.getElementById("searchReviews");
if (searchReviews) {
  searchReviews.addEventListener("keyup", () => {
    clearTimeout(window.reviewsSearchTimeout);
    window.reviewsSearchTimeout = setTimeout(() => {
      adminCMS.fetchAndRenderReviews();
    }, 300);
  });
}

// Status filter for bookings
const statusFilter = document.getElementById("statusFilter");
if (statusFilter) {
  statusFilter.addEventListener("change", () => {
    adminCMS.fetchAndRenderBookings();
  });
}

// Rating filter for reviews
const ratingFilter = document.getElementById("ratingFilter");
if (ratingFilter) {
  ratingFilter.addEventListener("change", () => {
    adminCMS.fetchAndRenderReviews();
  });
}

// ============ BULK OPERATIONS ============

function selectAllBookings() {
  const checkboxes = document.querySelectorAll("input[data-booking-check]");
  const selectAll = document.getElementById("selectAllBookings");
  checkboxes.forEach((cb) => (cb.checked = selectAll.checked));
}

function deleteSelectedBookings() {
  const checkboxes = document.querySelectorAll(
    "input[data-booking-check]:checked"
  );
  if (checkboxes.length === 0) {
    alert("Pilih minimal satu pemesanan");
    return;
  }

  if (confirm(`Hapus ${checkboxes.length} pemesanan?`)) {
    const ids = Array.from(checkboxes).map((cb) => cb.dataset.id);
    ids.forEach((id) => adminCMS.deleteBooking(id));
  }
}

// ============ AUTO-REFRESH ============

// Auto refresh dashboard every 5 minutes
let dashboardRefreshInterval;

function startDashboardRefresh() {
  dashboardRefreshInterval = setInterval(() => {
    if (adminCMS.currentModule === "dashboard") {
      adminCMS.loadDashboard();
    }
  }, 5 * 60 * 1000); // 5 minutes
}

function stopDashboardRefresh() {
  clearInterval(dashboardRefreshInterval);
}

// Start auto-refresh when DOM is ready
document.addEventListener("DOMContentLoaded", startDashboardRefresh);

// Stop when page unloads
window.addEventListener("beforeunload", stopDashboardRefresh);

// ============ KEYBOARD SHORTCUTS ============

document.addEventListener("keydown", (e) => {
  // Ctrl + K to open search
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    const searchBox = document.querySelector(".filter-input");
    if (searchBox) searchBox.focus();
  }

  // Ctrl + N to add new item
  if (e.ctrlKey && e.key === "n") {
    e.preventDefault();
    if (adminCMS.currentModule === "destinations") {
      adminCMS.openDestinationModal();
    } else if (adminCMS.currentModule === "guides") {
      adminCMS.openGuideModal();
    }
  }

  // Escape to close modals
  if (e.key === "Escape") {
    destinationModal.style.display = "none";
    guideModal.style.display = "none";
    replyModal.style.display = "none";
  }
});

console.log("CMS Modal Manager loaded successfully");
