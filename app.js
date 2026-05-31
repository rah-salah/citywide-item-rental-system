/* Citywide Jigjiga — shared client script
 * - Persists registered user (name/email/area) in localStorage
 * - Dynamically renders the user's name and initial across the site
 * - Adds a Dashboard link to the global navbar and a Sign Out when logged in
 */
(function () {
  var KEY = "cw_user";

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
      return null;
    }
  }
  function setUser(u) {
    localStorage.setItem(KEY, JSON.stringify(u));
  }
  function clearUser() {
    localStorage.removeItem(KEY);
  }
  function initial(name) {
    if (!name) return "G";
    var t = name.trim();
    return t ? t.charAt(0).toUpperCase() : "G";
  }

  // ===== Render dynamic user info =====
  function renderUser() {
    var u = getUser();
    var name = u && u.name ? u.name : "Guest User";
    var area = u && u.area ? u.area : "Jigjiga Central";

    document.querySelectorAll("[data-user-name]").forEach(function (el) {
      el.textContent = name;
    });
    document.querySelectorAll("[data-user-area]").forEach(function (el) {
      el.textContent = area;
    });
    document.querySelectorAll("[data-user-initial]").forEach(function (el) {
      el.textContent = initial(name);
    });
    // Also update legacy placeholders that weren't tagged
    document.querySelectorAll(".cw-avatar").forEach(function (el) {
      if (
        !el.hasAttribute("data-user-initial") &&
        el.textContent.trim() === "G"
      ) {
        el.textContent = initial(name);
      }
    });
    document
      .querySelectorAll(".cw-sidebar .fw-semibold.small")
      .forEach(function (el) {
        if (el.textContent.trim() === "Guest User") el.textContent = name;
      });
  }

  // ===== Inject Dashboard link + auth buttons into global navbar =====
  function enhanceNavbar() {
    var navList = document.querySelector(".cw-navbar #mainNav .navbar-nav");
    if (navList && !navList.querySelector('a[href="dashboard.html"]')) {
      var li = document.createElement("li");
      li.className = "nav-item";
      li.innerHTML = '<a class="nav-link" href="dashboard.html">Dashboard</a>';
      navList.appendChild(li);
    }

    // Mark active link by current filename
    var page = (
      location.pathname.split("/").pop() || "home.html"
    ).toLowerCase();
    document
      .querySelectorAll(".cw-navbar .nav-link, .cw-sidebar .nav-link")
      .forEach(function (a) {
        var href = (a.getAttribute("href") || "").toLowerCase();
        if (href === page) a.classList.add("active");
        else a.classList.remove("active");
      });

    // Swap Sign In / Register for the user name + Sign Out when logged in
    var u = getUser();
    if (!u) return;
    var btnRow = document.querySelector(
      ".cw-navbar #mainNav .d-flex.flex-column.flex-lg-row",
    );
    if (btnRow) {
      btnRow.innerHTML =
        '<a class="btn btn-outline-brand ms-lg-2 mt-2 mt-lg-0" href="profile.html">' +
        '<i class="bi bi-person-circle me-1"></i>' +
        (u.name || "Account") +
        "</a>" +
        '<a class="btn btn-brand ms-lg-2 mt-2 mt-lg-0" href="logout.html">Sign Out</a>';
    }
  }

  // ===== Auth form handlers =====
  function bindAuthForms() {
    var reg =
      document.querySelector("form[data-cw-register]") ||
      document.querySelector(
        'form[action$="dashboard.html"] input[name="fullName"]',
      );
    // Register form: any form on register.html
    if (/register\.html$/i.test(location.pathname)) {
      var rform = document.querySelector("form");
      if (rform) {
        rform.addEventListener("submit", function () {
          var nameEl = rform.querySelector(
            'input[name="fullName"], input[type="text"]',
          );
          var emailEl = rform.querySelector('input[type="email"]');
          var areaEl = rform.querySelector("select");
          setUser({
            name: nameEl ? nameEl.value.trim() : "",
            email: emailEl ? emailEl.value.trim() : "",
            area: areaEl ? areaEl.value.trim() : "",
          });
        });
      }
    }
    // Login form: keep existing user if present, otherwise create a minimal one from email
    if (/login\.html$/i.test(location.pathname)) {
      var lform = document.querySelector("form");
      if (lform) {
        lform.addEventListener("submit", function () {
          var existing = getUser();
          if (existing && existing.name) return;
          var emailEl = lform.querySelector('input[type="email"]');
          var email = emailEl ? emailEl.value.trim() : "";
          var nameFromEmail = email
            ? email.split("@")[0].replace(/[._-]+/g, " ")
            : "";
          nameFromEmail = nameFromEmail.replace(/\b\w/g, function (c) {
            return c.toUpperCase();
          });
          setUser({
            name: nameFromEmail || "Member",
            email: email,
            area: "Jigjiga Central",
          });
        });
      }
    }
    // Logout page: clear and redirect
    if (/logout\.html$/i.test(location.pathname)) {
      clearUser();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    enhanceNavbar();
    bindAuthForms();
    renderUser();
  });
})();
