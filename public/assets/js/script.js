// Main JavaScript file
import { initAuth, checkAuth, updateNavigation } from "./auth.js";
import {
  getDestinations,
  loadDestinationsFromDatabase,
  getImageUrl,
} from "./destinations.js";
import { formatPrice, generateStars, setMinimumDates } from "./utils.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Initialize navigation
  initNavigation();

  // Check authentication status (async)
  await initAuth();
  updateNavigation();

  // Load featured destinations on homepage
  if (document.getElementById("featuredDestinations")) {
    loadFeaturedDestinations();
  }

  // Quick booking form
  const quickBookingForm = document.getElementById("quickBookingForm");
  if (quickBookingForm) {
    setupQuickBooking();
  }

  // Set minimum date for date inputs
  setMinimumDates();
});

// Navigation toggle for mobile
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
}

// Load featured destinations
async function loadFeaturedDestinations() {
  const container = document.getElementById("featuredDestinations");
  if (!container) return;

  // Load data dari database terlebih dahulu
  const destinations = await loadDestinationsFromDatabase();
  const featuredDests = destinations.slice(0, 6); // Get first 6 destinations

  if (featuredDests.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; padding: 2rem; color: #999;">Destinasi tidak tersedia</p>';
    return;
  }

  container.innerHTML = featuredDests
    .map(
      (dest) => `
        <div class="destination-card" onclick="window.location.href='destination-detail.php?id=${
          dest.id
        }'">
            <img src="${getImageUrl(dest.image)}" alt="${
        dest.name
      }" class="destination-image">
            <div class="destination-content">
                <div class="destination-header">
                    <h3 class="destination-name">${dest.name}</h3>
                    <span class="destination-price">${formatPrice(
                      dest.price
                    )}</span>
                </div>
                <p class="destination-location">
                    <i class="fas fa-map-marker-alt"></i> ${dest.location}
                </p>
                <div class="destination-rating">
                    <span class="stars">${generateStars(dest.rating)}</span>
                    <span>${dest.rating}</span>
                    <span>(${dest.reviews} ulasan)</span>
                </div>
                <p class="destination-description">${dest.description.substring(
                  0,
                  100
                )}...</p>
                <span class="destination-category">${dest.category}</span>
            </div>
        </div>
    `
    )
    .join("");
}

// Quick booking setup
async function setupQuickBooking() {
  const form = document.getElementById("quickBookingForm");
  const destinationSelect = document.getElementById("quickDestination");

  // Populate destinations dari database
  const destinations = await loadDestinationsFromDatabase();
  destinationSelect.innerHTML =
    '<option value="">Pilih Destinasi</option>' +
    destinations
      .map((dest) => `<option value="${dest.id}">${dest.name}</option>`)
      .join("");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const destination = destinationSelect.value;
    const date = document.getElementById("quickDate").value;
    const tickets = document.getElementById("quickTickets").value;

    if (!destination || !date || !tickets) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    // Store booking data and redirect
    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        destination,
        date,
        tickets,
      })
    );

    window.location.href = "booking.php";
  });
}

// `formatPrice`, `generateStars`, and `setMinimumDates` are provided by `utils.js`
