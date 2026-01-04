/**
 * Login Page Script
 * Handles form submission, authentication, and redirection
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check if already authenticated (from sessionStorage)
  try {
    const session = sessionStorage.getItem('adminSession');
    if (session) {
      // Already logged in, redirect to admin
      window.location.href = "admin.php";
      return;
    }
  } catch (e) {
    console.log('Session storage check failed');
  }

  initializeLoginForm();
  initializePasswordToggle();
  loadRememberedUsername();
  initializeAuthListener();
  initializeSmoothScroll();
})

/**
 * Initialize login form submission
 */
function initializeLoginForm() {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const loginSuccess = document.getElementById("loginSuccess");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const submitButton = loginForm.querySelector('button[type="submit"]');

  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Hide previous messages
    if (loginError) loginError.style.display = "none";
    if (loginSuccess) loginSuccess.style.display = "none";

    // Validation
    if (!username || !password) {
      showError("Username dan password harus diisi", loginError);
      if (loginError) scrollToElement(loginError, 50);
      return;
    }

    // Show loading
    if (loadingSpinner) loadingSpinner.style.display = "flex";
    if (submitButton) submitButton.disabled = true;

    try {
      // Send login request to server via AJAX
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('login.php', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });

      // Parse JSON response
      const result = await response.json();

      if (result.success) {
        // Show success message
        showSuccess("Login berhasil! Mengarahkan ke dashboard...", loginSuccess);

        // Store in sessionStorage for reference
        sessionStorage.setItem('adminSession', JSON.stringify({
          username: username,
          loginTime: new Date().toISOString()
        }));

        if (rememberMe) {
          localStorage.setItem('adminRemember', JSON.stringify({
            username: username,
            rememberTime: new Date().toISOString()
          }));
        }

        // Clear form
        loginForm.reset();

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = result.redirect || 'admin.php';
        }, 800);
      } else {
        // Show error message from server
        const errorMsg = result.error || 'Login gagal. Silakan coba lagi.';
        showError(errorMsg, loginError);
        if (loginError) scrollToElement(loginError, 50);
      }
    } catch (error) {
      // Network or parsing error
      console.error('Login error:', error);
      showError('Terjadi kesalahan: ' + error.message, loginError);
      if (loginError) scrollToElement(loginError, 50);
    } finally {
      if (loadingSpinner) loadingSpinner.style.display = "none";
      if (submitButton) submitButton.disabled = false;
    }
  });
}

/**
 * Initialize password visibility toggle
 */
function initializePasswordToggle() {
  const toggleButton = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  if (!toggleButton || !passwordField) return;

  toggleButton.addEventListener("click", function (e) {
    e.preventDefault();

    const isPassword = passwordField.type === "password";
    const icon = toggleButton.querySelector("i");

    if (isPassword) {
      passwordField.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
      toggleButton.title = "Sembunyikan password";
    } else {
      passwordField.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
      toggleButton.title = "Tampilkan password";
    }
  });
}

/**
 * Load remembered username
 */
function loadRememberedUsername() {
  try {
    const remembered = JSON.parse(
      localStorage.getItem("adminRemember") || "{}"
    );
    const usernameField = document.getElementById("username");
    const rememberCheckbox = document.getElementById("rememberMe");

    if (remembered.username && usernameField) {
      usernameField.value = remembered.username;
      rememberCheckbox.checked = true;
      usernameField.focus();
      document.getElementById("password").focus();
    }
  } catch (e) {
    console.log("No remembered credentials found");
  }
}

/**
 * Show error message
 */
function showError(message, element) {
  if (!element) return;
  element.textContent = message;
  element.style.display = "block";
  element.classList.add("shake");
  
  setTimeout(() => {
    element.classList.remove("shake");
  }, 500);
}

/**
 * Show success message
 */
function showSuccess(message, element) {
  if (!element) return;
  element.textContent = message;
  element.style.display = "block";
}

/**
 * Initialize auth state listener
 */
function initializeAuthListener() {
  window.addEventListener("adminEvent", function (e) {
    const { type, data } = e.detail;

    if (type === "admin:logout") {
      // Redirect to login if logged out from another tab
      window.location.href = "login.php";
    }
  });
}

/**
 * Initialize smooth scroll functionality
 */
function initializeSmoothScroll() {
  // Auto-scroll to error messages
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const element = mutation.target;

        // If error or success message is shown, scroll to it
        if (
          element.classList.contains("loginError") ||
          element.classList.contains("loginSuccess")
        ) {
          if (!element.classList.contains("hidden")) {
            scrollToElement(element, 100);
          }
        }
      }
    });
  });

  // Observe error and success elements
  const loginError = document.getElementById("loginError");
  const loginSuccess = document.getElementById("loginSuccess");

  if (loginError) {
    observer.observe(loginError, { attributes: true });
  }
  if (loginSuccess) {
    observer.observe(loginSuccess, { attributes: true });
  }

  // Smooth scroll untuk demo section
  const demoSection = document.querySelector(".demo-section");
  if (demoSection) {
    // Scroll demo section into view on first focus
    demoSection.addEventListener(
      "focus",
      function () {
        scrollToElement(this, 150);
      },
      true
    );
  }

  // Smooth scroll untuk form inputs
  const formGroups = document.querySelectorAll(
    ".form-group input, .form-group textarea"
  );
  formGroups.forEach((input) => {
    input.addEventListener("focus", function () {
      // Scroll input ke tengah layar saat di-focus
      this.parentElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  });

  // Smooth scroll back to form when error occurs
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("scroll", function (e) {
      // Add visual feedback untuk scroll position
      updateScrollIndicator();
    });
  }
}

/**
 * Scroll to element with smooth animation
 */
function scrollToElement(element, offset = 0) {
  const loginCard = document.querySelector(".login-card");
  if (loginCard && loginCard.scrollHeight > loginCard.clientHeight) {
    // Calculate scroll position
    const elementTop = element.offsetTop - offset;

    // Use smooth scroll
    loginCard.scrollTo({
      top: elementTop,
      behavior: "smooth",
    });
  }
}

/**
 * Update scroll indicator (optional)
 */
function updateScrollIndicator() {
  const loginCard = document.querySelector(".login-card");
  if (loginCard) {
    const scrollPercentage =
      (loginCard.scrollTop /
        (loginCard.scrollHeight - loginCard.clientHeight)) *
      100;

    // Optional: Add class untuk styling based on scroll position
    if (scrollPercentage > 0) {
      loginCard.classList.add("scrolled");
    } else {
      loginCard.classList.remove("scrolled");
    }
  }
}

/**
 * Keyboard navigation untuk smooth scrolling
 */
document.addEventListener("keydown", function (e) {
  const loginCard = document.querySelector(".login-card");
  if (loginCard && loginCard.scrollHeight > loginCard.clientHeight) {
    if (e.key === "Page Down" || e.key === "Page Up") {
      e.preventDefault();
      const scrollDistance = 100;
      const newPosition =
        e.key === "Page Down"
          ? loginCard.scrollTop + scrollDistance
          : loginCard.scrollTop - scrollDistance;

      loginCard.scrollTo({
        top: newPosition,
        behavior: "smooth",
      });
    }
  }
});
