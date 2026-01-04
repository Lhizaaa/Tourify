// Booking functionality
import {
  getDestinationById,
  getDestinations,
  loadDestinationsFromDatabase,
} from "./destinations.js";
import { getTourGuides } from "./tour-guide.js";
import { formatPrice } from "./utils.js";

let currentStep = 1;
let bookingData = {};
let guideRefreshInterval = null;
let destinationsCache = []; // Cache untuk menyimpan destinations dari API
let guidesCache = []; // Cache untuk menyimpan tour guides dari API

document.addEventListener("DOMContentLoaded", async function () {
  if (!window.location.pathname.includes("booking.php")) return;

  // Check if user is logged in via PHP session
  try {
    const response = await fetch("/api/v1/check-session.php");
    const data = await response.json();

    if (!data.authenticated) {
      alert("Silakan login terlebih dahulu!");
      window.location.href = "auth.php";
      return;
    }

    // Store user data for form pre-fill
    window.currentUser = data.user;

    initializeBooking();
    setupStepNavigation();
    setupPriceCalculation();
    setupGuideAutoRefresh(); // Auto-refresh dropdown guide
  } catch (error) {
    console.error("Error checking session:", error);
    alert("Silakan login terlebih dahulu!");
    window.location.href = "auth.php";
  }
});

// Setup auto-refresh untuk dropdown guide
function setupGuideAutoRefresh() {
  if (guideRefreshInterval) clearInterval(guideRefreshInterval);

  guideRefreshInterval = setInterval(async () => {
    const guideSelect = document.getElementById("bookingTourGuide");
    if (!guideSelect) return;

    try {
      const response = await fetch(
        "./api/tour-guides.php?action=list&page=1&t=" + Date.now()
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        guidesCache = result.data; // Update cache
        const currentValue = guideSelect.value; // Save current selection

        guideSelect.innerHTML =
          '<option value="">Tidak Perlu Tour Guide</option>' +
          result.data
            .map(
              (guide) =>
              `<option value="${guide.guide_id}">${guide.name} - Rp ${parseInt(guide.price || 0).toLocaleString(
                "id-ID"
              )}</option>`
            )
            .join("");

        // Restore previous selection if still exists
        if (currentValue) {
          guideSelect.value = currentValue;
        }
      }
    } catch (error) {
      console.error("Error refreshing tour guides:", error);
    }
  }, 10000); // Refresh setiap 10 detik
}

// Stop auto-refresh ketika leaving page
window.addEventListener("beforeunload", function () {
  if (guideRefreshInterval) {
    clearInterval(guideRefreshInterval);
  }
});

async function initializeBooking() {
  // Load saved booking data from session
  const savedData = sessionStorage.getItem("bookingData");
  if (savedData) {
    const data = JSON.parse(savedData);
    if (data.destination) {
      document.getElementById("bookingDestination").value = data.destination;
    }
    if (data.date) {
      document.getElementById("bookingDate").value = data.date;
    }
    if (data.tickets) {
      document.getElementById("bookingTickets").value = data.tickets;
    }
  }

  // Populate destinations from database
  const destinationSelect = document.getElementById("bookingDestination");

  // Load dari database
  const destinations = await loadDestinationsFromDatabase();
  destinationsCache = destinations; // Cache untuk calculatePrice()

  destinationSelect.innerHTML =
    '<option value="">Pilih Destinasi</option>' +
    destinations
      .map(
        (dest) =>
          `<option value="${dest.id}">${dest.name} - ${formatPrice(
            dest.price
          )}</option>`
      )
      .join("");

  // Populate tour guides from API
  const guideSelect = document.getElementById("bookingTourGuide");
  try {
    const response = await fetch(
      "./api/tour-guides.php?action=list&page=1&t=" + Date.now()
    );
    const result = await response.json();
    if (result.success && result.data.length > 0) {
      guidesCache = result.data; // Cache untuk calculatePrice()
      guideSelect.innerHTML =
        '<option value="">Tidak Perlu Tour Guide</option>' +
        result.data
          .map(
            (guide) =>
              `<option value="${guide.guide_id}">${guide.name} - Rp ${parseInt(guide.price || 0).toLocaleString(
                "id-ID"
              )}</option>`
          )
          .join("");
    } else {
      guideSelect.innerHTML =
        '<option value="">Tidak Ada Tour Guide Tersedia</option>';
    }
  } catch (error) {
    console.error("Error loading tour guides:", error);
    guideSelect.innerHTML =
      '<option value="">Error loading tour guides</option>';
  }

  // Pre-fill user data from PHP session
  if (window.currentUser) {
    document.getElementById("visitorName").value = window.currentUser.name;
    document.getElementById("visitorEmail").value = window.currentUser.email;
    document.getElementById("visitorPhone").value =
      window.currentUser.phone || "";
  }
}

function setupStepNavigation() {
  const nextButtons = document.querySelectorAll(".btn-next");
  const prevButtons = document.querySelectorAll(".btn-prev");

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (validateCurrentStep()) {
        saveStepData();
        nextStep();
      }
    });
  });

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      prevStep();
    });
  });
}

function validateCurrentStep() {
  const currentStepElement = document.querySelector(
    `.form-step[data-step="${currentStep}"]`
  );
  
  if (!currentStepElement) {
    console.error("Step element not found:", currentStep);
    return false;
  }

  const inputs = currentStepElement.querySelectorAll(
    "input[required], select[required]"
  );

  for (let input of inputs) {
    if (!input.value) {
      alert("Mohon lengkapi semua field yang wajib diisi!");
      input.focus();
      return false;
    }
  }

  // Additional validation for payment step
  if (currentStep === 3) {
    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    );
    if (!paymentMethod) {
      alert("Mohon pilih metode pembayaran!");
      return false;
    }

    // Process payment simulation
    processPayment(paymentMethod.value);
  }

  return true;
}

function saveStepData() {
  if (currentStep === 1) {
    const destId = document.getElementById("bookingDestination").value;
    const tickets = parseInt(document.getElementById("bookingTickets").value);
    const guideId = document.getElementById("bookingTourGuide").value;

    // Gunakan cache yang sama dengan calculatePrice()
    const destination = destinationsCache.find((d) => d.id === destId);
    let ticketPrice = 0;
    let destinationName = "Unknown";
    let destinationNumericId = destId; // Default to full ID

    if (destination) {
      ticketPrice = parseFloat(destination.price) * tickets;
      destinationName = destination.name;
      // Extract numeric ID dari format "dest-123"
      if (destination.destination_id) {
        destinationNumericId = destination.destination_id;
      } else if (destId && destId.includes("-")) {
        destinationNumericId = destId.split("-")[1];
      }
    }

    bookingData = {
      destinationId: destinationNumericId,
      destinationName: destinationName,
      date: document.getElementById("bookingDate").value,
      tickets: tickets,
      ticketPrice: ticketPrice,
      guideId: guideId,
      guidePrice: 0,
    };

    if (guideId) {
      // Gunakan cache guides yang sama dengan calculatePrice()
      const guide = guidesCache.find((g) => g.guide_id == guideId);
      if (guide && guide.price) {
        bookingData.guidePrice = parseFloat(guide.price);
        bookingData.guideName = guide.name;
      }
    }

    bookingData.totalPrice =
      parseFloat(bookingData.ticketPrice) + parseFloat(bookingData.guidePrice);
  } else if (currentStep === 2) {
    bookingData.visitorName = document.getElementById("visitorName").value;
    bookingData.visitorEmail = document.getElementById("visitorEmail").value;
    bookingData.visitorPhone = document.getElementById("visitorPhone").value;
    bookingData.visitorId = document.getElementById("visitorId").value;
  }
}

function nextStep() {
  if (currentStep < 4) {
    currentStep++;
    updateStepDisplay();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateStepDisplay();
  }
}

function updateStepDisplay() {
  // Update step indicators
  document.querySelectorAll(".step").forEach((step) => {
    const stepNum = parseInt(step.getAttribute("data-step"));
    if (stepNum === currentStep) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });

  // Update form steps
  document.querySelectorAll(".form-step").forEach((step) => {
    const stepNum = parseInt(step.getAttribute("data-step"));
    if (stepNum === currentStep) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });

  // Show confirmation summary
  if (currentStep === 4) {
    displayBookingSummary();
  }
}

function setupPriceCalculation() {
  const destSelect = document.getElementById("bookingDestination");
  const ticketsInput = document.getElementById("bookingTickets");
  const guideSelect = document.getElementById("bookingTourGuide");

  [destSelect, ticketsInput, guideSelect].forEach((element) => {
    element?.addEventListener("change", calculatePrice);
  });

  calculatePrice();
}

function calculatePrice() {
  const destId = document.getElementById("bookingDestination").value;
  const tickets =
    parseInt(document.getElementById("bookingTickets").value) || 0;
  const guideId = document.getElementById("bookingTourGuide").value;

  let ticketPrice = 0;
  let guidePrice = 0;

  if (destId) {
    // Cari destination dari cache (dari API), bukan dari static destinationsData
    const destination = destinationsCache.find((d) => d.id === destId);
    if (destination) {
      ticketPrice = parseFloat(destination.price) * tickets;
    } else {
      console.warn("Destination not found:", destId);
    }
  }

  if (guideId) {
    // Cari guide dari cache dan ambil harga sebenarnya
    const guide = guidesCache.find((g) => g.guide_id == guideId);
    if (guide && guide.price) {
      guidePrice = parseFloat(guide.price);
    } else {
      // Fallback jika guide tidak ditemukan atau tidak punya price
      console.warn("Guide not found or no price:", guideId);
      guidePrice = 0;
    }
  }

  const total = parseFloat(ticketPrice) + parseFloat(guidePrice);

  document.getElementById("ticketPrice").textContent = formatPrice(ticketPrice);
  document.getElementById("guidePrice").textContent = formatPrice(guidePrice);
  document.getElementById("totalPrice").textContent = formatPrice(total);
}

function processPayment(method) {
  // Simulate payment processing
  const paymentDetails = document.getElementById("paymentDetails");

  let detailsHTML =
    '<div style="margin-top: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 8px;">';

  switch (method) {
    case "bank-mandiri":
      detailsHTML += `
                <h4>Transfer Bank Mandiri</h4>
                <p><strong>Bank:</strong> PT. Bank Mandiri (Persero) Tbk</p>
                <p><strong>No. Rekening:</strong> 1234567890</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="color: var(--warning); margin-top: 1rem;">
                    <i class="fas fa-info-circle"></i> Silakan transfer sesuai jumlah yang tertera
                </p>
            `;
      break;
    case "bank-bca":
      detailsHTML += `
                <h4>Transfer Bank BCA</h4>
                <p><strong>Bank:</strong> PT. Bank Central Asia Tbk</p>
                <p><strong>No. Rekening:</strong> 0987654321</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="color: var(--warning); margin-top: 1rem;">
                    <i class="fas fa-info-circle"></i> Silakan transfer sesuai jumlah yang tertera
                </p>
            `;
      break;
    case "bank-bri":
      detailsHTML += `
                <h4>Transfer Bank BRI</h4>
                <p><strong>Bank:</strong> PT. Bank Rakyat Indonesia (Persero) Tbk</p>
                <p><strong>No. Rekening:</strong> 5555666677</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="color: var(--warning); margin-top: 1rem;">
                    <i class="fas fa-info-circle"></i> Silakan transfer sesuai jumlah yang tertera
                </p>
            `;
      break;
    case "gopay":
      detailsHTML += `
                <h4>GoPay</h4>
                <p><strong>Platform:</strong> GoPay</p>
                <p><strong>Nomor:</strong> 0812-3456-7890</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="margin-top: 1rem;">
                    <i class="fas fa-mobile-alt"></i> Buka aplikasi GoPay Anda dan transfer ke nomor di atas
                </p>
            `;
      break;
    case "shopeepay":
      detailsHTML += `
                <h4>ShopeePay</h4>
                <p><strong>Platform:</strong> ShopeePay</p>
                <p><strong>Nomor:</strong> 0812-3456-7890</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="margin-top: 1rem;">
                    <i class="fas fa-mobile-alt"></i> Buka aplikasi Shopee Anda, pilih ShopeePay, dan transfer ke nomor di atas
                </p>
            `;
      break;
    case "dana":
      detailsHTML += `
                <h4>DANA</h4>
                <p><strong>Platform:</strong> DANA</p>
                <p><strong>Nomor:</strong> 0812-3456-7890</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="margin-top: 1rem;">
                    <i class="fas fa-mobile-alt"></i> Buka aplikasi DANA dan transfer ke nomor di atas
                </p>
            `;
      break;
    case "ovo":
      detailsHTML += `
                <h4>OVO</h4>
                <p><strong>Platform:</strong> OVO</p>
                <p><strong>Nomor:</strong> 0812-3456-7890</p>
                <p><strong>Atas Nama:</strong> Tourify</p>
                <p><strong>Jumlah:</strong> ${formatPrice(
                  bookingData.totalPrice
                )}</p>
                <p style="margin-top: 1rem;">
                    <i class="fas fa-mobile-alt"></i> Buka aplikasi OVO dan transfer ke nomor di atas
                </p>
            `;
      break;
    case "credit-card":
      detailsHTML += `
                <h4>Kartu Kredit</h4>
                <p>Pembayaran dengan kartu kredit akan diproses secara aman</p>
                <div class="form-group">
                    <label>Nomor Kartu</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Exp. Date</label>
                        <input type="text" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123" maxlength="3">
                    </div>
                </div>
            `;
      break;
  }

  detailsHTML += "</div>";
  paymentDetails.innerHTML = detailsHTML;
  paymentDetails.style.display = "block";

  // Simulate successful payment after 1 second
  setTimeout(() => {
    bookingData.paymentMethod = method;
    bookingData.paymentStatus = "success";
    saveBooking();
  }, 1000);
}

function saveBooking() {
  const currentUser =
    window.currentUser || JSON.parse(localStorage.getItem("currentUser"));

  // Prepare data untuk dikirim ke server
  const formData = new FormData();
  formData.append("action", "save_booking");
  formData.append("user_id", currentUser.id || currentUser.user_id);
  formData.append("destination_id", bookingData.destinationId);
  formData.append("booking_date", bookingData.date);
  formData.append("tickets", bookingData.tickets);
  formData.append("guide_id", bookingData.guideId || null);
  formData.append("total_price", bookingData.totalPrice);
  formData.append("payment_method", bookingData.paymentMethod);

  // Send ke server
  fetch("./booking.php", {
    method: "POST",
    body: formData,
    redirect: "follow",
  })
    .then((response) => {
      // Check jika ada redirect
      if (response.redirected) {
        // Extract booking ID dari URL jika ada
        const url = new URL(response.url);
        const bookingId = url.searchParams.get("id");

        // Create booking object untuk display
        const newBooking = {
          id: bookingId || "booking_" + Date.now(),
          userId: currentUser.id || currentUser.user_id,
          ...bookingData,
          status: "confirmed",
          bookingDate: new Date().toISOString(),
        };

        // Simpan ke sessionStorage untuk confirmation display
        sessionStorage.setItem("currentBooking", JSON.stringify(newBooking));

        // Move to step 4 (confirmation)
        currentStep = 4;
        updateStepDisplay();

        return Promise.resolve(); // Stop fetch chain
      }

      return response.text();
    })
    .then((text) => {
      if (text) {
        // Jika ada response text, cek apakah ada error
        if (text.includes("error")) {
          console.error("Booking save error:", text);
          alert("Terjadi kesalahan saat menyimpan booking");
          // Reset to step 3 jika ada error
          currentStep = 3;
          updateStepDisplay();
        }
      }
    })
    .catch((error) => {
      console.error("Error saving booking:", error);
      alert("Terjadi kesalahan saat menyimpan booking. Mohon coba lagi.");
      // Reset to step 3 jika ada error
      currentStep = 3;
      updateStepDisplay();
    });
}

function displayBookingSummary() {
  const booking = JSON.parse(sessionStorage.getItem("currentBooking"));
  const summaryContainer = document.getElementById("bookingSummary");

  summaryContainer.innerHTML = `
        <div class="booking-summary">
            <h3>Detail Pemesanan</h3>
            <div class="info-row">
                <span>Nomor Booking</span>
                <strong>${booking.id}</strong>
            </div>
            <div class="info-row">
                <span>Destinasi</span>
                <strong>${booking.destinationName}</strong>
            </div>
            <div class="info-row">
                <span>Tanggal Kunjungan</span>
                <strong>${new Date(booking.date).toLocaleDateString(
                  "id-ID"
                )}</strong>
            </div>
            <div class="info-row">
                <span>Jumlah Tiket</span>
                <strong>${booking.tickets} tiket</strong>
            </div>
            ${
              booking.guideName
                ? `
            <div class="info-row">
                <span>Tour Guide</span>
                <strong>${booking.guideName}</strong>
            </div>
            `
                : ""
            }
            <div class="info-row">
                <span>Nama Pengunjung</span>
                <strong>${booking.visitorName}</strong>
            </div>
            <div class="info-row">
                <span>Email</span>
                <strong>${booking.visitorEmail}</strong>
            </div>
            <div class="info-row">
                <span>Metode Pembayaran</span>
                <strong>${getPaymentMethodName(booking.paymentMethod)}</strong>
            </div>
            <div class="info-row" style="border-top: 2px solid var(--gray-200); margin-top: 1rem; padding-top: 1rem;">
                <span style="font-size: 1.2rem;">Total Pembayaran</span>
                <strong style="font-size: 1.5rem; color: var(--primary-blue);">${formatPrice(
                  booking.totalPrice
                )}</strong>
            </div>
        </div>
    `;

  // Setup download ticket button
  document.getElementById("downloadTicket").addEventListener("click", () => {
    downloadETicket(booking);
  });
}

function getPaymentMethodName(method) {
  const methods = {
    "bank-mandiri": "Bank Mandiri",
    "bank-bca": "Bank BCA",
    "bank-bri": "Bank BRI",
    "gopay": "GoPay",
    "shopeepay": "ShopeePay",
    "dana": "DANA",
    "ovo": "OVO",
    "credit-card": "Kartu Kredit",
  };
  return methods[method] || method;
}

function downloadETicket(booking) {
  // Simulate e-ticket download
  const ticketContent = `
        ========================================
        E-TICKET TOURIFY
        ========================================
        
        Booking ID: ${booking.id}
        
        DESTINASI: ${booking.destinationName}
        Tanggal: ${new Date(booking.date).toLocaleDateString("id-ID")}
        Jumlah Tiket: ${booking.tickets}
        
        PENGUNJUNG:
        Nama: ${booking.visitorName}
        Email: ${booking.visitorEmail}
        Telepon: ${booking.visitorPhone}
        
        ${booking.guideName ? `TOUR GUIDE: ${booking.guideName}\n` : ""}
        
        TOTAL PEMBAYARAN: ${formatPrice(booking.totalPrice)}
        Status: TERKONFIRMASI
        
        Tanggal Booking: ${new Date(booking.bookingDate).toLocaleString(
          "id-ID"
        )}
        
        ========================================
        Tunjukkan e-ticket ini saat check-in
        ========================================
    `;

  const blob = new Blob([ticketContent], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `e-ticket-${booking.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  alert("E-Ticket berhasil diunduh!");
}
