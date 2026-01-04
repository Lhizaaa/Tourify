// Itinerary functionality
import {
  getDestinations,
  getDestinationById,
  loadDestinationsFromDatabase,
} from "./destinations.js";
import { formatPrice } from "./utils.js";

let currentItinerary = {
  id: null,
  name: "",
  startDate: "",
  days: 1,
  destinations: [],
  userId: null,
};

let itineraryDays = [];
let allDestinations = []; // Cache destinations from database

// Helper function to get destination from cache with fallback
function getDestinationWithFallback(destId) {
  // Try to find in cached destinations from database first
  if (allDestinations.length > 0) {
    const dest = allDestinations.find((d) => d.id === destId);
    if (dest) return dest;
  }
  // Fallback to original function
  return getDestinationById(destId);
}

// Save current itinerary state to localStorage
function saveItineraryStateToLocalStorage() {
  const state = {
    name:
      document.getElementById("itineraryName")?.value || currentItinerary.name,
    startDate:
      document.getElementById("itineraryStartDate")?.value ||
      currentItinerary.startDate,
    days:
      parseInt(document.getElementById("itineraryDays")?.value) ||
      currentItinerary.days,
    itineraryDays: itineraryDays,
    destinations: currentItinerary.destinations,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem("itineraryDraftState", JSON.stringify(state));
  console.log("Itinerary draft state saved");
}

// Load itinerary state from localStorage
function loadItineraryStateFromLocalStorage() {
  const saved = localStorage.getItem("itineraryDraftState");
  if (!saved) return false;

  try {
    const state = JSON.parse(saved);

    // Only restore if data exists
    if (state.itineraryDays && state.itineraryDays.length > 0) {
      currentItinerary.name = state.name;
      currentItinerary.startDate = state.startDate;
      currentItinerary.days = state.days;
      currentItinerary.destinations = state.destinations || [];
      itineraryDays = state.itineraryDays;

      // Restore form values
      const nameInput = document.getElementById("itineraryName");
      const dateInput = document.getElementById("itineraryStartDate");
      const daysInput = document.getElementById("itineraryDays");

      if (nameInput) nameInput.value = state.name;
      if (dateInput) dateInput.value = state.startDate;
      if (daysInput) daysInput.value = state.days;

      return true;
    }
  } catch (e) {
    console.error("Error loading itinerary state:", e);
  }
  return false;
}

// Clear itinerary draft state
function clearItineraryDraftState() {
  localStorage.removeItem("itineraryDraftState");
  console.log("Itinerary draft state cleared");
}

document.addEventListener("DOMContentLoaded", async function () {
  if (!window.location.pathname.includes("itinerary.php")) return;

  // Check if user is logged in via PHP session
  try {
    const response = await fetch("/api/v1/check-session.php");
    const data = await response.json();

    if (!data.authenticated) {
      alert("Silakan login terlebih dahulu!");
      window.location.href = "auth.php";
      return;
    }

    currentItinerary.userId = data.user.id;

    // Load destinations from database first
    allDestinations = await loadDestinationsFromDatabase();
    console.log("Loaded destinations for itinerary:", allDestinations.length);

    initializeItinerary();
    setupEventListeners();
    await loadAvailableDestinations();
  } catch (error) {
    console.error("Error checking session:", error);
    alert("Silakan login terlebih dahulu!");
    window.location.href = "auth.php";
  }
});

function initializeItinerary() {
  // Load from URL if editing existing itinerary
  const urlParams = new URLSearchParams(window.location.search);
  const itineraryId = urlParams.get("id");

  if (itineraryId) {
    loadItineraryById(itineraryId);
  } else {
    // Try to restore draft state from localStorage first
    const restored = loadItineraryStateFromLocalStorage();

    if (!restored) {
      // Load from temp session if coming from destinations page
      const tempItinerary = JSON.parse(
        sessionStorage.getItem("tempItinerary") || "[]"
      );
      if (tempItinerary.length > 0) {
        itineraryDays = [
          {
            day: 1,
            destinations: tempItinerary,
            title: "Hari 1",
          },
        ];
        currentItinerary.destinations = tempItinerary;
        currentItinerary.days = 1;
        updateItinerarySummary();
        displayItineraryDays();
        sessionStorage.removeItem("tempItinerary");
      }
    } else {
      // Restored from localStorage - display the data
      updateItinerarySummary();
      displayItineraryDays();

      // Hide empty state
      const emptyState = document.getElementById("emptyState");
      if (emptyState && itineraryDays.length > 0) {
        emptyState.style.display = "none";
      }
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("itineraryStartDate").min = today;
  if (!document.getElementById("itineraryStartDate").value) {
    document.getElementById("itineraryStartDate").value = today;
  }
}

function setupEventListeners() {
  // Generate days button
  const generateDaysBtn = document.getElementById("generateDays");
  if (generateDaysBtn) {
    generateDaysBtn.addEventListener("click", generateDays);
  }

  // Clear draft button
  const clearDraftBtn = document.getElementById("clearDraft");
  if (clearDraftBtn) {
    clearDraftBtn.addEventListener("click", () => {
      if (
        confirm(
          "Apakah Anda yakin ingin membuat itinerary baru? Data saat ini akan dihapus."
        )
      ) {
        clearItineraryDraftState();
        // Reset form
        currentItinerary = {
          id: null,
          name: "",
          startDate: "",
          days: 1,
          destinations: [],
          userId: currentItinerary.userId,
        };
        itineraryDays = [];

        // Reset form inputs
        document.getElementById("itineraryName").value = "Perjalanan Saya";
        const today = new Date().toISOString().split("T")[0];
        document.getElementById("itineraryStartDate").value = today;
        document.getElementById("itineraryDays").value = 1;

        // Clear display
        const container = document.getElementById("itineraryDaysContainer");
        if (container) container.innerHTML = "";

        updateItinerarySummary();

        // Show empty state
        const emptyState = document.getElementById("emptyState");
        if (emptyState) {
          emptyState.style.display = "block";
        }

        alert("Draft itinerary telah dihapus. Mulai buat itinerary baru!");
      }
    });
  }

  // Save itinerary
  const saveBtn = document.getElementById("saveItinerary");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveItinerary);
  }

  // Export PDF
  const exportBtn = document.getElementById("exportItinerary");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportItineraryPDF);
  }

  // Share itinerary
  const shareBtn = document.getElementById("shareItinerary");
  if (shareBtn) {
    shareBtn.addEventListener("click", openShareModal);
  }

  // Search destinations
  const searchInput = document.getElementById("searchItineraryDest");
  if (searchInput) {
    searchInput.addEventListener("input", searchDestinations);
  }

  // Auto-save form inputs
  const nameInput = document.getElementById("itineraryName");
  const dateInput = document.getElementById("itineraryStartDate");
  const daysInput = document.getElementById("itineraryDays");

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      currentItinerary.name = nameInput.value;
      saveItineraryStateToLocalStorage();
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      currentItinerary.startDate = dateInput.value;
      saveItineraryStateToLocalStorage();
    });
  }

  if (daysInput) {
    daysInput.addEventListener("change", () => {
      currentItinerary.days = parseInt(daysInput.value) || 1;
      saveItineraryStateToLocalStorage();
    });
  }

  // Payment method radio buttons
  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener("change", handlePaymentMethodChange);
  });

  // Modal close button
  const modal = document.getElementById("shareModal");
  const closeBtn = document.querySelector("#shareModal .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  if (modal) {
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  // Share buttons
  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", handleShare);
  });

  // Copy link button
  const copyLinkBtn = document.getElementById("copyLink");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", copyShareLink);
  }
}

async function loadAvailableDestinations() {
  const destList = document.getElementById("availableDestList");

  // Use cached destinations from database, or fall back to getDestinations
  const destinations =
    allDestinations.length > 0 ? allDestinations : getDestinations();

  // Update day selector
  const daySelector = document.getElementById("selectDay");
  if (daySelector && itineraryDays.length > 0) {
    daySelector.innerHTML = itineraryDays
      .map((day) => `<option value="${day.day - 1}">Hari ${day.day}</option>`)
      .join("");
  }

  destList.innerHTML = destinations
    .map(
      (dest) => `
        <div class="dest-item" draggable="true" data-dest-id="${dest.id}">
            <div class="dest-item-header">
                <h4>${dest.name}</h4>
                <span class="dest-price">${formatPrice(dest.price)}</span>
            </div>
            <p class="dest-location"><i class="fas fa-map-marker-alt"></i> ${
              dest.location
            }</p>
            <p class="dest-duration"><i class="fas fa-clock"></i> ~${
              Math.floor(Math.random() * 2) + 2
            } jam</p>
            <button class="btn-small btn-primary" data-dest-id="${
              dest.id
            }" onclick="window.addDestinationToDay(event)">
                <i class="fas fa-plus"></i> Tambah
            </button>
        </div>
    `
    )
    .join("");

  // Setup drag and drop
  setupDragAndDrop();
}

function generateDays() {
  const name =
    document.getElementById("itineraryName").value || "Perjalanan Saya";
  const startDate = document.getElementById("itineraryStartDate").value;
  const days = parseInt(document.getElementById("itineraryDays").value) || 1;

  if (!startDate) {
    alert("Mohon pilih tanggal mulai!");
    return;
  }

  currentItinerary.name = name;
  currentItinerary.startDate = startDate;
  currentItinerary.days = days;

  // Generate day structure
  itineraryDays = [];
  for (let i = 1; i <= days; i++) {
    itineraryDays.push({
      day: i,
      destinations: [],
      title: `Hari ${i}`,
      notes: "",
    });
  }

  displayItineraryDays();
  updateItinerarySummary();

  // Reload available destinations with fresh event listeners
  loadAvailableDestinations();

  // Save state to localStorage
  saveItineraryStateToLocalStorage();

  // Hide empty state
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

function displayItineraryDays() {
  const container = document.getElementById("itineraryDaysContainer");

  if (itineraryDays.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = itineraryDays
    .map(
      (dayObj) => `
        <div class="day-card" data-day="${dayObj.day}">
            <div class="day-header">
                <h3>${dayObj.title}</h3>
                <span class="day-date">${getDateForDay(dayObj.day)}</span>
            </div>
            
            <div class="day-destinations" data-day-index="${dayObj.day - 1}">
                ${dayObj.destinations
                  .map((destId, idx) => {
                    const dest = getDestinationWithFallback(destId);
                    if (!dest) return "";
                    return `
                        <div class="destination-item" draggable="true" data-dest-id="${destId}" data-day="${
                      dayObj.day
                    }">
                            <div class="dest-item-info">
                                <h5>${dest.name}</h5>
                                <p><i class="fas fa-map-marker-alt"></i> ${
                                  dest.location
                                }</p>
                                <span class="time-badge">~${
                                  Math.floor(Math.random() * 2) + 2
                                } jam</span>
                            </div>
                            <div class="dest-item-actions">
                                <span class="time-input">
                                    <label>Waktu:</label>
                                    <input type="time" class="visit-time" data-idx="${idx}" value="09:00">
                                </span>
                                <button class="btn-small btn-danger" onclick="removeDestinationFromDay(${
                                  dayObj.day - 1
                                }, ${idx})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
            
            <div class="day-notes">
                <textarea placeholder="Catatan untuk hari ${
                  dayObj.day
                }..." class="day-notes-input" data-day-index="${
        dayObj.day - 1
      }">${dayObj.notes}</textarea>
            </div>
            
            <div class="day-summary">
                <span><i class="fas fa-map-marker-alt"></i> ${
                  dayObj.destinations.length
                } destinasi</span>
                <span><i class="fas fa-dollar-sign"></i> ${calculateDayTotal(
                  dayObj
                )}</span>
            </div>
        </div>
    `
    )
    .join("");

  // Setup textarea for notes
  document.querySelectorAll(".day-notes-input").forEach((textarea) => {
    textarea.addEventListener("change", (e) => {
      const dayIndex = parseInt(e.target.getAttribute("data-day-index"));
      itineraryDays[dayIndex].notes = e.target.value;

      // Save state to localStorage
      saveItineraryStateToLocalStorage();
    });
  });
}

function getDateForDay(dayNumber) {
  if (!currentItinerary.startDate) return "";
  const startDate = new Date(currentItinerary.startDate);
  const date = new Date(startDate);
  date.setDate(date.getDate() + (dayNumber - 1));
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function calculateDayTotal(dayObj) {
  const total = dayObj.destinations.reduce((sum, destId) => {
    const dest = getDestinationWithFallback(destId);
    return sum + (dest ? dest.price : 0);
  }, 0);
  return formatPrice(total);
}

function addDestinationToDay(event) {
  event.preventDefault();
  event.stopPropagation();

  const button = event.target.closest("button");
  const destId = button.getAttribute("data-dest-id");
  const daySelector = document.getElementById("selectDay");

  if (itineraryDays.length === 0) {
    alert("Mohon generate hari terlebih dahulu!");
    return;
  }

  // Determine which day to add to
  let dayIndex = 0; // default to first day
  if (daySelector && daySelector.value !== "") {
    dayIndex = parseInt(daySelector.value);
  } else if (itineraryDays.length === 1) {
    dayIndex = 0;
  } else {
    alert("Mohon pilih hari untuk menambahkan destinasi!");
    return;
  }

  // Validate day index
  if (dayIndex < 0 || dayIndex >= itineraryDays.length) {
    alert("Hari tidak valid!");
    return;
  }

  // Add to overall destinations list
  const destination = getDestinationWithFallback(destId);
  if (!destination) {
    alert("Destinasi tidak ditemukan!");
    return;
  }

  if (!currentItinerary.destinations.includes(destId)) {
    currentItinerary.destinations.push(destId);
  }

  // Add to selected day if not already there
  if (!itineraryDays[dayIndex].destinations.includes(destId)) {
    itineraryDays[dayIndex].destinations.push(destId);
  } else {
    alert("Destinasi sudah ada di hari ini!");
    return;
  }

  displayItineraryDays();
  updateItinerarySummary();

  // Save state to localStorage
  saveItineraryStateToLocalStorage();

  // Show feedback
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> Ditambahkan';
  button.disabled = true;
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.disabled = false;
  }, 1500);
}

window.addDestinationToDay = addDestinationToDay;

function removeDestinationFromDay(dayIndex, destIndex) {
  if (itineraryDays[dayIndex]) {
    const destId = itineraryDays[dayIndex].destinations[destIndex];
    itineraryDays[dayIndex].destinations.splice(destIndex, 1);

    // Update overall destinations list
    const stillExists = itineraryDays.some((day) =>
      day.destinations.includes(destId)
    );
    if (!stillExists) {
      const idx = currentItinerary.destinations.indexOf(destId);
      if (idx > -1) {
        currentItinerary.destinations.splice(idx, 1);
      }
    }

    displayItineraryDays();
    updateItinerarySummary();

    // Save state to localStorage
    saveItineraryStateToLocalStorage();
  }
}

window.removeDestinationFromDay = removeDestinationFromDay;

function searchDestinations(e) {
  const query = e.target.value.toLowerCase();
  const destItems = document.querySelectorAll(".dest-item");

  destItems.forEach((item) => {
    const name = item.querySelector("h4").textContent.toLowerCase();
    const location = item
      .querySelector(".dest-location")
      .textContent.toLowerCase();

    if (name.includes(query) || location.includes(query)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

function updateItinerarySummary() {
  const totalDestinations = currentItinerary.destinations.length;
  const totalDuration = calculateTotalDuration();
  const totalCost = calculateTotalCost();

  document.getElementById("totalDestinations").textContent = totalDestinations;
  document.getElementById("totalDuration").textContent = totalDuration;
  document.getElementById("totalCost").textContent = formatPrice(totalCost);
}

function calculateTotalDuration() {
  // Assuming 2-3 hours per destination on average
  return (currentItinerary.destinations.length * 2.5).toFixed(1);
}

function calculateTotalCost() {
  return currentItinerary.destinations.reduce((sum, destId) => {
    const dest = getDestinationWithFallback(destId);
    return sum + (dest ? dest.price : 0);
  }, 0);
}

function setupDragAndDrop() {
  // This is a simplified version. Full drag and drop would require more complex event handling
  console.log("Drag and drop setup complete");
}

function saveItinerary() {
  if (currentItinerary.destinations.length === 0) {
    alert("Mohon tambahkan minimal satu destinasi!");
    return;
  }

  if (!currentItinerary.startDate) {
    alert("Mohon pilih tanggal mulai!");
    return;
  }

  // Save notes from textareas
  document.querySelectorAll(".day-notes-input").forEach((textarea) => {
    const dayIndex = parseInt(textarea.getAttribute("data-day-index"));
    if (itineraryDays[dayIndex]) {
      itineraryDays[dayIndex].notes = textarea.value;
    }
  });

  const itineraryData = {
    id: currentItinerary.id || null,
    userId: currentItinerary.userId,
    name: currentItinerary.name,
    startDate: currentItinerary.startDate,
    days: currentItinerary.days,
    destinations: currentItinerary.destinations,
    itineraryDays: itineraryDays,
    totalCost: calculateTotalCost(),
  };

  // Save to database via API
  fetch("/api/v1/itinerary.php?action=save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itineraryData),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        currentItinerary.id = result.id;
        alert("Itinerary berhasil disimpan!");

        // Clear draft state after successful save
        clearItineraryDraftState();

        // Also save to localStorage as backup
        const itineraries = JSON.parse(
          localStorage.getItem("itineraries") || "[]"
        );
        itineraryData.id = result.id;
        const existingIndex = itineraries.findIndex((i) => i.id === result.id);
        if (existingIndex >= 0) {
          itineraries[existingIndex] = itineraryData;
        } else {
          itineraries.push(itineraryData);
        }
        localStorage.setItem("itineraries", JSON.stringify(itineraries));
      } else {
        alert(
          "Gagal menyimpan itinerary: " + (result.message || "Unknown error")
        );
      }
    })
    .catch((error) => {
      console.error("Error saving itinerary:", error);
      alert("Gagal menyimpan itinerary!");
    });
}

function loadItineraryById(itineraryId) {
  // Try to load from database first
  fetch(`./api/itinerary.php?action=detail&id=${itineraryId}`)
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        const itinerary = result.data;
        currentItinerary = {
          id: itinerary.id,
          name: itinerary.name,
          startDate: itinerary.startDate,
          days: itinerary.days,
          destinations: itinerary.destinations || [],
          userId: currentItinerary.userId,
        };

        // Build itineraryDays from API response
        itineraryDays = itinerary.days || [];

        document.getElementById("itineraryName").value = itinerary.name;
        document.getElementById("itineraryStartDate").value =
          itinerary.startDate;
        document.getElementById("itineraryDays").value = itinerary.days.length;

        displayItineraryDays();
        updateItinerarySummary();

        // Hide empty state
        const emptyState = document.getElementById("emptyState");
        if (emptyState) {
          emptyState.style.display = "none";
        }
      } else {
        // Fallback to localStorage
        loadItineraryFromLocalStorage(itineraryId);
      }
    })
    .catch((error) => {
      console.error("Error loading itinerary from database:", error);
      // Fallback to localStorage
      loadItineraryFromLocalStorage(itineraryId);
    });
}

function loadItineraryFromLocalStorage(itineraryId) {
  const itineraries = JSON.parse(localStorage.getItem("itineraries") || "[]");
  const itinerary = itineraries.find((i) => i.id === itineraryId);

  if (!itinerary) {
    alert("Itinerary tidak ditemukan!");
    window.location.href = "profile.php";
    return;
  }

  currentItinerary = {
    id: itinerary.id,
    name: itinerary.name,
    startDate: itinerary.startDate,
    days: itinerary.days,
    destinations: itinerary.destinations,
    userId: itinerary.userId,
  };

  itineraryDays = itinerary.itineraryDays || [];

  document.getElementById("itineraryName").value = itinerary.name;
  document.getElementById("itineraryStartDate").value = itinerary.startDate;
  document.getElementById("itineraryDays").value = itinerary.days;

  displayItineraryDays();
  updateItinerarySummary();

  // Hide empty state
  const emptyState = document.getElementById("emptyState");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

function exportItineraryPDF() {
  if (currentItinerary.destinations.length === 0) {
    alert("Mohon tambahkan destinasi terlebih dahulu!");
    return;
  }

  // Create a simple text-based export (in production, use a proper PDF library)
  let content = `
=====================================
ITINERARY: ${currentItinerary.name}
=====================================

Tanggal Mulai: ${new Date(currentItinerary.startDate).toLocaleDateString(
    "id-ID"
  )}
Durasi: ${currentItinerary.days} hari
Total Destinasi: ${currentItinerary.destinations.length}
Estimasi Biaya: ${formatPrice(calculateTotalCost())}

=====================================
DETAIL PERJALANAN
=====================================
`;

  itineraryDays.forEach((day) => {
    content += `
${day.title} (${getDateForDay(day.day)})
${"-".repeat(40)}
`;
    day.destinations.forEach((destId, idx) => {
      const dest = getDestinationWithFallback(destId);
      if (dest) {
        content += `
${idx + 1}. ${dest.name}
   Lokasi: ${dest.location}
   Harga: ${formatPrice(dest.price)}
   Durasi: ~${Math.floor(Math.random() * 2) + 2} jam
`;
      }
    });

    if (day.notes) {
      content += `
Catatan: ${day.notes}`;
    }

    content += `
Total Hari ${day.day}: ${calculateDayTotal(day)}
`;
  });

  content += `
=====================================
Created: ${new Date().toLocaleString("id-ID")}
Generated by Tourify
=====================================
`;

  // Download as text file
  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `itinerary-${currentItinerary.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  alert("Itinerary berhasil diunduh!");
}

function openShareModal() {
  if (currentItinerary.destinations.length === 0) {
    alert("Mohon simpan itinerary terlebih dahulu!");
    return;
  }

  const modal = document.getElementById("shareModal");
  const shareLink = document.getElementById("shareLink");

  // Generate shareable link
  const baseUrl =
    window.location.origin +
    window.location.pathname.split("/").slice(0, -1).join("/");
  const link = `${baseUrl}/itinerary.php?id=${currentItinerary.id}`;
  shareLink.value = link;

  modal.style.display = "block";
}

function handleShare(e) {
  const platform = e.target.closest(".share-btn").getAttribute("data-platform");
  const link = document.getElementById("shareLink").value;
  const text = `Lihat itinerary perjalanan saya: ${currentItinerary.name}`;

  switch (platform) {
    case "whatsapp":
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text + " " + link)}`
      );
      break;
    case "facebook":
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          link
        )}`
      );
      break;
    case "twitter":
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(link)}`
      );
      break;
    case "email":
      window.open(
        `mailto:?subject=${encodeURIComponent(
          currentItinerary.name
        )}&body=${encodeURIComponent(text + " " + link)}`
      );
      break;
  }
}

function copyShareLink() {
  const shareLink = document.getElementById("shareLink");
  shareLink.select();
  document.execCommand("copy");
  alert("Link berhasil disalin ke clipboard!");
}

function handlePaymentMethodChange(e) {
  // Placeholder for payment method handling if needed
  console.log("Payment method changed:", e.target.value);
}
