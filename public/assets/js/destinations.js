// Destinations data and functionality
import { formatPrice, generateStars } from "./utils.js";

// Helper function to get proper image URL
export function getImageUrl(filename) {
  // Fallback to local placeholder (1x1 gray pixel)
  const placeholderDataUri =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23cccccc' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%23666' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

  if (!filename) return placeholderDataUri;
  if (filename.startsWith("http") || filename.startsWith("data:")) {
    return filename; // Already a full URL or data URI
  }
  if (filename.startsWith("./public/") || filename.startsWith("/")) {
    return filename; // Already has path
  }
  // Construct URL for filename stored in database
  return `/TourifyV1/public/assets/uploads/${filename}`;
}

// Mock destinations data for Banjarnegara
// NOTE: Now empty - all data should come from database API
const destinationsData = [];

// Get all destinations
export function getDestinations() {
  return destinationsData;
}

// Async function to load destinations from API
export async function loadDestinationsFromDatabase() {
  try {
    // Check if data is cached (cache hanya 10 detik - quick updates saat admin delete/add)
    const cached = localStorage.getItem("destinationsData");
    const cacheTime = localStorage.getItem("destinationsDataTime");
    const now = Date.now();

    if (cached && cacheTime && now - parseInt(cacheTime) < 10 * 1000) {
      console.log("Using cached destinations data (< 10 sec old)");
      return JSON.parse(cached);
    }

    // Fetch dari API publik dengan cache buster
    const url = `./api/destinations-public.php?action=list&t=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Failed to load destinations from database");
      return [];
    }

    const result = await response.json();
    if (result.success && result.data && result.data.length > 0) {
      console.log("Loaded destinations from database:", result.data.length);

      // Cache the data
      localStorage.setItem("destinationsData", JSON.stringify(result.data));
      localStorage.setItem("destinationsDataTime", now.toString());

      // Merge dengan mock data untuk backup (jika data dari DB kurang)
      return result.data.length > 0 ? result.data : destinationsData;
    } else {
      console.warn("No data from API, using default data");
      return destinationsData;
    }
  } catch (error) {
    console.error("Error loading destinations from database:", error);
    // Fallback ke mock data jika API error
    return destinationsData;
  }
}

// Get destination by ID
export function getDestinationById(id) {
  return destinationsData.find((dest) => dest.id === id);
}

// Auto-refresh when page becomes visible (user switches back to tab)
document.addEventListener("visibilitychange", function () {
  if (
    !document.hidden &&
    window.location.pathname.includes("destinations.php")
  ) {
    console.log("📄 Page visible again - checking for updates...");

    // Always clear cache and reload saat user balik ke tab
    localStorage.removeItem("destinationsData");
    localStorage.removeItem("destinationsDataTime");

    // Reload destinations
    const container = document.getElementById("destinationsList");
    if (container) {
      loadDestinationsList();
    }
  }
});

// Listen for destination save events (from admin panel)
window.addEventListener("destinationSaved", function () {
  console.log("✓ Destination saved event received - clearing cache");
  localStorage.removeItem("destinationsData");
  localStorage.removeItem("destinationsDataTime");

  // Reload destinations if we're on the destinations page
  if (window.location.pathname.includes("destinations.php")) {
    loadDestinationsList();
  }
});

// Destinations list page
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("destinations.php")) {
    loadDestinationsList();
    setupFilters();
  }

  if (window.location.pathname.includes("destination-detail.php")) {
    loadDestinationDetail();
  }
});

// Listen for destination delete events (from admin panel)
window.addEventListener("destinationDeleted", function () {
  console.log(
    "✓ Destination deleted event received - clearing cache and reloading"
  );
  localStorage.removeItem("destinationsData");
  localStorage.removeItem("destinationsDataTime");

  // Reload destinations if we're on the destinations page
  if (window.location.pathname.includes("destinations.php")) {
    loadDestinationsList();
  }
});

function loadDestinationsList() {
  const container = document.getElementById("destinationsList");
  if (!container) return;

  // Show loading state
  container.innerHTML =
    '<p style="text-align: center; padding: 2rem;">Memuat destinasi...</p>';

  // Load dari database
  loadDestinationsFromDatabase().then((destinations) => {
    displayDestinations(destinations);
  });
}

function displayDestinations(destinations) {
  const container = document.getElementById("destinationsList");

  if (destinations.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; padding: 2rem;">Tidak ada destinasi ditemukan</p>';
    return;
  }

  container.innerHTML = destinations
    .map(
      (dest) => `
        <div class="destination-card" onclick="window.location.href='destination-detail.php?id=${
          dest.id
        }'">
            <img src="${getImageUrl(dest.image)}" alt="${
        dest.name || "Destinasi"
      }" class="destination-image">
            <div class="destination-content">
                <div class="destination-header">
                    <h3 class="destination-name">${
                      dest.name || "Tanpa Nama"
                    }</h3>
                    <span class="destination-price">${formatPrice(
                      dest.price || 0
                    )}</span>
                </div>
                <p class="destination-location">
                    <i class="fas fa-map-marker-alt"></i> ${
                      dest.location || "Lokasi tidak tersedia"
                    }
                </p>
                <div class="destination-rating">
                    <span class="stars">${generateStars(
                      dest.rating || 0
                    )}</span>
                    <span>${(dest.rating || 0).toFixed(1)}</span>
                    <span>(${dest.reviews || 0} ulasan)</span>
                </div>
                <p class="destination-description">${
                  dest.description && dest.description.length > 0
                    ? dest.description.substring(0, 120) + "..."
                    : "Tidak ada deskripsi"
                }</p>
                <span class="destination-category">${
                  dest.category || "Umum"
                }</span>
            </div>
        </div>
    `
    )
    .join("");
}

function setupFilters() {
  const searchInput = document.getElementById("searchDestination");
  const categoryFilter = document.getElementById("filterCategory");
  const priceFilter = document.getElementById("filterPrice");
  const applyBtn = document.getElementById("applyFilters");

  applyBtn?.addEventListener("click", applyFilters);
  searchInput?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") applyFilters();
  });
}

function applyFilters() {
  const searchTerm = document
    .getElementById("searchDestination")
    .value.toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const priceRange = document.getElementById("filterPrice").value;

  // Load dari database untuk filter terbaru
  loadDestinationsFromDatabase().then((allDestinations) => {
    let filtered = allDestinations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (dest) =>
          (dest.name && dest.name.toLowerCase().includes(searchTerm)) ||
          (dest.description &&
            dest.description.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter(
        (dest) => dest.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Price filter
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(
        (dest) => dest.price >= min && dest.price <= max
      );
    }

    displayDestinations(filtered);
  });
}

function loadDestinationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const destId = urlParams.get("id");

  if (!destId) {
    window.location.href = "destinations.php";
    return;
  }

  // Load dari database dengan cache buster
  loadDestinationsFromDatabase()
    .then((destinations) => {
      // Cari destinasi berdasarkan ID atau nama
      let destination = destinations.find(
        (d) => d.id === destId || d.id === `dest-${destId}`
      );

      if (!destination) {
        // Fallback: coba dari mock data
        destination = getDestinationById(destId);
      }

      if (destination) {
        populateDestinationDetails(destination, destId);
      } else {
        console.error("Destination not found:", destId);
        window.location.href = "destinations.php";
      }
    })
    .catch((err) => {
      console.error("Failed to load destinations:", err);
      // Fallback ke mock data
      const destination = getDestinationById(destId);
      if (destination) {
        populateDestinationDetails(destination, destId);
      } else {
        window.location.href = "destinations.php";
      }
    });
}

function populateDestinationDetails(destination, destId) {
  // Populate destination details
  document.getElementById("detailImage").src = getImageUrl(destination.image);
  document.getElementById("detailImage").alt = destination.name;
  document.getElementById("detailName").textContent = destination.name;
  document.getElementById("detailStars").innerHTML = generateStars(
    destination.rating
  );
  document.getElementById("detailRating").textContent = destination.rating;
  document.getElementById("detailReviews").textContent = destination.reviews;
  document.getElementById("detailDescription").textContent =
    destination.description;
  document.getElementById("detailLocation").textContent = destination.location;
  document.getElementById("detailPrice").textContent = formatPrice(
    destination.price
  );
  document.getElementById("detailCategory").textContent = destination.category;

  // Update page title
  document.title = `${destination.name} - Banjarnegara E-Tourism`;

  // Load facilities jika ada
  let facilities = destination.facilities;

  // Parse facilities if it's a JSON string (from database)
  if (typeof facilities === "string") {
    try {
      facilities = JSON.parse(facilities);
    } catch (e) {
      console.warn("Failed to parse facilities:", facilities);
      facilities = [];
    }
  }

  if (facilities && Array.isArray(facilities) && facilities.length > 0) {
    const facilitiesContainer = document.getElementById("detailFacilities");
    facilitiesContainer.innerHTML = facilities
      .map(
        (facility) => `
          <div class="facility-item">
              <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
              <span>${facility}</span>
          </div>
      `
      )
      .join("");
  }

  // Load hours jika ada
  if (destination.hours) {
    document.getElementById("detailHours").textContent = destination.hours;
  } else {
    document.getElementById("detailHours").textContent = "24 Jam";
  }

  // Load map jika ada - prioritas: maps_link dari database, fallback ke mapUrl
  const mapIframe = document.getElementById("detailMap");
  const mapContainer = document.getElementById("mapContainer");

  if (destination.maps_link) {
    let embedUrl = destination.maps_link;
    const locationName = destination.location || destination.name;

    // Jika format embed, gunakan langsung di iframe (FASTEST - no conversion needed)
    if (embedUrl.includes("/embed?pb=")) {
      // Langsung tampilkan - no delay
      mapIframe.src = embedUrl;
      mapIframe.style.display = "block";
      mapIframe.setAttribute("loading", "eager"); // Force eager loading
      if (mapContainer) mapContainer.style.display = "block";
    }
    // Untuk sharing link atau regular maps URL, fetch dengan timeout pendek
    else if (
      embedUrl.includes("maps.app.goo.gl") ||
      embedUrl.includes("goo.gl/maps") ||
      embedUrl.includes("google.com/maps") ||
      embedUrl.includes("maps.google.com")
    ) {
      // Check cache dulu
      const cacheKey = `map_embed_${btoa(embedUrl)}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        // Use cached embed URL
        const cachedData = JSON.parse(cached);
        mapIframe.src = cachedData.embed_url;
        mapIframe.style.display = "block";
        mapIframe.setAttribute("loading", "eager");
        if (mapContainer) mapContainer.style.display = "block";
      } else {
        // Fetch dengan timeout pendek (500ms)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500);

        fetch(
          `./api/convert-maps-link.php?link=${encodeURIComponent(
            embedUrl
          )}&location=${encodeURIComponent(locationName)}`,
          {
            signal: controller.signal,
          }
        )
          .then((res) => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => {
            if (data.success && data.embed_url) {
              // Cache result
              sessionStorage.setItem(cacheKey, JSON.stringify(data));
              mapIframe.src = data.embed_url;
              mapIframe.style.display = "block";
              mapIframe.setAttribute("loading", "eager");
              if (mapContainer) mapContainer.style.display = "block";
            } else {
              throw new Error(data.error || "Conversion failed");
            }
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            // Show fallback immediately if conversion timeout/fails
            showMapFallback(embedUrl, locationName);
          });
      }
    } else {
      // URL format tidak dikenali, tampilkan button fallback
      showMapFallback(embedUrl, locationName);
    }
  } else if (destination.mapUrl) {
    mapIframe.src = destination.mapUrl;
    mapIframe.style.display = "block";
    mapIframe.setAttribute("loading", "eager");
    if (mapContainer) mapContainer.style.display = "block";
  } else {
    // Sembunyikan map container jika tidak ada maps
    if (mapContainer) mapContainer.style.display = "none";
  }

  // Helper: show button fallback for sharing links (instant display)
  function showMapFallback(embedUrl, locationName) {
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="position: relative; width: 100%; height: 400px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; overflow: hidden;"
             onclick="window.open('${embedUrl}', '_blank')"
             onmouseover="this.style.transform='scale(1.02)'"
             onmouseout="this.style.transform='scale(1)'">
          <div style="text-align: center; color: white; z-index: 2;">
            <div style="font-size: 48px; margin-bottom: 10px;">🗺️</div>
            <h3 style="margin: 0 0 10px 0; font-size: 20px;">Buka Lokasi di Google Maps</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">Klik untuk melihat peta interaktif</p>
            <p style="margin: 0; font-size: 12px; font-weight: bold; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 4px; display: inline-block;">${locationName}</p>
          </div>
        </div>
      `;
      mapContainer.style.display = "block";
    }
  }

  loadDestinationReviews(destId);

  // Setup buttons with proper event handling
  const bookNowBtn = document.getElementById("bookNowBtn");
  const addToItineraryBtn = document.getElementById("addToItineraryBtn");
  const addReviewBtn = document.getElementById("addReviewBtn");

  // Remove existing listeners to avoid duplicates
  bookNowBtn.replaceWith(bookNowBtn.cloneNode(true));
  addToItineraryBtn.replaceWith(addToItineraryBtn.cloneNode(true));
  addReviewBtn.replaceWith(addReviewBtn.cloneNode(true));

  // Re-select after cloning
  const newBookBtn = document.getElementById("bookNowBtn");
  const newItineraryBtn = document.getElementById("addToItineraryBtn");
  const newReviewBtn = document.getElementById("addReviewBtn");

  newBookBtn.addEventListener("click", () => {
    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        destination: destId,
        destinationName: destination.name,
        price: destination.price,
        date: "",
        tickets: 1,
      })
    );
    window.location.href = "booking.php";
  });

  newItineraryBtn.addEventListener("click", () => {
    addToItinerary(destination);
  });

  newReviewBtn.addEventListener("click", () => {
    document.getElementById("reviewModal").style.display = "block";
  });

  // Setup review modal
  setupReviewModal(destId);
}

function loadDestinationReviews(destId) {
  const reviewsList = document.getElementById("reviewsList");

  if (!reviewsList) return;

  // Extract numeric ID untuk API call
  let numId = destId;
  if (destId.startsWith("dest-")) {
    numId = destId.substring(5);
  }

  // Load dari database
  fetch(`./api/get-reviews.php?destination_id=${numId}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success && result.data && result.data.length > 0) {
        displayReviews(result.data);
      } else {
        reviewsList.innerHTML =
          '<div style="padding: 2rem; text-align: center; color: #666;"><p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p></div>';
      }
    })
    .catch((err) => {
      console.error("Error loading reviews:", err);
      reviewsList.innerHTML =
        '<div style="padding: 2rem; text-align: center; color: #666;"><p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p></div>';
    });
}

function displayReviews(reviews) {
  const reviewsList = document.getElementById("reviewsList");

  if (reviews.length === 0) {
    reviewsList.innerHTML =
      '<div style="padding: 2rem; text-align: center; color: #666;"><p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p></div>';
    return;
  }

  reviewsList.innerHTML = reviews
    .map(
      (review) => `
        <div class="review-item" style="padding: 1.5rem; border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem;">
            <div class="review-header" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <div>
                    <strong class="review-author" style="display: block; margin-bottom: 0.5rem;">${
                      review.userName || "Pengunjung"
                    }</strong>
                    <div class="stars" style="font-size: 0.9rem;">${generateStars(
                      review.rating
                    )}</div>
                </div>
                <span class="review-date" style="color: #999; font-size: 0.9rem;">${new Date(
                  review.date || Date.now()
                ).toLocaleDateString("id-ID")}</span>
            </div>
            <p style="color: #666; margin: 0;">${
              review.text || review.review_text || ""
            }</p>
        </div>
    `
    )
    .join("");
}

function setupReviewModal(destId) {
  const modal = document.getElementById("reviewModal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".close");
  const stars = modal.querySelectorAll(".star-rating i");
  const ratingInput = document.getElementById("ratingValue");
  const reviewForm = document.getElementById("reviewForm");
  const reviewText = document.getElementById("reviewText");

  // Close modal handlers
  closeBtn.onclick = () => {
    modal.style.display = "none";
    reviewForm.reset();
    ratingInput.value = "";
    stars.forEach((s) => {
      s.classList.remove("fas", "active");
      s.classList.add("far");
    });
  };

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      reviewForm.reset();
      ratingInput.value = "";
      stars.forEach((s) => {
        s.classList.remove("fas", "active");
        s.classList.add("far");
      });
    }
  };

  // Star rating click handlers
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-rating");
      ratingInput.value = rating;

      stars.forEach((s) => {
        const sRating = s.getAttribute("data-rating");
        if (sRating <= rating) {
          s.classList.remove("far");
          s.classList.add("fas");
          s.style.color = "#FFB800";
        } else {
          s.classList.remove("fas");
          s.classList.add("far");
          s.style.color = "#ccc";
        }
      });
    });

    // Add hover effect
    star.addEventListener("mouseover", () => {
      const rating = star.getAttribute("data-rating");
      stars.forEach((s) => {
        const sRating = s.getAttribute("data-rating");
        if (sRating <= rating) {
          s.style.color = "#FFB800";
        } else {
          s.style.color = "#ccc";
        }
      });
    });
  });

  // Reset color on mouse leave
  const starRatingDiv = modal.querySelector(".star-rating");
  if (starRatingDiv) {
    starRatingDiv.addEventListener("mouseleave", () => {
      if (!ratingInput.value) {
        stars.forEach((s) => {
          s.style.color = "#ccc";
        });
      }
    });
  }

  // Submit review
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = ratingInput.value;
    const text = reviewText.value.trim();

    if (!rating) {
      alert("Mohon berikan rating!");
      return;
    }

    if (!text) {
      alert("Mohon tulis ulasan Anda!");
      return;
    }

    if (text.length < 10) {
      alert("Ulasan minimal 10 karakter!");
      return;
    }

    // Show loading state
    const submitBtn = reviewForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";

    try {
      // Check if user is logged in
      const response = await fetch("/api/v1/check-session.php");
      const authData = await response.json();

      if (!authData.authenticated || !authData.user) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "auth.php";
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      const currentUser = authData.user;

      // Extract numeric ID untuk API call
      let numId = destId;
      if (destId.startsWith("dest-")) {
        numId = destId.substring(5);
      }

      // Save review to database
      const saveResponse = await fetch("/api/v1/save-review.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination_id: numId,
          rating: parseInt(rating),
          review_text: text,
        }),
      });

      const result = await saveResponse.json();

      if (result.success) {
        alert("Terima kasih atas ulasan Anda!");
        modal.style.display = "none";
        reviewForm.reset();
        ratingInput.value = "";

        // Reset stars display
        stars.forEach((s) => {
          s.classList.remove("fas", "active");
          s.classList.add("far");
          s.style.color = "#ccc";
        });

        // Reload reviews
        loadDestinationReviews(destId);
      } else {
        alert("Error: " + (result.message || "Gagal menyimpan ulasan"));
      }
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Gagal menyimpan ulasan. Silakan coba lagi.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function addToItinerary(destination) {
  // Verify with server session instead of localStorage
  const checkUserAuth = async () => {
    try {
      const response = await fetch("/api/v1/check-session.php");
      const authData = await response.json();

      if (!authData.authenticated || !authData.user) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "auth.php";
        return false;
      }

      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      alert("Gagal memverifikasi login. Silakan coba lagi.");
      return false;
    }
  };

  checkUserAuth().then((isAuthenticated) => {
    if (!isAuthenticated) return;

    const tempItinerary = JSON.parse(
      sessionStorage.getItem("tempItinerary") || "[]"
    );
    tempItinerary.push(destination);
    sessionStorage.setItem("tempItinerary", JSON.stringify(tempItinerary));

    alert("Destinasi berhasil ditambahkan ke itinerary!");
  });
}
