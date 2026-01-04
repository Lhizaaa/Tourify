// Tour guides data and functionality
import { formatPrice } from "./utils.js";
import { loadDestinationsFromDatabase } from "./destinations.js";

// Helper function to get proper image URL
function getImageUrl(filename) {
  if (!filename) return "https://via.placeholder.com/80?text=Guide";
  if (filename.startsWith("http") || filename.startsWith("data:")) {
    return filename; // Already a full URL or data URI
  }
  if (filename.startsWith("./public/") || filename.startsWith("/")) {
    return filename; // Already has path
  }
  // Construct URL for filename stored in database
  return `/TourifyV1/public/assets/uploads/${filename}`;
}

let tourGuidesData = [];
let lastGuideCount = 0;
let autoRefreshInterval = null;

// Fetch tour guides from API
async function fetchTourGuides(page = 1, search = "") {
  try {
    const response = await fetch(
      `./api/tour-guides.php?action=list&page=${page}&search=${encodeURIComponent(
        search
      )}&t=${Date.now()}`
    );
    const result = await response.json();
    if (result.success) {
      tourGuidesData = result.data;

      // Check if data has changed
      if (result.total !== lastGuideCount) {
        lastGuideCount = result.total;
        // showDataUpdateNotification(); // Commented out: notification removed per user request
      }

      return result;
    } else {
      console.error("Error fetching tour guides:", result.error);
      return null;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// Show notification when data updates
function showDataUpdateNotification() {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 9999;
    font-weight: bold;
  `;
  notification.textContent = "✓ Data tour guide diperbarui!";
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Setup auto-refresh every 10 seconds
function setupAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);

  autoRefreshInterval = setInterval(async () => {
    const result = await fetchTourGuides(1, "");
    if (result && result.success) {
      const container = document.getElementById("guidesList");
      if (container) {
        displayTourGuides(tourGuidesData);
      }
    }
  }, 10000); // 10 detik
}

// Stop auto-refresh
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// Get all tour guides
export function getTourGuides() {
  return tourGuidesData;
}

// Get tour guide by ID
export function getTourGuideById(id) {
  return tourGuidesData.find((guide) => guide.guide_id == id);
}

// Load tour guides on the page
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("tour-guides.php")) {
    loadTourGuidesList();
    setupFilters();
    setupAutoRefresh(); // Start auto-refresh
  }
});

// Stop auto-refresh when leaving page
window.addEventListener("beforeunload", function () {
  stopAutoRefresh();
});

async function loadTourGuidesList() {
  const container = document.getElementById("guidesList");
  if (!container) return;

  // Show loading message
  container.innerHTML =
    '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;"><i class="fas fa-spinner fa-spin"></i> Memuat tour guide...</p>';

  // Fetch data from API
  const result = await fetchTourGuides(1, "");
  if (result && result.success) {
    tourGuidesData = result.data;
    displayTourGuides(tourGuidesData);
  } else {
    container.innerHTML =
      '<p style="text-align: center; padding: 2rem; grid-column: 1/-1; color: red;">Gagal memuat data tour guide</p>';
  }
}

function displayTourGuides(guides) {
  const container = document.getElementById("guidesList");

  if (guides.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">Tidak ada tour guide yang sesuai dengan filter Anda</p>';
    return;
  }

  container.innerHTML = guides
    .map(
      (guide) => `
        <div class="guide-card">
            <div class="guide-header">
                <img src="${
                  getImageUrl(guide.profile_picture) ||
                  "https://via.placeholder.com/80?text=" + guide.name.charAt(0)
                }" alt="${guide.name}" class="guide-avatar">
                <div class="guide-info">
                    <h3>${guide.name}</h3>
                </div>
            </div>
            
            <div class="guide-languages">
                <span class="language-tag">Professional Guide</span>
            </div>
            
            <div class="guide-experience">
                <i class="fas fa-briefcase"></i> Tour Guide Profesional
            </div>
            
            <p>${guide.bio || "Tour guide berpengalaman siap melayani Anda"}</p>
            
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200);">
                <p style="margin: 0.5rem 0;"><strong>Kontak:</strong> ${
                  guide.contact || "-"
                }</p>
                <p style="margin: 0.5rem 0;"><strong>Tur Selesai:</strong> ${
                  guide.completed_bookings || 0
                }</p>
                <p style="margin: 0.5rem 0;"><strong>Tarif per Hari:</strong> <span style="color: #10b981; font-weight: bold;">${formatPrice(
                  guide.price || 0
                )}</span></p>
            </div>
            
            <button class="btn-primary btn-block" onclick="bookTourGuide(${
              guide.guide_id
            })">
                <i class="fas fa-calendar"></i> Pesan Sekarang
            </button>
        </div>
    `
    )
    .join("");
}

function setupFilters() {
  const applyBtn = document.getElementById("applyGuideFilters");
  if (applyBtn) {
    applyBtn.addEventListener("click", applyGuideFilters);
  }
}

function applyGuideFilters() {
  const language = document.getElementById("filterLanguage")?.value || "";
  const price = document.getElementById("filterPrice")?.value || "";
  const experience = document.getElementById("filterExperience")?.value || "";

  let filtered = tourGuidesData;

  if (language) {
    filtered = filtered.filter((guide) =>
      guide.languages.some((lang) =>
        lang.toLowerCase().includes(language.toLowerCase())
      )
    );
  }

  if (price) {
    filtered = filtered.filter((guide) => {
      const guidePrice = guide.price || 0;
      if (price === "100000-500000")
        return guidePrice >= 100000 && guidePrice <= 500000;
      if (price === "500000-1000000")
        return guidePrice > 500000 && guidePrice <= 1000000;
      if (price === "1000000-2000000")
        return guidePrice > 1000000 && guidePrice <= 2000000;
      if (price === "2000000") return guidePrice > 2000000;
      return true;
    });
  }

  if (experience) {
    filtered = filtered.filter((guide) => {
      if (experience === "1-3")
        return guide.experience >= 1 && guide.experience <= 3;
      if (experience === "3-5")
        return guide.experience > 3 && guide.experience <= 5;
      if (experience === "5+") return guide.experience > 5;
      return true;
    });
  }

  displayTourGuides(filtered);
}

// Book tour guide function
window.bookTourGuide = async function (guideId) {
  // Verify with server session instead of localStorage
  try {
    const response = await fetch("/api/v1/check-session.php");
    const authData = await response.json();

    if (!authData.authenticated || !authData.user) {
      alert("Silakan login terlebih dahulu!");
      window.location.href = "auth.php";
      return;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    alert("Gagal memverifikasi login. Silakan coba lagi.");
    return;
  }

  const guide = getTourGuideById(guideId);
  const modal = document.getElementById("guideBookingModal");
  const guideDetails = document.getElementById("guideDetails");

  if (modal) {
    guideDetails.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3>${guide.name}</h3>
                <p><strong>Tarif Jasa:</strong> <span style="color: #10b981; font-weight: bold;">${formatPrice(
                  guide.price || 0
                )}</span>/hari</p>
                <p><strong>Kontak:</strong> ${guide.contact || "-"}</p>
                <p><strong>Bio:</strong> ${guide.bio || "-"}</p>
            </div>
        `;

    // Store selected guide in session for booking
    sessionStorage.setItem("selectedTourGuide", JSON.stringify(guide));

    // Setup date input
    const dateInput = document.getElementById("guideDate");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
    }

    // Load destinasi untuk dropdown
    const destinationSelect = document.getElementById("guideDestination");
    if (destinationSelect) {
      destinationSelect.innerHTML = '<option value="">Memuat destinasi...</option>';
      
      try {
        const destinations = await loadDestinationsFromDatabase();
        if (destinations && destinations.length > 0) {
          destinationSelect.innerHTML =
            '<option value="">Pilih Destinasi</option>' +
            destinations
              .map(
                (dest) =>
                  `<option value="${dest.id}">${dest.name} - ${formatPrice(dest.price)}</option>`
              )
              .join("");
        } else {
          destinationSelect.innerHTML = '<option value="">Tidak ada destinasi tersedia</option>';
        }
      } catch (error) {
        console.error("Error loading destinations:", error);
        destinationSelect.innerHTML = '<option value="">Error memuat destinasi</option>';
      }
    }

    modal.style.display = "block";

    // Setup close button
    const closeBtn = modal.querySelector(".close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };
    }

    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }
};

// Export for use in other modules
export { displayTourGuides, applyGuideFilters };
