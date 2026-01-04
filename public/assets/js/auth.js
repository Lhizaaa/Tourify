// Authentication module with PHP session integration
let currentUser = null;

// Initialize auth by checking server session
export async function initAuth() {
  try {
    const response = await fetch("/api/v1/check-session.php");
    const data = await response.json();
    if (data.authenticated) {
      currentUser = data.user;
      return true;
    }
    currentUser = null;
    return false;
  } catch (error) {
    console.error("Error checking session:", error);
    currentUser = null;
    return false;
  }
}

// Check if user is authenticated
export function checkAuth() {
  return currentUser !== null;
}

// Update navigation based on auth status
export function updateNavigation() {
  const authLink = document.getElementById("authLink");
  const logoutLink = document.getElementById("logoutLink");
  const profileLink = document.getElementById("profileLink");

  if (checkAuth()) {
    if (authLink) authLink.style.display = "none";
    if (logoutLink) {
      logoutLink.style.display = "block";
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
    if (profileLink) profileLink.style.display = "block";
  } else {
    if (authLink) authLink.style.display = "block";
    if (logoutLink) logoutLink.style.display = "none";
    if (profileLink) profileLink.style.display = "none";
  }
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Login function - submits to PHP backend
export function login(email, password) {
  // This is now handled by login.php form submission
  // Keep for reference but actual login happens server-side
  return { success: true, message: "Use PHP form submission" };
}

// Register function - submits to PHP backend
export function register(name, email, phone, password) {
  // This is now handled by register.php form submission
  // Keep for reference but actual registration happens server-side
  return { success: true, message: "Use PHP form submission" };
}

// Google OAuth redirect
export function loginWithGoogle() {
  // Get Google OAuth URL from server
  fetch("/api/v1/get-google-oauth-url.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(
          "Error: Google OAuth tidak dikonfigurasi. Silakan hubungi administrator."
        );
      }
    })
    .catch((error) => {
      console.error("Error getting Google OAuth URL:", error);
      alert("Error: Tidak dapat menginisialisasi Google login.");
    });
}

// Logout function - calls PHP logout handler
export function logout() {
  currentUser = null;
  window.location.href = "logout.php";
}

// Auth page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Check if on auth page
  if (!document.getElementById("loginForm")) return;

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const showRegisterBtn = document.getElementById("showRegister");
  const showLoginBtn = document.getElementById("showLogin");
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const googleRegisterBtn = document.getElementById("googleRegisterBtn");
  const authRight = document.querySelector(".auth-right");

  // Function to scroll to top with smooth animation
  function scrollToTop() {
    if (authRight) {
      authRight.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  // Toggle between login and register with scroll animation
  showRegisterBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("active");
    scrollToTop();
    setTimeout(() => {
      registerForm.classList.add("active");
    }, 100);
  });

  showLoginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.remove("active");
    scrollToTop();
    setTimeout(() => {
      loginForm.classList.add("active");
    }, 100);
  });

  // Handle login form - PHP will process it
  // Form should submit to login.php with method POST

  // Handle registration form - PHP will process it
  // Form should submit to register.php with method POST

  // Handle Google login
  googleLoginBtn?.addEventListener("click", () => {
    const result = loginWithGoogle();
    if (result.success) {
      alert("Login dengan Google berhasil!");
      window.location.href = "index.php";
    }
  });

  googleRegisterBtn?.addEventListener("click", () => {
    const result = loginWithGoogle();
    if (result.success) {
      alert("Registrasi dengan Google berhasil!");
      window.location.href = "index.php";
    }
  });

  // Add scroll behavior enhancements
  if (authRight) {
    // Smooth scroll listener for form visibility
    authRight.addEventListener("scroll", () => {
      const scrollPercentage = (authRight.scrollTop / (authRight.scrollHeight - authRight.clientHeight)) * 100;
      
      // Add visual feedback when scrolling
      if (authRight.scrollTop > 10) {
        authRight.style.boxShadow = "inset 0 10px 10px -10px rgba(0,0,0,0.1)";
      } else {
        authRight.style.boxShadow = "none";
      }
    });

    // Keyboard navigation support
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Can add escape key handling if needed
      }
      if (e.key === "Enter" && e.target.matches(".auth-form input")) {
        // Auto scroll on input focus
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    });

    // Handle input focus to scroll into view
    const inputs = document.querySelectorAll(".auth-form input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      });
    });
  }
});

// Profile page functionality
if (window.location.pathname.includes("profile.php")) {
  document.addEventListener("DOMContentLoaded", async function () {
    // Check auth status from server
    const isAuth = await initAuth();
    if (!isAuth) {
      window.location.href = "auth.php?login=required";
      return;
    }

    loadProfileData();
    setupProfileTabs();
    setupProfileForms();
  });
}

function loadProfileData() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("settingsName").value = user.name;
  document.getElementById("settingsEmail").value = user.email;
  document.getElementById("settingsPhone").value = user.phone || "";

  loadBookings();
  loadItineraries();
  loadReviews();
}

function setupProfileTabs() {
  const tabs = document.querySelectorAll(".profile-nav-item");
  const tabContents = document.querySelectorAll(".profile-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });
}

function setupProfileForms() {
  const settingsForm = document.getElementById("settingsForm");
  const passwordForm = document.getElementById("passwordForm");

  settingsForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("settingsName").value;
    const email = document.getElementById("settingsEmail").value;
    const phone = document.getElementById("settingsPhone").value;

    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    alert("Profil berhasil diperbarui!");
    loadProfileData();
  });

  passwordForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Password baru tidak cocok!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    alert("Password berhasil diubah!");
    passwordForm.reset();
  });
}

function loadBookings() {
  const bookingsList = document.getElementById("bookingsList");

  // Fetch user's bookings from API
  fetch("/api/v1/get-user-bookings.php")
    .then((response) => {
      console.log("Load bookings response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("Load bookings data:", data);
      if (data.success && data.data && data.data.length > 0) {
        bookingsList.innerHTML = data.data
          .map((booking) => {
            const bookingDate = new Date(
              booking.booking_date
            ).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const statusDisplay = {
              confirmed: { text: "Terkonfirmasi", color: "#4CAF50" },
              pending: { text: "Menunggu", color: "#FFC107" },
              cancelled: { text: "Dibatalkan", color: "#f44336" },
            };

            const statusInfo = statusDisplay[booking.status.toLowerCase()] || {
              text: booking.status,
              color: "#999",
            };

            return `
            <div style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 5px; display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="flex: 1;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${
                  booking.destination_name || "Destinasi"
                }</h4>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">
                  <i class="fas fa-map-marker-alt" style="color: #ff6b6b; margin-right: 5px;"></i>
                  ${booking.destination_location || "-"}
                </p>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">
                  <i class="fas fa-calendar-alt" style="color: #4ECDC4; margin-right: 5px;"></i>
                  ${bookingDate}
                </p>
                <p style="margin: 5px 0; color: #666; font-size: 0.9em;">
                  <i class="fas fa-users" style="color: #95E1D3; margin-right: 5px;"></i>
                  ${booking.ticket_quantity} tiket
                </p>
                ${
                  booking.guide_name
                    ? `
                  <p style="margin: 5px 0; color: #666; font-size: 0.9em;">
                    <i class="fas fa-user-tie" style="color: #C9B1FF; margin-right: 5px;"></i>
                    Pemandu: ${booking.guide_name}
                  </p>
                `
                    : ""
                }
                <p style="margin: 10px 0 0 0; color: #333; font-weight: bold; font-size: 1.1em;">
                  Total: Rp ${parseInt(booking.total_price).toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>
              <span style="background-color: ${
                statusInfo.color
              }; color: white; padding: 8px 12px; border-radius: 4px; font-size: 0.85em; font-weight: bold; white-space: nowrap; margin-left: 15px;">
                ${statusInfo.text}
              </span>
            </div>
          `;
          })
          .join("");
      } else {
        console.log("No bookings found or error:", data.message);
        bookingsList.innerHTML =
          '<p style="text-align: center; padding: 2rem; color: #999;">Belum ada pemesanan</p>';
      }
    })
    .catch((error) => {
      console.error("Error loading bookings:", error);
      bookingsList.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #999;">Belum ada pemesanan</p>';
    });
}

function loadItineraries() {
  const itinerariesList = document.getElementById("itinerariesList");

  // Show loading state
  itinerariesList.innerHTML = "<p>Memuat itinerary...</p>";

  // Load from database
  fetch("/api/v1/itinerary.php?action=list")
    .then((response) => response.json())
    .then((result) => {
      if (result.success && result.data && result.data.length > 0) {
        itinerariesList.innerHTML = result.data
          .map(
            (itinerary) => `
                    <div class="booking-item">
                        <div>
                            <h4>${itinerary.title}</h4>
                            <p><i class="fas fa-calendar"></i> ${itinerary.start_date} - ${itinerary.end_date}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${itinerary.destination_count} destinasi</p>
                        </div>
                        <button class="btn-primary" onclick="window.location.href='itinerary.php?id=${itinerary.itinerary_id}'">Lihat</button>
                        <button class="btn-danger" onclick="deleteItinerary(${itinerary.itinerary_id})">Hapus</button>
                    </div>
                `
          )
          .join("");
      } else {
        // Fallback to localStorage
        loadItinerariesFromLocalStorage();
      }
    })
    .catch((error) => {
      console.error("Error loading itineraries:", error);
      // Fallback to localStorage
      loadItinerariesFromLocalStorage();
    });
}

function loadItinerariesFromLocalStorage() {
  const itinerariesList = document.getElementById("itinerariesList");
  const itineraries = JSON.parse(localStorage.getItem("itineraries") || "[]");
  const userItineraries = itineraries.filter(
    (i) => i.userId === currentUser.id
  );

  if (userItineraries.length === 0) {
    itinerariesList.innerHTML = "<p>Belum ada itinerary tersimpan</p>";
    return;
  }

  itinerariesList.innerHTML = userItineraries
    .map(
      (itinerary) => `
        <div class="booking-item">
            <div>
                <h4>${itinerary.name}</h4>
                <p><i class="fas fa-calendar"></i> ${itinerary.startDate} - ${itinerary.days} hari</p>
                <p><i class="fas fa-map-marker-alt"></i> ${itinerary.destinations.length} destinasi</p>
            </div>
            <button class="btn-primary" onclick="window.location.href='itinerary.php?id=${itinerary.id}'">Lihat</button>
        </div>
    `
    )
    .join("");
}

function deleteItinerary(itineraryId) {
  if (!confirm("Apakah Anda yakin ingin menghapus itinerary ini?")) {
    return;
  }

  fetch(`./api/itinerary.php?action=delete&id=${itineraryId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        alert("Itinerary berhasil dihapus!");
        loadItineraries();
      } else {
        alert(
          "Gagal menghapus itinerary: " + (result.message || "Unknown error")
        );
      }
    })
    .catch((error) => {
      console.error("Error deleting itinerary:", error);
      alert("Gagal menghapus itinerary!");
    });
}

function loadReviews() {
  const reviewsList = document.getElementById("reviewsList");

  // Fetch user's reviews from API
  fetch("/api/v1/get-user-reviews.php")
    .then((response) => {
      console.log("Load reviews response status:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("Load reviews data:", data);
      if (data.success && data.data && data.data.length > 0) {
        reviewsList.innerHTML = data.data
          .map(
            (review) => `
          <div class="review-item" style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
            <div class="review-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <div>
                <strong style="font-size: 1.1em;">${
                  review.destination_name || "Destinasi"
                }</strong>
                <div class="stars" style="color: #ffc107; margin-top: 5px;">
                  ${generateStars(review.rating)}
                  <span style="color: #333; margin-left: 10px;">(${
                    review.rating
                  }/5)</span>
                </div>
              </div>
            </div>
            <p style="margin: 10px 0; color: #555; line-height: 1.6;">${
              review.review_text
            }</p>
            <span class="review-date" style="color: #999; font-size: 0.9em;">
              ${new Date(review.date).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        `
          )
          .join("");
      } else {
        console.log("No reviews found or error:", data.message);
        reviewsList.innerHTML =
          '<p style="text-align: center; padding: 2rem; color: #999;">Belum ada ulasan</p>';
      }
    })
    .catch((error) => {
      console.error("Error loading reviews:", error);
      reviewsList.innerHTML =
        '<p style="text-align: center; padding: 2rem; color: #999;">Belum ada ulasan</p>';
    });
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  const emptyStars = 5 - fullStars;
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  return stars;
}
